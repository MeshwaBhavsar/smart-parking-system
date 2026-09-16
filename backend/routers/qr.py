from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models import Reservation, ParkingSlot,Parking
from app.schemas import QRScanRequest


router = APIRouter(
    prefix="/qr",
    tags=["QR Scanner"]
)

@router.post("/scan")
def scan_qr(
    data: QRScanRequest,
    db: Session = Depends(get_db)
):

    # ----------------------------------
    # Find reservation
    # ----------------------------------

    reservation = db.query(
        Reservation
    ).filter(
        Reservation.qr_token ==
        data.qr_token
    ).first()

    if not reservation:

        raise HTTPException(
            status_code=404,
            detail="Invalid QR code"
        )

    # ----------------------------------
    # ENTRY
    # ----------------------------------

    if reservation.status == "BOOKED":

        reservation.entry_time = datetime.utcnow()

        reservation.status = "PARKED"

        slot = db.query(
            ParkingSlot
        ).filter(
            ParkingSlot.id ==
            reservation.slot_id
        ).first()

        if slot:

            slot.status = "PARKED"

        db.commit()

        return {

            "success": True,

            "action": "ENTRY",

            "message":
                "Entry allowed",

            "reservation_id":
                reservation.id,

            "entry_time":
                reservation.entry_time,

            "status":
                reservation.status
        }

    # ----------------------------------
    # EXIT
    # ----------------------------------

    elif reservation.status == "PARKED":

        reservation.exit_time = datetime.utcnow()

        # Calculate duration

        duration = (
            reservation.exit_time -
            reservation.entry_time
        )

        total_minutes = (
            duration.total_seconds() / 60
        )

        # ----------------------------------
        # Calculate amount
        # ----------------------------------

        parking = db.query(
            Parking
        ).filter(
            Parking.id ==
            reservation.parking_id
        ).first()

        if not parking:

            raise HTTPException(
                status_code=404,
                detail="Parking not found"
            )

        price_per_hour = parking.price

        hours = total_minutes / 60

        # Minimum 1 hour

        billed_hours = max(
            1,
            int(hours) +
            (1 if hours % 1 > 0 else 0)
        )

        total_amount = (
            billed_hours *
            price_per_hour
        )

        reservation.total_amount = (
            total_amount
        )

        reservation.status = (
            "EXIT_PENDING_PAYMENT"
        )

        db.commit()

        return {

            "success": True,

            "action": "EXIT",

            "message":
                "Exit scan successful",

            "reservation_id":
                reservation.id,

            "entry_time":
                reservation.entry_time,

            "exit_time":
                reservation.exit_time,

            "duration_minutes":
                round(total_minutes, 2),

            "billed_hours":
                billed_hours,

            "total_amount":
                total_amount,

            "status":
                reservation.status
        }

    # ----------------------------------
    # Already completed
    # ----------------------------------

    elif reservation.status == "EXIT_PENDING_PAYMENT":

        return {

            "success": False,

            "message":
                "Payment is pending",

            "status":
                reservation.status,

            "total_amount":
                reservation.total_amount
        }

    elif reservation.status == "COMPLETED":

        return {

            "success": False,

            "message":
                "This booking is already completed"
        }

    else:

        raise HTTPException(

            status_code=400,

            detail=
                f"Invalid booking status: "
                f"{reservation.status}"
        )