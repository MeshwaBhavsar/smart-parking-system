from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket_manager import manager


router = APIRouter()


@router.websocket("/ws")
async def parking_websocket(websocket: WebSocket):

    print("WebSocket connection request received")

    await manager.connect(websocket)

    try:

        while True:

            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(websocket)

        print("WebSocket disconnected")