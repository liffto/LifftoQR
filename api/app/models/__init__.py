"""Database models package."""

from app.db.base_class import Base, PKMixin, TimestampMixin, TenantMixin
from app.tenants.models import Account
from app.auth.models import User
from app.auth.models_extras import TokenBlocklist, EmailVerification
from app.rbac.models import Role, UserRole
from app.models.qr import QR
from app.models.scan_event import ScanEvent
from app.models.template import Template
from app.models.user_template import UserTemplate
from app.models.text import Text
from app.models.website import Website
from app.models.wifi import Wifi
from app.models.vcard import Vcard
from app.models.email import Email
from app.models.sms import Sms
from app.models.phone import Phone
from app.models.whatsapp import Whatsapp
from app.models.event import Event
from app.models.locations import Location
from app.models.social_media import SocialMedia
from app.models.google_review import GoogleReview
from app.models.pdf import Pdf
from app.models.video import Video
from app.models.audio import Audio
from app.models.app import App
from app.models.link_tree import LinkTree
from app.models.link_tree_link import LinkTreeLink
from app.models.coupon import Coupon
from app.models.invitation import Invitation
from app.models.feedback import Feedback

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
    "ScanEvent",
    "Template",
    "UserTemplate",
    "Text",
    "Website",
    "Wifi",
    "Vcard",
    "Email",
    "Sms",
    "Phone",
    "Whatsapp",
    "Event",
    "Location",
    "SocialMedia",
    "GoogleReview",
    "Pdf",
    "Video",
    "Audio",
    "App",
    "LinkTree",
    "LinkTreeLink",
    "Coupon",
    "Invitation",
    "Feedback",
]
