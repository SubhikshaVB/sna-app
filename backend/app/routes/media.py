from __future__ import annotations

import urllib.error
import urllib.request

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response

router = APIRouter(prefix="/api", tags=["media"])


@router.get("/media")
def media_proxy(url: str = Query(..., min_length=8)):
    try:
        request = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0",
            },
        )
        with urllib.request.urlopen(request, timeout=25) as response:
            content = response.read()
            content_type = response.headers.get("Content-Type", "image/jpeg")
            return Response(content=content, media_type=content_type)
    except (urllib.error.URLError, urllib.error.HTTPError, ValueError) as exc:
        raise HTTPException(status_code=404, detail=f"Image could not be loaded: {exc}")

