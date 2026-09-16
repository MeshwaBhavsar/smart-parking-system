# from readline import backend

from fastapi import APIRouter, Depends,HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import User,Parking,ParkingSlot,Reservation,Vehicle,Payment
from app.schemas import UserResponse,UserUpdate
from app.oauth2 import get_current_user
import json

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users



@router.get("/search/{user_id}", response_model=UserResponse)
def search_user(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User Not Found")

    return user



# --------------update user admin side--------------
@router.put("/{id}", response_model=UserResponse)
async def update_user(
    id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.id == id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    existing_user = db.query(User).filter(
        User.email == user_data.email,
        User.id != id
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    user.full_name = user_data.full_name
    user.email = user_data.email
    user.phone = user_data.phone
    user.role = user_data.role

    db.commit()
    db.refresh(user)

    await manager.broadcast(
        json.dumps({
            "event": "user_updated",
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role
            }
        })
    )

    return user


@router.delete("/{id}")
def delete_user(id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == id).first()

    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    db.delete(user)

    db.commit()

    return {
        "message": "User deleted successfully"
    }




# ----------------user dashboard--------------------


@router.get("/dashboard")
def get_user_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    user_name = getattr(
        current_user,
        "name",
        None
    )
    if not user_name:
        user_name = current_user.email
    
    # -----------------------------------------
    # TOTAL BOOKINGS
    # -----------------------------------------

    total_bookings = db.query(
        Reservation
    ).filter(
        Reservation.user_id == current_user.id
    ).count()

    # -----------------------------------------
    # TOTAL VEHICLES
    # -----------------------------------------

    total_vehicles = db.query(
        Vehicle
    ).filter(
        Vehicle.user_id == current_user.id
    ).count()

    # -----------------------------------------
    # TOTAL SPENT
    # -----------------------------------------
    total_spent = db.query(
    func.coalesce(
        func.sum(Payment.amount),
        0
    )
).filter(
    Payment.user_id == current_user.id
).scalar()
    # -----------------------------------------
    # AVAILABLE SLOTS
    # -----------------------------------------

    available_slots = db.query(
        ParkingSlot
    ).filter(
        ParkingSlot.status == "AVAILABLE"
    ).count()

    # -----------------------------------------
    # CURRENT RESERVATION
    # -----------------------------------------

    current_reservation = db.query(
        Reservation
    ).filter(
        Reservation.user_id == current_user.id,
        Reservation.status.in_([
            "RESERVED",
            "PARKED",
            "ENTRY_PENDING",
            "EXIT_PENDING_PAYMENT"
           

        ])
    ).order_by(
        Reservation.id.desc()
    ).first()

    current_data = None

    if current_reservation:

        parking = db.query(
            Parking
        ).filter(
            Parking.id == current_reservation.parking_id
        ).first()

        slot = db.query(
            ParkingSlot
        ).filter(
            ParkingSlot.id == current_reservation.slot_id
        ).first()

        current_data = {
            "reservation_id": current_reservation.id,

            "parking_name":
                parking.parking_name
                if parking else "N/A",

            "slot_number":
                slot.slot_number
                if slot else "N/A",

            "date":
                current_reservation.created_at,

            "vehicle_number":
                getattr(
                    current_reservation,
                    "vehicle_number",
                    None
                ),

            "status":
                current_reservation.status,

            "qr_token":
                getattr(
                    current_reservation,
                    "qr_token",
                    None
                )
        }

    # -----------------------------------------
    # RESPONSE
    # -----------------------------------------

    return {
        "user_name": getattr(
            current_user,
            "name",
            current_user.email
        ),

        "total_bookings": total_bookings,

        "total_vehicles": total_vehicles,

        "total_spent": float(
            total_spent or 0
        ),

        "available_slots": available_slots,

        "current_reservation": current_data
    }



# -----------------single user ---------------
@router.get("/{id}", response_model=UserResponse)
def get_user(id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# ------------------------for login ---------------------
@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "name": current_user.name
    }


# ----------------websocket----------------
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket_manager import manager



@router.websocket("/ws/users")
async def user_websocket(websocket: WebSocket):

    await manager.connect(websocket)

    try:

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(websocket)