import { EventStatus } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { createNotificationsBulk } from '../notifications/notifications.service';
import type { CreateEventInput, UpdateEventInput } from './events.schema';

function toDate(value?: string): Date | undefined {
  if (!value) return undefined;
  return new Date(value);
}

export async function listEvents() {
  const events = await prisma.event.findMany({
    include: {
      sport: { select: { id: true, name: true } },
      season: { select: { id: true, name: true } },
      _count: { select: { participants: true, matches: true } },
    },
    orderBy: [{ startDate: 'desc' }],
  });
  return events;
}

export async function getEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      sport: { select: { id: true, name: true } },
      season: { select: { id: true, name: true } },
      participants: {
        include: {
          team: { select: { id: true, name: true, shortName: true } },
          athlete: { select: { id: true, fullName: true, registrationNumber: true } },
        },
      },
      matches: {
        select: {
          id: true,
          matchNumber: true,
          round: true,
          scheduledDate: true,
          status: true,
          homeTeam: { select: { id: true, name: true } },
          awayTeam: { select: { id: true, name: true } },
          homeScore: true,
          awayScore: true,
        },
      },
    },
  });
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found');
  return event;
}

export async function createEvent(data: CreateEventInput, createdBy: string) {
  if (data.sportId) {
    const sport = await prisma.sport.findUnique({ where: { id: data.sportId } });
    if (!sport) throw new AppError(404, 'NOT_FOUND', 'Sport not found');
  }
  if (data.seasonId) {
    const season = await prisma.season.findUnique({ where: { id: data.seasonId } });
    if (!season) throw new AppError(404, 'NOT_FOUND', 'Season not found');
  }
  if (data.endDate && data.startDate && new Date(data.endDate) < new Date(data.startDate)) {
    throw new AppError(400, 'VALIDATION', 'End date cannot be before start date');
  }

  return prisma.event.create({
    data: {
      name: data.name,
      type: data.type,
      level: data.level,
      sportId: data.sportId,
      seasonId: data.seasonId,
      organizer: data.organizer,
      hostInstitution: data.hostInstitution,
      venue: data.venue,
      startDate: toDate(data.startDate),
      endDate: toDate(data.endDate),
      description: data.description,
      status: data.status,
      format: data.format,
      maxTeams: data.maxTeams,
      maxParticipants: data.maxParticipants,
      registrationDeadline: toDate(data.registrationDeadline),
      createdBy,
    },
  });
}

export async function updateEvent(id: string, data: UpdateEventInput) {
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Event not found');

  if (data.sportId) {
    const sport = await prisma.sport.findUnique({ where: { id: data.sportId } });
    if (!sport) throw new AppError(404, 'NOT_FOUND', 'Sport not found');
  }

  return prisma.event.update({
    where: { id },
    data: {
      name: data.name,
      type: data.type,
      level: data.level,
      sportId: data.sportId,
      seasonId: data.seasonId,
      organizer: data.organizer,
      hostInstitution: data.hostInstitution,
      venue: data.venue,
      startDate: toDate(data.startDate),
      endDate: toDate(data.endDate),
      description: data.description,
      status: data.status,
      format: data.format,
      maxTeams: data.maxTeams,
      maxParticipants: data.maxParticipants,
      registrationDeadline: toDate(data.registrationDeadline),
    },
  });
}

export async function deleteEvent(id: string) {
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Event not found');
  await prisma.event.delete({ where: { id } });
  return { message: 'Event deleted' };
}

export async function registerParticipant(
  eventId: string,
  data: { participantType: 'TEAM' | 'INDIVIDUAL'; teamId?: string; athleteId?: string },
  adminId: string
) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found');
  if (event.status === 'COMPLETED' || event.status === 'CANCELLED') {
    throw new AppError(400, 'VALIDATION', 'Cannot register for a completed or cancelled event');
  }
  if (event.registrationDeadline && event.registrationDeadline < new Date()) {
    throw new AppError(400, 'VALIDATION', 'Registration deadline has passed');
  }

  if (data.participantType === 'TEAM') {
    const team = await prisma.team.findUnique({ where: { id: data.teamId! } });
    if (!team) throw new AppError(404, 'NOT_FOUND', 'Team not found');
    const existing = await prisma.eventParticipant.findUnique({
      where: { eventId_teamId: { eventId, teamId: data.teamId! } },
    });
    if (existing) throw new AppError(409, 'CONFLICT', 'Team already registered for this event');

    return prisma.eventParticipant.create({
      data: { eventId, participantType: 'TEAM', teamId: data.teamId! },
    });
  }

  const athlete = await prisma.studentAthlete.findUnique({ where: { id: data.athleteId! } });
  if (!athlete) throw new AppError(404, 'NOT_FOUND', 'Student-athlete not found');
  const existing = await prisma.eventParticipant.findUnique({
    where: { eventId_athleteId: { eventId, athleteId: data.athleteId! } },
  });
  if (existing) throw new AppError(409, 'CONFLICT', 'Athlete already registered for this event');

  const participant = await prisma.eventParticipant.create({
    data: { eventId, participantType: 'INDIVIDUAL', athleteId: data.athleteId! },
  });

  const admins = await prisma.user.findMany({
    where: { role: { in: ['SPORTS_ADMIN', 'SUPER_ADMIN'] } },
    select: { id: true },
  });
  if (admins.length > 0) {
    await createNotificationsBulk(
      admins.map((a) => ({
        type: 'SYSTEM',
        title: `Participant registered — ${event.name}`,
        message: `${athlete.fullName} registered for ${event.name}.`,
        recipientUserId: a.id,
        relatedAthleteId: athlete.id,
        relatedEntityType: 'EVENT',
        relatedEntityId: event.id,
      }))
    );
  }

  return participant;
}

export async function listParticipants(eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found');

  return prisma.eventParticipant.findMany({
    where: { eventId },
    include: {
      team: { select: { id: true, name: true, shortName: true } },
      athlete: { select: { id: true, fullName: true, registrationNumber: true } },
    },
    orderBy: { registeredAt: 'asc' },
  });
}

export async function updateEventStatus(id: string, status: EventStatus) {
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Event not found');

  return prisma.event.update({ where: { id }, data: { status } });
}
