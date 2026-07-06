from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class TemplateBase(BaseModel):
    logo: str | None = Field(default=None, max_length=500)
    logo_size: float = Field(default=0.4, ge=0.2, le=0.6)
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


class WebsiteContentCreate(BaseModel):
    url: str = Field(min_length=1, max_length=500)


class WebsiteCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    url: str = Field(min_length=1, max_length=500)
    slug: str = Field(min_length=1, max_length=100)
    dynamic: bool = False
    qr_type: str = Field(min_length=1, max_length=100)
    folder: str | None = Field(default="Untitled", max_length=100)
    status: bool = True
    scans: int = Field(default=0, ge=0)
    content: WebsiteContentCreate
    template: TemplateBase
    created_by: int | None = None


class WebsiteContentUpdate(BaseModel):
    url: str | None = Field(default=None, min_length=1, max_length=500)


class WebsiteUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    url: str | None = Field(default=None, min_length=1, max_length=500)
    slug: str | None = Field(default=None, min_length=1, max_length=100)
    dynamic: bool | None = None
    qr_type: str | None = Field(default=None, min_length=1, max_length=100)
    folder: str | None = Field(default=None, max_length=100)
    status: bool | None = None
    scans: int | None = Field(default=None, ge=0)
    content: WebsiteContentUpdate | None = None
    template: TemplateBase | None = None
    updated_by: int | None = None


class WebsiteContentResponse(BaseModel):
    id: int
    qr_id: int
    url: str


class TemplateItemResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    qr_id: int
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


class WebsiteItemResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    type_key: str = Field(serialization_alias="typeKey")
    type: str
    name: str
    url: str | None
    slug: str
    dynamic: bool
    qr_type: str = Field(serialization_alias="qrType")
    folder: str | None
    status: str
    scans: int
    edited_on: str | None = Field(serialization_alias="editedOn")
    content: WebsiteContentResponse
    template: TemplateItemResponse

    @classmethod
    def from_qr(cls, qr) -> "WebsiteItemResponse":
        if qr.website is None or qr.template is None:
            raise ValueError("Website QR is missing content or template")

        edited_on: str | None = None
        if qr.edited_on is not None:
            edited_on = (
                qr.edited_on.isoformat()
                if isinstance(qr.edited_on, date)
                else str(qr.edited_on)
            )

        return cls(
            id=qr.id,
            type_key=qr.type_key,
            type=qr.type,
            name=qr.name,
            url=qr.url,
            slug=qr.slug,
            dynamic=qr.dynamic,
            qr_type=qr.qr_type,
            folder=qr.folder,
            status="Active" if qr.status else "Inactive",
            scans=qr.scans,
            edited_on=edited_on,
            content=WebsiteContentResponse(
                id=qr.website.id,
                qr_id=qr.website.qr_id,
                url=qr.website.url,
            ),
            template=TemplateItemResponse(
                id=qr.template.id,
                qr_id=qr.template.qr_id,
                logo=qr.template.logo,
                logo_size=qr.template.logo_size,
                frame=qr.template.frame,
                frame_text=qr.template.frame_text,
                body_pattern=qr.template.body_pattern,
                body_gradient=qr.template.body_gradient,
                body_color_1=qr.template.body_color_1,
                body_color_2=qr.template.body_color_2,
                corner_style=qr.template.corner_style,
                corner_gradient=qr.template.corner_gradient,
                corner_color_1=qr.template.corner_color_1,
                corner_color_2=qr.template.corner_color_2,
                background=qr.template.background,
            ),
        )
