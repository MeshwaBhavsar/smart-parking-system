from fastapi import WebSocket



class ConnectionManager:

    def __init__(self):
        self.active_connections = []

    async def connect(self, websocket: WebSocket):

        await websocket.accept()

        self.active_connections.append(websocket)

        print("Client connected")
        print("Total clients:", len(self.active_connections))

    def disconnect(self, websocket: WebSocket):

        if websocket in self.active_connections:

            self.active_connections.remove(websocket)

            print("Client disconnected")
            print("Total clients:", len(self.active_connections))

    async def broadcast(self, message: str):

        print("Broadcasting:", message)

        for connection in self.active_connections.copy():

            try:

                await connection.send_text(message)

            except Exception:

                self.disconnect(connection)


manager = ConnectionManager()

