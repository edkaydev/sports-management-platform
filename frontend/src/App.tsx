import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import AppLayout from '@/components/layout/AppLayout';
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

function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route path="/" element={<DashboardPage />} />
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
