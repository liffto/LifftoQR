from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, slug: str, websocket: WebSocket) -> None:
        if slug not in self.active_connections:
            self.active_connections[slug] = []
        self.active_connections[slug].append(websocket)

    def disconnect(self, slug: str, websocket: WebSocket) -> None:
        connections = self.active_connections.get(slug)
        if not connections:
            return
        if websocket in connections:
            connections.remove(websocket)
        if not connections:
            del self.active_connections[slug]

    async def broadcast(self, slug: str, message: dict) -> None:
        connections = list(self.active_connections.get(slug, []))
        for websocket in connections:
            try:
                await websocket.send_json(message)
            except Exception:
                self.disconnect(slug, websocket)

    def connection_count(self, slug: str) -> int:
        return len(self.active_connections.get(slug, []))


manager = ConnectionManager()
