from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect,HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from app.oauth2 import get_current_user

from app.database import get_db
from app import models
from app.models import Reservation,Payment

from app.websocket_manager import manager


router = APIRouter(
    prefix="/admin",
    tags=["Admin Dashboard"]
)

def get_dashboard_data(db: Session):

    today = date.today()

    # ==========================================
    # TOTAL USERS
    # ==========================================

    total_users = db.query(
        func.count(models.User.id)
    ).scalar() or 0


    # ==========================================
    # PARKING AREAS
    # ==========================================

    parking_areas = db.query(
        func.count(models.Parking.id)
    ).scalar() or 0


    # ==========================================
    # TOTAL SLOTS
    # ==========================================

    total_slots = db.query(
        func.coalesce(
            func.sum(models.Parking.total_slots),
            0
        )
    ).scalar() or 0


    # ==========================================
    # OCCUPIED SLOTS
    # ==========================================

    occupied_slots = db.query(
        func.count(models.ParkingSlot.id)
    ).filter(
        models.ParkingSlot.status == "Occupied"
    ).scalar() or 0


    # ==========================================
    # AVAILABLE SLOTS
    # ==========================================

    available_slots = db.query(
        func.count(models.ParkingSlot.id)
    ).filter(
        models.ParkingSlot.status == "Available"
    ).scalar() or 0


    # ==========================================
    # ACTIVE PARKING
    # ==========================================

    active_parking = db.query(
        func.count(models.Parking.id)
    ).scalar() or 0


    # ==========================================
    # TODAY'S BOOKINGS
    # ==========================================

    today_bookings = db.query(
        func.count(models.Reservation.id)
    ).filter(
        func.date(
            models.Reservation.booking_date
        ) == today
    ).scalar() or 0


    # ==========================================
    # TODAY'S REVENUE
    # ==========================================

    today_revenue = db.query(
        func.coalesce(
            func.sum(models.Payment.amount),
            0
        )
    ).filter(
        func.date(
            models.Payment.payment_date
        ) == today,
        models.Payment.payment_status == "Paid"
    ).scalar() or 0


    # ==========================================
    # PENDING PAYMENTS
    # ==========================================

    pending_payments = db.query(
        func.count(models.Payment.id)
    ).filter(
        models.Payment.payment_status.in_([
            "Created",
            "Pending"
        ])
    ).scalar() or 0


    # ==========================================
    # RETURN DASHBOARD DATA
    # ==========================================

    return {

        "total_users":
            total_users,

        "parking_areas":
            parking_areas,

        "active_parking":
            active_parking,

        "today_revenue":
            float(today_revenue),

        "available_slots":
            available_slots,

        "occupied_slots":
            occupied_slots,

        "today_bookings":
            today_bookings,

        "pending_payments":
            pending_payments
    }


# ------------------------------------------------------
@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db)
):
    return get_dashboard_data(db)


@router.websocket("/ws/dashboard")
async def dashboard_websocket(websocket: WebSocket):

    await manager.connect(websocket)

    try:

        while True:

            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(websocket)

    except Exception:

        manager.disconnect(websocket)

async def broadcast_dashboard_update(db: Session):

    dashboard_data = get_dashboard_data(db)

    await manager.broadcast({

        "type": "dashboard_update",

        "data": dashboard_data

    })



@router.get("/peak-days")
def get_peak_days(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    if current_user.role.lower() != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can access analytics"
        )

    day_number = func.extract(
        "dow",
        models.Reservation.entry_time
    )

    data = (
        db.query(
            day_number.label("day"),
            func.count(
                models.Reservation.id
            ).label("count")
        )
        .filter(
            models.Reservation.entry_time.isnot(None)
        )
        .group_by(day_number)
        .all()
    )

    day_names = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday"
    }

    result = []

    for row in data:

        result.append({
            "day": day_names[int(row.day)],
            "count": row.count
        })

    return result


# ==========================================================
# PEAK HOUR ANALYSIS
# ==========================================================
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.database import get_db
from app import models
from app.oauth2 import get_current_user


@router.get("/peak-hours")
def get_peak_hours(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # -----------------------------
    # ADMIN CHECK
    # -----------------------------
    if current_user.role.lower() != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can access analytics"
        )

    # -----------------------------
    # ENTRY COUNT BY HOUR
    # PostgreSQL compatible
    # -----------------------------

    entry_data = (
        db.query(
            extract(
                "hour",
                models.Reservation.entry_time
            ).label("hour"),

            func.count(
                models.Reservation.id
            ).label("entry_count")
        )
        .filter(
            models.Reservation.entry_time.isnot(None)
        )
        .group_by(
            extract(
                "hour",
                models.Reservation.entry_time
            )
        )
        .order_by(
            extract(
                "hour",
                models.Reservation.entry_time
            )
        )
        .all()
    )

    # -----------------------------
    # EXIT COUNT BY HOUR
    # -----------------------------

    exit_data = (
        db.query(
            extract(
                "hour",
                models.Reservation.exit_time
            ).label("hour"),

            func.count(
                models.Reservation.id
            ).label("exit_count")
        )
        .filter(
            models.Reservation.exit_time.isnot(None)
        )
        .group_by(
            extract(
                "hour",
                models.Reservation.exit_time
            )
        )
        .order_by(
            extract(
                "hour",
                models.Reservation.exit_time
            )
        )
        .all()
    )

    # -----------------------------
    # CONVERT TO DICTIONARY
    # -----------------------------

    entry_dict = {
        int(row.hour): row.entry_count
        for row in entry_data
    }

    exit_dict = {
        int(row.hour): row.exit_count
        for row in exit_data
    }

    # -----------------------------
    # CREATE 24 HOURS
    # -----------------------------

    result = []

    for hour in range(24):

        result.append({
            "hour": hour,
            "label": f"{hour:02d}:00",
            "entries": entry_dict.get(hour, 0),
            "exits": exit_dict.get(hour, 0)
        })

    return result