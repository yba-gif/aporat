"""OSINT scan endpoints — trigger, status, results."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.case import OsintScan, Case, CaseStatus, CaseEvent, EventType
from app.schemas.case import ScanCreate, ScanOut

router = APIRouter(prefix="/api/scans", tags=["scans"])


@router.post("", response_model=ScanOut, status_code=201)
async def trigger_scan(
    body: ScanCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Trigger a new OSINT scan. Queues a Celery task."""
    # If case_id provided, verify it exists
    if body.case_id:
        case = (await db.execute(select(Case).where(Case.id == body.case_id))).scalar_one_or_none()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        # Update case status to scanning
        case.status = CaseStatus.scanning
        event = CaseEvent(
            case_id=case.id,
            type=EventType.scan_started,
            description=f"OSINT scan triggered for {body.target_name}",
            user_name=user.get("email"),
        )
        db.add(event)

    scan = OsintScan(
        case_id=body.case_id,
        scan_type=body.scan_type,
        target_name=body.target_name,
        target_email=body.target_email,
        target_username=body.target_username,
    )
    db.add(scan)
    await db.flush()

    # Fire Celery task (import here to avoid circular imports)
    try:
        from app.tasks.osint_tasks import run_osint_scan
        run_osint_scan.delay(scan.id)
    except Exception:
        # Celery not running — scan stays queued, can be picked up later
        pass

    return ScanOut.model_validate(scan)


@router.get("/{scan_id}", response_model=ScanOut)
async def get_scan(
    scan_id: str,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    result = await db.execute(select(OsintScan).where(OsintScan.id == scan_id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return ScanOut.model_validate(scan)


@router.get("", response_model=list[ScanOut])
async def list_scans(
    case_id: str | None = None,
    status: str | None = None,
    scan_type: str | None = None,
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    q = select(OsintScan)
    if case_id:
        q = q.where(OsintScan.case_id == case_id)
    if status:
        q = q.where(OsintScan.status == status)
    if scan_type:
        q = q.where(OsintScan.scan_type == scan_type)

    q = q.order_by(OsintScan.created_at.desc()).limit(limit)
    rows = (await db.execute(q)).scalars().all()
    return [ScanOut.model_validate(r) for r in rows]
