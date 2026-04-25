from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import neo4j_connection
from .routes.analysis import router as analysis_router
from .routes.media import router as media_router
from .routes.places import router as places_router
from .routes.summary import router as summary_router

app = FastAPI(title=settings.app_name, version=settings.app_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(summary_router)
app.include_router(places_router)
app.include_router(analysis_router)
app.include_router(media_router)


@app.on_event("shutdown")
def shutdown_event():
    neo4j_connection.close()
