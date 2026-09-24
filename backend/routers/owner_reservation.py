from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.oauth2 import get_current_user
import json
from app.websocket_manager import manager



router = APIRouter(
    prefix="/owner/reservations",
    tags=["Owner Reservations"]
)

@router.get("/")
def get_owner_reservations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):


    role = str(current_user.role).strip().lower()

    print("CURRENT USER ID:", current_user.id)
    print("CURRENT USER NAME:", current_user.full_name)
    print("CURRENT USER ROLE:", repr(current_user.role))
    print("NORMALIZED ROLE:", repr(role))


    if role != "owner":
        raise HTTPException(
            status_code=403,
            detail="Only owner can access reservations"
        )


    reservations = (
        db.query(
            models.Reservation,
            models.User,
            models.Parking,
            models.ParkingSlot
        )
        .join(
            models.User,
            models.Reservation.user_id == models.User.id
        )
        .join(
            models.Parking,
            models.Reservation.parking_id == models.Parking.id
        )
        .join(
            models.ParkingSlot,
            models.Reservation.slot_id == models.ParkingSlot.id
        )
        .filter(
            models.Parking.owner_id == current_user.id
        )
        .all()
    )

    result = []

    for reservation, user, parking, slot in reservations:

        result.append({

            "reservation_id":
                reservation.id,

            "user_id":
                user.id,

            "user_name":
                user.full_name,

            "user_email":
                user.email,

            "user_phone":
                user.phone,

            "parking_id":
                parking.id,

            "parking_name":
                parking.parking_name,

            "parking_area":
                parking.area,

            "parking_address":
                parking.address,

            "slot_id":
                slot.id,

            "slot_number":
                slot.slot_number,

            "vehicle_number":
                reservation.vehicle_number,

            "vehicle_type":
                reservation.vehicle_type,

            "booking_date":
                reservation.booking_date,

            "entry_time":
                reservation.entry_time,

            "exit_time":
                reservation.exit_time,

            "total_amount":
                reservation.total_amount,

            "status":
                reservation.status,

            "qr_token":
                reservation.qr_token
        })

    return result


# --------------------------------view button---------------------
@router.get("/{reservation_id}")
def get_owner_reservation(

    reservation_id: int,

    db: Session = Depends(get_db),

    current_user: models.User =
        Depends(get_current_user)

):

    # =========================================
    # OWNER CHECK
    # =========================================

    role = str(
        current_user.role
    ).strip().lower()


    if role != "owner":

        raise HTTPException(
            status_code=403,
            detail="Only owner can access reservations"
        )


    # =========================================
    # GET RESERVATION
    # =========================================

    result = (

        db.query(
            models.Reservation,
            models.User,
            models.Parking,
            models.ParkingSlot
        )

        .join(
            models.User,
            models.Reservation.user_id ==
            models.User.id
        )

        .join(
            models.Parking,
            models.Reservation.parking_id ==
            models.Parking.id
        )

        .join(
            models.ParkingSlot,
            models.Reservation.slot_id ==
            models.ParkingSlot.id
        )

        .filter(
            models.Reservation.id ==
            reservation_id
        )

        .filter(
            models.Parking.owner_id ==
            current_user.id
        )

        .first()
    )


    if not result:

        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )


    reservation, user, parking, slot = result


    return {

        "reservation_id":
            reservation.id,

        "user_id":
            user.id,

        "user_name":
            user.full_name,

        "user_email":
            user.email,

        "user_phone":
            user.phone,

        "parking_id":
            parking.id,

        "parking_name":
            parking.parking_name,

        "parking_area":
            parking.area,

        "parking_city":
            parking.city,

        "parking_address":
            parking.address,

        "slot_id":
            slot.id,

        "slot_number":
            slot.slot_number,

        "vehicle_number":
            reservation.vehicle_number,

        "entry_time":
            reservation.entry_time,

        "exit_time":
            reservation.exit_time,

        "status":
            reservation.status,

        "amount":
            reservation.total_amount

    }

# ------------------------------------------------
@router.delete("/{reservation_id}")
def delete_reservation(
    reservation_id: int,
    db: Session = Depends(get_db)
):

    reservation = (
        db.query(models.Reservation)
        .filter(
            models.Reservation.id == reservation_id
        )
        .first()
    )

    if not reservation:

        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )

    db.delete(reservation)

    db.commit()

    return {
        "message": "Reservation deleted successfully",
        "reservation_id": reservation.id
    }

