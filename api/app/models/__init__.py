"""Database models package."""

from app.db.base_class import Base, PKMixin, TimestampMixin, TenantMixin
from app.tenants.models import Account
from app.auth.models import User
from app.auth.models_extras import TokenBlocklist, EmailVerification
from app.rbac.models import Role, UserRole
from app.models.qr import QR
from app.models.template import Template
from app.models.text import Text
from app.models.website import Website
from app.models.wifi import Wifi
from app.models.vcard import Vcard
from app.models.email import Email
from app.models.sms import Sms
from app.models.phone import Phone
from app.models.whatsapp import Whatsapp
from app.models.event import Event

__all__ = [
    "Base",
    "PKMixin",
    "TimestampMixin",
    "TenantMixin",
    "Account",
    "User",
    "TokenBlocklist",
    "EmailVerification",
    "Role",
    "UserRole",
    "QR",
    "Template",
    "Text",
    "Website",
    "Wifi",
    "Vcard",
    "Email",
    "Sms",
    "Phone",
    "Whatsapp",
    "Event",
]
