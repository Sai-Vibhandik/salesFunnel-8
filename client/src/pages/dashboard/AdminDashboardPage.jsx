import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService, projectService, notificationService, strategyService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardBody, Spinner, Button, Badge } from '@/components/ui';
import {
  TrendingUp,
  Users,
  FolderKanban,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  MoreHorizontal,
  ChevronRight,
  UserPlus,
  Settings,
  Activity,
  Briefcase,
  X,
  Eye,
  CheckSquare,
  AlertCircle,
  Shield,
  FileText,
  Image,
  Video,
  Layout,
  Code,
  Crown,
  PieChart as PieChartIcon,
  BarChart3,
  LayoutGrid,
  List,
  Calendar,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Modal Portal Component
function ModalPortal({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

// Role icon mapping
const ROLE_ICONS = {
  admin: { icon: Crown, color: 'bg-red-100 text-red-600', gradient: 'from-red-400 to-red-600' },
  performance_marketer: { icon: TrendingUp, color: 'bg-blue-100 text-blue-600', gradient: 'from-blue-400 to-blue-600' },
  content_writer: { icon: FileText, color: 'bg-emerald-100 text-emerald-600', gradient: 'from-emerald-400 to-emerald-600' },
  graphic_designer: { icon: Image, color: 'bg-pink-100 text-pink-600', gradient: 'from-pink-400 to-pink-600' },
  video_editor: { icon: Video, color: 'bg-cyan-100 text-cyan-600', gradient: 'from-cyan-400 to-cyan-600' },
  ui_ux_designer: { icon: Layout, color: 'bg-purple-100 text-purple-600', gradient: 'from-purple-400 to-purple-600' },
  developer: { icon: Code, color: 'bg-green-100 text-green-600', gradient: 'from-green-400 to-green-600' },
  tester: { icon: CheckCircle, color: 'bg-orange-100 text-orange-600', gradient: 'from-orange-400 to-orange-600' },
};

const ROLE_LABELS = {
  admin: 'Admin',
  performance_marketer: 'Performance Marketer',
  content_writer: 'Content Writer',
  ui_ux_designer: 'UI/UX Designer',
  graphic_designer: 'Graphic Designer',
  video_editor: 'Video Editor',
  developer: 'Developer',
  tester: 'Tester',
};

const ROLE_BADGE_COLORS = {
  admin: 'bg-red-100 text-red-700',
  performance_marketer: 'bg-blue-100 text-blue-700',
  content_writer: 'bg-emerald-100 text-emerald-700',
  ui_ux_designer: 'bg-purple-100 text-purple-700',
  graphic_designer: 'bg-pink-100 text-pink-700',
  video_editor: 'bg-cyan-100 text-cyan-700',
  developer: 'bg-green-100 text-green-700',
  tester: 'bg-orange-100 text-orange-700',
};

const AVAILABILITY_COLORS = {
  available: 'bg-green-500',
  busy: 'bg-yellow-500',
  offline: 'bg-gray-400',
};

// Role Icon Component
function RoleIcon({ role, size = 'md', showLabel = false }) {
  const config = ROLE_ICONS[role] || ROLE_ICONS.admin;
  const Icon = config.icon;

  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' };
  const iconSizes = { sm: 16, md: 20, lg: 24 };

  return (
    <div className="flex items-center gap-2">
      <div className={cn(sizes[size], 'rounded-xl flex items-center justify-center', config.color)}>
        <Icon size={iconSizes[size]} />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700">
          {role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, change, changeType, icon: Icon, iconBg }) {
  const isPositive = changeType === 'positive';
  return (
    <div className="stat-card-enhanced">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <ArrowUpRight size={16} className="text-green-500" />
              ) : (
                <ArrowDownRight size={16} className="text-red-500" />
              )}
              <span className={cn('text-sm font-medium', isPositive ? 'text-green-600' : 'text-red-600')}>
                {change}
              </span>
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-2xl', iconBg)}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}

// Team Member Card — fixed grid layout for consistent role column
function TeamMemberCard({ member, onClick }) {
  const roleConfig = ROLE_ICONS[member.role] || ROLE_ICONS.admin;
  const Icon = roleConfig.icon;

  return (
    <div onClick={onClick} className="team-member-card-enhanced cursor-pointer">
      {/* Grid: avatar | name+email | role badge */}
      <div
        className="grid items-center gap-3"
        style={{ gridTemplateColumns: '48px 1fr auto' }}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
            {member.name?.charAt(0).toUpperCase()}
          </div>
          <div className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
            AVAILABILITY_COLORS[member.availability] || 'bg-gray-400'
          )} />
        </div>

        {/* Name + Email */}
        <div className="min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{member.name}</h4>
          <p className="text-sm text-gray-500 truncate">{member.email}</p>
        </div>

        {/* Role badge — always right-aligned, fixed width */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className={cn('p-1.5 rounded-lg', roleConfig.color)}>
            <Icon size={14} />
          </div>
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap',
            ROLE_BADGE_COLORS[member.role] || 'bg-gray-100 text-gray-700'
          )}>
            {ROLE_LABELS[member.role] || member.role}
          </span>
        </div>
      </div>

      {/* Specialization */}
      {member.specialization && (
        <p className="mt-2 text-xs text-gray-400 pl-[60px]">{member.specialization}</p>
      )}
    </div>
  );
}

// Project Card Component
function ProjectCard({ project, onClick }) {
  const statusColors = {
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
    archived: 'bg-gray-100 text-gray-600',
  };

  return (
    <div onClick={onClick} className="project-card-enhanced">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{project.projectName || project.businessName}</h3>
          <p className="text-sm text-gray-500">{project.customerName}</p>
        </div>
        <div className="flex items-center gap-2">
          {project.isActive ? (
            <Badge className="bg-green-100 text-green-700">Active</Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-600">Inactive</Badge>
          )}
          <Badge className={cn('text-xs', statusColors[project.status])}>
            {project.status}
          </Badge>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Progress</span>
          <span className="font-medium text-gray-900">{project.overallProgress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${project.overallProgress}%`,
              background: project.overallProgress >= 100
                ? '#10B981'
                : 'linear-gradient(90deg, #FFC107 0%, #FFD54F 100%)'
            }}
          />
        </div>
      </div>
      {project.industry && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400">Industry: {project.industry}</span>
        </div>
      )}
    </div>
  );
}

// Project Row Component for List View
function ProjectRow({ project, onClick }) {
  const statusColors = {
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
    archived: 'bg-gray-100 text-gray-600',
  };

  const statusLabels = {
    active: 'Active',
    paused: 'Paused',
    completed: 'Completed',
    archived: 'Archived',
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 truncate">{project.projectName || project.businessName}</h3>
          {project.isActive ? (
            <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
          ) : (
            <span className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">{project.customerName}</p>
      </div>
      <div className="hidden md:block w-32">
        <span className="text-sm text-gray-600">{project.industry || '-'}</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={cn('text-xs', statusColors[project.status])}>
          {statusLabels[project.status] || project.status}
        </Badge>
      </div>
      <div className="hidden lg:flex items-center gap-3 w-40">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${project.overallProgress}%`,
              background: project.overallProgress >= 100
                ? '#10B981'
                : 'linear-gradient(90deg, #FFC107 0%, #FFD54F 100%)'
            }}
          />
        </div>
        <span className="text-sm font-medium text-gray-900 w-10 text-right">{project.overallProgress}%</span>
      </div>
      <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
    </div>
  );
}

// Strategy Detail Modal Component
function StrategyDetailModal({ strategy, onClose, onReview }) {
  const [reviewing, setReviewing] = useState(false);

  const handleReview = async () => {
    try {
      setReviewing(true);
      await strategyService.markReviewed(strategy.project._id);
      toast.success('Strategy marked as reviewed');
      onReview();
    } catch (error) {
      toast.error(error.message || 'Failed to mark as reviewed');
    } finally {
      setReviewing(false);
    }
  };

  if (!strategy) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none" aria-modal="true" role="dialog">
        <div
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Strategy Review: {strategy.project.projectName || strategy.project.businessName}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Completed by: {strategy.completedBy?.name || 'Unknown'} • {formatDate(strategy.project.strategyCompletedAt)}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Stage Progress</h3>
              <div className="grid grid-cols-6 gap-2">
                {strategy.project.stageStatus?.map((stage, index) => (
                  <div key={stage.key} className="text-center">
                    <div className={cn(
                      'w-8 h-8 rounded-full mx-auto flex items-center justify-center text-sm font-medium',
                      stage.isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                    )}>
                      {stage.isCompleted ? <CheckCircle size={16} /> : index + 1}
                    </div>
                    <p className="text-xs mt-1 text-gray-500 truncate">{stage.name.split(' ')[0]}</p>
                  </div>
                ))}
              </div>
            </div>

            {strategy.stages.marketResearch?.data && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Market Research</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {strategy.stages.marketResearch.data.avatar && (
                    <>
                      <div>
                        <span className="text-gray-500">Target Audience:</span>{' '}
                        <span className="text-gray-900">
                          {strategy.stages.marketResearch.data.avatar.ageRange}, {strategy.stages.marketResearch.data.avatar.profession}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Location:</span>{' '}
                        <span className="text-gray-900">{strategy.stages.marketResearch.data.avatar.location}</span>
                      </div>
                    </>
                  )}
                </div>
                {strategy.stages.marketResearch.data.painPoints?.length > 0 && (
                  <div className="mt-2">
                    <span className="text-gray-500 text-sm">Pain Points:</span>{' '}
                    <span className="text-gray-900 text-sm">{strategy.stages.marketResearch.data.painPoints.join(', ')}</span>
                  </div>
                )}
              </div>
            )}

            {strategy.stages.offerEngineering?.data && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Offer Engineering</h4>
                <div className="text-sm text-gray-700">
                  {strategy.stages.offerEngineering.data.headline && (
                    <p><span className="text-gray-500">Headline:</span> {strategy.stages.offerEngineering.data.headline}</p>
                  )}
                  {strategy.stages.offerEngineering.data.mainOffer && (
                    <p className="mt-1"><span className="text-gray-500">Main Offer:</span> {strategy.stages.offerEngineering.data.mainOffer}</p>
                  )}
                </div>
              </div>
            )}

            {strategy.stages.trafficStrategy?.data && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Traffic Strategy</h4>
                <div className="text-sm text-gray-700">
                  {strategy.stages.trafficStrategy.data.channels && (
                    <p>
                      <span className="text-gray-500">Channels:</span>{' '}
                      {Object.entries(strategy.stages.trafficStrategy.data.channels)
                        .filter(([_, v]) => v?.enabled)
                        .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
                        .join(', ') || 'None selected'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {strategy.stages.landingPage?.data && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Landing Page</h4>
                <div className="text-sm text-gray-700">
                  {strategy.stages.landingPage.data.headline && (
                    <p><span className="text-gray-500">Headline:</span> {strategy.stages.landingPage.data.headline}</p>
                  )}
                  {strategy.stages.landingPage.data.subheadline && (
                    <p className="mt-1"><span className="text-gray-500">Subheadline:</span> {strategy.stages.landingPage.data.subheadline}</p>
                  )}
                </div>
              </div>
            )}

            {strategy.stages.creativeStrategy?.data && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Creative Strategy</h4>
                <div className="text-sm text-gray-700">
                  {strategy.stages.creativeStrategy.data.adTypes?.length > 0 && (
                    <p><span className="text-gray-500">Ad Types:</span> {strategy.stages.creativeStrategy.data.adTypes.map(at => at.typeName).join(', ')}</p>
                  )}
                  {strategy.stages.creativeStrategy.data.creativeBrief && (
                    <p className="mt-1"><span className="text-gray-500">Brief:</span> {strategy.stages.creativeStrategy.data.creativeBrief.substring(0, 100)}...</p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Assigned Team</h4>
              <div className="flex flex-wrap gap-3">
                {strategy.project.assignedTeam?.performanceMarketer && (
                  <Badge className="bg-blue-100 text-blue-700">PM: {strategy.project.assignedTeam.performanceMarketer.name}</Badge>
                )}
                {strategy.project.assignedTeam?.uiUxDesigner && (
                  <Badge className="bg-purple-100 text-purple-700">UI/UX: {strategy.project.assignedTeam.uiUxDesigner.name}</Badge>
                )}
                {strategy.project.assignedTeam?.graphicDesigner && (
                  <Badge className="bg-pink-100 text-pink-700">Design: {strategy.project.assignedTeam.graphicDesigner.name}</Badge>
                )}
                {strategy.project.assignedTeam?.developer && (
                  <Badge className="bg-green-100 text-green-700">Dev: {strategy.project.assignedTeam.developer.name}</Badge>
                )}
                {strategy.project.assignedTeam?.tester && (
                  <Badge className="bg-orange-100 text-orange-700">QA: {strategy.project.assignedTeam.tester.name}</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={handleReview} loading={reviewing}>
              <CheckSquare size={16} className="mr-2" />
              Mark as Reviewed
            </Button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

// Chart Colors
const CHART_COLORS = {
  primary: '#FFC107',
  secondary: '#FFD54F',
  success: '#10B981',
  info: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  cyan: '#06B6D4',
  orange: '#F97316',
  red: '#EF4444',
  gray: '#6B7280',
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projectViewMode, setProjectViewMode] = useState('card');
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    recentProjects: [],
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamStats, setTeamStats] = useState({ total: 0, byRole: {}, available: 0 });
  const [notifications, setNotifications] = useState([]);
  const [strategyNotifications, setStrategyNotifications] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, teamRes, notifRes] = await Promise.all([
        projectService.getDashboardStats(),
        authService.getTeamMembers(),
        notificationService.getNotifications({ limit: 10 })
      ]);

      setStats(dashboardRes.data);

      const members = teamRes.data || [];
      setTeamMembers(members);

      const teamByRole = {};
      let availableCount = 0;
      members.forEach(member => {
        teamByRole[member.role] = (teamByRole[member.role] || 0) + 1;
        if (member.availability === 'available') availableCount++;
      });

      setTeamStats({ total: members.length, byRole: teamByRole, available: availableCount });

      const allNotifications = notifRes.data || [];
      setNotifications(allNotifications);
      setStrategyNotifications(allNotifications.filter(n => n.type === 'strategy_completed'));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStrategy = async (notification) => {
    try {
      const response = await strategyService.getCompleteStrategy(notification.projectId._id);
      setSelectedStrategy(response.data);
    } catch (error) {
      toast.error('Failed to load strategy details');
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setStrategyNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  const handleStrategyReviewed = () => {
    setSelectedStrategy(null);
    fetchData();
  };

  const getTaskStatusData = () => {
    return [
      { name: 'Active Projects', value: stats.activeProjects, color: CHART_COLORS.success },
      { name: 'Completed', value: stats.completedProjects, color: CHART_COLORS.info },
      { name: 'Other', value: stats.totalProjects - stats.activeProjects - stats.completedProjects, color: CHART_COLORS.gray },
    ].filter(item => item.value > 0);
  };

  const getTeamByRoleData = () => {
    const roleLabels = {
      admin: 'Admin',
      performance_marketer: 'Marketers',
      content_writer: 'Writers',
      ui_ux_designer: 'UI/UX',
      graphic_designer: 'Designers',
      video_editor: 'Video',
      developer: 'Developers',
      tester: 'Testers',
    };
    return Object.entries(teamStats.byRole).map(([role, count]) => ({
      name: roleLabels[role] || role,
      count,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const taskStatusData = getTaskStatusData();
  const teamByRoleData = getTeamByRoleData();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user?.name?.split(' ')[0] || 'Admin'}! Here's your team overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/team')}>
            <Users size={18} className="mr-2" />
            Manage Team
          </Button>
          <Button onClick={() => navigate('/projects/new')}>
            <span className="mr-2">+</span> New Project
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Projects"
          value={String(stats.totalProjects)}
          change="+8%"
          changeType="positive"
          icon={FolderKanban}
          iconBg="bg-gradient-to-br from-primary-400 to-primary-600"
        />
        <StatCard
          title="Active Projects"
          value={String(stats.activeProjects)}
          change="+12%"
          changeType="positive"
          icon={Activity}
          iconBg="bg-gradient-to-br from-green-400 to-green-600"
        />
        <StatCard
          title="Team Members"
          value={String(teamStats.total)}
          icon={Users}
          iconBg="bg-gradient-to-br from-blue-400 to-blue-600"
        />
        <StatCard
          title="Available Members"
          value={String(teamStats.available)}
          icon={CheckCircle}
          iconBg="bg-gradient-to-br from-purple-400 to-purple-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="lg:col-span-1 chart-container-enhanced">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-400 to-primary-500">
              <PieChartIcon size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Projects Overview</h3>
              <p className="text-sm text-gray-500">Status distribution</p>
            </div>
          </div>
          {taskStatusData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-400">No project data</div>
          )}
          <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
            {taskStatusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-2 chart-container-enhanced">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Team Distribution</h3>
                <p className="text-sm text-gray-500">Members per role</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{teamStats.total}</p>
              <p className="text-sm text-gray-500">Total Members</p>
            </div>
          </div>
          {teamByRoleData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamByRoleData} layout="vertical" barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                  <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} width={90} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                    cursor={{ fill: 'rgba(255, 193, 7, 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#FFC107" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No team data available</div>
          )}
        </div>
      </div>

      {/* Projects and Team Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="chart-container-enhanced">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
                <p className="text-sm text-gray-500 mt-1">Latest project activity</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setProjectViewMode('card')}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                      projectViewMode === 'card'
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <LayoutGrid size={16} />
                    <span className="hidden sm:inline">Cards</span>
                  </button>
                  <button
                    onClick={() => setProjectViewMode('list')}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                      projectViewMode === 'list'
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <List size={16} />
                    <span className="hidden sm:inline">List</span>
                  </button>
                </div>
                <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View All
                </Link>
              </div>
            </div>

            {stats.recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <FolderKanban className="w-12 h-12 mx-auto text-gray-300" />
                <h4 className="mt-2 font-medium text-gray-900">No projects yet</h4>
                <p className="text-sm text-gray-500 mt-1">Create your first project to get started</p>
              </div>
            ) : projectViewMode === 'card' ? (
              <div className="space-y-4">
                {stats.recentProjects.slice(0, 5).map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    onClick={() => navigate(`/projects/${project._id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {stats.recentProjects.slice(0, 5).map((project) => (
                  <ProjectRow
                    key={project._id}
                    project={project}
                    onClick={() => navigate(`/projects/${project._id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team Members */}
        <div className="chart-container-enhanced">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
              <p className="text-sm text-gray-500 mt-1">Your team roster</p>
            </div>
            <button
              onClick={() => navigate('/team')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </button>
          </div>

          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-300" />
              <h4 className="mt-2 font-medium text-gray-900">No team members</h4>
              <p className="text-sm text-gray-500 mt-1">Add team members to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.slice(0, 5).map((member) => (
                <TeamMemberCard
                  key={member._id}
                  member={member}
                  onClick={() => navigate('/team')}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/projects/new')}
          className="p-4 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl text-white text-left hover:shadow-lg transition-all duration-200"
        >
          <FolderKanban size={24} className="mb-2" />
          <p className="font-semibold">Create Project</p>
          <p className="text-sm text-white/80 mt-1">Start a new client project</p>
        </button>
        <button
          onClick={() => navigate('/team')}
          className="enhanced-card p-4 text-gray-900 text-left"
        >
          <UserPlus size={24} className="mb-2 text-primary-500" />
          <p className="font-semibold">Add Team Member</p>
          <p className="text-sm text-gray-500 mt-1">Invite new members</p>
        </button>
        <button
          onClick={() => navigate('/projects')}
          className="enhanced-card p-4 text-gray-900 text-left"
        >
          <Briefcase size={24} className="mb-2 text-green-500" />
          <p className="font-semibold">All Projects</p>
          <p className="text-sm text-gray-500 mt-1">View and manage projects</p>
        </button>
      </div>

      {/* Strategy Detail Modal */}
      {selectedStrategy && (
        <StrategyDetailModal
          strategy={selectedStrategy}
          onClose={() => setSelectedStrategy(null)}
          onReview={handleStrategyReviewed}
        />
      )}
    </div>
  );
}