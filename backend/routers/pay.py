import razorpay

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from datetime import datetime

from app.database import get_db

from app.models import Reservation

from app.models import Payment

from app.schemas import PaymentVerify

from app.oauth2 import get_current_user

from app.websocket_manager import manager
import json

from app.config import (
    RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET
)

import hmac
import hashlib

from datetime import datetime


router = APIRouter(
    prefix="/payment",
    tags=["Payment"]
)


razorpay_client = razorpay.Client(
    auth=(
        RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET
    )
)

@router.post("/create-order")
def create_payment_order(

    reservation_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)

):

    # --------------------------------
    # 1. Find reservation
    # --------------------------------

    reservation = db.query(
        Reservation
    ).filter(
        Reservation.id == reservation_id
    ).first()


    if not reservation:

        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )


    # --------------------------------
    # 2. Check user
    # --------------------------------

    if reservation.user_id != current_user.id:

        raise HTTPException(
            status_code=403,
            detail="You are not allowed to pay for this reservation"
        )


    # --------------------------------
    # 3. Get amount from DB
    # --------------------------------

    amount = reservation.total_amount


    if amount is None or amount <= 0:

        raise HTTPException(
            status_code=400,
            detail="Invalid reservation amount"
        )


    # --------------------------------
    # 4. Convert rupees to paise
    # --------------------------------

    amount_paise = int(
        round(amount * 100)
    )


    # --------------------------------
    # 5. Create Razorpay order
    # --------------------------------

    try:

        razorpay_order = (
            razorpay_client.order.create({

                "amount": amount_paise,

                "currency": "INR",

                "receipt":
                    f"reservation_{reservation.id}",

                "notes": {

                    "reservation_id":
                        str(reservation.id),

                    "user_id":
                        str(reservation.user_id)

                }

            })
        )

    except Exception as e:

        print(
            "Razorpay error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to create Razorpay order"
        )


    # --------------------------------
    # 6. Save payment record
    # --------------------------------

    payment = Payment(

        reservation_id =
            reservation.id,

        user_id =
            reservation.user_id,

        amount =
            amount,

        payment_method =
            "Razorpay",

        payment_status =
            "Created",

        razorpay_order_id =
            razorpay_order["id"]

    )


    db.add(payment)

    db.commit()

    db.refresh(payment)


    # --------------------------------
    # 7. Send data to frontend
    # --------------------------------

    return {

        "payment_id":
            payment.id,

        "reservation_id":
            reservation.id,

        "amount":
            amount,

        "amount_paise":
            amount_paise,

        "currency":
            "INR",

        "razorpay_order_id":
            razorpay_order["id"],

        "razorpay_key_id":
            RAZORPAY_KEY_ID

    }


@router.post("/verify")
async def verify_payment(

    payment_data: PaymentVerify,

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)

):

    # --------------------------------
    # 1. Find payment
    # --------------------------------

    payment = db.query(
        Payment
    ).filter(

        Payment.razorpay_order_id ==
        payment_data.razorpay_order_id

    ).first()


    if not payment:

        raise HTTPException(
            status_code=404,
            detail="Payment order not found"
        )


    # --------------------------------
    # 2. Check payment owner
    # --------------------------------

    if payment.user_id != current_user.id:

        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )


    # --------------------------------
    # 3. Create signature
    # --------------------------------

    message = (
        payment_data.razorpay_order_id
        + "|"
        + payment_data.razorpay_payment_id
    )


    generated_signature = hmac.new(

        RAZORPAY_KEY_SECRET.encode(),

        message.encode(),

        hashlib.sha256

    ).hexdigest()


    # --------------------------------
    # 4. Verify signature
    # --------------------------------

    if not hmac.compare_digest(

        generated_signature,

        payment_data.razorpay_signature

    ):

        payment.payment_status = "Failed"

        db.commit()


        raise HTTPException(

            status_code=400,

            detail="Payment verification failed"

        )


    # --------------------------------
    # 5. Save Razorpay information
    # --------------------------------

    payment.razorpay_payment_id = (

        payment_data.razorpay_payment_id

    )


    payment.razorpay_signature = (

        payment_data.razorpay_signature

    )


    payment.transaction_id = (

        payment_data.razorpay_payment_id

    )


    payment.payment_method = (

        "Razorpay"

    )


    payment.payment_status = (

        "Paid"

    )


    payment.payment_date = (

        datetime.utcnow()

    )


    # --------------------------------
    # 6. Save to database
    # --------------------------------

    db.commit()

    db.refresh(payment)


    print(
        "✅ Payment saved:",
        payment.id
    )


    # =================================
    # 7. WEBSOCKET
    # =================================

    try:

        await manager.broadcast(

            json.dumps({

                "event":
                    "payment_created",

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
                    payment.transaction_id

            })

        )

        print(
            "✅ Payment WebSocket sent"
        )

    except Exception as e:

        print(
            "❌ Payment WebSocket error:",
            str(e)
        )


    # --------------------------------
    # 8. Response to customer
    # --------------------------------

    return {

        "message":
            "Payment successful",

        "payment_id":
            payment.id,

        "reservation_id":
            payment.reservation_id,

        "amount":
            payment.amount,

        "transaction_id":
            payment.transaction_id,

        "payment_status":
            payment.payment_status

    }