"""Case CRUD + list/filter endpoints."""

import random
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.case import Case, CaseEvent, CaseStatus, EventType, RiskLevel
from app.schemas.case import (
    CaseCreate, CaseUpdate, CaseOut, CaseListOut, PaginatedCases,
)

router = APIRouter(prefix="/api/cases", tags=["cases"])


def _generate_case_id() -> str:
    year = datetime.now(timezone.utc).year
    seq = random.randint(1, 99999)
    return f"PL-{year}-{seq:05d}"


# ─── List / filter ───

@router.get("", response_model=PaginatedCases)
async def list_cases(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: str | None = None,
    risk_level: str | None = None,
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    q = select(Case)
    count_q = select(func.count(Case.id))

    if status:
        q = q.where(Case.status == status)
        count_q = count_q.where(Case.status == status)
    if risk_level:
        q = q.where(Case.risk_level == risk_level)
        count_q = count_q.where(Case.risk_level == risk_level)
    if search:
        like = f"%{search}%"
        filt = or_(Case.case_id.ilike(like), Case.applicant["firstName"].astext.ilike(like), Case.applicant["lastName"].astext.ilike(like))
        q = q.where(filt)
        count_q = count_q.where(filt)

    total = (await db.execute(count_q)).scalar() or 0
    rows = (
        await db.execute(
            q.order_by(Case.created_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
    ).scalars().all()

    return PaginatedCases(
        items=[CaseListOut.model_validate(r) for r in rows],
        total=total,
        page=page,
        per_page=per_page,
    )


# ─── Get single case (full detail) ───

@router.get("/{case_id}", response_model=CaseOut)
async def get_case(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    q = (
        select(Case)
        .options(selectinload(Case.findings), selectinload(Case.documents), selectinload(Case.events))
        .where((Case.id == case_id) | (Case.case_id == case_id))
    )
    result = await db.execute(q)
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return CaseOut.model_validate(case)


# ─── Create ───

@router.post("", response_model=CaseOut, status_code=201)
async def create_case(
    body: CaseCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    case = Case(
        case_id=_generate_case_id(),
        applicant=body.applicant.model_dump(),
        consulate_location=body.consulate_location,
        travel_destination=body.travel_destination,
        assigned_officer=user["user_id"],
    )
    db.add(case)
    await db.flush()

    # Add creation event
    event = CaseEvent(
        case_id=case.id,
        type=EventType.created,
        description=f"Case created for {body.applicant.firstName} {body.applicant.lastName}",
        user_name=user.get("email"),
    )
    db.add(event)
    await db.flush()

    # Re-fetch with relationships
    return await get_case(case.id, db, user)


# ─── Update (status changes, risk scores, assign officer) ───

@router.patch("/{case_id}", response_model=CaseOut)
async def update_case(
    case_id: str,
    body: CaseUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    q = select(Case).where((Case.id == case_id) | (Case.case_id == case_id))
    result = await db.execute(q)
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    update_data = body.model_dump(exclude_unset=True)
    old_status = case.status

    for key, value in update_data.items():
        if key == "risk_level" and value:
            setattr(case, key, RiskLevel(value))
        elif key == "status" and value:
            setattr(case, key, CaseStatus(value))
        else:
            setattr(case, key, value)

    case.updated_at = datetime.now(timezone.utc)

    # Auto-create status change event
    if body.status and body.status != old_status:
        event_type_map = {
            "approved": EventType.approved,
            "rejected": EventType.rejected,
            "escalated": EventType.escalated,
            "in_review": EventType.reviewed,
        }
        evt_type = event_type_map.get(body.status, EventType.reviewed)
        event = CaseEvent(
            case_id=case.id,
            type=evt_type,
            description=f"Status changed from {old_status} to {body.status}",
            user_name=user.get("email"),
        )
        db.add(event)

    await db.flush()
    return await get_case(case.id, db, user)


# ─── Delete ───

@router.delete("/{case_id}", status_code=204)
async def delete_case(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    q = select(Case).where((Case.id == case_id) | (Case.case_id == case_id))
    result = await db.execute(q)
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    await db.delete(case)
