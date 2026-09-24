from fastapi import APIRouter, Depends,HTTPException,WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
import json
#from backend.routers.reservation import cancel_expired_reservations
from app.routers.reservation import cancel_expired_reservations

from app.database import get_db
from app import models, schemas
import string
from math import radians, sin, cos, sqrt, atan2
from app.websocket_manager import manager
import asyncio
from app.oauth2 import get_current_user

router = APIRouter(
    prefix="/parking",
    tags=["Parking"]
)


@router.post("/")
async def add_parking(
    parking: schemas.ParkingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    new_parking = models.Parking(

        parking_name=parking.parking_name,
        area=parking.area,
        city=parking.city,
        address=parking.address,
        latitude=parking.latitude,
        longitude=parking.longitude,
        total_slots=parking.total_slots,
        price=parking.price,

        # IMPORTANT
        owner_id=current_user.id
    )

    db.add(new_parking)

    db.commit()

    db.refresh(new_parking)

    # Create slots
    letters = string.ascii_uppercase

    for i in range(parking.total_slots):

        row = letters[i // 10]

        number = (i % 10) + 1

        slot = models.ParkingSlot(

            parking_id=new_parking.id,

            slot_number=f"{row}{number}",

            status="Available"
        )

        db.add(slot)

    db.commit()

   
    await manager.broadcast(
    json.dumps({
        "event": "parking_added",
        "parking_id": new_parking.id
    })
)

    return {
        "message": "Parking Added Successfully",
        "data": {
            "id": new_parking.id,
            "parking_name": new_parking.parking_name,
            "area": new_parking.area,
            "city": new_parking.city,
            "address": new_parking.address,
            "latitude": new_parking.latitude,
            "longitude": new_parking.longitude,
            "total_slots": new_parking.total_slots,
            "price": new_parking.price,
            "owner_id": new_parking.owner_id
        }
    }



@router.get("/")
async def get_all_parkings(
    db: Session = Depends(get_db)
):

    parkings = (
        db.query(models.Parking)
        .all()
    )

    result = []

    for parking in parkings:

        counts = get_parking_slot_counts(
            db,
            parking.id
        )

        result.append({

            "id": parking.id,

            "parking_name":
                parking.parking_name,

            "area":
                parking.area,

            "city":
                parking.city,

            "address":
                parking.address,

            "latitude":
                parking.latitude,

            "longitude":
                parking.longitude,

            "total_slots":
                counts["total_slots"],

            "available_slots":
                counts["available_slots"],

            "reserved_slots":
                counts["reserved_slots"],

            "occupied_slots":
                counts["occupied_slots"],

            "maintenance_slots":
                counts["maintenance_slots"],

            "price":
                parking.price,

            "owner_id":
                parking.owner_id
        })

    return result


# --------------user search-------------------------------
def calculate_distance(lat1, lon1, lat2, lon2):

    R = 6371  # Earth radius in KM

    dLat = radians(lat2 - lat1)
    dLon = radians(lon2 - lon1)

    a = (
        sin(dLat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dLon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c

@router.get("/search-parking")
def search_parking(
    city: str = "",
    area: str = "",
    lat: float = None,
    lng: float = None,
    db: Session = Depends(get_db)
):

    parking_query = db.query(models.Parking)

    # Search by city
    if city:
        parking_query = parking_query.filter(
            models.Parking.city.ilike(f"%{city}%")
        )

    # Search by area
    if area:
        parking_query = parking_query.filter(
            models.Parking.area.ilike(f"%{area}%")
        )

    parking_list = parking_query.all()

    result = []

    for p in parking_list:

        distance = None

        if lat is not None and lng is not None:

            distance = calculate_distance(
                lat,
                lng,
                p.latitude,
                p.longitude
            )

        result.append({

            "id": p.id,

            "name": p.name,

            "address": p.address,

            "city": p.city,

            "area": p.area,

            "latitude": p.latitude,

            "longitude": p.longitude,

            "price": p.price,

            "available_slots": p.available_slots,

            "distance": distance

        })

    result.sort(
        key=lambda x: x["distance"]
        if x["distance"] is not None
        else 999999
    )

    return result

# -----------admin search by id-----------------
@router.get("/{parking_id}")
def get_parking_by_id(
    parking_id: int,
    db: Session = Depends(get_db)
):

    parking = db.query(models.Parking).filter(
        models.Parking.id == parking_id
    ).first()

    if not parking:
        raise HTTPException(
            status_code=404,
            detail="Parking Not Found"
        )

    return parking


# -----------------admin search by area---------- 

@router.get("/search/area/{area}")
def search_by_area(
    area: str,
    db: Session = Depends(get_db)
):

    parking = db.query(models.Parking).filter(
        models.Parking.area.ilike(f"%{area}%")
    ).all()

    return parking



@router.delete("/{parking_id}")
async def delete_parking(
    parking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # --------------------------------
    # Find parking
    # --------------------------------

    parking = db.query(models.Parking).filter(
        models.Parking.id == parking_id,
        models.Parking.owner_id == current_user.id
    ).first()


    if not parking:

        raise HTTPException(
            status_code=404,
            detail="Parking not found"
        )


    # Save ID before deleting
    deleted_parking_id = parking.id


    # --------------------------------
    # Delete parking
    # --------------------------------

    db.delete(parking)

    db.commit()


    # --------------------------------
    # WebSocket notification
    # --------------------------------

    await manager.broadcast(
        json.dumps({
            "event": "parking_deleted",
            "parking_id": deleted_parking_id
        })
    )


    # --------------------------------
    # Response
    # --------------------------------

    return {
        "message": "Parking deleted successfully",
        "parking_id": deleted_parking_id
    }

# ---------------------update-------------------------

import json

@router.put("/{parking_id}")
async def update_parking(
    parking_id: int,
    parking: schemas.ParkingUpdate,
    db: Session = Depends(get_db)
):

    # Find parking
    parking_db = db.query(
        models.Parking
    ).filter(
        models.Parking.id == parking_id
    ).first()


    # Parking not found
    if parking_db is None:

        raise HTTPException(
            status_code=404,
            detail="Parking Not Found"
        )


    # Update parking details

    parking_db.parking_name = parking.parking_name

    parking_db.area = parking.area

    parking_db.city = parking.city

    parking_db.address = parking.address

    parking_db.latitude = parking.latitude

    parking_db.longitude = parking.longitude

    parking_db.total_slots = parking.total_slots

    parking_db.price = parking.price


    # Save changes to database

    db.commit()

    db.refresh(parking_db)


    # ==========================================
    # WEBSOCKET NOTIFICATION
    # ==========================================

    await manager.broadcast(
        json.dumps({
            "event": "parking_updated",
            "parking_id": parking_db.id
        })
    )


    # Return updated parking

    return parking_db

# ------admin side return slots-----------------


# @router.get("/{parking_id}/slots")
# def get_slots(parking_id:int,db:Session=Depends(get_db)):

#     slots=db.query(models.ParkingSlot).filter(
#         models.ParkingSlot.parking_id==parking_id
#     ).all()

#     return slots

# ----------------user parking slot-----------------
# @router.get("/{parking_id}/slots")
# def get_slots_user(

#     parking_id: int,

#     db: Session = Depends(get_db)

# ):

#     slots = db.query(models.ParkingSlot).filter(

#         models.ParkingSlot.parking_id == parking_id

#     ).all()

#     return slots

# ---------------- USER / ADMIN PARKING SLOTS ----------------

@router.get("/{parking_id}/slots")
async def get_slots(
    parking_id: int,
    db: Session = Depends(get_db)
):

    # ==========================================
    # CHECK EXPIRED RESERVATIONS
    # ==========================================

    await cancel_expired_reservations(db)

    # ==========================================
    # CHECK PARKING
    # ==========================================

    parking = (
        db.query(models.Parking)
        .filter(
            models.Parking.id == parking_id
        )
        .first()
    )

    if not parking:

        raise HTTPException(
            status_code=404,
            detail="Parking not found"
        )

    # ==========================================
    # GET SLOTS
    # ==========================================

    slots = (
        db.query(models.ParkingSlot)
        .filter(
            models.ParkingSlot.parking_id == parking_id
        )
        .all()
    )

    return slots


# ----------------owner parking calculate real status-----------------------
async def broadcast_parking_status(
    db: Session,
    parking_id: int
):
    parking = db.query(models.Parking).filter(
        models.Parking.id == parking_id
    ).first()

    if not parking:
        return

    counts = get_parking_slot_counts(
        db,
        parking_id
    )

    await manager.broadcast(
        json.dumps({
            "event": "parking_status_updated",

            "data": {
                "id": parking.id,
                "parking_name": parking.parking_name,
                "area": parking.area,
                "city": parking.city,
                "address": parking.address,
                "latitude": parking.latitude,
                "longitude": parking.longitude,

                "total_slots":
                    counts["total_slots"],

                "available_slots":
                    counts["available_slots"],

                "reserved_slots":
                    counts["reserved_slots"],

                "occupied_slots":
                    counts["occupied_slots"],

                "maintenance_slots":
                    counts["maintenance_slots"],

                "price": parking.price,

                "owner_id":
                    parking.owner_id
            }
        })
    )

def get_parking_slot_counts(
    db: Session,
    parking_id: int
):

    slots = (
        db.query(models.ParkingSlot)
        .filter(
            models.ParkingSlot.parking_id
            == parking_id
        )
        .all()
    )

    total_slots = len(slots)

    available_slots = sum(
        1
        for slot in slots
        if slot.status == "Available"
    )

    reserved_slots = sum(
        1
        for slot in slots
        if slot.status == "Reserved"
    )

    occupied_slots = sum(
        1
        for slot in slots
        if slot.status == "Occupied"
    )

    maintenance_slots = sum(
        1
        for slot in slots
        if slot.status == "Maintenance"
    )

    return {
        "parking_id": parking_id,
        "total_slots": total_slots,
        "available_slots": available_slots,
        "reserved_slots": reserved_slots,
        "occupied_slots": occupied_slots,
        "maintenance_slots": maintenance_slots
    }

# --------------------------owner get particular owner parking--------------------
@router.get("/owner/")
def get_owner_parkings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    role = str(
            current_user.role
        ).strip().lower()

    if role != "owner":
    
            raise HTTPException(
                status_code=403,
                detail="Only owner can access payments"
            )
    
    parkings = db.query(models.Parking).filter(
        models.Parking.owner_id == current_user.id
    ).all()

    return parkings


# ---------------------------get owner parking slot--------------------
@router.get("/{parking_id}/slots")
def get_owner_slots(
    parking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # CHECK OWNER
    parking = get_owner_parkings(
        parking_id,
        current_user,
        db
    )

    slots = db.query(models.ParkingSlot).filter(
        models.ParkingSlot.parking_id == parking.id
    ).all()

    return slots