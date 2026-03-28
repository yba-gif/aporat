"""Defence OSINT endpoints — batch personnel scanning."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import csv
import io

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.case import OsintScan, ScanStatus
from app.schemas.case import ScanCreate, ScanOut

router = APIRouter(prefix="/api/defence", tags=["defence"])


@router.post("/scan", response_model=ScanOut, status_code=201)
async def trigger_defence_scan(
    body: ScanCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Single personnel OSINT scan for defence vertical."""
    scan = OsintScan(
        scan_type="defence",
        target_name=body.target_name,
        target_email=body.target_email,
        target_username=body.target_username,
    )
    db.add(scan)
    await db.flush()

    try:
        from app.tasks.osint_tasks import run_osint_scan
        run_osint_scan.delay(scan.id)
    except Exception:
        pass

    return ScanOut.model_validate(scan)


@router.post("/batch", response_model=list[ScanOut], status_code=201)
async def batch_defence_scan(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Upload CSV of personnel for batch OSINT scanning.
    CSV columns: name, email (optional), username (optional)
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files accepted")

    content = await file.read()
    reader = csv.DictReader(io.StringIO(content.decode("utf-8")))

    scans = []
    for row in reader:
        name = row.get("name", "").strip()
        if not name:
            continue
        scan = OsintScan(
            scan_type="defence",
            target_name=name,
            target_email=row.get("email", "").strip() or None,
            target_username=row.get("username", "").strip() or None,
        )
        db.add(scan)
        scans.append(scan)

    await db.flush()

    # Fire Celery tasks for each
    for scan in scans:
        try:
            from app.tasks.osint_tasks import run_osint_scan
            run_osint_scan.delay(scan.id)
        except Exception:
            pass

    return [ScanOut.model_validate(s) for s in scans]


@router.get("/scans", response_model=list[ScanOut])
async def list_defence_scans(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """List all defence-type scans."""
    q = select(OsintScan).where(OsintScan.scan_type == "defence").order_by(OsintScan.created_at.desc()).limit(100)
    rows = (await db.execute(q)).scalars().all()
    return [ScanOut.model_validate(r) for r in rows]
