import { useAuth } from '@/context/AuthContext';
import AdminDashboardPage from './AdminDashboardPage';
import PerformanceMarketerDashboard from './PerformanceMarketerDashboard';
import TeamMemberDashboard from './TeamMemberDashboard';
import GraphicDesignerDashboard from './GraphicDesignerDashboard';
import DeveloperDashboard from './DeveloperDashboard';
import TesterDashboard from './TesterDashboard';
import ContentWriterDashboard from './ContentWriterDashboard';
import UIDesignerDashboard from './UIDesignerDashboard';
import VideoEditorDashboard from './VideoEditorDashboard';

// Main Dashboard Page - Routes to role-specific dashboard
export default function DashboardPage() {
  const { user } = useAuth();

  // Route to appropriate dashboard based on role
  switch (user?.role) {
    case 'admin':
      return <AdminDashboardPage />;
    case 'performance_marketer':
      return <PerformanceMarketerDashboard user={user} />;
    case 'graphic_designer':
      return <GraphicDesignerDashboard user={user} />;
    case 'developer':
      return <DeveloperDashboard user={user} />;
    case 'tester':
      return <TesterDashboard user={user} />;
    case 'content_writer':
    case 'content_creator':
      return <ContentWriterDashboard user={user} />;
    case 'ui_ux_designer':
      return <UIDesignerDashboard user={user} />;
    case 'video_editor':
      return <VideoEditorDashboard user={user} />;
    default:
      // Fallback to team member dashboard for unknown team roles
      return <TeamMemberDashboard user={user} />;
  }
}