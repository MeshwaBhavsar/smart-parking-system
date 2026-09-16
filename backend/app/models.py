from sqlalchemy import Column, Integer, String,Text,DateTime,Float,ForeignKey
from .database import Base
from sqlalchemy.sql import func
from datetime import datetime


from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    #for register

    full_name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    phone=Column(String,nullable=False)

    password = Column(String, nullable=False)

    role = Column(
        String,
        nullable=False,
        default="CUSTOMER"
    )

    profile = relationship(
        "Profile",
        back_populates="user",
        uselist=False,
        cascade="all, delete"
    )

# ----------------------------------
class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    gender = Column(String(20), nullable=True)

    city = Column(String(100), nullable=True)

    address = Column(String(255), nullable=True)

    photo = Column(String(255), nullable=True)

    user = relationship(
        "User",
        back_populates="profile"
    )






# --------------------------------------------
class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    subject = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)



# models.py

class Parking(Base):
    __tablename__ = "parkings"

    id = Column(Integer, primary_key=True, index=True)

    parking_name = Column(String, nullable=False)

    city = Column(String, nullable=False)

    area = Column(String, nullable=False)

    address = Column(String)

    latitude = Column(Float)

    longitude = Column(Float)

    total_slots = Column(Integer)

    price = Column(Integer)

    slots = relationship(
        "ParkingSlot",
        back_populates="parking",
        cascade="all, delete"
    )

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)


class ParkingSlot(Base):

    __tablename__ = "parking_slots"

    id = Column(Integer, primary_key=True, index=True)

    parking_id = Column(
        Integer,
        ForeignKey("parkings.id", ondelete="CASCADE")
    )

    slot_number = Column(String, nullable=False)

    status = Column(
        String,
        default="Available"
    )

    parking = relationship(
        "Parking",
        back_populates="slots"
    )


# ------------------------reservation---------------------
class Reservation(Base):

    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    parking_id = Column(Integer, ForeignKey("parkings.id"))

    slot_id = Column(Integer, ForeignKey("parking_slots.id"))

    vehicle_number = Column(String)

    vehicle_type = Column(String)

    booking_date = Column(DateTime, default=datetime.utcnow)

    entry_time = Column(DateTime, nullable=True)

    exit_time = Column(DateTime, nullable=True)

    total_amount = Column(Float, default=0)

    status = Column(String, default="Booked")

    qr_token = Column(String, unique=True, nullable=True)

    payment = relationship(
        "Payment",
        back_populates="reservation",
        uselist=False
    )

   




# ------------------admin login----------------------
from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False, index=True)

    password = Column(String, nullable=False)

    is_active = Column(Boolean, default=True)


# -------------------owner-------------------------

class OwnerApplication(Base):

    __tablename__ = "owner_applications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    owner_name = Column(
        String,
        nullable=False
    )

    business_name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        nullable=False,
        index=True
    )

    password_hash = Column(String, nullable=False)

    phone = Column(
        String,
        nullable=False
    )

    parking_name = Column(
        String,
        nullable=False
    )

    address = Column(
        String,
        nullable=False
    )

    city = Column(
        String,
        nullable=False
    )

    state = Column(
        String,
        nullable=False
    )

    pincode = Column(
        String,
        nullable=False
    )

    total_slots = Column(
        Integer,
        nullable=False
    )

    status = Column(
        String,
        nullable=False,
        default="PENDING"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

# -----------------payment-------------------------

from sqlalchemy.orm import relationship

from datetime import datetime



class Payment(Base):

    __tablename__ = "payment"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    reservation_id = Column(
        Integer,
        ForeignKey("reservations.id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    amount = Column(
        Float,
        nullable=False
    )

    payment_method = Column(
        String,
        nullable=False
    )

    transaction_id = Column(
        String,
        unique=True,
        nullable=True
    )

    payment_status = Column(
        String,
        default="Created",
        nullable=False
    )

    payment_date = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # Razorpay information

    razorpay_order_id = Column(
        String,
        unique=True,
        nullable=True
    )

    razorpay_payment_id = Column(
        String,
        unique=True,
        nullable=True
    )

    razorpay_signature = Column(
        String,
        nullable=True
    )

    reservation = relationship(
        "Reservation",
        back_populates="payment"
    )


# -------------------vehical----------------------


class Vehicle(Base):

    __tablename__ = "vehicles"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    vehicle_number = Column(
        String,
        nullable=False
    )

    vehicle_type = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )