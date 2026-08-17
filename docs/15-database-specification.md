# 15 — Database Specification

## Overview

MySQL 8+ database using Prisma as the ORM. All primary keys are UUIDs (stored as `CHAR(36)`). All tables include `created_at` and `updated_at` timestamps. Soft deletes (using `deleted_at`) are used for critical records (athletes, users, teams).

MySQL does not have native enum types in Prisma the same way PostgreSQL does — enums are defined in the Prisma schema and enforced at the application layer. The SQL below shows the equivalent `ENUM` column types for reference.

---

## Prisma Schema (datasource)

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

---

## Enums

> Note: Enums are enforced at the application layer via Prisma. MySQL ENUM syntax is used below for reference.

```sql
-- User roles
-- user_role ENUM: 'TUTOR', 'SPORTS_REP'

-- Gender
-- gender ENUM: 'MALE', 'FEMALE', 'MIXED'

-- Athlete type
-- athlete_type ENUM: 'REGULAR', 'SCHOLARSHIP', 'CONTRACT'

-- Athlete status
-- athlete_status ENUM: 'ACTIVE', 'INJURED', 'SUSPENDED', 'GRADUATED', 'WITHDRAWN', 'INACTIVE'

-- Academic standing
-- academic_standing ENUM: 'GOOD_STANDING', 'WARNING', 'PROBATION', 'ACADEMIC_SUSPENSION', 'WITHDRAWN'

-- Sport category
-- sport_category ENUM: 'TEAM', 'INDIVIDUAL'

-- Event type
-- event_type ENUM: 'GALA', 'TOURNAMENT', 'LEAGUE', 'COMPETITION', 'FRIENDLY', 'TRIAL', 'TRAINING', 'FESTIVAL', 'SPECIAL'

-- Event level
-- event_level ENUM: 'CAMPUS', 'FACULTY', 'UNIVERSITY', 'LOCAL', 'NATIONAL', 'REGIONAL', 'INTERNATIONAL'
);

-- Event format
CREATE TYPE event_format AS ENUM (
  'KNOCKOUT', 'ROUND_ROBIN', 'LEAGUE', 'GROUP_STAGE', 'SINGLE_MATCH', 'OTHER'
);

-- Event status
CREATE TYPE event_status AS ENUM (
  'PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'POSTPONED'
);

-- Match status
CREATE TYPE match_status AS ENUM (
  'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED', 'ABANDONED'
);

-- Scholarship type
CREATE TYPE scholarship_type AS ENUM ('FULL', 'PARTIAL', 'SPONSORSHIP', 'BURSARY');

-- Scholarship status
CREATE TYPE scholarship_status AS ENUM (
  'ACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED', 'RENEWED', 'PENDING'
);

-- Contract status
CREATE TYPE contract_status AS ENUM (
  'ACTIVE', 'EXPIRED', 'TERMINATED', 'SUSPENDED'
);

-- Document category
CREATE TYPE document_category AS ENUM (
  'REGISTRATION', 'MEDICAL', 'ACADEMIC', 'SCHOLARSHIP',
  'CONTRACT', 'COMPETITION', 'MATCH', 'RECRUITMENT',
  'IDENTIFICATION', 'CORRESPONDENCE', 'OTHER'
);

-- Notification severity
CREATE TYPE notification_severity AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- Prospect status
CREATE TYPE prospect_status AS ENUM (
  'PROSPECT', 'REGISTERED', 'TRIAL_SCHEDULED', 'TRIAL_COMPLETED',
  'SELECTED', 'REJECTED', 'ENROLLED', 'WITHDRAWN'
);
```

---

## Core Tables

### users
```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT (UUID()),
  full_name       VARCHAR(255) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  role            VARCHAR(20) NOT NULL,  -- 'TUTOR' or 'SPORTS_REP'
  is_active       BOOLEAN DEFAULT true,
  phone_number    VARCHAR(20),
  profile_photo_url TEXT,
  last_login_at   TIMESTAMP,
  failed_login_attempts INT DEFAULT 0,
  locked_until    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  deleted_at      TIMESTAMP  -- soft delete
);
```

### seasons
```sql
CREATE TABLE seasons (
  id          UUID PRIMARY KEY DEFAULT (UUID()),
  name        VARCHAR(20) NOT NULL UNIQUE,  -- e.g. '2025/2026'
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  is_current  BOOLEAN DEFAULT false,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

### sports
```sql
CREATE TABLE sports (
  id          UUID PRIMARY KEY DEFAULT (UUID()),
  name        VARCHAR(100) NOT NULL,
  gender      gender NOT NULL,
  category    sport_category NOT NULL,
  is_active   BOOLEAN DEFAULT true,
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

### teams
```sql
CREATE TABLE teams (
  id          UUID PRIMARY KEY DEFAULT (UUID()),
  name        VARCHAR(255) NOT NULL,
  short_name  VARCHAR(20),
  sport_id    UUID NOT NULL REFERENCES sports(id),
  season_id   UUID REFERENCES seasons(id),
  gender      gender NOT NULL,
  logo_url    TEXT,
  home_venue  VARCHAR(255),
  founding_year SMALLINT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW(),
  deleted_at  TIMESTAMP
);
```

### student_athletes
```sql
CREATE TABLE student_athletes (
  id                  UUID PRIMARY KEY DEFAULT (UUID()),
  user_id             UUID UNIQUE REFERENCES users(id),
  full_name           VARCHAR(255) NOT NULL,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  gender              gender NOT NULL,
  date_of_birth       DATE,
  email               VARCHAR(255),
  phone_number        VARCHAR(20),
  year_of_study       SMALLINT,
  programme           VARCHAR(255),
  faculty             VARCHAR(255),
  athlete_type        athlete_type NOT NULL DEFAULT 'REGULAR',
  status              athlete_status NOT NULL DEFAULT 'ACTIVE',
  profile_photo_url   TEXT,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW(),
  deleted_at          TIMESTAMP
);
```

### sport_affiliations
```sql
CREATE TABLE sport_affiliations (
  id              UUID PRIMARY KEY DEFAULT (UUID()),
  athlete_id      UUID NOT NULL REFERENCES student_athletes(id),
  sport_id        UUID NOT NULL REFERENCES sports(id),
  team_id         UUID REFERENCES teams(id),
  position        VARCHAR(100),
  jersey_number   SMALLINT,
  is_captain      BOOLEAN DEFAULT false,
  is_vice_captain BOOLEAN DEFAULT false,
  joined_date     DATE,
  status          athlete_status DEFAULT 'ACTIVE',
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

---

## Academic Tables

### academic_records
```sql
CREATE TABLE academic_records (
  id                          UUID PRIMARY KEY DEFAULT (UUID()),
  athlete_id                  UUID NOT NULL REFERENCES student_athletes(id),
  academic_year               VARCHAR(10) NOT NULL,  -- '2025/2026'
  semester                    VARCHAR(10) NOT NULL,  -- 'SEM1', 'SEM2', 'RESIT'
  year_of_study               SMALLINT,
  gpa                         DECIMAL(3,2),
  cgpa                        DECIMAL(3,2),
  total_credit_units_taken    SMALLINT,
  total_credit_units_passed   SMALLINT,
  failed_units                SMALLINT DEFAULT 0,
  attendance_percentage       DECIMAL(5,2),
  academic_standing           academic_standing DEFAULT 'GOOD_STANDING',
  entered_by                  UUID REFERENCES users(id),
  entered_at                  TIMESTAMP DEFAULT NOW(),
  notes                       TEXT,
  updated_at                  TIMESTAMP DEFAULT NOW(),
  UNIQUE(athlete_id, academic_year, semester)
);
```

---

## Scholarship & Contract Tables

### scholarships
```sql
CREATE TABLE scholarships (
  id                          UUID PRIMARY KEY DEFAULT (UUID()),
  athlete_id                  UUID NOT NULL REFERENCES student_athletes(id),
  scholarship_type            scholarship_type NOT NULL,
  sponsor_name                VARCHAR(255),
  coverage_description        TEXT,
  coverage_percentage         DECIMAL(5,2),
  start_date                  DATE NOT NULL,
  end_date                    DATE NOT NULL,
  renewable                   BOOLEAN DEFAULT false,
  renewal_count               SMALLINT DEFAULT 0,
  status                      scholarship_status DEFAULT 'PENDING',
  academic_requirement_gpa    DECIMAL(3,2),
  sports_requirement          TEXT,
  awarded_by                  UUID REFERENCES users(id),
  awarded_at                  TIMESTAMP DEFAULT NOW(),
  revoked_by                  UUID REFERENCES users(id),
  revoked_at                  TIMESTAMP,
  revocation_reason           TEXT,
  notes                       TEXT,
  updated_at                  TIMESTAMP DEFAULT NOW()
);
```

### athlete_contracts
```sql
CREATE TABLE athlete_contracts (
  id                          UUID PRIMARY KEY DEFAULT (UUID()),
  athlete_id                  UUID NOT NULL REFERENCES student_athletes(id),
  contract_type               VARCHAR(50) NOT NULL,
  start_date                  DATE NOT NULL,
  end_date                    DATE NOT NULL,
  terms_summary               TEXT,
  has_accompanying_scholarship BOOLEAN DEFAULT false,
  scholarship_id              UUID REFERENCES scholarships(id),
  signed_by_athlete           BOOLEAN DEFAULT false,
  signed_at                   TIMESTAMP,
  status                      contract_status DEFAULT 'ACTIVE',
  created_by                  UUID REFERENCES users(id),
  created_at                  TIMESTAMP DEFAULT NOW(),
  terminated_by               UUID REFERENCES users(id),
  termination_date            DATE,
  termination_reason          TEXT,
  notes                       TEXT,
  updated_at                  TIMESTAMP DEFAULT NOW()
);
```

---

## Events & Matches Tables

### events
```sql
CREATE TABLE events (
  id                    UUID PRIMARY KEY DEFAULT (UUID()),
  name                  VARCHAR(255) NOT NULL,
  type                  event_type NOT NULL,
  level                 event_level NOT NULL,
  sport_id              UUID REFERENCES sports(id),
  season_id             UUID REFERENCES seasons(id),
  organizer             VARCHAR(255),
  host_institution      VARCHAR(255),
  venue                 VARCHAR(255),
  start_date            DATE,
  end_date              DATE,
  description           TEXT,
  status                event_status DEFAULT 'PLANNED',
  format                event_format DEFAULT 'OTHER',
  max_teams             SMALLINT,
  max_participants      SMALLINT,
  registration_deadline DATE,
  created_by            UUID REFERENCES users(id),
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);
```

### matches
```sql
CREATE TABLE matches (
  id                    UUID PRIMARY KEY DEFAULT (UUID()),
  event_id              UUID NOT NULL REFERENCES events(id),
  sport_id              UUID NOT NULL REFERENCES sports(id),
  season_id             UUID REFERENCES seasons(id),
  match_number          SMALLINT,
  round                 VARCHAR(100),
  home_team_id          UUID REFERENCES teams(id),
  away_team_id          UUID REFERENCES teams(id),
  home_individual_id    UUID REFERENCES student_athletes(id),
  away_individual_id    UUID REFERENCES student_athletes(id),
  venue                 VARCHAR(255),
  scheduled_date        DATE NOT NULL,
  scheduled_time        TIME,
  actual_start_time     TIMESTAMP,
  actual_end_time       TIMESTAMP,
  home_score            SMALLINT,
  away_score            SMALLINT,
  status                VARCHAR(20) DEFAULT 'SCHEDULED',  -- match_status enum
  match_type            VARCHAR(20) DEFAULT 'OTHER',      -- match_type enum
  notes                 TEXT,
  created_by            UUID REFERENCES users(id),
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);
```

---

## Documents Table

### documents
```sql
CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT (UUID()),
  title           VARCHAR(255) NOT NULL,
  category        document_category NOT NULL,
  file_url        TEXT NOT NULL,
  file_name       VARCHAR(255) NOT NULL,
  file_type       VARCHAR(10),
  file_size_bytes INTEGER,
  owner_type      VARCHAR(50) NOT NULL,
  athlete_id      UUID REFERENCES student_athletes(id),
  team_id         UUID REFERENCES teams(id),
  event_id        UUID REFERENCES events(id),
  match_id        UUID REFERENCES matches(id),
  expiry_date     DATE,
  status          VARCHAR(20) DEFAULT 'ACTIVE',
  is_verified     BOOLEAN DEFAULT false,
  verified_by     UUID REFERENCES users(id),
  verified_at     TIMESTAMP,
  uploaded_by     UUID NOT NULL REFERENCES users(id),
  uploaded_at     TIMESTAMP DEFAULT NOW(),
  notes           TEXT,
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

---

## Notifications Table

### notifications
```sql
CREATE TABLE notifications (
  id                    UUID PRIMARY KEY DEFAULT (UUID()),
  type                  VARCHAR(50) NOT NULL,
  severity              notification_severity NOT NULL DEFAULT 'INFO',
  title                 VARCHAR(255) NOT NULL,
  message               TEXT NOT NULL,
  recipient_user_id     UUID NOT NULL REFERENCES users(id),
  related_athlete_id    UUID REFERENCES student_athletes(id),
  related_entity_type   VARCHAR(50),
  related_entity_id     UUID,
  is_read               BOOLEAN DEFAULT false,
  read_at               TIMESTAMP,
  created_at            TIMESTAMP DEFAULT NOW(),
  expires_at            TIMESTAMP
);

CREATE INDEX idx_notifications_user_unread
  ON notifications(recipient_user_id, is_read)
  WHERE is_read = false;
```

---

## Key Indexes

```sql
-- Athlete lookups
CREATE INDEX idx_athletes_reg_number ON student_athletes(registration_number);
CREATE INDEX idx_athletes_type ON student_athletes(athlete_type);
CREATE INDEX idx_athletes_status ON student_athletes(status);

-- Academic records
CREATE INDEX idx_academic_athlete ON academic_records(athlete_id);

-- Scholarships
CREATE INDEX idx_scholarships_athlete ON scholarships(athlete_id);
CREATE INDEX idx_scholarships_status ON scholarships(status);
CREATE INDEX idx_scholarships_end_date ON scholarships(end_date);

-- Matches
CREATE INDEX idx_matches_date ON matches(scheduled_date);
CREATE INDEX idx_matches_event ON matches(event_id);
CREATE INDEX idx_matches_status ON matches(status);
```
