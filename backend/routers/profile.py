from fastapi import APIRouter, Depends,Form,UploadFile,File
from sqlalchemy.orm import Session

from app.database import get_db
from app.oauth2 import get_current_user
from app import models
from app import schemas
import os
import shutil

router = APIRouter(
    tags=["Profile"]
)

@router.get("/profile")
def get_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    profile = db.query(models.Profile).filter(
        models.Profile.user_id == current_user.id
    ).first()

    return {

        "id": current_user.id,

        "full_name": current_user.full_name,

        "email": current_user.email,

        "phone": current_user.phone,

        "gender": profile.gender if profile else None,

        "city": profile.city if profile else None,

        "address": profile.address if profile else None,

        "photo": profile.photo if profile else None

    }


@router.put("/profile")
def update_profile(

    full_name: str = Form(...),

    phone: str = Form(...),

    gender: str = Form(None),

    city: str = Form(None),

    address: str = Form(None),

    photo: UploadFile = File(None),

    db: Session = Depends(get_db),

    current_user: models.User =
        Depends(get_current_user)

):

    # =========================================
    # UPDATE USER TABLE
    # =========================================

    current_user.full_name = full_name
    current_user.phone = phone


    # =========================================
    # FIND PROFILE
    # =========================================

    user_profile = db.query(
        models.Profile
    ).filter(
        models.Profile.user_id ==
        current_user.id
    ).first()


    # =========================================
    # CREATE PROFILE IF NOT EXISTS
    # =========================================

    if not user_profile:

        user_profile = models.Profile(

            user_id=current_user.id,

            gender=gender,

            city=city,

            address=address

        )

        db.add(user_profile)

    else:

        user_profile.gender = gender

        user_profile.city = city

        user_profile.address = address


    # =========================================
    # PHOTO
    # =========================================

    if photo:

        os.makedirs(
            "uploads/profile",
            exist_ok=True
        )


        filename = (
            f"{current_user.id}_{photo.filename}"
        )


        filepath = os.path.join(
            "uploads/profile",
            filename
        )


        with open(
            filepath,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                photo.file,
                buffer
            )


        # user_profile.photo = filepath
        user_profile.photo = (
        f"uploads/profile/{filename}"
    )


    # =========================================
    # SAVE
    # =========================================

    db.commit()

    db.refresh(current_user)

    db.refresh(user_profile)


    return {

        "message":
            "Profile updated successfully",

        "photo":
            user_profile.photo

    }


@router.delete("/delete-account")
def delete_account(

    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)

):

    # Find profile
    profile = db.query(models.Profile).filter(
        models.Profile.user_id == current_user.id
    ).first()

    if profile:
        db.delete(profile)

    # Delete user
    db.delete(current_user)

    db.commit()

    return {
        "message": "Account deleted successfully"
    }