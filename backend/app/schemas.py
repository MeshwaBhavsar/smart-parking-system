from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone:str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int


class TokenData(BaseModel):
    id: int | None = None


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str
    role:str

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: str
    email: str
    phone: str
    role: str


# ----------------------owner--------------------

class OwnerCreate(BaseModel):

    full_name: str

    email: EmailStr

    phone: str

    password: str


# ------------profile-------------------
class ProfileResponse(BaseModel):
    gender: str | None = None
    city: str | None = None
    address: str | None = None
    photo: str | None = None

    class Config:
        from_attributes = True

# ----------------------------
class ProfileUpdate(BaseModel):
    full_name: str
    phone: str
    gender: str | None = None
    city: str | None = None
    address: str | None = None


# ----------------contact-----------------
from pydantic import BaseModel, EmailStr

class ContactCreate(BaseModel):
    full_name: str
    email: EmailStr
    subject: str
    message: str


class ContactResponse(ContactCreate):
    id: int

    class Config:
        from_attributes = True


#--------------------owner application--------------------------
class OwnerApplicationCreate(BaseModel):

    owner_name: str

    business_name: str

    email: EmailStr

    password: str

    phone: str

    parking_name: str

    address: str

    city: str

    state: str

    pincode: str

    total_slots: int


class OwnerApplicationResponse(BaseModel):

    id: int

    owner_name: str

    business_name: str

    email: str

    password: str

    phone: str

    parking_name: str

    address: str

    city: str

    state: str

    pincode: str

    total_slots: int

    status: str

    class Config:
        from_attributes = True



class OwnerLogin(BaseModel):

    email: EmailStr

    password: str




# -----------------------------parking--------------------------------
class ParkingCreate(BaseModel):

    parking_name: str
    city: str
    area: str
    address: str
    latitude: float
    longitude: float
    total_slots: int
    price: float


class ParkingResponse(BaseModel):

    id: int
    parking_name: str
    city: str
    area: str
    address: str
    latitude: float
    longitude: float
    total_slots: int
    price: float
    owner_id: int

    class Config:
        from_attributes = True
   


class ParkingUpdate(BaseModel):

    parking_name: str
    city: str
    area: str
    address: str
    latitude: float
    longitude: float
    total_slots: int
    price: float


class ParkingAdminResponse(BaseModel):
    id: int
    parking_name: str
    city: str
    area: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_slots: Optional[int] = None
    price: Optional[int] = None
    owner_id: int

    class Config:
        from_attributes = True

# ---------------------sloat------------------

class ParkingSlotResponse(BaseModel):

    id: int
    parking_id: int
    slot_number: str
    status: str

    class Config:
        from_attributes = True

# -----------------forget password-----------------

class ForgotPassword(BaseModel):
    email: EmailStr


class ResetPassword(BaseModel):
    email: EmailStr
    new_password: str


# ----------------------chnage password------------
from pydantic import BaseModel

class ChangePassword(BaseModel):
    current_password: str
    new_password: str

# -------------------reservation---------------
class ReservationCreate(BaseModel):

    parking_id:int

    slot_id:int

    vehicle_number:str

    vehicle_type:str

class ReservationResponse(BaseModel):

    
    id: int

    user_id: int

    parking_id: int

    slot_id: int

    vehicle_number: str

    vehicle_type: str

    booking_date: datetime

    entry_time: datetime | None = None

    exit_time: datetime | None = None

    total_amount: float

    status: str

    

    qr_image: str | None

    class Config:
        from_attributes = True

# ----------------------scan qr-------------------
class QRScanRequest(BaseModel):

    qr_token: str


# -------------------admin---------------------
class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminResetPassword(BaseModel):
    email: EmailStr
    new_password: str


# ---------------payment----------------------------

# class PaymentCreate(BaseModel):
#     reservation_id: int
#     payment_method: str


# class PaymentResponse(BaseModel):
#     id: int
#     reservation_id: int
#     user_id: int
#     amount: float
#     payment_method: str
#     transaction_id: str
#     payment_status: str
#     payment_date: Optional[datetime]
#     created_at: datetime

#     class Config:
#         from_attributes = True

class PaymentVerify(BaseModel):

    reservation_id: int

    razorpay_order_id: str

    razorpay_payment_id: str

    razorpay_signature: str


# ---------------------vehical-----------------


class VehicleCreate(BaseModel):

    vehicle_number: str
    vehicle_type: str


class VehicleUpdate(BaseModel):

    vehicle_number: str
    vehicle_type: str


class VehicleResponse(BaseModel):

    id: int
    vehicle_number: str
    vehicle_type: str
    created_at: datetime

    class Config:
        from_attributes = True