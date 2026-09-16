from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import OwnerApplication,User
from app.schemas import OwnerApplicationCreate
from app.email_service import send_owner_application_email

from app.util import hash_password


router = APIRouter(
    prefix="/owner-applications",
    tags=["Owner Applications"]
)


@router.post("/")
def create_owner_application(
    application: OwnerApplicationCreate,
    db: Session = Depends(get_db)
):

    # --------------------------------
    # Check existing email
    # --------------------------------

    existing_application = (
        db.query(OwnerApplication)
        .filter(
            OwnerApplication.email ==
            application.email
        )
        .first()
    )


    if existing_application:

        raise HTTPException(
            status_code=400,
            detail="Email already exists."
        )


    # --------------------------------
    # Hash password
    # --------------------------------

    hashed_password = hash_password(
        application.password
    )


    # --------------------------------
    # Create application
    # --------------------------------

    new_application = OwnerApplication(

        owner_name=
            application.owner_name,

        business_name=
            application.business_name,

        email=
            application.email,

        password_hash=
            hashed_password,

        phone=
            application.phone,

        parking_name=
            application.parking_name,

        address=
            application.address,

        city=
            application.city,

        state=
            application.state,

        pincode=
            application.pincode,

        total_slots=
            application.total_slots,

        status="pending"
    )


    # --------------------------------
    # Save to database
    # --------------------------------

    db.add(new_application)

    db.commit()

    db.refresh(new_application)


    # --------------------------------
    # Response
    # --------------------------------

    return {

        "message":
            "Owner application submitted successfully.",

        "application_id":
            new_application.id,

        "status":
            new_application.status
    }

    

# -------------------------get owner application-----------------


@router.get("/")
def get_owner_applications(
    db: Session = Depends(get_db)
):

    applications = (
        db.query(OwnerApplication)
        .order_by(
            OwnerApplication.id.desc()
        )
        .all()
    )

    result = []

    for application in applications:

        result.append({

            "id": application.id,

            "owner_name":
                application.owner_name,

            "business_name":
                application.business_name,

            "email":
                application.email,

            "phone":
                application.phone,

            "parking_name":
                application.parking_name,

            "address":
                application.address,

            "city":
                application.city,

            "state":
                application.state,

            "pincode":
                application.pincode,

            "total_slots":
                application.total_slots,

            "status":
                application.status
        })

    return result



# -------------using email----------------
# ------------------ APPROVE API ----------------------

# @router.put("/{application_id}/approve")
# async def approve_owner(
#     application_id: int,
#     db: Session = Depends(get_db)
# ):

#     # -----------------------------------------
#     # Find application
#     # -----------------------------------------

#     application = (
#         db.query(OwnerApplication)
#         .filter(
#             OwnerApplication.id == application_id
#         )
#         .first()
#     )

#     if not application:
#         raise HTTPException(
#             status_code=404,
#             detail="Owner application not found"
#         )

#     # -----------------------------------------
#     # Check status
#     # -----------------------------------------

#     if application.status == "APPROVED":
#         raise HTTPException(
#             status_code=400,
#             detail="Application already approved"
#         )

#     # -----------------------------------------
#     # Check whether email already exists
#     # -----------------------------------------

#     existing_user = (
#         db.query(User)
#         .filter(
#             User.email == application.email
#         )
#         .first()
#     )

#     if existing_user:
#         raise HTTPException(
#             status_code=400,
#             detail="User with this email already exists"
#         )

#     # -----------------------------------------
#     # Create owner account
#     # -----------------------------------------

#     new_owner = User(

#         full_name=application.owner_name,

#         email=application.email,

#         phone=application.phone,

#         password=application.password_hash,

#         role="OWNER"
#     )

#     db.add(new_owner)

#     # -----------------------------------------
#     # Update application status
#     # -----------------------------------------

#     application.status = "APPROVED"

#     # -----------------------------------------
#     # Save database changes
#     # -----------------------------------------

#     try:

#         db.commit()

#         db.refresh(new_owner)

#     except Exception as e:

#         db.rollback()

#         print("APPROVE OWNER ERROR:", e)

#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )

#     # -----------------------------------------
#     # SEND APPROVAL EMAIL
#     # -----------------------------------------

#     try:

#         await send_owner_application_email(
#             owner_email=application.email,
#             owner_name=application.owner_name,
#             status="APPROVED"
#         )

#     except Exception as e:

#         print("APPROVAL EMAIL ERROR:", e)

#         # IMPORTANT:
#         # Do not rollback here.
#         #
#         # Owner is already successfully created
#         # and application is already approved.

#     # -----------------------------------------
#     # Response
#     # -----------------------------------------

#     return {
#         "message": "Owner approved successfully",

#         "user": {
#             "id": new_owner.id,
#             "full_name": new_owner.full_name,
#             "email": new_owner.email,
#             "phone": new_owner.phone,
#             "role": new_owner.role
#         }
#     }

@router.put("/{application_id}/approve")
async def approve_owner(
    application_id: int,
    db: Session = Depends(get_db)
):

    # =========================================
    # FIND APPLICATION
    # =========================================

    application = (
        db.query(OwnerApplication)
        .filter(
            OwnerApplication.id == application_id
        )
        .first()
    )


    if not application:

        raise HTTPException(
            status_code=404,
            detail="Owner application not found"
        )


    # =========================================
    # CHECK STATUS
    # =========================================

    if application.status.upper() == "APPROVED":

        raise HTTPException(
            status_code=400,
            detail="Application already approved"
        )


    # =========================================
    # CHECK EXISTING USER
    # =========================================

    existing_user = (
        db.query(User)
        .filter(
            User.email == application.email
        )
        .first()
    )


    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )


    # =========================================
    # CREATE OWNER
    # =========================================

    new_owner = User(

        full_name=application.owner_name,

        email=application.email,

        phone=application.phone,

        password=application.password_hash,

        role="OWNER"
    )


    db.add(new_owner)


    # =========================================
    # UPDATE APPLICATION
    # =========================================

    application.status = "APPROVED"


    # =========================================
    # SAVE DATABASE
    # =========================================

    try:

        db.commit()

        db.refresh(new_owner)

    except Exception as e:

        db.rollback()

        print(
            "APPROVE OWNER DATABASE ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to approve owner"
        )


    # =========================================
    # SEND APPROVAL EMAIL
    # =========================================

    email_sent = True


    try:

        print(
            "Sending APPROVED email to:",
            application.email
        )


        await send_owner_application_email(

            owner_email=application.email,

            owner_name=application.owner_name,

            status="APPROVED"

        )


        print(
            "APPROVED EMAIL SENT SUCCESSFULLY"
        )


    except Exception as e:

        email_sent = False


        print(
            "APPROVAL EMAIL FAILED:",
            type(e).__name__,
            str(e)
        )


    # =========================================
    # RESPONSE
    # =========================================

    return {

        "message":
            "Owner approved successfully",

        "email_sent":
            email_sent,

        "user": {

            "id":
                new_owner.id,

            "full_name":
                new_owner.full_name,

            "email":
                new_owner.email,

            "phone":
                new_owner.phone,

            "role":
                new_owner.role
        }

    }


# ----------------------- REJECT API ------------------

@router.put("/{application_id}/reject")
async def reject_owner_application(
    application_id: int,
    db: Session = Depends(get_db)
):

    # -----------------------------------------
    # Find owner application
    # -----------------------------------------

    application = (
        db.query(OwnerApplication)
        .filter(
            OwnerApplication.id == application_id
        )
        .first()
    )

    # -----------------------------------------
    # Application not found
    # -----------------------------------------

    if not application:

        raise HTTPException(
            status_code=404,
            detail="Owner application not found"
        )

    # -----------------------------------------
    # Already rejected
    # -----------------------------------------

    if application.status == "REJECTED":

        return {
            "message": "Application already rejected",
            "application_id": application.id,
            "status": application.status
        }

    # -----------------------------------------
    # Update status
    # -----------------------------------------

    application.status = "REJECTED"

    # -----------------------------------------
    # Save database
    # -----------------------------------------

    try:

        db.commit()

        db.refresh(application)

    except Exception as e:

        db.rollback()

        print("REJECT OWNER ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    # -----------------------------------------
    # SEND REJECTION EMAIL
    # -----------------------------------------

    try:

        await send_owner_application_email(
            owner_email=application.email,
            owner_name=application.owner_name,
            status="REJECTED"
        )

    except Exception as e:

        print("REJECTION EMAIL ERROR:", e)

        # Don't rollback the application status.
        # It is already successfully rejected.

    # -----------------------------------------
    # Response
    # -----------------------------------------

    return {
        "message": "Owner application rejected successfully",
        "application_id": application.id,
        "status": application.status
    }


# ---------------delete owner_app------------------------
# =====================================================
# DELETE OWNER APPLICATION
# =====================================================

@router.delete("/{application_id}")
def delete_owner_application(
    application_id: int,
    db: Session = Depends(get_db)
):

    # -----------------------------------------
    # Find application
    # -----------------------------------------

    application = (
        db.query(OwnerApplication)
        .filter(
            OwnerApplication.id == application_id
        )
        .first()
    )


    # -----------------------------------------
    # Application not found
    # -----------------------------------------

    if not application:

        raise HTTPException(
            status_code=404,
            detail="Owner application not found"
        )


    # -----------------------------------------
    # Delete application
    # -----------------------------------------

    try:

        db.delete(application)

        db.commit()

    except Exception as e:

        db.rollback()

        print(
            "DELETE OWNER APPLICATION ERROR:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to delete owner application"
        )


    # -----------------------------------------
    # Response
    # -----------------------------------------

    return {

        "message":
            "Owner application deleted successfully",

        "application_id":
            application_id

    }
