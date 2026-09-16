from fastapi import APIRouter

from app.service.analytics_service import (
    get_occupancy_summary,
    get_zone_occupancy,
    get_zone_summary
)


router = APIRouter(

    prefix="/analytics",

    tags=["Analytics"]
)


# ------------------------------------------
# Overall occupancy
# ------------------------------------------

@router.get("/occupancy-summary")
def occupancy_summary():

    return get_occupancy_summary()


# ------------------------------------------
# Zone occupancy
# ------------------------------------------

@router.get("/zone-occupancy")
def zone_occupancy():

    return get_zone_occupancy()


# ------------------------------------------
# Most + least occupied zones
# ------------------------------------------

@router.get("/zone-summary")
def zone_summary():

    return get_zone_summary()


from fastapi import WebSocket, WebSocketDisconnect
from app.websocket_manager import manager


@router.websocket("/ws")
async def analytics_websocket(
    websocket: WebSocket
):

    await manager.connect(websocket)

    try:

        while True:

            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(websocket)