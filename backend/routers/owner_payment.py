from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.oauth2 import get_current_user


router = APIRouter(
    prefix="/owner/payments",
        tags=["Owner Payment"]
)

@router.get("/")
def get_owner_payments(

    db: Session = Depends(get_db),

    current_user: models.User =
        Depends(get_current_user)

):

    # =====================================
    # CHECK OWNER
    # =====================================

    role = str(
        current_user.role
    ).strip().lower()


    if role != "owner":

        raise HTTPException(
            status_code=403,
            detail="Only owner can access payments"
        )


    # =====================================
    # GET PAYMENTS
    # =====================================

    payments = (

        db.query(
            models.Payment,
            models.Reservation,
            models.Parking
        )

        .join(
            models.Reservation,
            models.Payment.reservation_id ==
            models.Reservation.id
        )

        .join(
            models.Parking,
            models.Reservation.parking_id ==
            models.Parking.id
        )

        .filter(
            models.Parking.owner_id ==
            current_user.id
        )

        .all()
    )


    result = []


    for payment, reservation, parking in payments:

        result.append({

            "payment_id":
                payment.id,

            "user_id":
                payment.user_id,

            "reservation_id":
                payment.reservation_id,

            "amount":
                payment.amount,

            "payment_method":
                payment.payment_method,

            "payment_status":
                payment.payment_status

        })


    return result


# ---------------------only show one user payment------------------
@router.get("/{payment_id}")
def get_owner_payment(

    payment_id: int,

    db: Session = Depends(get_db),

    current_user: models.User =
        Depends(get_current_user)

):

    # =====================================
    # CHECK OWNER
    # =====================================

    role = str(
        current_user.role
    ).strip().lower()


    if role != "owner":

        raise HTTPException(
            status_code=403,
            detail="Only owner can access payments"
        )


    # =====================================
    # FIND PAYMENT
    # =====================================

    result = (

        db.query(
            models.Payment,
            models.Reservation,
            models.Parking,
            models.User
        )

        .join(
            models.Reservation,
            models.Payment.reservation_id ==
            models.Reservation.id
        )

        .join(
            models.Parking,
            models.Reservation.parking_id ==
            models.Parking.id
        )

        .join(
            models.User,
            models.Payment.user_id ==
            models.User.id
        )

        .filter(
            models.Payment.id ==
            payment_id
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
            detail="Payment not found"
        )


    payment, reservation, parking, user = result


    return {

        "payment_id":
            payment.id,

        "user_id":
            payment.user_id,

        "reservation_id":
            payment.reservation_id,

        "amount":
            payment.amount,

        "payment_method":
            payment.payment_method,

        "payment_status":
            payment.payment_status,

        "transaction_id":
            getattr(
                payment,
                "transaction_id",
                None
            ),

        "payment_date":
            getattr(
                payment,
                "payment_date",
                None
            ),

        # User information

        "user_name":
            user.full_name,

        "user_email":
            user.email,

        "user_phone":
            user.phone,

        # Reservation information

        "vehicle_number":
            reservation.vehicle_number,

        "entry_time":
            reservation.entry_time,

        "exit_time":
            reservation.exit_time,

        "reservation_status":
            reservation.status,

        # Parking information

        "parking_name":
            parking.parking_name,

        "parking_area":
            parking.area,

        "parking_city":
            parking.city,

        "parking_address":
            parking.address

    }