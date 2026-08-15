import { z } from 'zod';
import { MatchStatus, MatchType } from '@prisma/client';

export const createMatchSchema = z.object({
  eventId: z.string().uuid(),
  sportId: z.string().uuid(),
  seasonId: z.string().uuid().optional(),
  matchNumber: z.number().int().positive().optional(),
  round: z.string().optional(),
  homeTeamId: z.string().uuid().optional(),
  awayTeamId: z.string().uuid().optional(),
  homeIndividualId: z.string().uuid().optional(),
  awayIndividualId: z.string().uuid().optional(),
  venue: z.string().optional(),
  scheduledDate: z.string(),
  scheduledTime: z.string().optional(),
  status: z.nativeEnum(MatchStatus).default(MatchStatus.SCHEDULED),
  matchType: z.nativeEnum(MatchType).default(MatchType.OTHER),
  notes: z.string().optional(),
});

export const updateMatchSchema = createMatchSchema.partial();

export const submitLineupSchema = z.object({
  teamId: z.string().uuid(),
  entries: z
    .array(
      z.object({
        athleteId: z.string().uuid(),
        jerseyNumber: z.number().int().positive().optional(),
        position: z.string().optional(),
        isStarter: z.boolean().default(false),
        isCaptain: z.boolean().default(false),
        order: z.number().int().positive().optional(),
      })
    )
    .min(1, 'Lineup must have at least one player'),
});

export const recordMatchEventSchema = z.object({
  eventType: z.string().min(1),
  minute: z.number().int().min(0).optional(),
  teamId: z.string().uuid().optional(),
  athleteId: z.string().uuid().optional(),
  secondaryAthleteId: z.string().uuid().optional(),
  details: z.string().optional(),
});

export const recordResultSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  resultType: z.enum(['HOME_WIN', 'AWAY_WIN', 'DRAW']),
  homePenalties: z.number().int().min(0).optional(),
  awayPenalties: z.number().int().min(0).optional(),
  walkover: z.boolean().default(false),
});

export const submitMatchReportSchema = z.object({
  summary: z.string().optional(),
  mvpAthleteId: z.string().uuid().optional(),
  attendanceCount: z.number().int().min(0).optional(),
  notableIncidents: z.string().optional(),
  coachingNotes: z.string().optional(),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;
