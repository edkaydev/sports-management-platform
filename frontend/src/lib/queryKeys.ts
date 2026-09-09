export const queryKeys = {
  athletes: {
    all: ['athletes'] as const,
    detail: (id: string) => ['athletes', 'detail', id] as const,
    list: (filters?: Record<string, unknown>) => ['athletes', 'list', filters] as const,
  },
  sports: {
    all: ['sports'] as const,
    detail: (id: string) => ['sports', 'detail', id] as const,
  },
  teams: {
    all: ['teams'] as const,
    detail: (id: string) => ['teams', 'detail', id] as const,
    bySport: (sportId: string) => ['teams', 'bySport', sportId] as const,
  },
  events: {
    all: ['events'] as const,
    detail: (id: string) => ['events', 'detail', id] as const,
  },
  matches: {
    all: ['matches'] as const,
    detail: (id: string) => ['matches', 'detail', id] as const,
  },
  academic: {
    all: ['academic'] as const,
    byAthlete: (athleteId: string) => ['academic', 'athlete', athleteId] as const,
  },
  scholarships: {
    all: ['scholarships'] as const,
    detail: (id: string) => ['scholarships', 'detail', id] as const,
  },
  contracts: {
    all: ['contracts'] as const,
    detail: (id: string) => ['contracts', 'detail', id] as const,
  },
  prospects: {
    all: ['prospects'] as const,
    detail: (id: string) => ['prospects', 'detail', id] as const,
  },
  trials: {
    all: ['trials'] as const,
    detail: (id: string) => ['trials', 'detail', id] as const,
  },
  documents: {
    all: ['documents'] as const,
    byAthlete: (athleteId: string) => ['documents', 'athlete', athleteId] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unread: ['notifications', 'unread'] as const,
  },
  reports: {
    overview: ['reports', 'overview'] as const,
    athletes: ['reports', 'athletes'] as const,
    academic: ['reports', 'academic'] as const,
    scholarships: ['reports', 'scholarships'] as const,
  },
  equipment: {
    all: ['equipment'] as const,
    detail: (id: string) => ['equipment', 'detail', id] as const,
  },
  news: {
    all: ['news'] as const,
    detail: (id: string) => ['news', 'detail', id] as const,
  },
  slides: {
    all: ['slides'] as const,
  },
  seasons: {
    all: ['seasons'] as const,
    current: ['seasons', 'current'] as const,
  },
} as const;
