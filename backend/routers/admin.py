from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Admin
from app.schemas import AdminLogin, AdminResetPassword,ParkingAdminResponse
from app.util import verify_password, hash_password
from app.models import User,OwnerApplication,Parking,Reservation,ParkingSlot
from app.schemas import OwnerCreate,ParkingResponse
from app.util import hash_password
from app.oauth2 import get_current_user
import json
from app.websocket_manager import manager

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

@router.post("/login")
def admin_login(
    request: AdminLogin,
    db: Session = Depends(get_db)
):

    admin = db.query(Admin).filter(
        Admin.email == request.email
    ).first()

    if not admin:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        request.password,
        admin.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=403,
            detail="Admin account is inactive"
        )

    return {
        "message": "Admin login successful",
        "admin_id": admin.id,
        "admin_name": admin.full_name
    }


# -------------------reset password--------------------
@router.put("/reset-password")
def reset_admin_password(
    request: AdminResetPassword,
    db: Session = Depends(get_db)
):

    admin = db.query(Admin).filter(
        Admin.email == request.email
    ).first()

    if not admin:
        raise HTTPException(
            status_code=404,
            detail="Admin email not found"
        )

    admin.password = hash_password(
        request.new_password
    )

    db.commit()

    return {
        "message": "Password changed successfully"
    }

# ----------------owner api------------
@router.post("/owners")
def create_owner(
    owner:OwnerCreate,
    db: Session = Depends(get_db)
):

    # Check if email already exists
    existing_user = db.query(User).filter(
        User.email == owner.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Hash password
    hashed_password =hash_password(
        owner.password
    )

    # Create owner
    new_owner =User(

        full_name=owner.full_name,

        email=owner.email,

        phone=owner.phone,

        password=hashed_password,

        role="OWNER"
    )

    db.add(new_owner)

    db.commit()

    db.refresh(new_owner)

    return {
        "message": "Owner created successfully",

        "owner": {
            "id": new_owner.id,
            "full_name": new_owner.full_name,
            "email": new_owner.email,
            "phone": new_owner.phone,
            "role": new_owner.role
        }
    }


# ------------------------approve application-----------------
@router.post("/{application_id}/approve")
def approve_owner_application(
    application_id: int,
    db: Session = Depends(get_db)
):

    application = db.query(
        OwnerApplication
    ).filter(
        OwnerApplication.id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    if application.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail="Application already processed"
        )

    existing_user = db.query(
        User
    ).filter(
        User.email == application.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )

    new_owner =User(
        full_name=application.owner_name,
        email=application.email,
        phone=application.phone,
        password=hash_password("Temp@123"),
        role="OWNER"
    )

    db.add(new_owner)

    application.status = "APPROVED"

    db.commit()

    return {
        "message": "Owner approved successfully",
        "role": "OWNER"
    }

# ----------------owner rejected-------------------

@router.post("/{application_id}/reject")
def reject_owner_application(
    application_id: int,
    db: Session = Depends(get_db)
):

    application = db.query(
        OwnerApplication
    ).filter(
        OwnerApplication.id == application_id
    ).first()

    if not application:

        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    if application.status != "PENDING":

        raise HTTPException(
            status_code=400,
            detail="Application already processed"
        )

    application.status = "REJECTED"

    db.commit()

    return {
        "message": "Application rejected"
    }

# ----------------------get api for parking---------------------------

@router.get("/", response_model=list[ParkingResponse])
def get_all_parkings(db: Session = Depends(get_db)):

    parkings = db.query(Parking).all()

    return parkings

# --------------------delete-------------------

@router.delete("/parkings/{parking_id}")
async def delete_parking(
    parking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    print("DELETE PARKING REQUEST:", parking_id)

    # --------------------------------
    # CHECK ADMIN
    # --------------------------------
    print("USER ID:", current_user.id)
    print("USER EMAIL:", current_user.email)
    print("USER ROLE:", current_user.role)

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    # --------------------------------
    # FIND PARKING
    # --------------------------------

    parking = db.query(Parking).filter(
        Parking.id == parking_id
    ).first()

    if not parking:

        raise HTTPException(
            status_code=404,
            detail="Parking not found"
        )

    try:

        # --------------------------------
        # DELETE RESERVATIONS
        # --------------------------------

        db.query(Reservation).filter(
            Reservation.parking_id == parking_id
        ).delete(
            synchronize_session=False
        )

        # --------------------------------
        # DELETE PARKING SLOTS
        # --------------------------------

        db.query(ParkingSlot).filter(
            ParkingSlot.parking_id == parking_id
        ).delete(
            synchronize_session=False
        )

        # --------------------------------
        # DELETE PARKING
        # --------------------------------

        db.delete(parking)

        db.commit()

        print(
            "Parking deleted successfully:",
            parking_id
        )

        # --------------------------------
        # WEBSOCKET
        # --------------------------------

        await manager.broadcast(
            json.dumps({
                "event": "parking_deleted",
                "parking_id": parking_id
            })
        )

        return {
            "message": "Parking deleted successfully",
            "parking_id": parking_id
        }

    except Exception as e:

        db.rollback()

        print(
            "DELETE PARKING ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )