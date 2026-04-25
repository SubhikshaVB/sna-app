from __future__ import annotations

from fastapi import APIRouter

from ..db import neo4j_connection
from ..services.graph_service import GraphService

router = APIRouter(prefix="/api", tags=["summary"])


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/summary")
def summary():
    service = GraphService(neo4j_connection.driver())
    return service.get_summary()


@router.get("/taluk-summary")
def taluk_summary():
    service = GraphService(neo4j_connection.driver())
    return service.get_taluk_summary()


@router.get("/cross-taluk-links")
def cross_taluk_links():
    service = GraphService(neo4j_connection.driver())
    return service.get_cross_taluk_links()

