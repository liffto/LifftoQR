from datetime import date

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.website import TemplateBase, TemplateItemResponse


class AppContentCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    ios_url: str | None = Field(
        default=None, max_length=1000, validation_alias="iosUrl", serialization_alias="iosUrl"
    )
    android_url: str | None = Field(
        default=None,
        max_length=1000,
        validation_alias="androidUrl",
        serialization_alias="androidUrl",
    )
    fallback_url: str | None = Field(
        default=None,
        max_length=1000,
        validation_alias="fallbackUrl",
        serialization_alias="fallbackUrl",
    )
    name: str = Field(min_length=1, max_length=255)


class AppCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    url: str = Field(default="", max_length=500)
    slug: str = Field(min_length=1, max_length=100)
    dynamic: bool = False
    qr_type: str = Field(min_length=1, max_length=100)
    folder: str | None = Field(default="Untitled", max_length=100)
    status: bool = True
    scans: int = Field(default=0, ge=0)
    content: AppContentCreate
    template: TemplateBase
    created_by: int | None = None


class AppContentUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    ios_url: str | None = Field(
        default=None, max_length=1000, validation_alias="iosUrl", serialization_alias="iosUrl"
    )
    android_url: str | None = Field(
        default=None,
        max_length=1000,
        validation_alias="androidUrl",
        serialization_alias="androidUrl",
    )
    fallback_url: str | None = Field(
        default=None,
        max_length=1000,
        validation_alias="fallbackUrl",
        serialization_alias="fallbackUrl",
    )
    name: str | None = Field(default=None, min_length=1, max_length=255)


class AppUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    url: str | None = Field(default=None, max_length=500)
    slug: str | None = Field(default=None, min_length=1, max_length=100)
    dynamic: bool | None = None
    qr_type: str | None = Field(default=None, min_length=1, max_length=100)
    folder: str | None = Field(default=None, max_length=100)
    status: bool | None = None
    scans: int | None = Field(default=None, ge=0)
    content: AppContentUpdate | None = None
    template: TemplateBase | None = None
    updated_by: int | None = None


class AppContentResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    qr_id: int
    ios_url: str | None = Field(serialization_alias="iosUrl")
    android_url: str | None = Field(serialization_alias="androidUrl")
    fallback_url: str | None = Field(serialization_alias="fallbackUrl")
    name: str


class AppItemResponse(BaseModel):
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
    content: AppContentResponse
    template: TemplateItemResponse

    @classmethod
    def from_qr(cls, qr) -> "AppItemResponse":
        if qr.app is None or qr.template is None:
            raise ValueError("App QR is missing content or template")

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
            content=AppContentResponse(
                id=qr.app.id,
                qr_id=qr.app.qr_id,
                ios_url=qr.app.ios_url,
                android_url=qr.app.android_url,
                fallback_url=qr.app.fallback_url,
                name=qr.app.name,
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

