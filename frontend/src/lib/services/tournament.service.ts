import api from '@/lib/api';

export interface TournamentData {
  name: string;
  type: string;
  level: string;
  sportId?: string;
  venue?: string;
  startDate?: string;
  endDate?: string;
  format: string;
  description?: string;
  maxTeams?: number;
  maxParticipants?: number;
  registrationDeadline?: string;
  organizer?: string;
  hostInstitution?: string;
  participants?: TournamentParticipant[];
  matches?: TournamentMatch[];
}

export interface TournamentParticipant {
  participantType: 'TEAM' | 'INDIVIDUAL';
  teamId?: string;
  athleteId?: string;
  name?: string;
}

export interface TournamentMatch {
  homeTeamId?: string;
  awayTeamId?: string;
  homeIndividualId?: string;
  awayIndividualId?: string;
  scheduledDate: string;
  scheduledTime?: string;
  venue?: string;
  round?: string;
  matchNumber?: number;
  matchType?: string;
}

export const tournamentService = {
  async create(data: TournamentData) {
    const res = await api.post('/events', {
      name: data.name,
      type: data.type,
      level: data.level,
      sportId: data.sportId || undefined,
      venue: data.venue || undefined,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      format: data.format,
      description: data.description || undefined,
      maxTeams: data.maxTeams || undefined,
      maxParticipants: data.maxParticipants || undefined,
      registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline).toISOString() : undefined,
      organizer: data.organizer || undefined,
      hostInstitution: data.hostInstitution || undefined,
    });
    return res.data;
  },

  async addParticipant(eventId: string, participant: TournamentParticipant) {
    const res = await api.post(`/events/${eventId}/participants`, {
      participantType: participant.participantType,
      teamId: participant.teamId || undefined,
      athleteId: participant.athleteId || undefined,
    });
    return res.data;
  },

  async addParticipants(eventId: string, participants: TournamentParticipant[]) {
    const results = [];
    for (const p of participants) {
      try {
        const result = await this.addParticipant(eventId, p);
        results.push({ success: true, participant: p, result });
      } catch (err: any) {
        results.push({ success: false, participant: p, error: err.message });
      }
    }
    return results;
  },

  async createMatches(eventId: string, matches: TournamentMatch[]) {
    const results = [];
    for (const m of matches) {
      try {
        const res = await api.post('/matches', {
          eventId,
          sportId: (await api.get(`/events/${eventId}`)).data.sportId,
          homeTeamId: m.homeTeamId || undefined,
          awayTeamId: m.awayTeamId || undefined,
          homeIndividualId: m.homeIndividualId || undefined,
          awayIndividualId: m.awayIndividualId || undefined,
          scheduledDate: new Date(m.scheduledDate).toISOString(),
          scheduledTime: m.scheduledTime || undefined,
          venue: m.venue || undefined,
          round: m.round || undefined,
          matchNumber: m.matchNumber || undefined,
          matchType: m.matchType || 'TOURNAMENT',
        });
        results.push({ success: true, match: m, result: res.data });
      } catch (err: any) {
        results.push({ success: false, match: m, error: err.message });
      }
    }
    return results;
  },

  async registerPlayersByName(eventId: string, players: { name: string; teamName?: string }[]) {
    const res = await api.post(`/events/${eventId}/register-players`, { players });
    return res.data;
  },

  async getDetails(eventId: string) {
    const res = await api.get(`/events/${eventId}`);
    return res.data;
  },

  async updateStatus(eventId: string, status: string) {
    const res = await api.patch(`/events/${eventId}`, { status });
    return res.data;
  },
};
