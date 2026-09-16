from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    WebSocket,
    WebSocketDisconnect
)

from sqlalchemy.orm import Session

from app.database import get_db
from app import models

from app.oauth2 import get_current_user
from app.websocket_manager import manager

from datetime import timezone
from zoneinfo import ZoneInfo


router = APIRouter(
    prefix="/admin_payments",
    tags=["Admin Payments"]
)


# =========================================================
# ADMIN PAYMENT HELPER
# =========================================================

def check_admin(current_user):

    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="User not authenticated"
        )

    role = (
        str(current_user.role)
        .strip()
        .lower()
        if current_user.role
        else ""
    )

    print(
        "Admin payment user:",
        current_user.id,
        current_user.email,
        role
    )

    if role != "admin":

        raise HTTPException(
            status_code=403,
            detail="Only admin can access payments"
        )


# =========================================================
# GET ALL PAYMENTS
# =========================================================

# @router.get("/")
# def get_all_payments(
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user)
# ):

#     check_admin(current_user)

#     payments = (
#         db.query(models.Payment)
#         .order_by(models.Payment.id.desc())
#         .all()
#     )

#     result = []

#     for payment in payments:

#         result.append({

#             "id": payment.id,

#             "user_id":
#                 payment.user_id,

#             "reservation_id":
#                 payment.reservation_id,

#             "amount":
#                 payment.amount,

#             "payment_method":
#                 payment.payment_method,

#             "payment_status":
#                 payment.payment_status,

#             "order_id":
#                 getattr(
#                     payment,
#                     "order_id",
#                     None
#                 ),

#             "payment_id":
#                 getattr(
#                     payment,
#                     "payment_id",
#                     None
#                 ),

#             "created_at":
#                 getattr(
#                     payment,
#                     "created_at",
#                     None
#                 ),

#             "paid_at":
#                 getattr(
#                     payment,
#                     "paid_at",
#                     None
#                 )
#         })

#     return result



@router.get("/")
def get_all_payments(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    check_admin(current_user)

    payments = (
        db.query(models.Payment)
        .order_by(models.Payment.id.desc())
        .all()
    )

    result = []

    for payment in payments:

        result.append({

            "id": payment.id,

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

            # IMPORTANT
            "razorpay_order_id":
                getattr(
                    payment,
                    "razorpay_order_id",
                    None
                ),

            # IMPORTANT
            "razorpay_payment_id":
                getattr(
                    payment,
                    "razorpay_payment_id",
                    None
                ),

            # UTC -> IST
            "created_at":
                to_ist(
                    getattr(
                        payment,
                        "created_at",
                        None
                    )
                ),

            # UTC -> IST
            "payment_date":
                to_ist(
                    getattr(
                        payment,
                        "payment_date",
                        None
                    )
                )
        })

    return result

# =========================================================
# GET SINGLE PAYMENT
# =========================================================

# @router.get("/{payment_id}")
# def get_payment(
#     payment_id: int,
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user)
# ):

#     check_admin(current_user)

#     payment = (
#         db.query(models.Payment)
#         .filter(
#             models.Payment.id == payment_id
#         )
#         .first()
#     )

#     if not payment:

#         raise HTTPException(
#             status_code=404,
#             detail="Payment not found"
#         )

#     return {

#         "id":
#             payment.id,

#         "user_id":
#             payment.user_id,

#         "reservation_id":
#             payment.reservation_id,

#         "amount":
#             payment.amount,

#         "payment_method":
#             payment.payment_method,

#         "payment_status":
#             payment.payment_status,

#         "order_id":
#             getattr(
#                 payment,
#                 "order_id",
#                 None
#             ),

#         "payment_id":
#             getattr(
#                 payment,
#                 "payment_id",
#                 None
#             ),

#         "created_at":
#             getattr(
#                 payment,
#                 "created_at",
#                 None
#             ),

#         "paid_at":
#             getattr(
#                 payment,
#                 "paid_at",
#                 None
#             )
#     }

@router.get("/{payment_id}")
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    check_admin(current_user)

    payment = (
        db.query(models.Payment)
        .filter(
            models.Payment.id == payment_id
        )
        .first()
    )

    if not payment:

        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    return {

        "id":
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

        # =====================================
        # RAZORPAY DETAILS
        # =====================================

        "razorpay_order_id":
            getattr(
                payment,
                "razorpay_order_id",
                None
            ),

        "razorpay_payment_id":
            getattr(
                payment,
                "razorpay_payment_id",
                None
            ),

        # =====================================
        # TIME
        # =====================================

        "created_at":
            to_ist(
                getattr(
                    payment,
                    "created_at",
                    None
                )
            ),

        "payment_date":
            to_ist(
                getattr(
                    payment,
                    "payment_date",
                    None
                )
            )
    }


# =========================================================
# WEBSOCKET
# =========================================================

@router.websocket("/ws")
async def admin_payment_websocket(websocket: WebSocket):

    await manager.connect(websocket)

    print(
        "Admin payment WebSocket connected"
    )

    try:

        while True:

            message = await websocket.receive_text()

            print(
                "Admin payment WebSocket message:",
                message
            )

    except WebSocketDisconnect:

        print(
            "Admin payment WebSocket disconnected"
        )

        manager.disconnect(websocket)

    except Exception as e:

        print(
            "Admin payment WebSocket error:",
            e
        )

        manager.disconnect(websocket)


# -------------------------------------------------------------------------
# =========================================================
# UTC -> INDIA TIME
# =========================================================

def to_ist(value):

    if not value:
        return None

    # If database datetime is naive, treat it as UTC
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)

    return value.astimezone(
        ZoneInfo("Asia/Kolkata")
    )