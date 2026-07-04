from typing import Any


def serialize_model(model: Any) -> dict[str, Any]:
    return model.model_dump() if hasattr(model, "model_dump") else model
