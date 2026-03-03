from __future__ import annotations

from fastapi import APIRouter
from fastapi.requests import Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates


router = APIRouter()
templates = Jinja2Templates(directory="app/templates")


@router.get("/resources", response_class=HTMLResponse)
async def resources_page(request: Request):
    return templates.TemplateResponse("resources.html", {"request": request})




