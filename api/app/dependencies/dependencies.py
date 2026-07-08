from fastapi import Depends
from sqlalchemy.orm import Session

from app.controllers.event_controller import EventController
from app.controllers.email_controller import EmailController
from app.controllers.phone_controller import PhoneController
from app.controllers.sms_controller import SmsController
from app.controllers.text_controller import TextController
from app.controllers.user_controller import UserController
from app.controllers.vcard_controller import VcardController
from app.controllers.website_controller import WebsiteController
from app.controllers.whatsapp_controller import WhatsappController
from app.controllers.wifi_controller import WifiController
from app.db.session import get_db
from app.repositories.event_repository import EventRepository
from app.repositories.email_repository import EmailRepository
from app.repositories.phone_repository import PhoneRepository
from app.repositories.sms_repository import SmsRepository
from app.repositories.text_repository import TextRepository
from app.repositories.user_repository import UserRepository
from app.repositories.vcard_repository import VcardRepository
from app.repositories.website_repository import WebsiteRepository
from app.repositories.whatsapp_repository import WhatsappRepository
from app.repositories.wifi_repository import WifiRepository
from app.services.event_service import EventService
from app.services.email_service import EmailService
from app.services.phone_service import PhoneService
from app.services.sms_service import SmsService
from app.services.text_service import TextService
from app.services.user_service import UserService
from app.services.vcard_service import VcardService
from app.services.website_service import WebsiteService
from app.services.whatsapp_service import WhatsappService
from app.services.wifi_service import WifiService


def get_user_controller() -> UserController:
    return UserController(UserService(UserRepository()))


def get_website_controller(db: Session = Depends(get_db)) -> WebsiteController:
    return WebsiteController(WebsiteService(WebsiteRepository(db)))


def get_text_controller(db: Session = Depends(get_db)) -> TextController:
    return TextController(TextService(TextRepository(db)))


def get_wifi_controller(db: Session = Depends(get_db)) -> WifiController:
    return WifiController(WifiService(WifiRepository(db)))


def get_vcard_controller(db: Session = Depends(get_db)) -> VcardController:
    return VcardController(VcardService(VcardRepository(db)))


def get_email_controller(db: Session = Depends(get_db)) -> EmailController:
    return EmailController(EmailService(EmailRepository(db)))


def get_sms_controller(db: Session = Depends(get_db)) -> SmsController:
    return SmsController(SmsService(SmsRepository(db)))


def get_phone_controller(db: Session = Depends(get_db)) -> PhoneController:
    return PhoneController(PhoneService(PhoneRepository(db)))


def get_whatsapp_controller(db: Session = Depends(get_db)) -> WhatsappController:
    return WhatsappController(WhatsappService(WhatsappRepository(db)))


def get_event_controller(db: Session = Depends(get_db)) -> EventController:
    return EventController(EventService(EventRepository(db)))
