from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid

from app.database import get_db
from app import models
from app.schemas import QRScanRequest
from app.schemas import ReservationCreate
from app.oauth2 import get_current_user
from utils.qr_generator import generate_qr_image
from utils.qr_generator import generate_qr_token
from app.models import Reservation
from app.models import ParkingSlot,Parking
import qrcode
import os
from app.websocket_manager import manager
import json

router = APIRouter(
        prefix="/reservation",
        tags=["Reservation"]
)


@router.post("/")
async def create_reservation(

    reservation: ReservationCreate,

    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    )

):

    # ==========================================
    # 1. FIND SLOT
    # ==========================================

    slot = db.query(
        models.ParkingSlot
    ).filter(

        models.ParkingSlot.id ==
        reservation.slot_id,

        models.ParkingSlot.parking_id ==
        reservation.parking_id

    ).first()


    if slot is None:

        raise HTTPException(
            status_code=404,
            detail="Parking slot not found"
        )


    # ==========================================
    # 2. CHECK SLOT
    # ==========================================

    if slot.status != "Available":

        raise HTTPException(

            status_code=400,

            detail=
            f"Slot is already {slot.status}"

        )


    # ==========================================
    # 3. CREATE QR TOKEN
    # ==========================================

    qr_token = str(uuid.uuid4())


    # ==========================================
    # 4. CREATE RESERVATION
    # ==========================================

    new_reservation = models.Reservation(

        user_id=current_user.id,

        parking_id=reservation.parking_id,

        slot_id=reservation.slot_id,

        vehicle_number=
            reservation.vehicle_number,

        vehicle_type=
            reservation.vehicle_type,

        booking_date=datetime.utcnow(),

        status="Booked",

        qr_token=qr_token

    )


    db.add(new_reservation)


    # ==========================================
    # 5. CHANGE SLOT
    # ==========================================

    slot.status = "Reserved"


    # ==========================================
    # 6. SAVE
    # ==========================================

    db.commit()

    db.refresh(new_reservation)


    # ==========================================
    # 7. WEBSOCKET
    # ==========================================

    # await manager.broadcast(

    #     json.dumps({

    #         "event": "slot_updated",

    #         "parking_id":
    #             slot.parking_id,

    #         "slot_id":
    #             slot.id,

    #         "slot_number":
    #             slot.slot_number,

    #         "status":
    #             "Reserved",

    #         "reservation_id":
    #             new_reservation.id

    #     })

    # )

    await manager.broadcast(
    json.dumps({
        "event": "reservation_created",
        "reservation_id": new_reservation.id,
        "user_id": new_reservation.user_id,
        "parking_id": new_reservation.parking_id,
        "slot_id": new_reservation.slot_id,
        "status": new_reservation.status
    })
)




    # ==========================================
    # 8. RESPONSE
    # ==========================================

    return {

        "message":
            "Reservation created successfully",

        "reservation_id":
            new_reservation.id,

        "parking_id":
            slot.parking_id,

        "slot_id":
            slot.id,

        "slot_number":
            slot.slot_number,

        "status":
            "Reserved",

        "qr_token":
            qr_token

    }

# ----------------------------------------
async def cancel_expired_reservations(db: Session):

    expiry_time = datetime.utcnow() - timedelta(hours=1)

    expired_reservations = (
        db.query(models.Reservation)
        .filter(
            models.Reservation.status == "Booked",
            models.Reservation.booking_date <= expiry_time,
            models.Reservation.entry_time == None
        )
        .all()
    )

    cancelled_count = 0

    for reservation in expired_reservations:

        # Find slot
        slot = (
            db.query(models.ParkingSlot)
            .filter(
                models.ParkingSlot.id == reservation.slot_id
            )
            .first()
        )

        # Change slot back to Available
        if slot and slot.status == "Reserved":
            slot.status = "Available"

        # Cancel reservation
        reservation.status = "Cancelled"

        cancelled_count += 1

        # WebSocket notification
        await manager.broadcast(
            json.dumps({
                "event": "reservation_cancelled",
                "reservation_id": reservation.id,
                "parking_id": reservation.parking_id,
                "slot_id": reservation.slot_id,
                "status": "Cancelled",
                "slot_status": "Available"
            })
        )

    # IMPORTANT:
    # Commit once after all changes
    db.commit()

    return cancelled_count
# --------------------------------------------
@router.post("/cleanup-expired")
async def cleanup_expired_reservations(
    db: Session = Depends(get_db)
):

    count = await cancel_expired_reservations(db)

    return {
        "message": "Expired reservations checked",
        "cancelled_count": count
    }

# --------------------------------------------------------

def generate_qr_code(reservation_id: int):

    # Get backend folder
    BASE_DIR = os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    )

    # backend/static/qr_codes
    folder = os.path.join(
        BASE_DIR,
        "static",
        "qr_codes"
    )

    # Create folder if it does not exist
    os.makedirs(folder, exist_ok=True)

    # Data stored inside QR
    qr_data = f"RESERVATION:{reservation_id}"

    # Generate QR
    qr = qrcode.make(qr_data)

    # File name
    file_name = f"{reservation_id}.png"

    # Full file path
    file_path = os.path.join(
        folder,
        file_name
    )

    # Save QR image
    qr.save(file_path)

    print("================================")
    print("Reservation ID:", reservation_id)
    print("QR saved at:", file_path)
    print("QR exists:", os.path.exists(file_path))
    print("================================")

    # URL for frontend
    return f"/static/qr_codes/{file_name}"



# @router.get("/my-history")
# def get_my_history(
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user)
# ):

#     reservations = (
#         db.query(
#             models.Reservation,
#             models.Parking,
#             models.ParkingSlot
#         )
#         .join(
#             models.Parking,
#             models.Reservation.parking_id ==
#             models.Parking.id
#         )
#         .join(
#             models.ParkingSlot,
#             models.Reservation.slot_id ==
#             models.ParkingSlot.id
#         )
#         .filter(
#             models.Reservation.user_id ==
#             current_user.id
#         )
#         .order_by(
#             models.Reservation.id.desc()
#         )
#         .all()
#     )


#     history = []


#     for reservation, parking, slot in reservations:

#         history.append({

#             "reservation_id":
#                 reservation.id,

#             "parking_name":
#                 parking.parking_name,

#             "slot_number":
#                 slot.slot_number,

#             "entry_time":
#                 reservation.entry_time,

#             "exit_time":
#                 reservation.exit_time,

#             "amount":
#                 reservation.total_amount,

#             "status":
#                 reservation.status,

#             "payment_status":
#                 "PAID"

#         })


#     return history


@router.get("/my-history")
def get_my_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    reservations = (
        db.query(
            models.Reservation,
            models.Parking,
            models.ParkingSlot
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
            models.Reservation.user_id ==
            current_user.id
        )
        .order_by(
            models.Reservation.id.desc()
        )
        .all()
    )

    history = []

    for reservation, parking, slot in reservations:

        # Find payment for this reservation
        payment = (
            db.query(models.Payment)
            .filter(
                models.Payment.reservation_id ==
                reservation.id
            )
            .order_by(
                models.Payment.id.desc()
            )
            .first()
        )

        # Get actual payment status
        payment_status = (
            payment.payment_status
            if payment
            else "PENDING"
        )

        history.append({

            "reservation_id":
                reservation.id,

            "parking_name":
                parking.parking_name,

            "slot_number":
                slot.slot_number,

            "entry_time":
                reservation.entry_time,

            "exit_time":
                reservation.exit_time,

            "amount":
                reservation.total_amount,

            "status":
                reservation.status,

            "payment_status":
                payment_status
        })

    return history

# ----------------------------------------------------
@router.get("/{reservation_id}")
def get_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    reservation = db.query(Reservation).filter(
        Reservation.id == reservation_id
    ).first()

    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )

    # Check user ownership
    if reservation.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    # Get parking
    parking = db.query(Parking).filter(
        Parking.id == reservation.parking_id
    ).first()

    return {
        "id": reservation.id,

        "user_id": reservation.user_id,

        "parking_id": reservation.parking_id,

        "parking_name": parking.parking_name if parking else "Unknown Parking",

        "parking_price_per_hour": parking.price if parking else 0,

        "slot_id": reservation.slot_id,

        "vehicle_number": reservation.vehicle_number,

        "vehicle_type": reservation.vehicle_type,

        "booking_date": reservation.booking_date,

        "entry_time": reservation.entry_time,

        "exit_time": reservation.exit_time,

        "total_amount": reservation.total_amount,

        "status": reservation.status,

        "qr_token": reservation.qr_token
    }


# --------------------admin reservation--------------------
@router.get("/reservation")
def all_reservations(
    db: Session = Depends(get_db)
):

    return db.query(models.Reservation).all()

# -----------------------------------------------------

@router.get("/admin/reservations")
def get_admin_reservations(
    db: Session = Depends(get_db)
):

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
        .all()
    )

    result = []

    for reservation, user, parking, slot in reservations:

        result.append({

            "id": reservation.id,

            "user_name": user.full_name,

            "parking_name": parking.parking_name,

            "slot_number": slot.slot_number,

            "vehicle_number": reservation.vehicle_number

        })

    return result

# ------------------admin view api----------------------------------------
@router.get("/admin/reservations/{reservation_id}")
def get_reservation_details(
    reservation_id: int,
    db: Session = Depends(get_db)
):

    result = (
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
            models.Reservation.id == reservation_id
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

        "reservation_id": reservation.id,

        # User
        "user_id": user.id,
        "user_name": user.full_name,
        "user_email": user.email,
        "user_phone": user.phone,

        # Parking
        "parking_id": parking.id,
        "parking_name": parking.parking_name,
        "parking_area": parking.area,
        "parking_address": parking.address,

        # Slot
        "slot_id": slot.id,
        "slot_number": slot.slot_number,

        # Vehicle
        "vehicle_number": reservation.vehicle_number,
        "vehicle_type": reservation.vehicle_type,

        # Reservation
        "booking_date": reservation.booking_date,
        "entry_time": reservation.entry_time,
        "exit_time": reservation.exit_time,
        "total_amount": reservation.total_amount,
        "status": reservation.status

    }

# --------------------------delete reservation in admin -------------------------------
@router.delete("/admin/reservations/{reservation_id}")
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



# ------------------view button history user-----------------
# @router.get("/details/{reservation_id}")
# def get_reservation_details(
#     reservation_id: int,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user)
# ):

#     # ==========================================
#     # FIND RESERVATION
#     # ==========================================

#     reservation = db.query(
#         models.Reservation
#     ).filter(
#         models.Reservation.id == reservation_id
#     ).first()


#     # ==========================================
#     # RESERVATION NOT FOUND
#     # ==========================================

#     if not reservation:

#         raise HTTPException(
#             status_code=404,
#             detail="Reservation not found"
#         )


#     # ==========================================
#     # SECURITY CHECK
#     # ==========================================

#     if reservation.user_id != current_user.id:

#         raise HTTPException(
#             status_code=403,
#             detail="You cannot view this reservation"
#         )


#     # ==========================================
#     # GET PARKING
#     # ==========================================

#     parking = db.query(
#         models.Parking
#     ).filter(
#         models.Parking.id == reservation.parking_id
#     ).first()


#     # ==========================================
#     # GET SLOT
#     # ==========================================

#     slot = db.query(
#         models.ParkingSlot
#     ).filter(
#         models.ParkingSlot.id == reservation.slot_id
#     ).first()


#     # ==========================================
#     # RESPONSE
#     # ==========================================

#     return {

#         "reservation_id":
#             reservation.id,

#         "parking_name":
#             parking.parking_name
#             if parking else "N/A",

#         "area":
#             parking.area
#             if parking else "N/A",

#         "city":
#             parking.city
#             if parking else "N/A",

#         "address":
#             parking.address
#             if parking else "N/A",

#         "slot_number":
#             slot.slot_number
#             if slot else "N/A",

#         "entry_time":
#             reservation.entry_time,

#         "exit_time":
#             reservation.exit_time,

#         "amount":
#             reservation.amount
#             if hasattr(reservation, "amount")
#             else getattr(
#                 reservation,
#                 "total_amount",
#                 0
#             ),

#         "payment_status":
#             getattr(
#                 reservation,
#                 "payment_status",
#                 "PENDING"
#             ),

#         "status":
#             reservation.status
#     }

@router.get("/details/{reservation_id}")
def get_reservation_details(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # ==========================================
    # FIND RESERVATION
    # ==========================================

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

    # ==========================================
    # SECURITY CHECK
    # ==========================================

    if reservation.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot view this reservation"
        )

    # ==========================================
    # GET PARKING
    # ==========================================

    parking = (
        db.query(models.Parking)
        .filter(
            models.Parking.id ==
            reservation.parking_id
        )
        .first()
    )

    # ==========================================
    # GET SLOT
    # ==========================================

    slot = (
        db.query(models.ParkingSlot)
        .filter(
            models.ParkingSlot.id ==
            reservation.slot_id
        )
        .first()
    )

    # ==========================================
    # GET PAYMENT
    # ==========================================

    payment = (
        db.query(models.Payment)
        .filter(
            models.Payment.reservation_id ==
            reservation.id
        )
        .order_by(
            models.Payment.id.desc()
        )
        .first()
    )

    # ==========================================
    # PAYMENT STATUS
    # ==========================================

    payment_status = (
        payment.payment_status
        if payment
        else "PENDING"
    )

    # ==========================================
    # RESPONSE
    # ==========================================

    return {

        "reservation_id":
            reservation.id,

        "parking_name":
            parking.parking_name
            if parking else "N/A",

        "area":
            parking.area
            if parking else "N/A",

        "city":
            parking.city
            if parking else "N/A",

        "address":
            parking.address
            if parking else "N/A",

        "slot_number":
            slot.slot_number
            if slot else "N/A",

        "entry_time":
            reservation.entry_time,

        "exit_time":
            reservation.exit_time,

        "amount":
            reservation.total_amount,

        "payment_status":
            payment_status,

        "status":
            reservation.status
    }