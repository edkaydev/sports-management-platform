import { Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';
import prisma from '../../config/database';
import type { ReportsQuery } from './reports.schema';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`);
  }
  return new Date(value);
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ];
  return lines.join('\n');
}

// ─── 1. Department Overview ───────────────────────────────────────────────────

export async function departmentOverview() {
  const currentSeason = await prisma.season.findFirst({
    where: { isCurrent: true },
  });

  const [
    totalAthletes,
    athletesBySport,
    athletesByGender,
    athletesByType,
    activeTeams,
    activeScholarships,
    expiringScholarships,
    academicStandingSummary,
    documentCount,
  ] = await Promise.all([
    prisma.studentAthlete.count(),
    prisma.sportAffiliation.groupBy({ by: ['sportId'], _count: { _all: true } }),
    prisma.studentAthlete.groupBy({ by: ['gender'], _count: { _all: true } }),
    prisma.studentAthlete.groupBy({ by: ['athleteType'], _count: { _all: true } }),
    prisma.team.count({ where: { isActive: true } }),
    prisma.scholarship.count({ where: { status: 'ACTIVE' } }),
    prisma.scholarship.count({ where: { status: 'ACTIVE', endDate: { lte: new Date(Date.now() + 30 * 86400000) } } }),
    prisma.academicRecord.groupBy({ by: ['academicStanding'], _count: { _all: true } }),
    prisma.document.count(),
  ]);

  const sportIds = athletesBySport.map((s) => s.sportId);
  const sports = sportIds.length
    ? await prisma.sport.findMany({ where: { id: { in: sportIds } }, select: { id: true, name: true } })
    : [];
  const bySport = athletesBySport.map((s) => ({
    sport: sports.find((x) => x.id === s.sportId)?.name ?? s.sportId,
    count: s._count._all,
  }));

  return {
    season: currentSeason?.name ?? null,
    totalAthletes,
    bySport,
    byGender: athletesByGender.map((g) => ({ gender: g.gender, count: g._count._all })),
    byAthleteType: athletesByType.map((t) => ({ type: t.athleteType, count: t._count._all })),
    activeTeams,
    activeScholarships,
    expiringScholarships,
    academicStanding: academicStandingSummary.map((s) => ({
      standing: s.academicStanding,
      count: s._count._all,
    })),
    totalDocuments: documentCount,
  };
}

// ─── 2. Student-Athlete Report ────────────────────────────────────────────────

export async function athleteReport(query: ReportsQuery) {
  const where: Prisma.StudentAthleteWhereInput = { deletedAt: null };
  if (query.sport) {
    where.affiliations = { some: { sportId: query.sport } };
  }
  if (query.team) {
    where.squadEntries = { some: { teamId: query.team } };
  }

  const athletes = await prisma.studentAthlete.findMany({
    where,
    include: {
      affiliations: { include: { sport: true, team: true } },
      academicRecords: { orderBy: { createdAt: 'desc' }, take: 1 },
      scholarships: { where: { status: 'ACTIVE' } },
      squadEntries: true,
    },
    orderBy: { fullName: 'asc' },
  });

  const rows = athletes.map((a) => ({
    name: a.fullName,
    registrationNumber: a.registrationNumber,
    programme: a.programme ?? '',
    yearOfStudy: a.yearOfStudy ?? '',
    gender: a.gender,
    athleteType: a.athleteType,
    status: a.status,
    sports: a.affiliations.map((x) => x.sport.name).join('; '),
    gpa: a.academicRecords[0]?.gpa?.toString() ?? '',
    academicStanding: a.academicRecords[0]?.academicStanding ?? '',
    scholarshipStatus: a.scholarships[0]?.status ?? '',
    teams: a.squadEntries.length,
  }));

  return {
    count: rows.length,
    athletes: rows,
  };
}

// ─── 3. Academic Standing Report ──────────────────────────────────────────────

export async function academicStandingReport(query: ReportsQuery) {
  const where: Prisma.AcademicRecordWhereInput = {};
  if (query.season) where.academicYear = query.season;
  if (query.semester) where.semester = query.semester;
  if (query.sport) {
    where.athlete = { affiliations: { some: { sportId: query.sport } } };
  }

  const records = await prisma.academicRecord.findMany({
    where,
    include: {
      athlete: {
        select: { id: true, fullName: true, registrationNumber: true, faculty: true },
      },
    },
    orderBy: [{ academicStanding: 'asc' }],
  });

  const grouped = records.reduce<Record<string, typeof records>>((acc, r) => {
    (acc[r.academicStanding] ??= []).push(r);
    return acc;
  }, {});

  const rows = records.map((r) => ({
    name: r.athlete.fullName,
    registrationNumber: r.athlete.registrationNumber,
    faculty: r.athlete.faculty ?? '',
    year: r.academicYear,
    semester: r.semester,
    gpa: r.gpa?.toString() ?? '',
    failedUnits: r.failedUnits,
    attendance: r.attendancePercentage?.toString() ?? '',
    standing: r.academicStanding,
  }));

  return {
    total: records.length,
    byStanding: Object.entries(grouped).map(([standing, list]) => ({
      standing,
      count: list.length,
    })),
    records: rows,
  };
}

// ─── 4. Scholarship Report ────────────────────────────────────────────────────

export async function scholarshipReport() {
  const scholarships = await prisma.scholarship.findMany({
    include: {
      athlete: {
        select: { fullName: true, registrationNumber: true },
      },
    },
    orderBy: { endDate: 'asc' },
  });

  const today = new Date();
  const in30 = new Date(Date.now() + 30 * 86400000);
  const in90 = new Date(Date.now() + 90 * 86400000);

  const active = scholarships.filter((s) => s.status === 'ACTIVE');
  const expiring30 = active.filter((s) => s.endDate >= today && s.endDate <= in30);
  const expiring90 = active.filter((s) => s.endDate >= today && s.endDate <= in90);
  const revoked = scholarships.filter((s) => s.status === 'REVOKED');

  const rows = scholarships.map((s) => ({
    athlete: s.athlete.fullName,
    registrationNumber: s.athlete.registrationNumber,
    type: s.scholarshipType,
    sponsor: s.sponsorName ?? '',
    coverage: s.coveragePercentage?.toString() ?? '',
    startDate: s.startDate.toISOString().slice(0, 10),
    endDate: s.endDate.toISOString().slice(0, 10),
    status: s.status,
    gpaRequirement: s.academicRequirementGpa?.toString() ?? '',
  }));

  return {
    total: scholarships.length,
    active: active.length,
    expiringWithin30Days: expiring30.length,
    expiringWithin90Days: expiring90.length,
    revoked,
    byType: {
      full: scholarships.filter((s) => s.scholarshipType === 'FULL').length,
      partial: scholarships.filter((s) => s.scholarshipType === 'PARTIAL').length,
      sponsorship: scholarships.filter((s) => s.scholarshipType === 'SPONSORSHIP').length,
      bursary: scholarships.filter((s) => s.scholarshipType === 'BURSARY').length,
    },
    records: rows,
  };
}

// ─── 5. Contract Report ───────────────────────────────────────────────────────

export async function contractReport() {
  const contracts = await prisma.athleteContract.findMany({
    include: { athlete: { select: { fullName: true, registrationNumber: true } } },
    orderBy: { endDate: 'asc' },
  });

  const today = new Date();
  const in30 = new Date(Date.now() + 30 * 86400000);
  const expiring30 = contracts.filter(
    (c) => c.status === 'ACTIVE' && c.endDate >= today && c.endDate <= in30
  );

  const rows = contracts.map((c) => ({
    athlete: c.athlete.fullName,
    registrationNumber: c.athlete.registrationNumber,
    type: c.contractType,
    startDate: c.startDate.toISOString().slice(0, 10),
    endDate: c.endDate.toISOString().slice(0, 10),
    status: c.status,
    withScholarship: c.hasAccompanyingScholarship,
  }));

  return {
    total: contracts.length,
    active: contracts.filter((c) => c.status === 'ACTIVE').length,
    expiringWithin30Days: expiring30.length,
    records: rows,
  };
}

// ─── 6. Fixture Schedule Report (events placeholder until Phase 11-12) ────────

export async function fixtureScheduleReport(query: ReportsQuery) {
  const where: Prisma.EventWhereInput = {};
  const from = parseDate(query.from);
  const to = parseDate(query.to);
  if (query.sport) where.sportId = query.sport;
  if (query.season) where.season = { name: query.season };
  if (from || to) {
    where.OR = [
      ...(from ? [{ startDate: { gte: from } }] : []),
      ...(to ? [{ startDate: { lte: to } }] : []),
    ];
  }

  const events = await prisma.event.findMany({
    where,
    include: { sport: { select: { name: true } } },
    orderBy: { startDate: 'asc' },
  });

  return {
    total: events.length,
    events: events.map((e) => ({
      name: e.name,
      type: e.type,
      sport: e.sport?.name ?? '',
      venue: e.venue ?? '',
      startDate: e.startDate?.toISOString().slice(0, 10) ?? '',
      endDate: e.endDate?.toISOString().slice(0, 10) ?? '',
      status: e.status,
    })),
  };
}

// ─── Export helpers ───────────────────────────────────────────────────────────

export function toCsvExport(rows: Record<string, unknown>[]): string {
  return toCsv(rows);
}

// ─── PDF export ───────────────────────────────────────────────────────────────

export interface PdfColumn {
  label: string;
  key: string;
}

export function toPdfExport(
  title: string,
  subtitle: string,
  columns: PdfColumn[],
  rows: Record<string, unknown>[],
): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const pageWidth = doc.page.width - 80;
  const colWidth = pageWidth / Math.max(columns.length, 1);
  const headerH = 18;
  const rowH = 16;

  doc.font('Helvetica-Bold').fontSize(17).fillColor('#111827').text(title, { align: 'center' });
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(9).fillColor('#6b7280').text(subtitle, { align: 'center' });
  doc.moveDown(0.6);

  const startY = doc.y;
  columns.forEach((col, i) => {
    doc.save().rect(40 + i * colWidth, startY, colWidth, headerH).fill('#1e3a8a').restore();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff').text(
      col.label,
      40 + i * colWidth + 4,
      startY + 5,
      { width: colWidth - 8, height: headerH - 10, lineBreak: false },
    );
  });

  doc.font('Helvetica').fontSize(8).fillColor('#111827');
  let y = startY + headerH;

  if (rows.length === 0) {
    doc.text('No records found.', 40, y + 4);
  }

  rows.forEach((row) => {
    if (y + rowH > doc.page.height - 40) {
      doc.addPage();
      y = 40;
    }
    const isAlt = (y - startY - headerH) / rowH % 2 === 1;
    if (isAlt) {
      doc.save().rect(40, y, pageWidth, rowH).fill('#f3f4f6').restore();
    }
    columns.forEach((col, i) => {
      doc.text(
        String(row[col.key] ?? ''),
        40 + i * colWidth + 4,
        y + 3,
        { width: colWidth - 8, height: rowH - 6, lineBreak: false, ellipsis: true },
      );
    });
    y += rowH;
  });

  doc.end();
  return doc;
}
