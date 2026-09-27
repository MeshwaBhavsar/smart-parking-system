import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.oauth2 import verify_access_token
from app.websocket_manager import manager


router = APIRouter()


@router.websocket("/ws")
async def parking_websocket(websocket: WebSocket):

    print("WebSocket connection request received")

    await manager.connect(websocket)

    try:

        while True:

            message = await websocket.receive_text()

            try:
                data = json.loads(message)
            except json.JSONDecodeError:
                continue

            if data.get("type") != "authenticate":
                continue

            user_id = verify_access_token(data.get("token", ""))

            if user_id is None:
                await websocket.send_json({
                    "event": "authentication_failed"
                })
                continue

            manager.associate_user(websocket, int(user_id))
            await websocket.send_json({
                "event": "authenticated",
                "user_id": int(user_id)
            })

    except WebSocketDisconnect:

        manager.disconnect(websocket)

        print("WebSocket disconnected")
