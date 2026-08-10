"""API v1 router aggregation."""

from fastapi import APIRouter

from app.auth.routers import router as auth_router
from app.routes.app_routes import router as app_router
from app.routes.audio_routes import router as audio_router
from app.routes.coupon_routes import router as coupon_router
from app.routes.email_routes import router as email_router
from app.routes.event_routes import router as event_router
from app.routes.feedback_routes import router as feedback_router
from app.routes.google_review_routes import router as google_review_router
from app.routes.invitation_routes import router as invitation_router
from app.routes.link_tree_routes import router as link_tree_router
from app.routes.location_routes import router as location_router
from app.routes.pdf_routes import router as pdf_router
from app.routes.phone_routes import router as phone_router
from app.routes.public_routes import router as public_router
from app.routes.qr_routes import router as qr_router
from app.routes.sms_routes import router as sms_router
from app.routes.social_media_routes import router as social_media_router
from app.routes.text_routes import router as text_router
from app.routes.vcard_routes import router as vcard_router
from app.routes.video_routes import router as video_router
from app.routes.website_routes import router as website_router
from app.routes.whatsapp_routes import router as whatsapp_router
from app.routes.wifi_routes import router as wifi_router

api_v1 = APIRouter()
api_v1.include_router(auth_router)
api_v1.include_router(public_router)
api_v1.include_router(qr_router)
api_v1.include_router(website_router)
api_v1.include_router(text_router)
api_v1.include_router(wifi_router)
api_v1.include_router(vcard_router)
api_v1.include_router(email_router)
api_v1.include_router(sms_router)
api_v1.include_router(phone_router)
api_v1.include_router(whatsapp_router)
api_v1.include_router(event_router)
api_v1.include_router(location_router)
api_v1.include_router(social_media_router)
api_v1.include_router(google_review_router)
api_v1.include_router(pdf_router)
api_v1.include_router(video_router)
api_v1.include_router(audio_router)
api_v1.include_router(app_router)
api_v1.include_router(link_tree_router)
api_v1.include_router(coupon_router)
api_v1.include_router(invitation_router)
api_v1.include_router(feedback_router)
