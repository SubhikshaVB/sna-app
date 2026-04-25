from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from ..db import neo4j_connection
from ..services.graph_service import GraphService

router = APIRouter(prefix="/api", tags=["places"])


@router.get("/places")
def places(
    search: str | None = Query(default=None),
    taluk: str | None = Query(default=None),
    limit: int = Query(default=60, ge=1, le=300),
):
    service = GraphService(neo4j_connection.driver())
    return service.get_places(search=search, taluk=taluk, limit=limit)


@router.get("/places/{node_id}")
def place_detail(node_id: str):
    service = GraphService(neo4j_connection.driver())
    detail = service.get_place_detail(node_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Place not found")
    return detail


@router.get("/places/{node_id}/recommendations")
def recommendations(
    node_id: str,
    transport: str = Query(default="car", pattern="^(car|bus|2w|cycle|walk)$"),
    limit: int = Query(default=6, ge=1, le=20),
):
    service = GraphService(neo4j_connection.driver())
    return service.get_recommendations(node_id=node_id, transport=transport, limit=limit)

