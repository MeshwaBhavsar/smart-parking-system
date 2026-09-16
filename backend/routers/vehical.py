from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from app.models import Vehicle, User
from app.schemas import VehicleCreate, VehicleResponse, VehicleUpdate
from app.database import get_db
from app.oauth2 import get_current_user
from app.websocket_manager import manager


router = APIRouter(
    prefix="/vehicles",
    tags=["Vehicles"]
)


# =========================================================
# ADD VEHICLE
# =========================================================

@router.post(
    "/",
    response_model=VehicleResponse
)
async def add_vehicle(
    vehicle: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # -----------------------------------------------------
    # GET USER ROLE
    # -----------------------------------------------------

    role = current_user.role

    # If role is Enum
    if hasattr(role, "value"):
        role = role.value

    role = str(role).strip().lower()

    print("--------------------------------")
    print("Current User ID:", current_user.id)
    print("Current User Email:", current_user.email)
    print("Current User Role:", role)
    print("--------------------------------")


    # -----------------------------------------------------
    # ONLY NORMAL USER CAN ADD VEHICLE
    # -----------------------------------------------------

    if role not in ["user", "customer"]:
      raise HTTPException(
        status_code=403,
        detail=f"Only normal users can add vehicles. Current role: {role}"
    )


    # -----------------------------------------------------
    # CHECK DUPLICATE VEHICLE
    # -----------------------------------------------------

    existing_vehicle = db.query(
        Vehicle
    ).filter(
        Vehicle.user_id == current_user.id,
        Vehicle.vehicle_number == vehicle.vehicle_number
    ).first()


    if existing_vehicle:

        raise HTTPException(
            status_code=400,
            detail="Vehicle already exists"
        )


    # -----------------------------------------------------
    # CREATE VEHICLE
    # -----------------------------------------------------

    new_vehicle = Vehicle(

        user_id=current_user.id,

        vehicle_number=vehicle.vehicle_number,

        vehicle_type=vehicle.vehicle_type
    )


    db.add(new_vehicle)

    db.commit()

    db.refresh(new_vehicle)


    # -----------------------------------------------------
    # REAL TIME UPDATE
    # -----------------------------------------------------

    await manager.broadcast(
        json.dumps({

            "event": "vehicle_added",

            "user_id": current_user.id,

            "vehicle_id": new_vehicle.id

        })
    )


    return new_vehicle


# =========================================================
# GET MY VEHICLES
# =========================================================

@router.get(
    "/my-vehicles",
    response_model=list[VehicleResponse]
)
def get_my_vehicles(

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    vehicles = db.query(
        Vehicle
    ).filter(

        Vehicle.user_id == current_user.id

    ).order_by(

        Vehicle.id.desc()

    ).all()


    return vehicles


# =========================================================
# UPDATE VEHICLE
# =========================================================

@router.put(
    "/{vehicle_id}",
    response_model=VehicleResponse
)
async def update_vehicle(

    vehicle_id: int,

    vehicle_data: VehicleUpdate,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    vehicle = db.query(
        Vehicle
    ).filter(

        Vehicle.id == vehicle_id,

        Vehicle.user_id == current_user.id

    ).first()


    if not vehicle:

        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )


    # -----------------------------------------------------
    # DUPLICATE VEHICLE NUMBER
    # -----------------------------------------------------

    duplicate = db.query(
        Vehicle
    ).filter(

        Vehicle.user_id == current_user.id,

        Vehicle.vehicle_number == vehicle_data.vehicle_number,

        Vehicle.id != vehicle_id

    ).first()


    if duplicate:

        raise HTTPException(
            status_code=400,
            detail="Vehicle number already exists"
        )


    # -----------------------------------------------------
    # UPDATE
    # -----------------------------------------------------

    vehicle.vehicle_number = vehicle_data.vehicle_number

    vehicle.vehicle_type = vehicle_data.vehicle_type


    db.commit()

    db.refresh(vehicle)


    # -----------------------------------------------------
    # WEBSOCKET
    # -----------------------------------------------------

    await manager.broadcast(
        json.dumps({

            "event": "vehicle_updated",

            "user_id": current_user.id,

            "vehicle_id": vehicle.id

        })
    )


    return vehicle


# =========================================================
# DELETE VEHICLE
# =========================================================

@router.delete(
    "/{vehicle_id}"
)
async def delete_vehicle(

    vehicle_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    vehicle = db.query(
        Vehicle
    ).filter(

        Vehicle.id == vehicle_id,

        Vehicle.user_id == current_user.id

    ).first()


    if not vehicle:

        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )


    db.delete(vehicle)

    db.commit()


    # -----------------------------------------------------
    # WEBSOCKET
    # -----------------------------------------------------

    await manager.broadcast(
        json.dumps({

            "event": "vehicle_deleted",

            "user_id": current_user.id,

            "vehicle_id": vehicle_id

        })
    )


    return {

        "message": "Vehicle deleted successfully"

    }
# --------------------get-------------------

# @router.get(
#     "/my-vehicles",
#     response_model=list[VehicleResponse]
# )
# def get_my_vehicles(
#     db: Session = Depends(get_db),
#     current_user:User = Depends(get_current_user)
# ):

#     vehicles = db.query(
#         Vehicle
#     ).filter(
#         Vehicle.user_id ==
#         current_user.id
#     ).order_by(
#         Vehicle.id.desc()
#     ).all()


#     return vehicles


# # --------------------update---------------------
# @router.put(
#     "/{vehicle_id}",
#     response_model=VehicleResponse
# )
# async def update_vehicle(
#     vehicle_id: int,
#     vehicle_data: VehicleUpdate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):

#     vehicle = db.query(
#         Vehicle
#     ).filter(
#         Vehicle.id == vehicle_id,
#         Vehicle.user_id == current_user.id
#     ).first()


#     if not vehicle:

#         raise HTTPException(
#             status_code=404,
#             detail="Vehicle not found"
#         )


#     # Check duplicate number

#     duplicate = db.query(
#         Vehicle
#     ).filter(
#         Vehicle.user_id == current_user.id,
#         Vehicle.vehicle_number ==
#             vehicle_data.vehicle_number,
#         Vehicle.id != vehicle_id
#     ).first()


#     if duplicate:

#         raise HTTPException(
#             status_code=400,
#             detail="Vehicle number already exists"
#         )


#     vehicle.vehicle_number = (
#         vehicle_data.vehicle_number
#     )

#     vehicle.vehicle_type = (
#         vehicle_data.vehicle_type
#     )


#     db.commit()

#     db.refresh(vehicle)


#     await manager.broadcast(
#         json.dumps({
#             "event": "vehicle_updated",
#             "user_id": current_user.id,
#             "vehicle_id": vehicle.id
#         })
#     )


#     return vehicle

# # ---------------------delete-----------------
# @router.delete("/{vehicle_id}")
# async def delete_vehicle(
#     vehicle_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):

#     vehicle = db.query(
#         Vehicle
#     ).filter(
#         Vehicle.id == vehicle_id,
#         Vehicle.user_id == current_user.id
#     ).first()


#     if not vehicle:

#         raise HTTPException(
#             status_code=404,
#             detail="Vehicle not found"
#         )


#     db.delete(vehicle)

#     db.commit()


#     await manager.broadcast(
#         json.dumps({
#             "event": "vehicle_deleted",
#             "user_id": current_user.id,
#             "vehicle_id": vehicle_id
#         })
#     )


#     return {
#         "message": "Vehicle deleted successfully"
#     }
