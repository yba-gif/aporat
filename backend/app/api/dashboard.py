"""Dashboard stats endpoint."""

from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.case import Case, CaseEvent, CaseStatus, RiskLevel
from app.schemas.case import DashboardStats, EventOut

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardStats)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    # Total cases
    total = (await db.execute(select(func.count(Case.id)))).scalar() or 0

    # Pending review (new + in_review)
    pending = (await db.execute(
        select(func.count(Case.id)).where(Case.status.in_([CaseStatus.new, CaseStatus.in_review]))
    )).scalar() or 0

    # High risk (high + critical)
    high_risk = (await db.execute(
        select(func.count(Case.id)).where(Case.risk_level.in_([RiskLevel.high, RiskLevel.critical]))
    )).scalar() or 0

    # Approved today
    approved_today = (await db.execute(
        select(func.count(Case.id)).where(
            Case.status == CaseStatus.approved,
            Case.updated_at >= today_start,
        )
    )).scalar() or 0

    # Risk distribution
    risk_dist = {}
    for level in RiskLevel:
        count = (await db.execute(
            select(func.count(Case.id)).where(Case.risk_level == level)
        )).scalar() or 0
        risk_dist[level.value] = count

    # Recent activity (last 20 events)
    events = (await db.execute(
        select(CaseEvent).order_by(CaseEvent.timestamp.desc()).limit(20)
    )).scalars().all()

    return DashboardStats(
        total_cases=total,
        pending_review=pending,
        high_risk=high_risk,
        approved_today=approved_today,
        risk_distribution=risk_dist,
        recent_activity=[EventOut.model_validate(e) for e in events],
    )
