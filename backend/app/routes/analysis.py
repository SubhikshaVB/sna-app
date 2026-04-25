from __future__ import annotations

from fastapi import APIRouter, Query

from ..db import neo4j_connection
from ..services.graph_service import GraphService

router = APIRouter(prefix="/api", tags=["analysis"])


@router.get("/top-hubs")
def top_hubs(limit: int = Query(default=10, ge=1, le=50)):
    service = GraphService(neo4j_connection.driver())
    return service.get_top_hubs(limit=limit)


@router.get("/isolated-places")
def isolated_places():
    service = GraphService(neo4j_connection.driver())
    return service.get_isolated_places()


@router.get("/metrics")
def metrics():
    service = GraphService(neo4j_connection.driver())
    return service.get_metrics()


@router.get("/network-preview")
def network_preview(limit: int = Query(default=80, ge=20, le=150)):
    service = GraphService(neo4j_connection.driver())
    return service.get_network_preview(limit=limit)

