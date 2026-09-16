from fastapi import APIRouter,Depends,HTTPException
from app.schemas import QRScanRequest
from app.database import get_db
from app.models import Reservation,Parking,ParkingSlot
import json 
from app.websocket_manager import manager
import math
from sqlalchemy.orm import Session
from datetime import datetime

router=APIRouter()
@router.post("/scan-qr")

async def scan_qr(

    request: QRScanRequest,

    db: Session = Depends(get_db)

):

    # ==========================================
    # 1. FIND RESERVATION
    # ==========================================

    reservation = db.query(
        Reservation
    ).filter(

        Reservation.qr_token ==
        request.qr_token

    ).first()


    if reservation is None:

        raise HTTPException(
            status_code=404,
            detail="Invalid QR code"
        )


    # ==========================================
    # 2. FIND SLOT
    # ==========================================

    slot = db.query(
        ParkingSlot
    ).filter(

        ParkingSlot.id ==
        reservation.slot_id

    ).first()


    if slot is None:

        raise HTTPException(
            status_code=404,
            detail="Parking slot not found"
        )


    # ==========================================
    # 3. ENTRY
    # ==========================================

    if reservation.status == "Booked":

        reservation.entry_time = datetime.utcnow()

        reservation.status = "Active"

        slot.status = "Occupied"


        db.commit()

        db.refresh(reservation)


        # WebSocket
        await manager.broadcast(

            json.dumps({

                "event":
                    "slot_updated",

                "parking_id":
                    slot.parking_id,

                "slot_id":
                    slot.id,

                "slot_number":
                    slot.slot_number,

                "status":
                    "Occupied"

            })

        )


        return {

            "message":
                "Vehicle entry recorded",

            "action":
                "entry",

            "reservation_id":
                reservation.id,

            "vehicle_number":
                reservation.vehicle_number,

            "slot_number":
                slot.slot_number,

            "status":
                "Active",

            "entry_time":
                reservation.entry_time

        }


    # ==========================================
    # 4. EXIT
    # ==========================================

    elif reservation.status == "Active":

        reservation.exit_time = datetime.utcnow()

        reservation.status = "Completed"

        slot.status = "Available"


        # Calculate amount
        if (
            reservation.entry_time
            and reservation.exit_time
        ):

            duration = (
                reservation.exit_time -
                reservation.entry_time
            )

            total_seconds = (
                duration.total_seconds()
            )

            total_hours = (
                total_seconds / 3600
            )

            # Minimum 1 hour
            billing_hours = max(
                1,
                math.ceil(total_hours)
            )

            # Get parking
            parking = db.query(
                Parking
            ).filter(

                Parking.id ==
                reservation.parking_id

            ).first()


            if parking:

                reservation.total_amount = (
                    billing_hours *
                    parking.price
                )


        db.commit()

        db.refresh(reservation)


        # WebSocket
        await manager.broadcast(

            json.dumps({

                "event":
                    "slot_updated",

                "parking_id":
                    slot.parking_id,

                "slot_id":
                    slot.id,

                "slot_number":
                    slot.slot_number,

                "status":
                    "Available"

            })

        )


        return {

            "message":
                "Vehicle exit recorded",

            "action":
                "exit",

            "reservation_id":
                reservation.id,

            "vehicle_number":
                reservation.vehicle_number,

            "slot_number":
                slot.slot_number,

            "status":
                "Completed",

            "entry_time":
                reservation.entry_time,

            "exit_time":
                reservation.exit_time,

            "total_amount":
                reservation.total_amount

        }


    # ==========================================
    # 5. ALREADY COMPLETED
    # ==========================================

    elif reservation.status == "Completed":

        raise HTTPException(

            status_code=400,

            detail=
                "This reservation is already completed"

        )


    else:

        raise HTTPException(

            status_code=400,

            detail=
                f"Invalid reservation status: "
                f"{reservation.status}"

        )