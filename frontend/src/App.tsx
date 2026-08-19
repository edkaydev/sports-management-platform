import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageLoader } from '@/components/PageLoader';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));

const ForbiddenPage = lazy(() => import('./pages/errors/ForbiddenPage').then(m => ({ default: m.ForbiddenPage })));
const UnauthorizedPage = lazy(() => import('./pages/errors/UnauthorizedPage').then(m => ({ default: m.UnauthorizedPage })));
const NotFoundErrorPage = lazy(() => import('./pages/errors/NotFoundErrorPage').then(m => ({ default: m.NotFoundErrorPage })));
const ServerErrorPage = lazy(() => import('./pages/errors/ServerErrorPage').then(m => ({ default: m.ServerErrorPage })));

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AthletesPage = lazy(() => import('./pages/AthletesPage'));
const AthleteFormPage = lazy(() => import('./pages/AthleteFormPage'));
const AthleteDetailPage = lazy(() => import('./pages/AthleteDetailPage'));
const SportsAdminPage = lazy(() => import('./pages/SportsPage'));
const TeamsPage = lazy(() => import('./pages/TeamsPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const MatchesPage = lazy(() => import('./pages/MatchesPage'));
const AcademicPage = lazy(() => import('./pages/AcademicPage'));
const ScholarshipsPage = lazy(() => import('./pages/ScholarshipsPage'));
const ContractsPage = lazy(() => import('./pages/ContractsPage'));
const ProspectsPage = lazy(() => import('./pages/ProspectsPage'));
const TrialsPage = lazy(() => import('./pages/TrialsPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const NewsManagePage = lazy(() => import('./pages/NewsManagePage'));
const SlidesManagePage = lazy(() => import('./pages/SlidesManagePage'));
const EquipmentPage = lazy(() => import('./pages/EquipmentPage'));
const TournamentCreatePage = lazy(() => import('./pages/TournamentCreatePage'));

const HomePage = lazy(() => import('./pages/public/HomePage'));
const PublicFixturesPage = lazy(() => import('./pages/public/FixturesPage'));
const PublicResultsPage = lazy(() => import('./pages/public/ResultsPage'));
const PublicSportsPage = lazy(() => import('./pages/public/SportsPage'));
const PublicSportDetailPage = lazy(() => import('./pages/public/SportDetailPage'));
const PublicTeamsPage = lazy(() => import('./pages/public/TeamsPage'));
const PublicTeamDetailPage = lazy(() => import('./pages/public/TeamDetailPage'));
const PublicEventsPage = lazy(() => import('./pages/public/EventsPage'));
const PublicEventDetailPage = lazy(() => import('./pages/public/EventDetailPage'));
const PublicNewsPage = lazy(() => import('./pages/public/NewsPage'));
const PublicNewsDetailPage = lazy(() => import('./pages/public/NewsDetailPage'));

const ProtectedLayout = (
  <ErrorBoundary>
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  </ErrorBoundary>
);

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/change-password" element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          } />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="/not-found" element={<NotFoundErrorPage />} />
          <Route path="/server-error" element={<ServerErrorPage />} />

          <Route path="/" element={<HomePage />} />
          <Route path="/fixtures" element={<PublicFixturesPage />} />
          <Route path="/results" element={<PublicResultsPage />} />
          <Route path="/sports" element={<PublicSportsPage />} />
          <Route path="/sports/:id" element={<PublicSportDetailPage />} />
          <Route path="/teams" element={<PublicTeamsPage />} />
          <Route path="/teams/:id" element={<PublicTeamDetailPage />} />
          <Route path="/events" element={<PublicEventsPage />} />
          <Route path="/events/:id" element={<PublicEventDetailPage />} />
          <Route path="/news" element={<PublicNewsPage />} />
          <Route path="/news/:slug" element={<PublicNewsDetailPage />} />

          <Route path="/dashboard" element={ProtectedLayout}>
            <Route index element={<DashboardPage />} />
          </Route>

          <Route path="/athletes" element={ProtectedLayout}>
            <Route index element={<AthletesPage />} />
            <Route path="new" element={<AthleteFormPage />} />
            <Route path=":id" element={<AthleteDetailPage />} />
          </Route>

          <Route path="/sports-admin" element={ProtectedLayout}>
            <Route index element={<SportsAdminPage />} />
          </Route>

          <Route path="/teams-admin" element={ProtectedLayout}>
            <Route index element={<TeamsPage />} />
          </Route>

          <Route path="/events-admin" element={ProtectedLayout}>
            <Route index element={<EventsPage />} />
          </Route>

          <Route path="/tournaments/new" element={ProtectedLayout}>
            <Route index element={<TournamentCreatePage />} />
          </Route>

          <Route path="/matches" element={ProtectedLayout}>
            <Route index element={<MatchesPage />} />
          </Route>

          <Route path="/academic" element={ProtectedLayout}>
            <Route index element={<AcademicPage />} />
          </Route>

          <Route path="/scholarships" element={ProtectedLayout}>
            <Route index element={<ScholarshipsPage />} />
          </Route>

          <Route path="/contracts" element={ProtectedLayout}>
            <Route index element={<ContractsPage />} />
          </Route>

          <Route path="/prospects" element={ProtectedLayout}>
            <Route index element={<ProspectsPage />} />
          </Route>

          <Route path="/trials" element={ProtectedLayout}>
            <Route index element={<TrialsPage />} />
          </Route>

          <Route path="/documents" element={ProtectedLayout}>
            <Route index element={<DocumentsPage />} />
          </Route>

          <Route path="/notifications" element={ProtectedLayout}>
            <Route index element={<NotificationsPage />} />
          </Route>

          <Route path="/reports" element={ProtectedLayout}>
            <Route index element={<ReportsPage />} />
          </Route>

          <Route path="/news/manage" element={ProtectedLayout}>
            <Route index element={<NewsManagePage />} />
          </Route>

          <Route path="/slides/manage" element={ProtectedLayout}>
            <Route index element={<SlidesManagePage />} />
          </Route>

          <Route path="/equipment" element={ProtectedLayout}>
            <Route index element={<EquipmentPage />} />
          </Route>

          <Route path="*" element={<NotFoundErrorPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
