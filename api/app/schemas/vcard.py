from datetime import date

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.website import TemplateBase, TemplateItemResponse


class VcardContentCreate(BaseModel):
    photo: str | None = Field(default=None, max_length=500)
    logo: str | None = Field(default=None, max_length=500)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    org: str | None = Field(default=None, max_length=255)
    title: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=30)
    work_phone: str | None = Field(default=None, max_length=30)
    email: str | None = Field(default=None, max_length=255)
    url: str | None = Field(default=None, max_length=500)
    street: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    zip: str | None = Field(default=None, max_length=20)
    country: str | None = Field(default=None, max_length=100)
    note: str | None = None


class VcardCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    url: str = Field(default="", max_length=500)
    slug: str = Field(min_length=1, max_length=100)
    dynamic: bool = False
    qr_type: str = Field(min_length=1, max_length=100)
    folder: str | None = Field(default="Untitled", max_length=100)
    status: bool = True
    scans: int = Field(default=0, ge=0)
    content: VcardContentCreate
    template: TemplateBase
    created_by: int | None = None


class VcardContentUpdate(BaseModel):
    photo: str | None = Field(default=None, max_length=500)
    logo: str | None = Field(default=None, max_length=500)
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    org: str | None = Field(default=None, max_length=255)
    title: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=30)
    work_phone: str | None = Field(default=None, max_length=30)
    email: str | None = Field(default=None, max_length=255)
    url: str | None = Field(default=None, max_length=500)
    street: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    zip: str | None = Field(default=None, max_length=20)
    country: str | None = Field(default=None, max_length=100)
    note: str | None = None


class VcardUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    url: str | None = Field(default=None, max_length=500)
    slug: str | None = Field(default=None, min_length=1, max_length=100)
    dynamic: bool | None = None
    qr_type: str | None = Field(default=None, min_length=1, max_length=100)
    folder: str | None = Field(default=None, max_length=100)
    status: bool | None = None
    scans: int | None = Field(default=None, ge=0)
    content: VcardContentUpdate | None = None
    template: TemplateBase | None = None
    updated_by: int | None = None


class VcardContentResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    qr_id: int
    photo: str | None
    logo: str | None
    first_name: str = Field(serialization_alias="firstName")
    last_name: str | None = Field(serialization_alias="lastName")
    org: str | None
    title: str | None
    phone: str | None
    work_phone: str | None = Field(serialization_alias="workPhone")
    email: str | None
    url: str | None
    street: str | None
    city: str | None
    state: str | None
    zip: str | None
    country: str | None
    note: str | None


class VcardItemResponse(BaseModel):
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
    content: VcardContentResponse
    template: TemplateItemResponse

    @classmethod
    def from_qr(cls, qr) -> "VcardItemResponse":
        if qr.vcard is None or qr.template is None:
            raise ValueError("Contact Card QR is missing content or template")

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
            content=VcardContentResponse(
                id=qr.vcard.id,
                qr_id=qr.vcard.qr_id,
                photo=qr.vcard.photo,
                logo=qr.vcard.logo,
                first_name=qr.vcard.first_name,
                last_name=qr.vcard.last_name,
                org=qr.vcard.org,
                title=qr.vcard.title,
                phone=qr.vcard.phone,
                work_phone=qr.vcard.work_phone,
                email=qr.vcard.email,
                url=qr.vcard.url,
                street=qr.vcard.street,
                city=qr.vcard.city,
                state=qr.vcard.state,
                zip=qr.vcard.zip,
                country=qr.vcard.country,
                note=qr.vcard.note,
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
