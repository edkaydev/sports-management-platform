import { Decimal } from '@prisma/client/runtime/library';
import { parse } from 'csv-parse/sync';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

// ─── Thresholds (configurable — hard-coded defaults for now) ─────────────────
const THRESHOLDS = {
  minGpaGoodStanding: 2.5,
  maxFailedUnitsWarning: 1,
  maxFailedUnitsProbation: 3,
  minAttendanceWarning: 75,
};

type AcademicStandingValue =
  | 'GOOD_STANDING'
  | 'WARNING'
  | 'PROBATION'
  | 'ACADEMIC_SUSPENSION'
  | 'WITHDRAWN';

function computeStanding(
  gpa: number | null | undefined,
  failedUnits: number,
  _attendance?: number | null
): AcademicStandingValue {
  if (gpa === null || gpa === undefined) return 'GOOD_STANDING';

  if (
    gpa >= THRESHOLDS.minGpaGoodStanding &&
    failedUnits === 0
  ) {
    return 'GOOD_STANDING';
  }

  if (failedUnits >= THRESHOLDS.maxFailedUnitsProbation) {
    return 'PROBATION';
  }

  return 'WARNING';
}

// ─── List ─────────────────────────────────────────────────────────────────────
export async function listAcademicRecords(filters: {
  athleteId?: string;
  academicYear?: string;
  semester?: 'SEM1' | 'SEM2' | 'RESIT';
  standing?: string;
  page: number;
  pageSize: number;
}) {
  const where: Record<string, unknown> = {};
  if (filters.athleteId) where.athleteId = filters.athleteId;
  if (filters.academicYear) where.academicYear = filters.academicYear;
  if (filters.semester) where.semester = filters.semester;
  if (filters.standing) where.academicStanding = filters.standing;

  const [records, total] = await Promise.all([
    prisma.academicRecord.findMany({
      where,
      include: {
        athlete: {
          select: { id: true, fullName: true, registrationNumber: true },
        },
        courseResults: true,
      },
      orderBy: [{ academicYear: 'desc' }, { semester: 'asc' }],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.academicRecord.count({ where }),
  ]);

  return {
    records,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.ceil(total / filters.pageSize),
    },
  };
}

// ─── Get single ───────────────────────────────────────────────────────────────
export async function getAcademicRecord(id: string) {
  const record = await prisma.academicRecord.findUnique({
    where: { id },
    include: {
      athlete: {
        select: {
          id: true,
          fullName: true,
          registrationNumber: true,
          faculty: true,
          programme: true,
        },
      },
      courseResults: true,
      enteredByUser: { select: { id: true, fullName: true } },
    },
  });

  if (!record) return null;
  return record;
}

// ─── Create ───────────────────────────────────────────────────────────────────
export async function createAcademicRecord(
  data: {
    athleteId: string;
    academicYear: string;
    semester: 'SEM1' | 'SEM2' | 'RESIT';
    yearOfStudy?: number;
    gpa?: number;
    cgpa?: number;
    totalCreditUnitsTaken?: number;
    totalCreditUnitsPassed?: number;
    failedUnits?: number;
    attendancePercentage?: number;
    academicStanding?: AcademicStandingValue;
    notes?: string;
    courseResults?: {
      courseCode: string;
      courseName: string;
      creditUnits: number;
      marks?: number;
      grade?: string;
      result: 'PASS' | 'FAIL' | 'INCOMPLETE' | 'WITHDRAWN';
      retake?: boolean;
    }[];
  },
  enteredBy: string
) {
  // Check athlete exists
  const athlete = await prisma.studentAthlete.findUnique({
    where: { id: data.athleteId },
  });
  if (!athlete) {
    throw new AppError(404, 'NOT_FOUND', 'Athlete not found');
  }

  // Check for duplicate
  const existing = await prisma.academicRecord.findUnique({
    where: {
      athleteId_academicYear_semester: {
        athleteId: data.athleteId,
        academicYear: data.academicYear,
        semester: data.semester,
      },
    },
  });
  if (existing) {
    throw new AppError(
      409,
      'CONFLICT',
      'Academic record for this athlete/year/semester already exists'
    );
  }

  // Compute standing if not explicitly provided
  const standing =
    data.academicStanding ??
    computeStanding(data.gpa, data.failedUnits ?? 0, data.attendancePercentage);

  const record = await prisma.academicRecord.create({
    data: {
      athleteId: data.athleteId,
      academicYear: data.academicYear,
      semester: data.semester,
      yearOfStudy: data.yearOfStudy,
      gpa: data.gpa !== undefined ? new Decimal(data.gpa) : undefined,
      cgpa: data.cgpa !== undefined ? new Decimal(data.cgpa) : undefined,
      totalCreditUnitsTaken: data.totalCreditUnitsTaken,
      totalCreditUnitsPassed: data.totalCreditUnitsPassed,
      failedUnits: data.failedUnits ?? 0,
      attendancePercentage:
        data.attendancePercentage !== undefined
          ? new Decimal(data.attendancePercentage)
          : undefined,
      academicStanding: standing,
      enteredBy,
      notes: data.notes,
      courseResults: data.courseResults
        ? {
            create: data.courseResults.map((c) => ({
              courseCode: c.courseCode,
              courseName: c.courseName,
              creditUnits: c.creditUnits,
              marks: c.marks !== undefined ? new Decimal(c.marks) : undefined,
              grade: c.grade,
              result: c.result,
              retake: c.retake ?? false,
            })),
          }
        : undefined,
    },
    include: { courseResults: true },
  });

  return record;
}

// ─── Update ───────────────────────────────────────────────────────────────────
export async function updateAcademicRecord(
  id: string,
  data: {
    yearOfStudy?: number;
    gpa?: number;
    cgpa?: number;
    totalCreditUnitsTaken?: number;
    totalCreditUnitsPassed?: number;
    failedUnits?: number;
    attendancePercentage?: number;
    academicStanding?: AcademicStandingValue;
    notes?: string;
  }
) {
  const existing = await prisma.academicRecord.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Academic record not found');
  }

  // Recompute standing if relevant fields changed and standing not explicitly set
  const failedUnits = data.failedUnits ?? Number(existing.failedUnits);
  const gpa =
    data.gpa !== undefined ? data.gpa : existing.gpa ? Number(existing.gpa) : undefined;
  const standing =
    data.academicStanding ?? computeStanding(gpa, failedUnits, data.attendancePercentage);

  const record = await prisma.academicRecord.update({
    where: { id },
    data: {
      yearOfStudy: data.yearOfStudy,
      gpa: data.gpa !== undefined ? new Decimal(data.gpa) : undefined,
      cgpa: data.cgpa !== undefined ? new Decimal(data.cgpa) : undefined,
      totalCreditUnitsTaken: data.totalCreditUnitsTaken,
      totalCreditUnitsPassed: data.totalCreditUnitsPassed,
      failedUnits: data.failedUnits,
      attendancePercentage:
        data.attendancePercentage !== undefined
          ? new Decimal(data.attendancePercentage)
          : undefined,
      academicStanding: standing,
      notes: data.notes,
    },
    include: { courseResults: true },
  });

  return record;
}

// ─── CSV Import ───────────────────────────────────────────────────────────────
export async function importAcademicRecordsFromCsv(
  csvBuffer: Buffer,
  enteredBy: string
): Promise<{ imported: number; skipped: number; errors: { row: number; message: string }[] }> {
  const rows = parse(csvBuffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  let imported = 0;
  let skipped = 0;
  const errors: { row: number; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-indexed, header is row 1

    try {
      // Required fields
      const { registration_number, academic_year, semester } = row;
      if (!registration_number || !academic_year || !semester) {
        errors.push({
          row: rowNum,
          message: 'Missing required fields: registration_number, academic_year, semester',
        });
        skipped++;
        continue;
      }

      // Validate semester
      if (!['SEM1', 'SEM2', 'RESIT'].includes(semester)) {
        errors.push({ row: rowNum, message: `Invalid semester: ${semester}` });
        skipped++;
        continue;
      }

      // Find athlete
      const athlete = await prisma.studentAthlete.findUnique({
        where: { registrationNumber: registration_number },
      });
      if (!athlete) {
        errors.push({
          row: rowNum,
          message: `Athlete not found: ${registration_number}`,
        });
        skipped++;
        continue;
      }

      // Parse numeric fields
      const gpa = row.gpa ? parseFloat(row.gpa) : undefined;
      const cgpa = row.cgpa ? parseFloat(row.cgpa) : undefined;
      const failedUnits = row.failed_units ? parseInt(row.failed_units, 10) : 0;
      const attendance = row.attendance ? parseFloat(row.attendance) : undefined;

      if (gpa !== undefined && (gpa < 0 || gpa > 5)) {
        errors.push({ row: rowNum, message: `GPA out of range (0–5): ${gpa}` });
        skipped++;
        continue;
      }

      // Check duplicate
      const dup = await prisma.academicRecord.findUnique({
        where: {
          athleteId_academicYear_semester: {
            athleteId: athlete.id,
            academicYear: academic_year,
            semester: semester as 'SEM1' | 'SEM2' | 'RESIT',
          },
        },
      });
      if (dup) {
        skipped++;
        continue;
      }

      const standing =
        (row.standing as AcademicStandingValue) ||
        computeStanding(gpa, failedUnits, attendance);

      await prisma.academicRecord.create({
        data: {
          athleteId: athlete.id,
          academicYear: academic_year,
          semester: semester as 'SEM1' | 'SEM2' | 'RESIT',
          yearOfStudy: row.year_of_study ? parseInt(row.year_of_study, 10) : undefined,
          gpa: gpa !== undefined ? new Decimal(gpa) : undefined,
          cgpa: cgpa !== undefined ? new Decimal(cgpa) : undefined,
          failedUnits,
          attendancePercentage:
            attendance !== undefined ? new Decimal(attendance) : undefined,
          academicStanding: standing,
          enteredBy,
          notes: row.notes || undefined,
        },
      });

      imported++;
    } catch (err) {
      errors.push({
        row: rowNum,
        message: err instanceof Error ? err.message : 'Unknown error',
      });
      skipped++;
    }
  }

  return { imported, skipped, errors };
}
