from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .database import get_db
from . import models

SECRET_KEY = "smartparkingsecretkey"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def verify_access_token(token):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        id = payload.get("user_id")

        if id is None:
            return None

        return id

    except JWTError:

        return None


def get_current_user(

        token: str = Depends(oauth2_scheme),

        db: Session = Depends(get_db)

):

    id = verify_access_token(token)

    if id is None:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Invalid Token"

        )

    user = db.query(models.User).filter(
        models.User.id == id
    ).first()

    if not user:

        raise HTTPException(

            status_code=404,

            detail="User Not Found"

        )

    return user