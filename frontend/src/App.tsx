import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import AppLayout from '@/components/layout/AppLayout';
import PublicLayout from '@/components/layout/PublicLayout';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import DashboardPage from '@/pages/DashboardPage';
import AthletesPage from '@/pages/AthletesPage';
import AthleteFormPage from '@/pages/AthleteFormPage';
import AthleteDetailPage from '@/pages/AthleteDetailPage';
import SportsPage from '@/pages/SportsPage';
import TeamsPage from '@/pages/TeamsPage';
import EventsPage from '@/pages/EventsPage';
import MatchesPage from '@/pages/MatchesPage';
import AcademicPage from '@/pages/AcademicPage';
import ScholarshipsPage from '@/pages/ScholarshipsPage';
import ContractsPage from '@/pages/ContractsPage';
import ProspectsPage from '@/pages/ProspectsPage';
import TrialsPage from '@/pages/TrialsPage';
import DocumentsPage from '@/pages/DocumentsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import ReportsPage from '@/pages/ReportsPage';
import NewsManagePage from '@/pages/NewsManagePage';
import SlidesManagePage from '@/pages/SlidesManagePage';
import EquipmentPage from '@/pages/EquipmentPage';
import HomePage from '@/pages/public/HomePage';
import PublicFixturesPage from '@/pages/public/FixturesPage';
import PublicResultsPage from '@/pages/public/ResultsPage';
import PublicSportsPage from '@/pages/public/SportsPage';
import PublicSportDetailPage from '@/pages/public/SportDetailPage';
import PublicTeamsPage from '@/pages/public/TeamsPage';
import PublicTeamDetailPage from '@/pages/public/TeamDetailPage';
import PublicEventsPage from '@/pages/public/EventsPage';
import PublicEventDetailPage from '@/pages/public/EventDetailPage';
import PublicNewsPage from '@/pages/public/NewsPage';
import PublicNewsDetailPage from '@/pages/public/NewsDetailPage';

function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function TutorOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'TUTOR') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
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
      </Route>

      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/athletes" element={<AthletesPage />} />
        <Route path="/athletes/new" element={<AthleteFormPage />} />
        <Route path="/athletes/:id" element={<AthleteDetailPage />} />
        <Route path="/sports" element={<SportsPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/academic" element={<AcademicPage />} />
        <Route path="/scholarships" element={<ScholarshipsPage />} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/prospects" element={<ProspectsPage />} />
        <Route path="/trials" element={<TrialsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/news/manage" element={<NewsManagePage />} />
        <Route path="/slides/manage" element={<SlidesManagePage />} />
        <Route
          path="/equipment"
          element={
            <TutorOnly>
              <EquipmentPage />
            </TutorOnly>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
