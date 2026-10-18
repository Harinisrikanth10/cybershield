from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.analysis import router as analysis_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.reports import router as reports_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.assistant import router as assistant_router
from app.api.v1.learn import router as learn_router
from app.api.v1.profile import router as profile_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(analysis_router)
api_router.include_router(dashboard_router)
api_router.include_router(reports_router)
api_router.include_router(alerts_router)
api_router.include_router(assistant_router)
api_router.include_router(learn_router)
api_router.include_router(profile_router)
