from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Contact
from app.schemas import ContactCreate

router = APIRouter(
    prefix="/contact",
    tags=["Contact"]
)

@router.post("/")
def save_contact(contact: ContactCreate,
                 db: Session = Depends(get_db)):

    new_contact = Contact(

        full_name=contact.full_name,
        email=contact.email,
        subject=contact.subject,
        message=contact.message

    )

    db.add(new_contact)

    db.commit()

    db.refresh(new_contact)

    return {
        "message": "Message sent successfully"
    }

@router.get("/")
def get_all_messages(db: Session = Depends(get_db)):

    contacts = db.query(Contact).all()

    return contacts