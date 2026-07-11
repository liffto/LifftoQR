from sqlalchemy import Boolean, Column, Date, DateTime, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class QR(Base):
    __tablename__ = "qrs"

    id = Column(Integer, primary_key=True, index=True)
    type_key = Column(String(100), nullable=False, index=True)
    type = Column(String(100), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    url = Column(String(500), nullable=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    dynamic = Column(Boolean, nullable=False, default=False)
    qr_type = Column(String(100), nullable=False)
    folder = Column(String(100), nullable=True)
    status = Column(Boolean, nullable=False, default=True)
    scans = Column(Integer, nullable=False, default=0)
    edited_on = Column(Date, nullable=True)

    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_by = Column(Integer, nullable=True)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    website = relationship(
        "Website",
        back_populates="qr",
        uselist=False,
        foreign_keys="Website.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    template = relationship(
        "Template",
        back_populates="qr",
        uselist=False,
        foreign_keys="Template.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    text = relationship(
        "Text",
        back_populates="qr",
        uselist=False,
        foreign_keys="Text.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    wifi = relationship(
        "Wifi",
        back_populates="qr",
        uselist=False,
        foreign_keys="Wifi.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    vcard = relationship(
        "Vcard",
        back_populates="qr",
        uselist=False,
        foreign_keys="Vcard.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    email = relationship(
        "Email",
        back_populates="qr",
        uselist=False,
        foreign_keys="Email.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    sms = relationship(
        "Sms",
        back_populates="qr",
        uselist=False,
        foreign_keys="Sms.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    phone = relationship(
        "Phone",
        back_populates="qr",
        uselist=False,
        foreign_keys="Phone.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    whatsapp = relationship(
        "Whatsapp",
        back_populates="qr",
        uselist=False,
        foreign_keys="Whatsapp.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    event = relationship(
        "Event",
        back_populates="qr",
        uselist=False,
        foreign_keys="Event.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    location = relationship(
        "Location",
        back_populates="qr",
        uselist=False,
        foreign_keys="Location.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    social_media = relationship(
        "SocialMedia",
        back_populates="qr",
        uselist=False,
        foreign_keys="SocialMedia.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    google_review = relationship(
        "GoogleReview",
        back_populates="qr",
        uselist=False,
        foreign_keys="GoogleReview.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    pdf = relationship(
        "Pdf",
        back_populates="qr",
        uselist=False,
        foreign_keys="Pdf.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    video = relationship(
        "Video",
        back_populates="qr",
        uselist=False,
        foreign_keys="Video.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    audio = relationship(
        "Audio",
        back_populates="qr",
        uselist=False,
        foreign_keys="Audio.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    app = relationship(
        "App",
        back_populates="qr",
        uselist=False,
        foreign_keys="App.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    link_tree = relationship(
        "LinkTree",
        back_populates="qr",
        uselist=False,
        foreign_keys="LinkTree.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    coupon = relationship(
        "Coupon",
        back_populates="qr",
        uselist=False,
        foreign_keys="Coupon.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    invitation = relationship(
        "Invitation",
        back_populates="qr",
        uselist=False,
        foreign_keys="Invitation.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    feedback = relationship(
        "Feedback",
        back_populates="qr",
        uselist=False,
        foreign_keys="Feedback.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
