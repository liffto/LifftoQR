from pydantic import BaseModel, ConfigDict, Field


class UserTemplateSave(BaseModel):
    """What the studio sends when saving a look.

    snake_case, because that is what designToTemplate on the front end already
    produces for the per-QR template — the same payload, plus a name.
    """

    label: str = Field(min_length=1, max_length=100)
    logo: str | None = None
    logo_size: float = Field(default=0.4, ge=0, le=1)
    frame_text: str | None = Field(default=None, max_length=100)
    frame: str = Field(default="none", max_length=100)
    body_pattern: str = Field(default="square", max_length=100)
    body_gradient: bool = False
    body_color_1: str = Field(default="#000000", max_length=20)
    body_color_2: str = Field(default="#000000", max_length=20)
    corner_style: int = Field(default=0, ge=0)
    corner_gradient: bool = False
    corner_color_1: str = Field(default="#000000", max_length=20)
    corner_color_2: str = Field(default="#000000", max_length=20)
    background: str = Field(default="#FFFFFF", max_length=20)


class UserTemplateResponse(BaseModel):
    """What comes back, camelCased to match every other template response.

    The aliases are load-bearing, not decoration. templateToDesign reads
    `bodyPattern`, `bodyColor1` and the rest, and falls back to a default for
    anything it cannot find — so returning snake_case does not fail, it quietly
    hands back a plain black square with the right name on it. That is exactly
    what this did before the aliases were added.
    """

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    label: str
    logo: str | None
    logo_size: float = Field(serialization_alias="logoSize")
    frame: str
    frame_text: str | None = Field(serialization_alias="frameText")
    body_pattern: str = Field(serialization_alias="bodyPattern")
    body_gradient: bool = Field(serialization_alias="bodyGradient")
    body_color_1: str = Field(serialization_alias="bodyColor1")
    body_color_2: str = Field(serialization_alias="bodyColor2")
    corner_style: int = Field(serialization_alias="cornerStyle")
    corner_gradient: bool = Field(serialization_alias="cornerGradient")
    corner_color_1: str = Field(serialization_alias="cornerColor1")
    corner_color_2: str = Field(serialization_alias="cornerColor2")
    background: str
