import { z } from 'zod';
import { TrainingStatus, AttendanceStatus } from '@prisma/client';

export const recordPerformanceSchema = z.object({
  matchId: z.string().uuid(),
  athleteId: z.string().uuid(),
  teamId: z.string().uuid(),
  minutesPlayed: z.number().int().min(0),
  points: z.number().int().min(0).optional(),
  assists: z.number().int().min(0).optional(),
  rebounds: z.number().int().min(0).optional(),
  steals: z.number().int().min(0).optional(),
  blocks: z.number().int().min(0).optional(),
  goals: z.number().int().min(0).optional(),
  shotsOnTarget: z.number().int().min(0).optional(),
  saves: z.number().int().min(0).optional(),
  tackles: z.number().int().min(0).optional(),
  interceptions: z.number().int().min(0).optional(),
  passesCompleted: z.number().int().min(0).optional(),
  passesAttempted: z.number().int().min(0).optional(),
  fouls: z.number().int().min(0).optional(),
  yellowCards: z.number().int().min(0).optional(),
  redCards: z.number().int().min(0).optional(),
  sprints: z.number().int().min(0).optional(),
  distanceCoveredKm: z.number().min(0).optional(),
  maxSpeedKph: z.number().min(0).optional(),
  rating: z.number().min(0).max(10).optional(),
  notes: z.string().optional(),
});

export const updatePerformanceSchema = recordPerformanceSchema.partial();

export const createTrainingSessionSchema = z.object({
  sportId: z.string().uuid(),
  teamId: z.string().uuid().optional(),
  seasonId: z.string().uuid().optional(),
  title: z.string().min(2).max(255),
  location: z.string().optional(),
  sessionDate: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  focusAreas: z.string().optional(),
  intensity: z.string().optional(),
  status: z.nativeEnum(TrainingStatus).default(TrainingStatus.SCHEDULED),
});

export const updateTrainingSessionSchema = createTrainingSessionSchema.partial();

export const recordAttendanceSchema = z.object({
  records: z
    .array(
      z.object({
        athleteId: z.string().uuid(),
        status: z.nativeEnum(AttendanceStatus).default(AttendanceStatus.PRESENT),
        notes: z.string().optional(),
      })
    )
    .min(1, 'At least one attendance record required'),
});

export type RecordPerformanceInput = z.infer<typeof recordPerformanceSchema>;
export type CreateTrainingSessionInput = z.infer<typeof createTrainingSessionSchema>;
