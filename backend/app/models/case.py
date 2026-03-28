"""Case and related database models — mirrors V3 TypeScript types exactly."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column, String, Integer, Float, DateTime, ForeignKey, Enum, JSON, Text, Boolean
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


# ─── Enums (match V3 TypeScript) ───

class RiskLevel(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class CaseStatus(str, enum.Enum):
    new = "new"
    scanning = "scanning"
    in_review = "in_review"
    escalated = "escalated"
    approved = "approved"
    rejected = "rejected"


class OsintSource(str, enum.Enum):
    instagram = "instagram"
    facebook = "facebook"
    twitter = "twitter"
    tiktok = "tiktok"
    linkedin = "linkedin"
    strava = "strava"
    public_records = "public_records"
    financial = "financial"
    travel = "travel"
    darkweb = "darkweb"


class FindingCategory(str, enum.Enum):
    social_media = "social_media"
    public_records = "public_records"
    financial = "financial"
    travel = "travel"
    network = "network"
    digital_footprint = "digital_footprint"


class RiskImpact(str, enum.Enum):
    none = "none"
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class DocumentType(str, enum.Enum):
    passport = "passport"
    bank_statement = "bank_statement"
    travel_insurance = "travel_insurance"
    hotel_booking = "hotel_booking"
    employment_letter = "employment_letter"
    invitation_letter = "invitation_letter"


class OcrStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class EventType(str, enum.Enum):
    created = "created"
    document_upload = "document_upload"
    ocr_complete = "ocr_complete"
    scan_started = "scan_started"
    scan_completed = "scan_completed"
    finding_added = "finding_added"
    risk_scored = "risk_scored"
    reviewed = "reviewed"
    escalated = "escalated"
    approved = "approved"
    rejected = "rejected"


# ─── Models ───

def gen_uuid():
    return str(uuid.uuid4())


def utcnow():
    return datetime.utcnow()


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="officer")  # officer | supervisor | admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)


class Case(Base):
    __tablename__ = "cases"

    id = Column(String, primary_key=True, default=gen_uuid)
    case_id = Column(String, unique=True, nullable=False, index=True)  # PL-2026-00142

    # Applicant info (embedded JSON for flexibility)
    applicant = Column(JSON, nullable=False)
    # { firstName, lastName, dateOfBirth, nationality, passportNumber, gender }

    application_date = Column(DateTime, nullable=False, default=utcnow)
    consulate_location = Column(String, nullable=False)  # Istanbul | Ankara | Izmir
    travel_destination = Column(String, nullable=False)

    risk_score = Column(Float, default=0.0)
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.low)
    risk_breakdown = Column(JSON, default=dict)
    # { document, identity, travel, financial, network, digitalFootprint }
    risk_factors = Column(JSON, default=list)  # list of string explanations

    status = Column(Enum(CaseStatus), default=CaseStatus.new, index=True)
    assigned_officer = Column(String, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    findings = relationship("OsintFinding", back_populates="case", cascade="all, delete-orphan")
    documents = relationship("CaseDocument", back_populates="case", cascade="all, delete-orphan")
    events = relationship("CaseEvent", back_populates="case", cascade="all, delete-orphan", order_by="CaseEvent.timestamp")


class OsintFinding(Base):
    __tablename__ = "osint_findings"

    id = Column(String, primary_key=True, default=gen_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False, index=True)

    source = Column(Enum(OsintSource), nullable=False)
    category = Column(Enum(FindingCategory), nullable=False)
    title = Column(String, nullable=False)
    detail = Column(Text, nullable=False)
    url = Column(String, default="")
    confidence = Column(Integer, default=0)  # 0-100
    risk_impact = Column(Enum(RiskImpact), default=RiskImpact.none)
    timestamp = Column(DateTime, default=utcnow)  # when the content was posted/found
    evidence = Column(JSON, default=dict)  # { screenshot_url, cached_content }

    case = relationship("Case", back_populates="findings")


class CaseDocument(Base):
    __tablename__ = "case_documents"

    id = Column(String, primary_key=True, default=gen_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False, index=True)

    name = Column(String, nullable=False)
    type = Column(Enum(DocumentType), nullable=False)
    file_path = Column(String, default="")
    ocr_status = Column(Enum(OcrStatus), default=OcrStatus.pending)
    extracted_fields = Column(JSON, default=dict)

    case = relationship("Case", back_populates="documents")


class CaseEvent(Base):
    __tablename__ = "case_events"

    id = Column(String, primary_key=True, default=gen_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False, index=True)

    type = Column(Enum(EventType), nullable=False)
    description = Column(String, nullable=False)
    user_name = Column(String, nullable=True)
    timestamp = Column(DateTime, default=utcnow)

    case = relationship("Case", back_populates="events")


# ─── OSINT Scan tracking ───

class ScanStatus(str, enum.Enum):
    queued = "queued"
    running = "running"
    completed = "completed"
    failed = "failed"


class OsintScan(Base):
    __tablename__ = "osint_scans"

    id = Column(String, primary_key=True, default=gen_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=True, index=True)

    scan_type = Column(String, default="visa")  # visa | defence
    target_name = Column(String, nullable=False)
    target_email = Column(String, nullable=True)
    target_username = Column(String, nullable=True)

    status = Column(Enum(ScanStatus), default=ScanStatus.queued)
    progress = Column(Integer, default=0)  # 0-100
    tools_used = Column(JSON, default=list)  # ["sherlock", "maigret", ...]
    results = Column(JSON, default=dict)  # raw results from each tool
    findings_count = Column(Integer, default=0)

    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    error = Column(Text, nullable=True)
