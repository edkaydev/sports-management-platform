# 11 — Documents and Records

## Overview

One of the biggest pain points identified by the UMU Sports Tutor is managing the volume of paper documents — registration forms, medical clearances, scholarship agreements, competition entry forms, match reports, and more.

This module provides a centralised document store linked to athletes, teams, events, and the department as a whole. It replaces manual paper filing.

---

## Document Categories

| Category | Examples |
|---|---|
| `REGISTRATION` | Sports registration form, enrollment form |
| `MEDICAL` | Medical clearance, injury report, medical declaration |
| `ACADEMIC` | Transcript, semester results, enrollment letter |
| `SCHOLARSHIP` | Scholarship award letter, signed agreement, renewal letter |
| `CONTRACT` | Athlete contract, amendments, termination letter |
| `COMPETITION` | Entry forms, competition regulations, invitation letters |
| `MATCH` | Match report, lineup sheet, result form |
| `RECRUITMENT` | Trial form, scouting report, recommendation letter |
| `IDENTIFICATION` | Student ID copy, passport copy, NIN |
| `CORRESPONDENCE` | Letters, emails printed, official communications |
| `OTHER` | Anything that doesn't fit the above |

---

## Document Data Model

```
Document
├── id (UUID)
├── title (text — human-readable name)
├── category (enum — see above)
├── file_url (text — S3 or local storage path)
├── file_name (original filename)
├── file_type (enum: PDF | JPEG | PNG | DOCX | XLSX | OTHER)
├── file_size_bytes (integer)
│
│  — What this document belongs to —
├── owner_type (enum: ATHLETE | TEAM | EVENT | MATCH | TRIAL | DEPARTMENT)
├── athlete_id (FK → StudentAthlete, nullable)
├── team_id (FK → Team, nullable)
├── event_id (FK → Event, nullable)
├── match_id (FK → Match, nullable)
├── trial_id (FK → Trial, nullable)
│
├── expiry_date (date, nullable — for clearances, contracts, etc.)
├── status (enum: ACTIVE | EXPIRED | SUPERSEDED | ARCHIVED)
├── is_verified (boolean, default false)
├── verified_by (FK → User, nullable)
├── verified_at (timestamp, nullable)
│
├── uploaded_by (FK → User)
├── uploaded_at (timestamp)
├── notes (text, nullable)
└── updated_at
```

---

## Document Checklist per Athlete

The system provides a per-athlete document checklist endpoint that returns which required documents are present, missing, or expired.

```
GET /api/documents/athletes/:athleteId/checklist

Response: {
  athleteId: string,
  documents: {
    category: DocumentCategory,
    required: boolean,
    status: "PRESENT" | "MISSING" | "EXPIRED",
    documentId: string | null
  }[]
}
```

### Example Checklist

| Document | Regular | Scholarship | Contract |
|---|:---:|:---:|:---:|
| Registration Form | Required | Required | Required |
| Medical Clearance | Required | Required | Required |
| Student ID Copy | Optional | Required | Required |
| Scholarship Agreement | — | Required | — |
| Contract Document | — | — | Required |
| Academic Transcript | Optional | Required | Required |
| NIN / Passport Copy | Optional | Optional | Required |

---

## Document Expiry Tracking

Some documents expire (medical clearances, contracts). The system:

- Tracks expiry dates
- Flags documents 30 days before expiry
- Marks them as `EXPIRED` automatically after the expiry date
- Triggers a notification to the Sports Admin

---

## Document Search and Filter

The Sports Admin can search all documents by:

- Athlete name or registration number
- Category
- Status (Active / Expired / Missing)
- Date range
- Sport / Team

---

## Document Upload Rules

- Accepted file types: PDF, JPEG, PNG, DOCX, XLSX
- Maximum file size: 10 MB per file
- File names are sanitised on upload (no special characters)
- All files are stored with a UUID-based path to prevent enumeration
- Only authenticated users with appropriate roles can access document URLs

---

## Athlete Document View

From an athlete's profile, the Sports Admin sees:

```
Documents — Kayiira Edward

Category         Document                  Status      Expires
Registration     Registration Form 2024    Active      —
Medical          Medical Clearance         Active      Dec 2026
Scholarship      Scholarship Agreement     Active      —
Academic         Semester 1 Transcript     Active      —
ID               Student ID Copy           Active      —

Missing:
  Contract Document  [Upload]
```

---

## Department-Level Documents

Some documents are not tied to a specific athlete but to the department:

- Competition entry forms (team-level)
- University sports policy documents
- Training schedules
- Budget documents (restricted to TUTOR)
- Inter-university correspondence

---

## Actions by Role

| Action | TUTOR | SPORTS_REP |
|---|:---:|:---:|
| Upload document (athlete) | ✅ | ✅ |
| Upload document (team) | ✅ | ✅ |
| Upload document (event/match) | ✅ | ✅ |
| View athlete documents | ✅ | ✅ |
| Delete document | ✅ | ❌ |
| Delete document | ✅ | ❌ | ❌ |
| Verify document | ✅ | ❌ | ❌ |
| View document checklist | ✅ | 🔶 | 👁 own only |
| Export document list | ✅ | ❌ | ❌ |
