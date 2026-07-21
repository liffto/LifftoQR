from fastapi import Depends
from sqlalchemy.orm import Session

from app.controllers.app_controller import AppController
from app.controllers.audio_controller import AudioController
from app.controllers.coupon_controller import CouponController
from app.controllers.email_controller import EmailController
from app.controllers.event_controller import EventController
from app.controllers.feedback_controller import FeedbackController
from app.controllers.google_review_controller import GoogleReviewController
from app.controllers.invitation_controller import InvitationController
from app.controllers.link_tree_controller import LinkTreeController
from app.controllers.location_controller import LocationController
from app.controllers.pdf_controller import PdfController
from app.controllers.phone_controller import PhoneController
from app.controllers.sms_controller import SmsController
from app.controllers.social_media_controller import SocialMediaController
from app.controllers.text_controller import TextController
from app.controllers.user_controller import UserController
from app.controllers.vcard_controller import VcardController
from app.controllers.video_controller import VideoController
from app.controllers.website_controller import WebsiteController
from app.controllers.whatsapp_controller import WhatsappController
from app.controllers.wifi_controller import WifiController
from app.controllers.qr_controller import QrController
from app.controllers.scan_controller import ScanController
from app.db.session import get_db
from app.repositories.app_repository import AppRepository
from app.repositories.audio_repository import AudioRepository
from app.repositories.coupon_repository import CouponRepository
from app.repositories.email_repository import EmailRepository
from app.repositories.event_repository import EventRepository
from app.repositories.feedback_repository import FeedbackRepository
from app.repositories.google_review_repository import GoogleReviewRepository
from app.repositories.invitation_repository import InvitationRepository
from app.repositories.link_tree_repository import LinkTreeRepository
from app.repositories.location_repository import LocationRepository
from app.repositories.pdf_repository import PdfRepository
from app.repositories.phone_repository import PhoneRepository
from app.repositories.qr_repository import QrRepository
from app.repositories.sms_repository import SmsRepository
from app.repositories.social_media_repository import SocialMediaRepository
from app.repositories.text_repository import TextRepository
from app.repositories.user_repository import UserRepository
from app.repositories.vcard_repository import VcardRepository
from app.repositories.video_repository import VideoRepository
from app.repositories.website_repository import WebsiteRepository
from app.repositories.whatsapp_repository import WhatsappRepository
from app.repositories.wifi_repository import WifiRepository
from app.services.app_service import AppService
from app.services.audio_service import AudioService
from app.services.coupon_service import CouponService
from app.services.email_service import EmailService
from app.services.event_service import EventService
from app.services.feedback_service import FeedbackService
from app.services.google_review_service import GoogleReviewService
from app.services.invitation_service import InvitationService
from app.services.link_tree_service import LinkTreeService
from app.services.location_service import LocationService
from app.services.pdf_service import PdfService
from app.services.phone_service import PhoneService
from app.services.qr_service import QrService
from app.services.scan_service import ScanService
from app.services.sms_service import SmsService
from app.services.social_media_service import SocialMediaService
from app.services.text_service import TextService
from app.services.user_service import UserService
from app.services.vcard_service import VcardService
from app.services.video_service import VideoService
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


def get_location_controller(db: Session = Depends(get_db)) -> LocationController:
    return LocationController(LocationService(LocationRepository(db)))


def get_social_media_controller(db: Session = Depends(get_db)) -> SocialMediaController:
    return SocialMediaController(SocialMediaService(SocialMediaRepository(db)))


def get_google_review_controller(db: Session = Depends(get_db)) -> GoogleReviewController:
    return GoogleReviewController(GoogleReviewService(GoogleReviewRepository(db)))


def get_pdf_controller(db: Session = Depends(get_db)) -> PdfController:
    return PdfController(PdfService(PdfRepository(db)))


def get_video_controller(db: Session = Depends(get_db)) -> VideoController:
    return VideoController(VideoService(VideoRepository(db)))


def get_audio_controller(db: Session = Depends(get_db)) -> AudioController:
    return AudioController(AudioService(AudioRepository(db)))


def get_app_controller(db: Session = Depends(get_db)) -> AppController:
    return AppController(AppService(AppRepository(db)))


def get_link_tree_controller(db: Session = Depends(get_db)) -> LinkTreeController:
    return LinkTreeController(LinkTreeService(LinkTreeRepository(db)))


def get_coupon_controller(db: Session = Depends(get_db)) -> CouponController:
    return CouponController(CouponService(CouponRepository(db)))


def get_invitation_controller(db: Session = Depends(get_db)) -> InvitationController:
    return InvitationController(InvitationService(InvitationRepository(db)))


def get_feedback_controller(db: Session = Depends(get_db)) -> FeedbackController:
    return FeedbackController(FeedbackService(FeedbackRepository(db)))


def get_qr_controller(db: Session = Depends(get_db)) -> QrController:
    return QrController(QrService(QrRepository(db)))


def get_scan_controller(db: Session = Depends(get_db)) -> ScanController:
    return ScanController(ScanService(QrRepository(db)))
