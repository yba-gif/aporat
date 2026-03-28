"""Celery tasks for OSINT scan orchestration."""

import logging
from datetime import datetime, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.celery_app import celery_app
from app.core.config import get_settings
from app.models.case import (
    OsintScan, OsintFinding, Case, CaseEvent,
    ScanStatus, EventType, CaseStatus,
)

logger = logging.getLogger(__name__)
settings = get_settings()

# Sync engine for Celery workers (Celery is sync, not async)
sync_engine = create_engine(settings.DATABASE_SYNC_URL, pool_size=5)
SyncSession = sessionmaker(bind=sync_engine)


def _get_db() -> Session:
    return SyncSession()


@celery_app.task(bind=True, max_retries=2, default_retry_delay=30)
def run_osint_scan(self, scan_id: str):
    """Main OSINT scan orchestrator.

    1. Load scan record
    2. Run each OSINT tool in sequence
    3. Parse results into OsintFinding records
    4. Update risk score on parent case
    """
    db = _get_db()
    try:
        scan = db.query(OsintScan).filter(OsintScan.id == scan_id).first()
        if not scan:
            logger.error(f"Scan {scan_id} not found")
            return

        # Mark running
        scan.status = ScanStatus.running
        scan.started_at = datetime.now(timezone.utc)
        scan.progress = 5
        db.commit()

        tools_to_run = []
        results = {}

        # Decide which tools to run based on available info
        if scan.target_username:
            tools_to_run.extend(["sherlock", "maigret"])
        elif scan.target_name:
            # Derive a username guess from name
            tools_to_run.extend(["sherlock", "maigret"])

        if scan.target_email:
            tools_to_run.append("holehe")

        scan.tools_used = tools_to_run
        db.commit()

        total_tools = len(tools_to_run) or 1
        findings = []

        for i, tool_name in enumerate(tools_to_run):
            try:
                logger.info(f"[Scan {scan_id}] Running {tool_name}...")
                if tool_name == "sherlock":
                    from app.osint.sherlock_runner import run_sherlock
                    tool_results = run_sherlock(
                        username=scan.target_username or scan.target_name.lower().replace(" ", ""),
                    )
                elif tool_name == "maigret":
                    from app.osint.maigret_runner import run_maigret
                    tool_results = run_maigret(
                        username=scan.target_username or scan.target_name.lower().replace(" ", ""),
                    )
                elif tool_name == "holehe":
                    from app.osint.holehe_runner import run_holehe
                    tool_results = run_holehe(email=scan.target_email)
                else:
                    tool_results = {"accounts": []}

                results[tool_name] = tool_results

                # Convert tool results to OsintFinding records
                for account in tool_results.get("accounts", []):
                    finding = OsintFinding(
                        case_id=scan.case_id,
                        source=_map_tool_to_source(tool_name, account.get("site", "")),
                        category="social_media",
                        title=f"Account found on {account.get('site', 'unknown')}",
                        detail=account.get("detail", f"Username matched on {account.get('site', '')}"),
                        url=account.get("url", ""),
                        confidence=account.get("confidence", 70),
                        risk_impact=_assess_risk_impact(account),
                        evidence={"tool": tool_name, "raw": account},
                    )
                    if scan.case_id:
                        db.add(finding)
                        findings.append(finding)

            except Exception as e:
                logger.warning(f"[Scan {scan_id}] {tool_name} failed: {e}")
                results[tool_name] = {"error": str(e)}

            # Update progress
            scan.progress = int(((i + 1) / total_tools) * 90) + 5
            db.commit()

        # Finalize
        scan.status = ScanStatus.completed
        scan.progress = 100
        scan.results = results
        scan.findings_count = len(findings)
        scan.completed_at = datetime.now(timezone.utc)
        db.commit()

        # Update parent case if exists
        if scan.case_id:
            case = db.query(Case).filter(Case.id == scan.case_id).first()
            if case:
                # Simple risk scoring based on findings
                score = min(100.0, len(findings) * 12.0)
                case.risk_score = score
                if score >= 75:
                    case.risk_level = "critical"
                elif score >= 50:
                    case.risk_level = "high"
                elif score >= 25:
                    case.risk_level = "medium"
                else:
                    case.risk_level = "low"

                case.status = CaseStatus.in_review
                case.risk_factors = [f.title for f in findings[:10]]
                case.updated_at = datetime.now(timezone.utc)

                # Add scan complete event
                event = CaseEvent(
                    case_id=case.id,
                    type=EventType.scan_completed,
                    description=f"OSINT scan completed — {len(findings)} findings from {len(tools_to_run)} tools",
                )
                db.add(event)

                # Add risk scored event
                risk_event = CaseEvent(
                    case_id=case.id,
                    type=EventType.risk_scored,
                    description=f"Risk score: {score:.0f}/100 ({case.risk_level})",
                )
                db.add(risk_event)

                db.commit()

        logger.info(f"[Scan {scan_id}] Completed — {len(findings)} findings")
        return {"scan_id": scan_id, "findings": len(findings)}

    except Exception as exc:
        logger.exception(f"[Scan {scan_id}] Fatal error")
        try:
            scan = db.query(OsintScan).filter(OsintScan.id == scan_id).first()
            if scan:
                scan.status = ScanStatus.failed
                scan.error = str(exc)
                scan.completed_at = datetime.now(timezone.utc)
                db.commit()
        except Exception:
            pass
        raise self.retry(exc=exc)
    finally:
        db.close()


def _map_tool_to_source(tool: str, site: str) -> str:
    """Map tool + site name to OsintSource enum value."""
    site_lower = site.lower()
    if "instagram" in site_lower:
        return "instagram"
    if "facebook" in site_lower:
        return "facebook"
    if "twitter" in site_lower or "x.com" in site_lower:
        return "twitter"
    if "tiktok" in site_lower:
        return "tiktok"
    if "linkedin" in site_lower:
        return "linkedin"
    if "strava" in site_lower:
        return "strava"
    # Default based on tool
    return "public_records"


def _assess_risk_impact(account: dict) -> str:
    """Simple risk assessment for an individual account finding."""
    site = account.get("site", "").lower()
    # High-risk platforms for OPSEC
    high_risk = ["strava", "instagram", "tiktok", "facebook"]
    medium_risk = ["twitter", "linkedin", "reddit"]
    if any(h in site for h in high_risk):
        return "high"
    if any(m in site for m in medium_risk):
        return "medium"
    return "low"
