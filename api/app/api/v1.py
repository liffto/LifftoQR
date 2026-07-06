"""API v1 router aggregation."""

from fastapi import APIRouter
from app.auth.routers import router as auth_router
from app.routes.website_routes import router as website_router

api_v1 = APIRouter()
api_v1.include_router(auth_router)
api_v1.include_router(website_router)
