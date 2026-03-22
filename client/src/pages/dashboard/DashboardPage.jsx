import { useAuth } from '@/context/AuthContext';
import AdminDashboardPage from './AdminDashboardPage';
import PerformanceMarketerDashboard from './PerformanceMarketerDashboard';
import TeamMemberDashboard from './TeamMemberDashboard';

// Main Dashboard Page - Routes to role-specific dashboard
export default function DashboardPage() {
  const { user } = useAuth();

  // Route to appropriate dashboard based on role
  switch (user?.role) {
    case 'admin':
      return <AdminDashboardPage />;
    case 'performance_marketer':
      return <PerformanceMarketerDashboard user={user} />;
    case 'content_writer':
    case 'video_editor':
    case 'ui_ux_designer':
    case 'graphic_designer':
    case 'developer':
    case 'tester':
      return <TeamMemberDashboard user={user} />;
    default:
      // Fallback to team member dashboard for unknown team roles
      return <TeamMemberDashboard user={user} />;
  }
}