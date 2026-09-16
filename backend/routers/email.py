from fastapi import APIRouter

from app.email_service import send_owner_application_email

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, OwnerApplication
from app.email_service import send_owner_application_email


router = APIRouter()


@router.get("/test-email")
@router.get("/test-email")
async def test_email():

    await send_owner_application_email(
        owner_email="bhavsarmeshwa1708@gmail.com",
        owner_name="Test Owner",
        status="Approved"
    )

    return {
        "message": "Test email sent successfully"
    }