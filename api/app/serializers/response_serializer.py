from typing import Any


def success_response(data: Any) -> dict[str, Any]:
    return {"success": True, "data": data}
