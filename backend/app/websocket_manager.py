from fastapi import WebSocket



class ConnectionManager:

    def __init__(self):
        self.active_connections = []
        self.customer_connections = {}

    async def connect(self, websocket: WebSocket):

        await websocket.accept()

        self.active_connections.append(websocket)

        print("Client connected")
        print("Total clients:", len(self.active_connections))

    def disconnect(self, websocket: WebSocket):

        if websocket in self.active_connections:

            self.active_connections.remove(websocket)

            for user_id, connections in list(
                self.customer_connections.items()
            ):
                if websocket in connections:
                    connections.remove(websocket)

                if not connections:
                    del self.customer_connections[user_id]

            print("Client disconnected")
            print("Total clients:", len(self.active_connections))

    async def broadcast(self, message: str):

        print("Broadcasting:", message)

        for connection in self.active_connections.copy():

            try:

                await connection.send_text(message)

            except Exception:

                self.disconnect(connection)

    def associate_user(self, websocket: WebSocket, user_id: int):

        connections = self.customer_connections.setdefault(user_id, [])

        if websocket not in connections:
            connections.append(websocket)

    async def send_to_user(self, user_id: int, message: str):

        connections = self.customer_connections.get(user_id, []).copy()

        for connection in connections:

            try:

                await connection.send_text(message)

            except Exception:

                self.disconnect(connection)

        return len(connections)


manager = ConnectionManager()

