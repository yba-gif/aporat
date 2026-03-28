"""Case-related Pydantic schemas — mirrors V3 TypeScript types."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ─── Applicant (embedded JSON in Case) ───

class ApplicantSchema(BaseModel):
    firstName: str
    lastName: str
    dateOfBirth: str
    nationality: str
    passportNumber: str
    gender: str = "male"


# ─── Case ───

class CaseCreate(BaseModel):
    applicant: ApplicantSchema
    consulate_location: str = "Istanbul"
    travel_destination: str = "Schengen"


class CaseUpdate(BaseModel):
    status: Optional[str] = None
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None
    risk_breakdown: Optional[dict] = None
    risk_factors: Optional[list[str]] = None
    assigned_officer: Optional[str] = None


class CaseOut(BaseModel):
    id: str
    case_id: str
    applicant: dict
    application_date: datetime
    consulate_location: str
    travel_destination: str
    risk_score: float
    risk_level: str
    risk_breakdown: dict
    risk_factors: list
    status: str
    assigned_officer: Optional[str]
    created_at: datetime
    updated_at: datetime
    findings: list["FindingOut"] = []
    documents: list["DocumentOut"] = []
    events: list["EventOut"] = []

    model_config = {"from_attributes": True}


class CaseListOut(BaseModel):
    id: str
    case_id: str
    applicant: dict
    application_date: datetime
    consulate_location: str
    travel_destination: str
    risk_score: float
    risk_level: str
    status: str
    assigned_officer: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Finding ───

class FindingOut(BaseModel):
    id: str
    source: str
    category: str
    title: str
    detail: str
    url: str
    confidence: int
    risk_impact: str
    timestamp: datetime
    evidence: dict

    model_config = {"from_attributes": True}


# ─── Document ───

class DocumentOut(BaseModel):
    id: str
    name: str
    type: str
    file_path: str
    ocr_status: str
    extracted_fields: dict

    model_config = {"from_attributes": True}


# ─── Event ───

class EventOut(BaseModel):
    id: str
    type: str
    description: str
    user_name: Optional[str]
    timestamp: datetime

    model_config = {"from_attributes": True}


# ─── Scan ───

class ScanCreate(BaseModel):
    case_id: Optional[str] = None
    scan_type: str = "visa"  # visa | defence
    target_name: str
    target_email: Optional[str] = None
    target_username: Optional[str] = None


class ScanOut(BaseModel):
    id: str
    case_id: Optional[str]
    scan_type: str
    target_name: str
    target_email: Optional[str]
    target_username: Optional[str]
    status: str
    progress: int
    tools_used: list
    results: dict
    findings_count: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    error: Optional[str]

    model_config = {"from_attributes": True}


# ─── Paginated response ───

class PaginatedCases(BaseModel):
    items: list[CaseListOut]
    total: int
    page: int
    per_page: int


# ─── Dashboard stats ───

class DashboardStats(BaseModel):
    total_cases: int
    pending_review: int
    high_risk: int
    approved_today: int
    risk_distribution: dict  # { low, medium, high, critical }
    recent_activity: list[EventOut]


# Rebuild forward refs
CaseOut.model_rebuild()
