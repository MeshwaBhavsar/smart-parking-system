import json
import math
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Parking, ParkingSlot, Reservation
from app.oauth2 import get_current_user
from app.schemas import QRScanRequest
from app.websocket_manager import manager


router = APIRouter(
    prefix="/qr",
    tags=["QR Scanner"],
)


@router.post("/scan")
async def scan_qr(
    data: QRScanRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    staff_role = str(getattr(current_user, "role", "")).strip().upper()

    if staff_role != "STAFF":
        raise HTTPException(
            status_code=403,
            detail="Only staff can scan QR codes",
        )

    qr_token = str(data.qr_token or "").strip()
    if not qr_token:
        raise HTTPException(
            status_code=400,
            detail="QR token is required",
        )

    reservation = (
        db.query(Reservation)
        .filter(Reservation.qr_token == qr_token)
        .first()
    )

    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Invalid QR code",
        )

    reservation_status = str(
        reservation.status or ""
    ).strip().upper()

    print("QR RESERVATION ID:", reservation.id)
    print("ORIGINAL STATUS:", repr(reservation.status))
    print("NORMALIZED STATUS:", reservation_status)
    print("STAFF ID:", current_user.id)
    print("STAFF ROLE:", staff_role)

    slot = (
        db.query(ParkingSlot)
        .filter(ParkingSlot.id == reservation.slot_id)
        .first()
    )

    if reservation_status == "BOOKED":
        print("ENTRY: BOOKED -> PARKED")

        reservation.entry_time = datetime.utcnow()
        reservation.status = "PARKED"

        if slot:
            slot.status = "Occupied"

        db.commit()
        db.refresh(reservation)

        await manager.broadcast(
            json.dumps(
                {
                    "event": "slot_updated",
                    "parking_id": (
                        slot.parking_id if slot else reservation.parking_id
                    ),
                    "slot_id": reservation.slot_id,
                    "slot_number": slot.slot_number if slot else None,
                    "status": "Occupied",
                    "reservation_id": reservation.id,
                }
            )
        )

        await manager.send_to_user(
            reservation.user_id,
            json.dumps(
                {
                    "event": "reservation_updated",
                    "reservation_id": reservation.id,
                    "user_id": reservation.user_id,
                    "status": "PARKED",
                    "entry_time": (
                        reservation.entry_time.isoformat()
                        if reservation.entry_time
                        else None
                    ),
                }
            ),
        )

        return {
            "success": True,
            "action": "ENTRY",
            "status": "PARKED",
            "reservation_id": reservation.id,
            "vehicle_number": reservation.vehicle_number,
            "vehicle_type": reservation.vehicle_type,
            "slot_number": slot.slot_number if slot else None,
            "entry_time": reservation.entry_time,
        }

    elif reservation_status == "PARKED":
        print("EXIT: PARKED -> COMPLETED")

        if not reservation.entry_time:
            raise HTTPException(
                status_code=400,
                detail="Entry time not found",
            )

        reservation.exit_time = datetime.utcnow()
        duration = reservation.exit_time - reservation.entry_time
        duration_minutes = duration.total_seconds() / 60
        billed_hours = max(1, math.ceil(duration_minutes / 60))

        parking = (
            db.query(Parking)
            .filter(Parking.id == reservation.parking_id)
            .first()
        )

        if not parking:
            raise HTTPException(
                status_code=404,
                detail="Parking not found",
            )

        total_amount = billed_hours * float(parking.price or 0)

        reservation.total_amount = total_amount
        reservation.status = "COMPLETED"

        if slot:
            slot.status = "Available"

        db.commit()
        db.refresh(reservation)

        await manager.send_to_user(
            reservation.user_id,
            json.dumps(
                {
                    "event": "reservation_completed",
                    "reservation_id": reservation.id,
                    "user_id": reservation.user_id,
                    "status": "COMPLETED",
                    "entry_time": reservation.entry_time.isoformat(),
                    "exit_time": reservation.exit_time.isoformat(),
                    "duration_minutes": round(duration_minutes, 2),
                    "billed_hours": billed_hours,
                    "total_amount": total_amount,
                }
            ),
        )

        await manager.broadcast(
            json.dumps(
                {
                    "event": "slot_updated",
                    "parking_id": reservation.parking_id,
                    "slot_id": reservation.slot_id,
                    "slot_number": slot.slot_number if slot else None,
                    "status": "Available",
                    "reservation_id": reservation.id,
                }
            )
        )

        return {
            "success": True,
            "action": "EXIT",
            "status": "COMPLETED",
            "reservation_id": reservation.id,
            "vehicle_number": reservation.vehicle_number,
            "vehicle_type": reservation.vehicle_type,
            "slot_number": slot.slot_number if slot else None,
            "entry_time": reservation.entry_time,
            "exit_time": reservation.exit_time,
            "duration_minutes": round(duration_minutes, 2),
            "billed_hours": billed_hours,
            "total_amount": total_amount,
        }

    elif reservation_status == "COMPLETED":
        return {
            "success": False,
            "action": "COMPLETED",
            "message": "This booking is already completed",
            "reservation_id": reservation.id,
            "total_amount": reservation.total_amount,
            "status": "COMPLETED",
        }

    raise HTTPException(
        status_code=400,
        detail=f"Invalid booking status: {reservation.status}",
    )
