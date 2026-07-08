"""API v1 router aggregation."""

from fastapi import APIRouter
from app.auth.routers import router as auth_router
from app.routes.event_routes import router as event_router
from app.routes.email_routes import router as email_router
from app.routes.phone_routes import router as phone_router
from app.routes.sms_routes import router as sms_router
from app.routes.text_routes import router as text_router
from app.routes.vcard_routes import router as vcard_router
from app.routes.website_routes import router as website_router
from app.routes.whatsapp_routes import router as whatsapp_router
from app.routes.wifi_routes import router as wifi_router

api_v1 = APIRouter()
api_v1.include_router(auth_router)
api_v1.include_router(website_router)
api_v1.include_router(text_router)
api_v1.include_router(wifi_router)
api_v1.include_router(vcard_router)
api_v1.include_router(email_router)
api_v1.include_router(sms_router)
api_v1.include_router(phone_router)
api_v1.include_router(whatsapp_router)
api_v1.include_router(event_router)
