from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    WebSocket,
    WebSocketDisconnect
)

from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.oauth2 import get_current_user
from app.websocket_manager import manager

import json


router = APIRouter(
    prefix="/admin_parking",
    tags=["Admin Parking"]
)


@router.get("/")
def get_all_parking(
    db: Session = Depends(get_db)
):

    parkings = db.query(models.Parking).all()

    result = []

    for parking in parkings:

        total_slots = db.query(models.ParkingSlot).filter(
            models.ParkingSlot.parking_id == parking.id
        ).count()

        available_slots = db.query(models.ParkingSlot).filter(
            models.ParkingSlot.parking_id == parking.id,
            models.ParkingSlot.status == "Available"
        ).count()

        occupied_slots = db.query(models.ParkingSlot).filter(
            models.ParkingSlot.parking_id == parking.id,
            models.ParkingSlot.status == "Occupied"
        ).count()

        result.append({
            "id": parking.id,
            "parking_name": parking.parking_name,
            "area": parking.area,
            "city": parking.city,
            "address": parking.address,
            "latitude": parking.latitude,
            "longitude": parking.longitude,
            "total_slots": total_slots,
            "available_slots": available_slots,
            "occupied_slots": occupied_slots,
            "price": parking.price
        })

    return result

@router.get("/{parking_id}/slots")
def get_parking_slots(
    parking_id: int,
    db: Session = Depends(get_db)
):

    parking = db.query(models.Parking).filter(
        models.Parking.id == parking_id
    ).first()

    if not parking:
        raise HTTPException(
            status_code=404,
            detail="Parking not found"
        )

    slots = db.query(models.ParkingSlot).filter(
        models.ParkingSlot.parking_id == parking_id
    ).order_by(
        models.ParkingSlot.id
    ).all()

    return {
        "parking": {
            "id": parking.id,
            "parking_name": parking.parking_name,
            "area": parking.area,
            "city": parking.city,
            "address": parking.address
        },

        "slots": [
            {
                "id": slot.id,
                "slot_number": slot.slot_number,
                "status": slot.status
            }
            for slot in slots
        ]
    }

@router.delete("/{parking_id}")
async def delete_parking(
    parking_id: int,
    db: Session = Depends(get_db)
):

    parking = db.query(models.Parking).filter(
        models.Parking.id == parking_id
    ).first()

    if not parking:

        raise HTTPException(
            status_code=404,
            detail="Parking not found"
        )

    # Delete parking slots first
    db.query(models.ParkingSlot).filter(
        models.ParkingSlot.parking_id == parking_id
    ).delete(
        synchronize_session=False
    )

    # Delete parking
    db.delete(parking)

    db.commit()

    # Real-time event
    await manager.broadcast({
        "event": "parking_deleted",
        "parking_id": parking_id
    })

    return {
        "message": "Parking deleted successfully"
    }

# ------------------------------------------
@router.websocket("/ws/parking")
async def parking_websocket(websocket: WebSocket):

    await manager.connect(websocket)

    try:

        while True:

            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(websocket)

    except Exception:

        manager.disconnect(websocket)