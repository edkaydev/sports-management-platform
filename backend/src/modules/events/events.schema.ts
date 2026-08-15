import { z } from 'zod';
import { EventType, EventLevel, EventStatus, EventFormat } from '@prisma/client';

export const createEventSchema = z.object({
  name: z.string().min(2).max(255),
  type: z.nativeEnum(EventType),
  level: z.nativeEnum(EventLevel),
  sportId: z.string().uuid().optional(),
  seasonId: z.string().uuid().optional(),
  organizer: z.string().optional(),
  hostInstitution: z.string().optional(),
  venue: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(EventStatus).default(EventStatus.PLANNED),
  format: z.nativeEnum(EventFormat).default(EventFormat.OTHER),
  maxTeams: z.number().int().positive().optional(),
  maxParticipants: z.number().int().positive().optional(),
  registrationDeadline: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const registerParticipantSchema = z
  .object({
    participantType: z.enum(['TEAM', 'INDIVIDUAL']),
    teamId: z.string().uuid().optional(),
    athleteId: z.string().uuid().optional(),
  })
  .refine((data) => {
    if (data.participantType === 'TEAM') return !!data.teamId;
    return !!data.athleteId;
  }, 'teamId or athleteId is required depending on participantType');

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
