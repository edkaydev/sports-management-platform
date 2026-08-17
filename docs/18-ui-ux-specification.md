# 18 — UI/UX Specification

## Design Philosophy

Clean, functional, and fast. The UI is built for people who use it every day — a Sports Tutor managing a full department. It should feel like a professional admin tool, not a consumer app.

**Principles:**
- Show the right information at a glance — no hunting through menus
- Only use icons where they genuinely help readability (status, navigation); not for decoration
- No heavy borders, shadows, or gradient cards for their own sake
- Dense but readable — tables over cards where data is the point
- Actions are obvious and labelled — no icon-only buttons for important actions

---

## Tech

- React + TypeScript
- Tailwind CSS for styling
- React Router v6 for navigation
- TanStack Table for data tables
- Recharts for charts
- React Hook Form + Zod for forms
- No component library (custom components to avoid framework-imposed styling)

---

## Layout

### Authenticated Layout

```
┌──────────────────────────────────────────────────────────┐
│  UMU Sports         [Search]              Notifications  User │
├───────────┬──────────────────────────────────────────────┤
│           │                                              │
│  Sidebar  │              Main Content                    │
│  Nav      │                                              │
│           │                                              │
│           │                                              │
│           │                                              │
└───────────┴──────────────────────────────────────────────┘
```

- Sidebar is fixed on desktop, collapsible on tablet, hidden (drawer) on mobile
- Top bar shows page title, global search, notification bell with unread count, user menu
- Content area is scrollable

---

## Sidebar Navigation

Navigation is identical for both staff roles (TUTOR and SPORTS_REP). User management
and delete actions are shown only to TUTOR. For example:

```
Dashboard
Athletes
  └── All Athletes
  └── Add Athlete
Teams & Sports
  └── Teams
  └── Sports
Fixtures & Matches
  └── Fixtures
  └── Calendar
Events & Competitions
Scholarships & Contracts
Recruitment
  └── Prospects
  └── Trials
Academic Performance
Documents
Reports
Settings
```

Active item is highlighted with a left border accent, not background fill.

---

## Typography

- Font: Inter (Google Fonts, free)
- Base size: 14px
- Headings: 16px / 20px / 24px — semibold, not heavy
- No decorative font mixing

---

## Colour

Minimal palette. One brand colour, greys for everything else.

| Token | Value | Use |
|---|---|---|
| `primary` | `#1d4ed8` (blue) | Buttons, active states, links |
| `text-base` | `#111827` | Main body text |
| `text-muted` | `#6b7280` | Secondary labels |
| `border` | `#e5e7eb` | Table borders, dividers |
| `bg-page` | `#f9fafb` | Page background |
| `bg-surface` | `#ffffff` | Cards, modals, sidebar |
| `success` | `#16a34a` | Active, good standing |
| `warning` | `#d97706` | Warning states |
| `danger` | `#dc2626` | Errors, critical alerts, revoked |
| `info` | `#2563eb` | Informational badges |

Status badges use colour + text label, never colour alone.

---

## Components

### Button
- Primary: solid blue, white text
- Secondary: white background, grey border, dark text
- Destructive: red, white text — only for irreversible actions (revoke, delete)
- All buttons have a text label; icons inside buttons are optional and only where they clarify (e.g., a download icon on "Export PDF" is fine)
- Disabled state: reduced opacity, not-allowed cursor

### Table
- Full-width
- Light grey header row, no background fill on data rows
- Hover state: very light grey row highlight
- Pagination below table (Previous / 1 2 3 ... / Next)
- Sortable columns show a sort indicator
- Empty state: a short plain message ("No athletes found"), no illustrations

### Status Badge
- Inline pill, coloured background at low opacity, coloured text
- Examples: `Active` (green), `Expired` (red), `Warning` (amber), `Pending` (grey)
- Always shows text, never colour alone

### Form
- Label above input, always
- Error message below input in red — specific ("GPA must be between 0.0 and 5.0")
- Required fields marked with `*` in label
- Submit button at bottom right of form
- Cancel link to the left of submit

### Modal
- Centred overlay
- Max width 640px (narrow form) or 900px (large form/content)
- Plain header with title, close button top-right (X, labelled)
- Footer with action buttons

### Alert / Notification Panel
- In-page inline alerts: coloured left border (no background fill), icon + message
- Inline alerts: `info`, `warning`, `error`, `success`
- Notification bell in header: shows unread count badge

---

## Key Screens

### Dashboard (TUTOR / SPORTS_REP)

```
UMU Sports Department                         2025/2026 Season

Athletes: 247   Teams: 12   Competitions: 8   Upcoming: 34

Attention Required
─────────────────────────────────────────────────────────────
Academic Warnings        7 athletes     [View]
Scholarships Expiring    4 records      [View]
Missing Documents       12 athletes     [View]
Match Reports Pending    3 matches      [View]

Today's Fixtures
─────────────────────────────────────────────────────────────
2:00 PM   Football (Men)      UMU FC vs UCU         [View]
4:00 PM   Basketball (Men)    UMU Stallions vs MUBS  [View]
5:30 PM   Volleyball (Men)    UMU vs KIU             [View]
```

No cards with gradients, no big icon blocks. Data in plain rows.

---

### Athlete List

```
Athletes                                          [+ Add Athlete]

Search: [_______________]   Sport: [All]   Type: [All]   Standing: [All]

Name                Reg. No.      Sport        Type         Standing   Status
─────────────────────────────────────────────────────────────────────────────
Kayiira Edward      2024/BSCS/01  Football     Contract     Good       Active
Nakato Sarah        2023/BBA/045  Netball      Scholarship  Warning    Active
Ssekandi Brian      2024/BCom/12  Basketball   Regular      Good       Active
...

Showing 1–20 of 247      [Previous]  1  2  3 ...  [Next]
```

---

### Athlete 360° Profile

```
Kayiira Edward                                    [Edit]  [Deactivate]
2024/BSCS/001  ·  BSc Computer Science  ·  Year 3  ·  CONTRACT

─── Sports ─────────────────────────────────────────────────────────
Football (Men)   Midfielder   UMU FC   #10   Active

─── Academic Performance ───────────────────────────────────────────
Semester        GPA     Failed Units    Attendance    Standing
SEM1 2024/25    3.7     0               92%           Good
SEM2 2024/25    3.5     0               88%           Good
SEM1 2025/26    3.6     0               91%           Good

─── Sports Performance (2025/26 Season) ────────────────────────────
Matches: 18    Started: 14    Goals: 7    Assists: 9    Cards: 1

─── Scholarship ─────────────────────────────────────────────────────
No active scholarship.

─── Contract ────────────────────────────────────────────────────────
Type: Playing Contract
Period: 01 Sep 2025 – 31 Aug 2026    Status: Active
Renewal due in 21 days               [View Contract]

─── Documents ───────────────────────────────────────────────────────
Registration Form        Active
Medical Clearance        Active (expires Dec 2026)
Contract Document        Active
Student ID Copy          Active
Academic Transcript      Active

─── Alerts ──────────────────────────────────────────────────────────
Contract expiring in 21 days.
```

No decorative dividers or coloured section headers — plain section labels with a thin grey rule.

---

### Match Recording Screen

```
UMU FC vs UCU                            Faculty Gala · 11 Aug 2026

  UMU FC                                              UCU
    2               SCORE                  1
  [Half Time: 1–0]

  Match Events
  ───────────────────────────────────────────────────────────────
  12'   Goal          Kayiira Edward (UMU)     Assist: Ssemakula
  34'   Yellow Card   Opio James (UCU)
  45'   Half Time
  67'   Substitution  Mukasa (on) · Nkuubi (off)  UMU
  78'   Goal          Ssemakula John (UMU)
  82'   Goal          Okello Fred (UCU)
  90'   Full Time

  [Record Event]   [Submit Match Report]   [Confirm Result]
```

---

### Fixture Calendar

- Month/week/list view toggle (text buttons, not icon-only)
- Colour coding: Scheduled (grey), In Progress (blue), Completed (green), Cancelled (red)
- Each event shows: time, sport, teams — no more

---

## Responsive Behaviour

| Breakpoint | Layout |
|---|---|
| Desktop (1024px+) | Full sidebar + content |
| Tablet (768–1023px) | Collapsed sidebar (icons visible, expand on hover) |
| Mobile (<768px) | Hamburger menu → drawer. Tables scroll horizontally. |

---

## Forms

### Add/Edit Athlete Form

Fields in logical groups:
1. Personal Information
2. Academic Information
3. Sport & Position
4. Athlete Type (Regular / Scholarship / Contract)
5. Medical Declaration

Inline validation. No multi-step wizard for v1.0 (single scrollable form).

---

## Empty States

Keep empty states simple — a short sentence, one action button where relevant:

- Athlete list with no results: "No athletes match these filters."
- Notifications with none pending: "No notifications."
- No fixtures today: "No fixtures scheduled today."

No illustrations or large icons.

---

## Error Pages

- 404: "Page not found." + link back to dashboard
- 403: "You don't have permission to view this page." + link back
- 500: "Something went wrong. Please try again." + retry button

Plain text, no decorative elements.
