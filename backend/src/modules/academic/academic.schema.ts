import { z } from 'zod';

const semesterEnum = z.enum(['SEM1', 'SEM2', 'RESIT']);
const standingEnum = z.enum(['GOOD_STANDING', 'WARNING', 'PROBATION', 'ACADEMIC_SUSPENSION', 'WITHDRAWN']);

export const createAcademicRecordSchema = z.object({
  athleteId: z.string().uuid(),
  academicYear: z
    .string()
    .regex(/^\d{4}\/\d{4}$/, 'academicYear must be in format YYYY/YYYY'),
  semester: semesterEnum,
  yearOfStudy: z.number().int().min(1).max(8).optional(),
  gpa: z.number().min(0).max(5).optional(),
  cgpa: z.number().min(0).max(5).optional(),
  totalCreditUnitsTaken: z.number().int().min(0).optional(),
  totalCreditUnitsPassed: z.number().int().min(0).optional(),
  failedUnits: z.number().int().min(0).optional(),
  attendancePercentage: z.number().min(0).max(100).optional(),
  academicStanding: standingEnum.optional(),
  notes: z.string().optional(),
  courseResults: z
    .array(
      z.object({
        courseCode: z.string().min(1),
        courseName: z.string().min(1),
        creditUnits: z.number().int().min(0),
        marks: z.number().min(0).max(100).optional(),
        grade: z.string().optional(),
        result: z.enum(['PASS', 'FAIL', 'INCOMPLETE', 'WITHDRAWN']),
        retake: z.boolean().optional(),
      })
    )
    .optional(),
});

export const updateAcademicRecordSchema = z.object({
  yearOfStudy: z.number().int().min(1).max(8).optional(),
  gpa: z.number().min(0).max(5).optional(),
  cgpa: z.number().min(0).max(5).optional(),
  totalCreditUnitsTaken: z.number().int().min(0).optional(),
  totalCreditUnitsPassed: z.number().int().min(0).optional(),
  failedUnits: z.number().int().min(0).optional(),
  attendancePercentage: z.number().min(0).max(100).optional(),
  academicStanding: standingEnum.optional(),
  notes: z.string().optional(),
});
