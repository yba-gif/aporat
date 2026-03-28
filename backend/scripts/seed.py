"""Seed database with demo data matching V3 mock data."""

import asyncio
import random
from datetime import datetime, timezone, timedelta

from sqlalchemy import text

# Ensure models are imported before Base.metadata
from app.models.case import (
    User, Case, OsintFinding, CaseDocument, CaseEvent,
    CaseStatus, RiskLevel, OsintSource, FindingCategory, RiskImpact,
    DocumentType, OcrStatus, EventType,
)
from app.core.auth import hash_password
from app.core.database import engine, Base, async_session


CONSULATES = ["Istanbul", "Ankara", "Izmir"]
DESTINATIONS = ["Schengen", "Germany", "France", "Netherlands", "Italy", "Spain"]
NATIONALITIES = ["Turkish", "Syrian", "Iraqi", "Iranian", "Afghan", "Pakistani"]

APPLICANTS = [
    {"firstName": "Mehmet", "lastName": "Yilmaz", "dateOfBirth": "1985-03-15", "nationality": "Turkish", "passportNumber": "U12345678", "gender": "male"},
    {"firstName": "Ayse", "lastName": "Demir", "dateOfBirth": "1990-07-22", "nationality": "Turkish", "passportNumber": "U87654321", "gender": "female"},
    {"firstName": "Omar", "lastName": "Hassan", "dateOfBirth": "1988-11-03", "nationality": "Syrian", "passportNumber": "N11223344", "gender": "male"},
    {"firstName": "Fatima", "lastName": "Al-Rashid", "dateOfBirth": "1992-01-17", "nationality": "Iraqi", "passportNumber": "A99887766", "gender": "female"},
    {"firstName": "Ali", "lastName": "Kaya", "dateOfBirth": "1979-06-30", "nationality": "Turkish", "passportNumber": "U55667788", "gender": "male"},
    {"firstName": "Elena", "lastName": "Petrova", "dateOfBirth": "1995-04-11", "nationality": "Turkish", "passportNumber": "U33445566", "gender": "female"},
    {"firstName": "Kemal", "lastName": "Ozturk", "dateOfBirth": "1983-09-25", "nationality": "Turkish", "passportNumber": "U77889900", "gender": "male"},
    {"firstName": "Leyla", "lastName": "Aksoy", "dateOfBirth": "1991-12-08", "nationality": "Turkish", "passportNumber": "U11224466", "gender": "female"},
]

FINDING_TEMPLATES = [
    {"source": "instagram", "category": "social_media", "title": "Active Instagram account", "detail": "Public profile with 847 posts, frequent travel photos across Europe"},
    {"source": "twitter", "category": "social_media", "title": "Twitter/X activity", "detail": "Active account since 2018, retweets political content occasionally"},
    {"source": "linkedin", "category": "social_media", "title": "LinkedIn professional profile", "detail": "Claims software engineer at a tech company, profile matches application"},
    {"source": "strava", "category": "social_media", "title": "Strava fitness activity", "detail": "Regular running routes near military installations flagged"},
    {"source": "public_records", "category": "public_records", "title": "Business registration found", "detail": "Registered as director of import/export company since 2020"},
    {"source": "financial", "category": "financial", "title": "Unusual transaction pattern", "detail": "Multiple small transfers to European accounts detected in public filings"},
    {"source": "travel", "category": "travel", "title": "Frequent travel pattern", "detail": "12 border crossings in the last 6 months, pattern suggests irregular movement"},
    {"source": "facebook", "category": "social_media", "title": "Facebook account matched", "detail": "Account with 2.3K friends, group memberships include diaspora communities"},
    {"source": "tiktok", "category": "social_media", "title": "TikTok account found", "detail": "Active creator with location-tagged videos from restricted areas"},
    {"source": "darkweb", "category": "digital_footprint", "title": "Email found in data breach", "detail": "Email appeared in 2 known data breaches (2021, 2023)"},
]


async def seed():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # Create demo users
        admin = User(email="admin@portolan.ai", name="Admin", hashed_password=hash_password("admin123"), role="admin")
        officer1 = User(email="officer@portolan.ai", name="Deniz Akar", hashed_password=hash_password("officer123"), role="officer")
        officer2 = User(email="supervisor@portolan.ai", name="Emre Celik", hashed_password=hash_password("super123"), role="supervisor")
        db.add_all([admin, officer1, officer2])
        await db.flush()

        officers = [officer1, officer2]

        # Create cases
        for i, applicant in enumerate(APPLICANTS):
            year = 2026
            case_id = f"PL-{year}-{(i+142):05d}"
            risk_score = random.uniform(10, 95)
            risk_level = (
                RiskLevel.critical if risk_score >= 75
                else RiskLevel.high if risk_score >= 50
                else RiskLevel.medium if risk_score >= 25
                else RiskLevel.low
            )
            statuses = [CaseStatus.new, CaseStatus.in_review, CaseStatus.approved, CaseStatus.escalated, CaseStatus.scanning]
            case_status = random.choice(statuses)

            case = Case(
                case_id=case_id,
                applicant=applicant,
                application_date=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30)),
                consulate_location=random.choice(CONSULATES),
                travel_destination=random.choice(DESTINATIONS),
                risk_score=round(risk_score, 1),
                risk_level=risk_level,
                risk_breakdown={
                    "document": random.randint(0, 30),
                    "identity": random.randint(0, 25),
                    "travel": random.randint(0, 20),
                    "financial": random.randint(0, 20),
                    "network": random.randint(0, 15),
                    "digitalFootprint": random.randint(0, 15),
                },
                risk_factors=[],
                status=case_status,
                assigned_officer=random.choice(officers).id,
            )
            db.add(case)
            await db.flush()

            # Add findings
            num_findings = random.randint(1, 6)
            selected_findings = random.sample(FINDING_TEMPLATES, min(num_findings, len(FINDING_TEMPLATES)))
            factors = []
            for ft in selected_findings:
                finding = OsintFinding(
                    case_id=case.id,
                    source=OsintSource(ft["source"]),
                    category=FindingCategory(ft["category"]),
                    title=ft["title"],
                    detail=ft["detail"],
                    confidence=random.randint(50, 95),
                    risk_impact=random.choice([RiskImpact.low, RiskImpact.medium, RiskImpact.high]),
                    timestamp=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 90)),
                    evidence={"tool": "seed_data"},
                )
                db.add(finding)
                factors.append(ft["title"])

            case.risk_factors = factors

            # Add documents
            doc = CaseDocument(
                case_id=case.id,
                name=f"{applicant['firstName']}_{applicant['lastName']}_passport.pdf",
                type=DocumentType.passport,
                ocr_status=OcrStatus.completed,
                extracted_fields={"name": f"{applicant['firstName']} {applicant['lastName']}", "passport": applicant["passportNumber"]},
            )
            db.add(doc)

            # Add events
            event = CaseEvent(
                case_id=case.id,
                type=EventType.created,
                description=f"Case created for {applicant['firstName']} {applicant['lastName']}",
                user_name="system",
                timestamp=case.application_date,
            )
            db.add(event)

            if case_status in (CaseStatus.in_review, CaseStatus.approved, CaseStatus.escalated):
                scan_event = CaseEvent(
                    case_id=case.id,
                    type=EventType.scan_completed,
                    description=f"OSINT scan completed — {num_findings} findings",
                    timestamp=case.application_date + timedelta(hours=random.randint(1, 12)),
                )
                db.add(scan_event)

        await db.commit()
        print(f"✓ Seeded {len(APPLICANTS)} cases, 3 users (admin/officer/supervisor)")
        print("  Login: admin@portolan.ai / admin123")
        print("         officer@portolan.ai / officer123")
        print("         supervisor@portolan.ai / super123")


if __name__ == "__main__":
    asyncio.run(seed())
