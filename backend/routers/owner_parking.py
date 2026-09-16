from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
import string
from math import radians, sin, cos, sqrt, atan2
from app.websocket_manager import manager
import asyncio
from app.oauth2 import get_current_user
from sqlalchemy import func

router = APIRouter(
    prefix="/owner_parking",
    tags=["Owner_parking"]
)

@router.post("/")
async def add_parking(parking: schemas.ParkingCreate,
                db: Session = Depends(get_db)):

    new_parking = models.Parking(

        parking_name=parking.parking_name,

        area=parking.area,

        city=parking.city,

        address=parking.address,

        latitude=parking.latitude,

        longitude=parking.longitude,

        total_slots=parking.total_slots,

        price=parking.price
    )

    db.add(new_parking)

    db.commit()

   
    

    db.refresh(new_parking)
    asyncio.run(
    manager.broadcast("parking_added")
)

    letters = string.ascii_uppercase

    for i in range(parking.total_slots):

        row = letters[i // 10]

        number = (i % 10) + 1

        slot = models.ParkingSlot(

            parking_id=new_parking.id,

            slot_number=f"{row}{number}",

            status="Available"

        )


        db.add(slot)   # <-- INSIDE the loop

    db.commit()        # <-- AFTER the loop


    # -------------------------------
    await manager.broadcast({
        "event": "parking_added",
        "parking_id": new_parking.id
    })

    return {
        "message": "Parking Added Successfully",
        "data": new_parking
    }


# ---------------------owner dashboard----------------------

@router.get("/")
def get_owner_dashboard(

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)

):

    # =========================================
    # CHECK OWNER
    # =========================================

    if str(current_user.role).upper() != "OWNER":

        raise HTTPException(
            status_code=403,
            detail="Only owner can access dashboard"
        )


    owner_id = current_user.id


    # =========================================
    # TOTAL PARKINGS
    # =========================================

    total_parkings = db.query(
        models.Parking
    ).filter(
        models.Parking.owner_id == owner_id
    ).count()


    # =========================================
    # OWNER PARKING IDs
    # =========================================

    parking_ids = db.query(
        models.Parking.id
    ).filter(
        models.Parking.owner_id == owner_id
    ).all()


    parking_ids = [
        parking_id[0]
        for parking_id in parking_ids
    ]


    # =========================================
    # TOTAL SLOTS
    # =========================================

    if parking_ids:

        total_slots = db.query(
            models.ParkingSlot
        ).filter(
            models.ParkingSlot.parking_id.in_(
                parking_ids
            )
        ).count()

    else:

        total_slots = 0


    # =========================================
    # AVAILABLE SLOTS
    # =========================================

    if parking_ids:

        available_slots = db.query(
            models.ParkingSlot
        ).filter(
            models.ParkingSlot.parking_id.in_(
                parking_ids
            ),
            models.ParkingSlot.status == "Available"
        ).count()

    else:

        available_slots = 0


    # =========================================
    # OCCUPIED SLOTS
    # =========================================

    if parking_ids:

        occupied_slots = db.query(
            models.ParkingSlot
        ).filter(
            models.ParkingSlot.parking_id.in_(
                parking_ids
            ),
            models.ParkingSlot.status == "Occupied"
        ).count()

    else:

        occupied_slots = 0


    # =========================================
    # TOTAL RESERVATIONS
    # =========================================

    if parking_ids:

        total_reservations = db.query(
            models.Reservation
        ).filter(
            models.Reservation.parking_id.in_(
                parking_ids
            )
        ).count()

    else:

        total_reservations = 0


    # =========================================
    # TOTAL REVENUE
    # =========================================

    if parking_ids:

        total_revenue = db.query(
            func.coalesce(
                func.sum(
                    models.Payment.amount
                ),
                0
            )
        ).join(
            models.Reservation,
            models.Payment.reservation_id ==
            models.Reservation.id
        ).filter(
            models.Reservation.parking_id.in_(
                parking_ids
            ),
            models.Payment.payment_status == "Paid"
        ).scalar()

    else:

        total_revenue = 0


    # =========================================
    # RESPONSE
    # =========================================

    return {

        "owner_id":
            owner_id,

        "owner_name":
            current_user.full_name,

        "total_parkings":
            total_parkings,

        "total_slots":
            total_slots,

        "available_slots":
            available_slots,

        "occupied_slots":
            occupied_slots,

        "total_reservations":
            total_reservations,

        "total_revenue":
            float(total_revenue or 0)

    }

# ---------------get current user parking--------------
@router.get("/")
def get_owner_parkings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    if current_user.role != "owner":
        raise HTTPException(
            status_code=403,
            detail="Only owners can access this page"
        )

    parkings = db.query(models.Parking).filter(
        models.Parking.owner_id == current_user.id
    ).all()

    return parkings


# ============================================================
# UPDATE SLOT STATUS
# ============================================================

@router.put("/{slot_id}/status")
async def update_slot_status(
    slot_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # CHECK OWNER
    # --------------------------------------------------------

    if str(current_user.role).upper() != "OWNER":
        raise HTTPException(
            status_code=403,
            detail="Only owner can update slot status"
        )

    # --------------------------------------------------------
    # FIND SLOT
    # --------------------------------------------------------

    slot = db.query(
        models.ParkingSlot
    ).filter(
        models.ParkingSlot.id == slot_id
    ).first()

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Slot not found"
        )

    # --------------------------------------------------------
    # CHECK PARKING BELONGS TO OWNER
    # --------------------------------------------------------

    parking = db.query(
        models.Parking
    ).filter(
        models.Parking.id == slot.parking_id
    ).first()

    if not parking:
        raise HTTPException(
            status_code=404,
            detail="Parking not found"
        )

    if parking.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot update this slot"
        )

    # --------------------------------------------------------
    # VALID STATUS
    # --------------------------------------------------------

    allowed_statuses = [
        "Available",
        "Reserved",
        "Occupied",
        "Maintenance"
    ]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid slot status"
        )

    # --------------------------------------------------------
    # UPDATE
    # --------------------------------------------------------

    slot.status = status

    db.commit()
    db.refresh(slot)

    # --------------------------------------------------------
    # GET LIVE COUNTS
    # --------------------------------------------------------

    total_slots = db.query(
        models.ParkingSlot
    ).filter(
        models.ParkingSlot.parking_id == slot.parking_id
    ).count()

    available_slots = db.query(
        models.ParkingSlot
    ).filter(
        models.ParkingSlot.parking_id == slot.parking_id,
        models.ParkingSlot.status == "Available"
    ).count()

    occupied_slots = db.query(
        models.ParkingSlot
    ).filter(
        models.ParkingSlot.parking_id == slot.parking_id,
        models.ParkingSlot.status == "Occupied"
    ).count()

    reserved_slots = db.query(
        models.ParkingSlot
    ).filter(
        models.ParkingSlot.parking_id == slot.parking_id,
        models.ParkingSlot.status == "Reserved"
    ).count()

    maintenance_slots = db.query(
        models.ParkingSlot
    ).filter(
        models.ParkingSlot.parking_id == slot.parking_id,
        models.ParkingSlot.status == "Maintenance"
    ).count()

    # --------------------------------------------------------
    # REAL-TIME WEBSOCKET EVENT
    # --------------------------------------------------------

    await manager.broadcast({

        "event": "slot_status_updated",

        "slot_id": slot.id,

        "parking_id": slot.parking_id,

        "slot_number": slot.slot_number,

        "status": slot.status,

        "total_slots": total_slots,

        "available_slots": available_slots,

        "occupied_slots": occupied_slots,

        "reserved_slots": reserved_slots,

        "maintenance_slots": maintenance_slots

    })

    return {

        "message": "Slot status updated successfully",

        "slot_id": slot.id,

        "parking_id": slot.parking_id,

        "slot_number": slot.slot_number,

        "status": slot.status,

        "total_slots": total_slots,

        "available_slots": available_slots,

        "occupied_slots": occupied_slots,

        "reserved_slots": reserved_slots,

        "maintenance_slots": maintenance_slots

    }