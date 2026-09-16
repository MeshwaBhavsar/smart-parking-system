from fastapi import APIRouter, Depends, HTTPException,WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.websocket_manager import manager
import json

from app.database import get_db
from app import models, schemas
from app.oauth2 import get_current_user


router = APIRouter(
    prefix="/admin_reservations",
    tags=["Admin Reservations"]
)


# ---------------------------------------------
@router.get("/")
def get_all_reservations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # =========================
    # ADMIN CHECK
    # =========================

    role = str(
        current_user.role
    ).strip().lower()

    if role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can access reservations"
        )

    # =========================
    # GET RESERVATIONS
    # =========================

    reservations = (
        db.query(models.Reservation)
        .order_by(
            models.Reservation.id.desc()
        )
        .all()
    )

    result = []

    # =========================
    # LOOP RESERVATIONS
    # =========================

    for reservation in reservations:

        # -------------------------
        # USER
        # -------------------------

        user = (
            db.query(models.User)
            .filter(
                models.User.id ==
                reservation.user_id
            )
            .first()
        )

        # -------------------------
        # PARKING
        # -------------------------

        parking = (
            db.query(models.Parking)
            .filter(
                models.Parking.id ==
                reservation.parking_id
            )
            .first()
        )

        # -------------------------
        # SLOT
        # -------------------------

        slot = (
            db.query(models.ParkingSlot)
            .filter(
                models.ParkingSlot.id ==
                reservation.slot_id
            )
            .first()
        )

        # -------------------------
        # VEHICLE
        # -------------------------

        vehicle = None

        vehicle_id = getattr(
            reservation,
            "vehicle_id",
            None
        )

        if vehicle_id is not None:

            vehicle = (
                db.query(models.Vehicle)
                .filter(
                    models.Vehicle.id ==
                    vehicle_id
                )
                .first()
            )

        # =========================
        # SAFE USER DATA
        # =========================

        user_name = "-"

        if user:

            user_name = (
                getattr(user, "name", None)
                or getattr(user, "username", None)
                or getattr(user, "email", "-")
            )

        user_email = "-"

        if user:

            user_email = getattr(
                user,
                "email",
                "-"
            )

        # =========================
        # SAFE PARKING DATA
        # =========================

        parking_name = "-"

        parking_address = "-"

        if parking:

            parking_name = getattr(
                parking,
                "parking_name",
                "-"
            )

            parking_address = getattr(
                parking,
                "address",
                "-"
            )

        # =========================
        # SAFE SLOT DATA
        # =========================

        slot_number = "-"

        if slot:

            slot_number = (
                getattr(
                    slot,
                    "slot_number",
                    None
                )
                or getattr(
                    slot,
                    "slot_name",
                    None
                )
                or getattr(
                    slot,
                    "name",
                    None
                )
                or "-"
            )

        # =========================
        # SAFE VEHICLE DATA
        # =========================

        vehicle_number = "-"

        vehicle_type = "-"

        if vehicle:

            vehicle_number = getattr(
                vehicle,
                "vehicle_number",
                "-"
            )

            vehicle_type = getattr(
                vehicle,
                "vehicle_type",
                "-"
            )

        else:

            vehicle_number = getattr(
                reservation,
                "vehicle_number",
                "-"
            )

            vehicle_type = getattr(
                reservation,
                "vehicle_type",
                "-"
            )

        # =========================
        # RESULT
        # =========================

        result.append({

            "id": reservation.id,

            "user_name": user_name,

            "user_email": user_email,

            "parking_name": parking_name,

            "parking_address": parking_address,

            "slot_number": slot_number,

            "vehicle_number": vehicle_number,

            "vehicle_type": vehicle_type,

            "status": getattr(
                reservation,
                "status",
                None
            ),

            "reservation_date": getattr(
                reservation,
                "reservation_date",
                None
            ),

            "entry_time": getattr(
                reservation,
                "entry_time",
                None
            ),

            "exit_time": getattr(
                reservation,
                "exit_time",
                None
            ),

            "total_amount": getattr(
                reservation,
                "total_amount",
                None
            ),

            "created_at": getattr(
                reservation,
                "created_at",
                None
            )
        })

    return result

# -------------------view one reservation----------------

@router.get("/{reservation_id}")
def get_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    try:

        # =========================
        # ADMIN CHECK
        # =========================

        role = str(
            current_user.role
        ).strip().lower()

        if role != "admin":
            raise HTTPException(
                status_code=403,
                detail="Only admin can view reservations"
            )

        # =========================
        # GET RESERVATION
        # =========================

        reservation = (
            db.query(models.Reservation)
            .filter(
                models.Reservation.id ==
                reservation_id
            )
            .first()
        )

        if not reservation:

            raise HTTPException(
                status_code=404,
                detail="Reservation not found"
            )

        # =========================
        # USER
        # =========================

        user = (
            db.query(models.User)
            .filter(
                models.User.id ==
                reservation.user_id
            )
            .first()
        )

        # =========================
        # PARKING
        # =========================

        parking = (
            db.query(models.Parking)
            .filter(
                models.Parking.id ==
                reservation.parking_id
            )
            .first()
        )

        # =========================
        # SLOT
        # =========================

        slot = (
            db.query(models.ParkingSlot)
            .filter(
                models.ParkingSlot.id ==
                reservation.slot_id
            )
            .first()
        )

        # =========================
        # VEHICLE
        # =========================

        vehicle = None

        vehicle_id = getattr(
            reservation,
            "vehicle_id",
            None
        )

        if vehicle_id:

            vehicle = (
                db.query(models.Vehicle)
                .filter(
                    models.Vehicle.id ==
                    vehicle_id
                )
                .first()
            )

        # =========================
        # USER INFORMATION
        # =========================

        user_name = "-"

        user_email = "-"

        if user:

            user_name = (
                getattr(
                    user,
                    "name",
                    None
                )
                or getattr(
                    user,
                    "username",
                    None
                )
                or getattr(
                    user,
                    "email",
                    None
                )
                or "-"
            )

            user_email = getattr(
                user,
                "email",
                "-"
            )

        # =========================
        # PARKING INFORMATION
        # =========================

        parking_name = "-"

        parking_address = "-"

        parking_area = "-"

        parking_city = "-"

        if parking:

            parking_name = getattr(
                parking,
                "parking_name",
                "-"
            )

            parking_address = getattr(
                parking,
                "address",
                "-"
            )

            parking_area = getattr(
                parking,
                "area",
                "-"
            )

            parking_city = getattr(
                parking,
                "city",
                "-"
            )

        # =========================
        # SLOT INFORMATION
        # =========================

        slot_number = "-"

        slot_status = "-"

        if slot:

            slot_number = (
                getattr(
                    slot,
                    "slot_number",
                    None
                )
                or getattr(
                    slot,
                    "slot_name",
                    None
                )
                or getattr(
                    slot,
                    "name",
                    None
                )
                or "-"
            )

            slot_status = getattr(
                slot,
                "status",
                "-"
            )

        # =========================
        # VEHICLE INFORMATION
        # =========================

        vehicle_number = "-"

        vehicle_type = "-"

        if vehicle:

            vehicle_number = getattr(
                vehicle,
                "vehicle_number",
                "-"
            )

            vehicle_type = getattr(
                vehicle,
                "vehicle_type",
                "-"
            )

        else:

            vehicle_number = getattr(
                reservation,
                "vehicle_number",
                "-"
            )

            vehicle_type = getattr(
                reservation,
                "vehicle_type",
                "-"
            )

        # =========================
        # RESPONSE
        # =========================

        return {

            "id": reservation.id,

            "user": {
                "id": (
                    user.id
                    if user
                    else reservation.user_id
                ),
                "name": user_name,
                "email": user_email
            },

            "parking": {
                "id": (
                    parking.id
                    if parking
                    else reservation.parking_id
                ),
                "name": parking_name,
                "address": parking_address,
                "area": parking_area,
                "city": parking_city
            },

            "slot": {
                "id": (
                    slot.id
                    if slot
                    else reservation.slot_id
                ),
                "number": slot_number,
                "status": slot_status
            },

            "vehicle": {
                "number": vehicle_number,
                "type": vehicle_type
            },

            "status": getattr(
                reservation,
                "status",
                None
            ),

            "reservation_date": getattr(
                reservation,
                "reservation_date",
                None
            ),

            "entry_time": getattr(
                reservation,
                "entry_time",
                None
            ),

            "exit_time": getattr(
                reservation,
                "exit_time",
                None
            ),

            "total_amount": getattr(
                reservation,
                "total_amount",
                None
            ),

            "created_at": getattr(
                reservation,
                "created_at",
                None
            )
        }

    except HTTPException:
        raise

    except Exception as e:

        import traceback

        print(
            "VIEW RESERVATION ERROR:"
        )

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ---------------------------------------
@router.websocket("/ws")
async def admin_reservation_websocket(
    websocket: WebSocket
):
    await manager.connect(websocket)

    print(
        "ADMIN RESERVATION WEBSOCKET CONNECTED"
    )

    try:
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        print(
            "ADMIN RESERVATION WEBSOCKET DISCONNECTED"
        )

        manager.disconnect(websocket)

# -----------------delete reservation-----------------
@router.delete("/{reservation_id}")
async def delete_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # ============================
    # CHECK ADMIN
    # ============================

    if str(current_user.role).strip().lower() != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can delete reservations"
        )

    # ============================
    # FIND RESERVATION
    # ============================

    reservation = (
        db.query(models.Reservation)
        .filter(
            models.Reservation.id == reservation_id
        )
        .first()
    )

    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )

    try:

        # ============================
        # DELETE PAYMENT FIRST
        # ============================

        payments = (
            db.query(models.Payment)
            .filter(
                models.Payment.reservation_id == reservation_id
            )
            .all()
        )

        for payment in payments:
            db.delete(payment)

        # ============================
        # DELETE RESERVATION
        # ============================

        db.delete(reservation)

        # ============================
        # COMMIT
        # ============================

        db.commit()

        # ============================
        # WEBSOCKET
        # ============================

        await manager.broadcast(
            json.dumps({
                "event": "reservation_deleted",
                "data": {
                    "id": reservation_id
                }
            })
        )

        return {
            "message": "Reservation deleted successfully",
            "reservation_id": reservation_id
        }

    except Exception as e:

        db.rollback()

        print(
            "Delete reservation error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to delete reservation"
        )