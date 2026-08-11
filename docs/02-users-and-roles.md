# 02 — Users and Roles

## Overview

The system uses **Role-Based Access Control (RBAC)**. Every user is assigned one or more roles, and each role has a defined set of permissions across each module.

---

## Roles

### 1. SUPER_ADMIN

System-level administrator. Has unrestricted access to everything.

**Responsibilities:**
- Create and manage user accounts
- Configure system settings
- Assign roles to users
- View all audit logs
- Manage academic year / season configuration

---

### 2. SPORTS_ADMIN (Sports Tutor)

The primary operator of the system. This is the UMU Sports Tutor or department head.

**Responsibilities:**
- Full management of all student-athletes
- Manage all teams, sports, fixtures, and competitions
- Manage scholarships
- View academic performance data
- Approve recruitment and trial outcomes
- Generate all reports
- Manage document records
- Configure notification rules

---

### 3. COACH

Manages one or more sports teams. Can manage training and match-day operations for their assigned teams.

**Responsibilities:**
- Manage team rosters (within assigned teams)
- Create and edit training sessions
- Set match lineups and substitutions
- Record player performance (within assigned teams)
- View athlete academic status (read-only)
- Submit match reports
- Conduct trial assessments

**Restriction:** Can only access data for teams they are assigned to.

---

### 4. TEAM_MANAGER

Administrative support for a specific team.

**Responsibilities:**
- Manage team logistics (travel, venue, equipment)
- View fixture schedule
- Track player availability
- Upload team documents
- View athlete profiles (read-only)

**Restriction:** Read-only on performance and academic data.

---

### 5. SPORTS_OFFICIAL / REFEREE

Match officials who record live match data.

**Responsibilities:**
- Record match scores, goals, cards, and events
- Submit official match reports
- View match fixture details

**Restriction:** Can only edit matches they are assigned to.

---

### 6. ACADEMIC_STAFF

Representatives from faculties/academic registry who provide academic data.

**Responsibilities:**
- Enter/update student GPA and academic records
- Flag academic warnings for athletes
- View athlete academic profile

**Restriction:** Cannot access sports performance, scholarships, or recruitment data.

---

### 7. STUDENT_ATHLETE

The student-athlete themselves.

**Responsibilities:**
- View own full profile (360° view)
- View own match history and performance stats
- View own academic record (as entered by academic staff)
- View own scholarship status
- View team fixtures and schedule
- Upload own documents when requested
- View recruitment/trial status

**Restriction:** Read-only across all data. Can only see their own data.

---

### 8. UNIVERSITY_ADMIN

Senior university administration (e.g., Vice Chancellor's office, Finance).

**Responsibilities:**
- View institutional-level sports reports
- View scholarship summaries
- View enrollment and participation statistics

**Restriction:** No write access. Reporting only.

---

### 9. RECRUITER / SCOUT

Manages the recruitment pipeline and trial process.

**Responsibilities:**
- Register prospects
- Schedule and manage trials
- Record trial assessments and scores
- Recommend athletes for teams
- View prospect profiles

**Restriction:** Cannot access existing athlete academic records or scholarship data.

---

## Role Permission Matrix

| Permission | SUPER_ADMIN | SPORTS_ADMIN | COACH | TEAM_MANAGER | OFFICIAL | ACADEMIC | ATHLETE | UNI_ADMIN | RECRUITER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Manage users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage athletes | ✅ | ✅ | 🔶 | 🔶 | ❌ | ❌ | 👁 | ❌ | ❌ |
| Manage teams | ✅ | ✅ | 🔶 | 🔶 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage fixtures | ✅ | ✅ | 🔶 | 🔶 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Record match data | ✅ | ✅ | 🔶 | ❌ | 🔶 | ❌ | ❌ | ❌ | ❌ |
| View match data | ✅ | ✅ | ✅ | ✅ | 🔶 | ❌ | 🔶 | ✅ | ❌ |
| Manage academic data | ✅ | ✅ | 👁 | ❌ | ❌ | ✅ | 👁 | 👁 | ❌ |
| Manage scholarships | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | 👁 | 👁 | ❌ |
| Manage recruitment | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | 👁 | ❌ | ✅ |
| Manage documents | ✅ | ✅ | 🔶 | 🔶 | ❌ | ❌ | 🔶 | ❌ | 🔶 |
| View reports | ✅ | ✅ | 🔶 | 🔶 | ❌ | 🔶 | 👁 | ✅ | 🔶 |
| System config | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Audit logs | ✅ | 🔶 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Legend:**
- ✅ Full access
- 🔶 Partial / scoped access (own team/data only)
- 👁 Read-only
- ❌ No access

---

## User Data Model

```
User
├── id (UUID)
├── full_name
├── email (unique)
├── password_hash
├── role (enum: SUPER_ADMIN | SPORTS_ADMIN | COACH | TEAM_MANAGER | OFFICIAL | ACADEMIC | ATHLETE | UNI_ADMIN | RECRUITER)
├── is_active (boolean)
├── profile_photo_url
├── phone_number
├── created_at
├── updated_at
└── last_login_at

UserScope (for scoped roles like COACH, OFFICIAL)
├── user_id (FK → User)
├── scope_type (enum: TEAM | SPORT | MATCH)
└── scope_id (FK to relevant table)
```

---

## Authentication

- JWT-based authentication
- Access token: short-lived (15 minutes)
- Refresh token: long-lived (7 days), stored in `httpOnly` cookie
- Passwords hashed with `bcrypt` (minimum 12 rounds)
- Failed login attempts: lock account after 5 consecutive failures
- Password reset via email token (expires in 1 hour)

---

## Registration Flow

### For Staff / Coaches / Officials
1. SPORTS_ADMIN or SUPER_ADMIN creates the account
2. System sends invite email with temporary password
3. User sets their own password on first login

### For Student-Athletes
1. Student completes the physical / digital UMU Sports Registration Form
2. SPORTS_ADMIN creates their account and links to their student profile
3. Student receives login credentials via email

### For Academic Staff
1. SUPER_ADMIN creates account and assigns `ACADEMIC` role
2. Scoped to specific faculty/school

---

## Notes

- A user can have only one primary role in v1.0
- The `STUDENT_ATHLETE` role is always linked to exactly one `StudentAthlete` record
- Role changes must be performed by `SUPER_ADMIN` only
- All login events and role changes are recorded in the audit log
