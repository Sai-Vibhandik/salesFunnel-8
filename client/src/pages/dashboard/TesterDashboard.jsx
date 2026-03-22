import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { projectService, taskService } from '@/services/api';
import { Card, CardBody, Badge, Spinner, Button } from '@/components/ui';
import {
  Bug,
  FolderKanban,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ChevronRight,
  PieChart as PieChartIcon,
  BarChart3,
  AlertCircle,
  ClipboardCheck,
  Hourglass,
  AlertTriangle,
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
  ResponsiveContainer,
} from 'recharts';

// Status configuration for tasks in review
const STATUS_CONFIG = {
  submitted: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700', chartColor: '#F59E0B' },
  design_submitted: { label: 'Design Review', color: 'bg-yellow-100 text-yellow-700', chartColor: '#F59E0B' },
  content_submitted: { label: 'Content Review', color: 'bg-orange-100 text-orange-700', chartColor: '#F97316' },
  development_submitted: { label: 'Dev Review', color: 'bg-blue-100 text-blue-700', chartColor: '#3B82F6' },
  approved_by_tester: { label: 'Approved', color: 'bg-green-100 text-green-700', chartColor: '#10B981' },
  final_approved: { label: 'Final Approved', color: 'bg-emerald-100 text-emerald-700', chartColor: '#059669' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', chartColor: '#EF4444' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700', chartColor: '#8B5CF6' },
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700', chartColor: '#6B7280' },
};

// Task type labels
const TASK_TYPE_LABELS = {
  graphic_design: 'Graphic Design',
  video_editing: 'Video Editing',
  content_writing: 'Content Writing',
  content_creation: 'Content Creation',
  landing_page_design: 'Landing Page Design',
  landing_page_development: 'Landing Page Dev',
};

// Stat Card Component (matching Admin dashboard style)
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
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <Hourglass size={16} className="text-orange-500" />
              )}
              <span className={cn('text-sm font-medium', isPositive ? 'text-green-600' : 'text-orange-600')}>
                {change}
              </span>
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

// Review Task Card Component
function ReviewTaskCard({ task, onReview }) {
  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const taskType = TASK_TYPE_LABELS[task.taskType] || task.taskType?.replace(/_/g, ' ') || 'Task';

  return (
    <div className="project-card-enhanced">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {taskType}
            </Badge>
          </div>
          <h3 className="font-semibold text-gray-900 truncate">
            {task.creativeName || task.taskTitle || 'Review Task'}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {task.projectId?.projectName || task.projectId?.businessName || 'Unknown Project'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock size={14} />
          <span>{formatDate(task.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReview(task)}
          >
            <Eye size={14} className="mr-1" />
            Review
          </Button>
        </div>
      </div>
    </div>
  );
}

// Reviewed Task Card Component
function ReviewedTaskCard({ task }) {
  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const isApproved = ['approved_by_tester', 'final_approved', 'approved'].includes(task.status);
  const taskType = TASK_TYPE_LABELS[task.taskType] || task.taskType?.replace(/_/g, ' ') || 'Task';

  return (
    <div className="project-card-enhanced">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {taskType}
            </Badge>
          </div>
          <h3 className="font-semibold text-gray-900 truncate">
            {task.creativeName || task.taskTitle || 'Task'}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {task.projectId?.projectName || task.projectId?.businessName || 'Unknown Project'}
          </p>
        </div>
        <div className="flex-shrink-0">
          {isApproved ? (
            <CheckCircle size={20} className="text-green-500" />
          ) : (
            <XCircle size={20} className="text-red-500" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{formatDate(task.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {}}
            className="text-gray-500"
          >
            View Details
            <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function TesterDashboard({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingReview, setPendingReview] = useState([]);
  const [recentlyReviewed, setRecentlyReviewed] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalReviewed: 0,
    approvedCount: 0,
    rejectedCount: 0,
    myAssignedTasks: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch pending review tasks, my tasks, and projects in parallel
      const [pendingRes, myTasksRes, projectsRes] = await Promise.all([
        taskService.getPendingReview(),
        taskService.getMyRoleTasks ? taskService.getMyRoleTasks() : taskService.getMyTasks(),
        projectService.getProjects({ limit: 50 }),
      ]);

      const pendingTasks = pendingRes.data || [];
      const assignedTasks = myTasksRes.data || [];
      const allProjects = projectsRes.data || [];

      setPendingReview(pendingTasks);
      setMyTasks(assignedTasks);
      setProjects(allProjects);

      const reviewed = pendingTasks.filter(t =>
        ['approved_by_tester', 'approved', 'rejected'].includes(t.status)
      ).slice(0, 5);
      setRecentlyReviewed(reviewed);
      calculateStats(pendingTasks, reviewed, assignedTasks);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setPendingReview([]);
      setMyTasks([]);
      setProjects([]);
      setRecentlyReviewed([]);
      calculateStats([], [], []);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (pending, reviewed, assigned) => {
    const totalPending = pending.filter(t =>
      ['submitted', 'design_submitted', 'content_submitted', 'development_submitted'].includes(t.status)
    ).length;

    const approvedCount = reviewed.filter(t =>
      ['approved_by_tester', 'approved'].includes(t.status)
    ).length;

    const rejectedCount = reviewed.filter(t =>
      t.status === 'rejected'
    ).length;

    setStats({
      totalPending,
      totalReviewed: reviewed.length,
      approvedCount,
      rejectedCount,
      myAssignedTasks: assigned.length,
    });
  };

  // Prepare pie chart data for review status distribution
  const getReviewStatusData = () => {
    const pending = stats.totalPending;
    const approved = stats.approvedCount;
    const rejected = stats.rejectedCount;

    const data = [
      { name: 'Pending Review', value: pending, color: '#F59E0B' },
      { name: 'Approved', value: approved, color: '#10B981' },
      { name: 'Rejected', value: rejected, color: '#EF4444' },
    ];
    return data.filter(item => item.value > 0);
  };

  // Prepare bar chart data - tasks by type pending review
  const getTasksByTypeData = () => {
    const typeCount = {};

    pendingReview.forEach(task => {
      const type = task.taskType || task.creativeType || 'other';
      const label = TASK_TYPE_LABELS[type] || type.replace(/_/g, ' ');

      if (!typeCount[label]) {
        typeCount[label] = {
          name: label.length > 12 ? label.substring(0, 12) + '...' : label,
          fullName: label,
          count: 0,
        };
      }
      typeCount[label].count++;
    });

    return Object.values(typeCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  };

  // Get pending review tasks grouped by type
  const getPendingByType = () => {
    const grouped = {};
    pendingReview.forEach(task => {
      const type = task.taskType || task.creativeType || 'other';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(task);
    });
    return grouped;
  };

  // Handle review action
  const handleReview = (task) => {
    navigate('/tasks/review', { state: { taskId: task._id } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const reviewStatusData = getReviewStatusData();
  const tasksByTypeData = getTasksByTypeData();
  const pendingByType = getPendingByType();
  const pendingTasks = pendingReview.filter(t =>
    ['submitted', 'design_submitted', 'content_submitted', 'development_submitted'].includes(t.status)
  ).slice(0, 6);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600">
            <Bug size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tester Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, {user?.name?.split(' ')[0] || 'Tester'}! Review and approve submitted work.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/projects')}>
            <FolderKanban size={18} className="mr-2" />
            Projects
          </Button>
          <Button onClick={() => navigate('/tasks/review')} className="relative">
            <ClipboardCheck size={18} className="mr-2" />
            Review Queue
            {stats.totalPending > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {stats.totalPending > 9 ? '9+' : stats.totalPending}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Review"
          value={String(stats.totalPending)}
          change={stats.totalPending > 0 ? 'Needs attention' : null}
          changeType="neutral"
          icon={Hourglass}
          iconBg="bg-gradient-to-br from-orange-400 to-orange-600"
        />
        <StatCard
          title="Approved This Week"
          value={String(stats.approvedCount)}
          change={stats.approvedCount > 0 ? 'Approved' : null}
          changeType="positive"
          icon={CheckCircle}
          iconBg="bg-gradient-to-br from-green-400 to-green-600"
        />
        <StatCard
          title="Rejected This Week"
          value={String(stats.rejectedCount)}
          icon={XCircle}
          iconBg="bg-gradient-to-br from-red-400 to-red-600"
        />
        <StatCard
          title="My Assigned Tasks"
          value={String(stats.myAssignedTasks)}
          icon={ClipboardCheck}
          iconBg="bg-gradient-to-br from-blue-400 to-blue-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Review Status Distribution */}
        <div className="chart-container-enhanced">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600">
              <PieChartIcon size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Review Status</h3>
              <p className="text-sm text-gray-500">Distribution overview</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4">
            {reviewStatusData.map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="text-sm font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>

          {reviewStatusData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {reviewStatusData.map((entry, index) => (
                      <linearGradient key={`gradient-${index}`} id={`color-orange-${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={reviewStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={3}
                    stroke="#fff"
                  >
                    {reviewStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#color-orange-${index})`} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} task${value !== 1 ? 's' : ''}`, name]}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                      padding: '12px 16px',
                      fontSize: '14px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-10px' }}>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{stats.totalPending + stats.approvedCount + stats.rejectedCount}</div>
                  <div className="text-sm text-gray-500">Total Reviews</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <ClipboardCheck className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No review data yet</p>
                <p className="text-sm text-gray-400 mt-1">Tasks will appear here for review</p>
              </div>
            </div>
          )}
        </div>

        {/* Bar Chart - Tasks by Type */}
        <div className="chart-container-enhanced">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pending by Task Type</h3>
                <p className="text-sm text-gray-500">Tasks awaiting review</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">{stats.totalPending}</div>
              <div className="text-xs text-gray-500">Total pending</div>
            </div>
          </div>

          {tasksByTypeData.length > 0 ? (
            <div style={{ height: `${Math.max(tasksByTypeData.length * 50 + 40, 200)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tasksByTypeData}
                  layout="vertical"
                  barSize={28}
                  margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="barGradient1" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#FBBF24" />
                    </linearGradient>
                    <linearGradient id="barGradient2" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#60A5FA" />
                    </linearGradient>
                    <linearGradient id="barGradient3" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#34D399" />
                    </linearGradient>
                    <linearGradient id="barGradient4" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#A78BFA" />
                    </linearGradient>
                    <linearGradient id="barGradient5" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#EC4899" />
                      <stop offset="100%" stopColor="#F472B6" />
                    </linearGradient>
                    <linearGradient id="barGradient6" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#06B6D4" />
                      <stop offset="100%" stopColor="#22D3EE" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="#f0f0f0"
                    horizontal={false}
                    vertical={true}
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                    width={120}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} task${value !== 1 ? 's' : ''}`, 'Pending']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                      padding: '12px 16px',
                      fontSize: '14px',
                    }}
                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {tasksByTypeData.map((entry, index) => {
                      const gradients = ['barGradient1', 'barGradient2', 'barGradient3', 'barGradient4', 'barGradient5', 'barGradient6'];
                      return <Cell key={`bar-${index}`} fill={`url(#${gradients[index % gradients.length]})`} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-gray-500 font-medium">All caught up!</p>
                <p className="text-sm text-gray-400 mt-1">No pending reviews</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pending Review Section */}
      <div className="chart-container-enhanced">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Tasks Pending Review</h3>
              <p className="text-sm text-gray-500">Work submitted and awaiting your approval</p>
            </div>
            {stats.totalPending > 0 && (
              <Badge className="ml-2 bg-yellow-100 text-yellow-700">
                {stats.totalPending} pending
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/tasks/review')}>
            View All
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>

        {pendingTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingTasks.map((task) => (
              <ReviewTaskCard
                key={task._id}
                task={task}
                onReview={handleReview}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h4>
            <p className="text-sm text-gray-500 mb-4">
              No tasks pending review. Great job staying on top of things!
            </p>
            <Button variant="outline" onClick={() => navigate('/tasks')}>
              View All Tasks
            </Button>
          </div>
        )}
      </div>

      {/* Recently Reviewed Section */}
      {recentlyReviewed.length > 0 && (
        <div className="chart-container-enhanced">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-400 to-green-500">
                <CheckCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Recently Reviewed</h3>
                <p className="text-sm text-gray-500">Your recent review activity</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentlyReviewed.slice(0, 6).map((task) => (
              <ReviewedTaskCard
                key={task._id}
                task={task}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/tasks/review')}
          className="p-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl text-white text-left hover:shadow-lg transition-all duration-200"
        >
          <ClipboardCheck size={24} className="mb-2" />
          <p className="font-semibold">Review Queue</p>
          <p className="text-sm text-white/80 mt-1">Approve or reject submitted work</p>
          {stats.totalPending > 0 && (
            <Badge className="mt-2 bg-white/20 text-white">
              {stats.totalPending} pending
            </Badge>
          )}
        </button>
        <button
          onClick={() => navigate('/tasks')}
          className="enhanced-card p-4 text-gray-900 text-left"
        >
          <Bug size={24} className="mb-2 text-primary-500" />
          <p className="font-semibold">My Tasks</p>
          <p className="text-sm text-gray-500 mt-1">View your assigned tasks</p>
        </button>
        <button
          onClick={() => navigate('/projects')}
          className="enhanced-card p-4 text-gray-900 text-left"
        >
          <FolderKanban size={24} className="mb-2 text-green-500" />
          <p className="font-semibold">All Projects</p>
          <p className="text-sm text-gray-500 mt-1">Browse project overview</p>
        </button>
      </div>

      {/* Alert for high pending count */}
      {stats.totalPending > 5 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-orange-900">High Review Queue</p>
              <p className="text-sm text-orange-600">
                You have {stats.totalPending} tasks waiting for review. Consider prioritizing your review queue.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/tasks/review')}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            Start Reviewing
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}