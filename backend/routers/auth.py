from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app import schemas
from  app import util
from app.oauth2 import create_access_token
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas import UserCreate, UserResponse,UserLogin,Token
from app.models import User
from app.util import hash_password,verify_password

router = APIRouter(tags=["Authentication"])


@router.post("/register", response_model=UserResponse)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    try:

        print("REGISTER DATA:", user_data)                                                                                                      

        # Check existing email
        existing_user = db.query(User).filter(
            User.email == user_data.email
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        new_user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            phone=user_data.phone,
            password=hash_password(user_data.password),
            role="CUSTOMER"
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        print("USER CREATED:", new_user.id)

        return new_user

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        print("REGISTER ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ----------------------------------------------
@router.post("/login")
def login(
    user: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    db_user = db.query(models.User).filter(
        models.User.email == user.username
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Email"
        )

    valid = util.verify_password(
        user.password,
        db_user.password
    )

    if not valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid Password"
        )

    # Create JWT token
    token = create_access_token(
        {
            "user_id": db_user.id,
            "role": db_user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",

        "user": {
            "id": db_user.id,
            "full_name": db_user.full_name,
            "email": db_user.email,
            "phone": db_user.phone,
            "role": db_user.role
        }
    }


# -----------------forget password---------------
@router.post("/forgot-password")
def forgot_password(
    request: schemas.ForgotPassword,
    db: Session = Depends(get_db)
):

    user = db.query(models.User).filter(
        models.User.email == request.email
    ).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="Email not found"
        )

    return {
        "message": "Email found"
    }

# -------------reset password--------------
@router.put("/reset-password")
def reset_password(
    request: schemas.ResetPassword,
    db: Session = Depends(get_db)
):

    user = db.query(models.User).filter(
        models.User.email == request.email
    ).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="Email not found"
        )


    user.password = util.hash_password(request.new_password)

    db.commit()

    return {
        "message": "Password updated successfully"
    }

# -----------------chnage password---------------
from app.oauth2 import get_current_user
@router.put("/change-password")
def change_password(
    request: schemas.ChangePassword,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # Verify current password
    if not util.verify_password(
        request.current_password,
        current_user.password
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    # Save new hashed password
    current_user.password = util.hash_password(request.new_password)

    db.commit()

    return {
        "message": "Password changed successfully"
    }