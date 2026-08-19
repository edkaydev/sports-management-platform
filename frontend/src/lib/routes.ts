import type { UserRole } from '@/types';

export const ROUTES = {
  login: '/login',
  home: '/',
  dashboard: '/dashboard',
  errors: {
    unauthorized: '/unauthorized',
    forbidden: '/forbidden',
    notFound: '/not-found',
    serverError: '/server-error',
  },
  athletes: {
    list: '/athletes',
    create: '/athletes/new',
    detail: (id: string) => `/athletes/${id}`,
  },
  sports: '/sports',
  teams: '/teams',
  events: '/events',
  matches: '/matches',
  academic: '/academic',
  scholarships: '/scholarships',
  contracts: '/contracts',
  prospects: '/prospects',
  trials: '/trials',
  documents: '/documents',
  notifications: '/notifications',
  reports: '/reports',
  newsManage: '/news/manage',
  slidesManage: '/slides/manage',
  equipment: '/equipment',
  public: {
    home: '/',
    fixtures: '/fixtures',
    results: '/results',
    sports: '/sports',
    sportDetail: (id: string) => `/sports/${id}`,
    teams: '/teams',
    teamDetail: (id: string) => `/teams/${id}`,
    events: '/events',
    eventDetail: (id: string) => `/events/${id}`,
    news: '/news',
    newsDetail: (slug: string) => `/news/${slug}`,
  },
} as const;

export const ROLE_HOME: Record<UserRole, string> = {
  TUTOR: ROUTES.dashboard,
  SPORTS_REP: ROUTES.dashboard,
};
