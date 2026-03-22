import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { projectService, taskService } from '@/services/api';
import { Card, CardBody, Badge, Spinner, Button } from '@/components/ui';
import {
  Video,
  FolderKanban,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Upload,
  ChevronRight,
  PieChart as PieChartIcon,
  BarChart3,
  AlertCircle,
  Film,
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

// Status configuration for video editor workflow
const STATUS_CONFIG = {
  design_pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', chartColor: '#F59E0B' },
  design_submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', chartColor: '#3B82F6' },
  design_approved: { label: 'Approved', color: 'bg-green-100 text-green-700', chartColor: '#10B981' },
  design_rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', chartColor: '#EF4444' },
  final_approved: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', chartColor: '#059669' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', chartColor: '#F59E0B' },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', chartColor: '#3B82F6' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', chartColor: '#10B981' },
  approved_by_tester: { label: 'Tester Approved', color: 'bg-purple-100 text-purple-700', chartColor: '#8B5CF6' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', chartColor: '#EF4444' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700', chartColor: '#8B5CF6' },
  todo: { label: 'To Do', color: 'bg-gray-100 text-gray-700', chartColor: '#6B7280' },
};


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
                <ArrowDownRight size={16} className="text-orange-500" />
              )}
              <span className={cn('text-sm font-medium', isPositive ? 'text-green-600' : 'text-orange-600')}>
                {change}
              </span>
              <span className="text-xs text-gray-400">vs last week</span>
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

// Task Card Component
function TaskCard({ task, onClick }) {
  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const videoTypeLabels = {
    VIDEO: 'Video',
    REEL: 'Reel',
    TESTIMONIAL: 'Testimonial',
    UGC: 'UGC',
    DEMO: 'Demo',
  };

  return (
    <div
      onClick={onClick}
      className="project-card-enhanced cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
            {task.creativeType && (
              <Badge variant="outline" className="text-xs">
                {videoTypeLabels[task.creativeType] || task.creativeType}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 truncate">
            {task.creativeName || task.taskTitle || 'Video Task'}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {task.projectId?.projectName || task.projectId?.businessName || 'Unknown Project'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{formatDate(task.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}

export default function VideoEditorDashboard({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingEdits: 0,
    submittedEdits: 0,
    approvedEdits: 0,
    rejectedEdits: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch tasks and projects in parallel
      const [tasksRes, projectsRes] = await Promise.all([
        taskService.getMyRoleTasks ? taskService.getMyRoleTasks() : taskService.getMyTasks(),
        projectService.getProjects({ limit: 50 }),
      ]);

      const assignedTasks = tasksRes.data || [];
      const assignedProjects = projectsRes.data || [];

      setTasks(assignedTasks);
      setProjects(assignedProjects);
      calculateStats(assignedTasks);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setTasks([]);
      setProjects([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (taskList) => {
    const pendingEdits = taskList.filter(t =>
      ['design_pending', 'pending', 'todo'].includes(t.status)
    ).length;

    const submittedEdits = taskList.filter(t =>
      ['design_submitted', 'submitted', 'in_progress'].includes(t.status)
    ).length;

    // A task is completed for video editor if:
    // 1. Status is design_approved (current stage)
    // 2. OR designCompletedAt is set (video edit was completed and task moved to next stage)
    const approvedEdits = taskList.filter(t =>
      t.designCompletedAt ||
      ['design_approved', 'approved', 'approved_by_tester', 'final_approved'].includes(t.status)
    ).length;

    const rejectedEdits = taskList.filter(t =>
      ['design_rejected', 'rejected'].includes(t.status)
    ).length;

    setStats({
      totalTasks: taskList.length,
      pendingEdits,
      submittedEdits,
      approvedEdits,
      rejectedEdits,
    });
  };

  // Prepare pie chart data for video status
  const getTaskStatusData = () => {
    const data = [
      { name: 'Pending', value: stats.pendingEdits, color: '#F59E0B' },
      { name: 'In Review', value: stats.submittedEdits, color: '#3B82F6' },
      { name: 'Approved', value: stats.approvedEdits, color: '#10B981' },
      { name: 'Rejected', value: stats.rejectedEdits, color: '#EF4444' },
    ];
    return data.filter(item => item.value > 0);
  };

  // Prepare bar chart data - tasks per project
  const getTasksPerProjectData = () => {
    const projectTaskCount = {};

    // Group tasks by project and count
    tasks.forEach(task => {
      const projectId = task.projectId?._id || task.projectId;
      const projectName = task.projectId?.projectName || task.projectId?.businessName || 'Unknown';

      if (!projectTaskCount[projectId]) {
        projectTaskCount[projectId] = {
          name: projectName.length > 15 ? projectName.substring(0, 15) + '...' : projectName,
          fullName: projectName,
          total: 0,
          completed: 0,
        };
      }

      projectTaskCount[projectId].total++;

      if (['design_approved', 'approved', 'approved_by_tester', 'final_approved'].includes(task.status)) {
        projectTaskCount[projectId].completed++;
      }
    });

    // Convert to array and limit to top 5 projects
    return Object.values(projectTaskCount)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(item => ({
        name: item.name,
        fullName: item.fullName,
        completed: item.completed,
        pending: item.total - item.completed,
      }));
  };

  // Get recent tasks
  const getRecentTasks = () => {
    return [...tasks]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 6);
  };

  // Get tasks needing attention
  const getTasksNeedingAttention = () => {
    return tasks.filter(t =>
      ['design_rejected', 'rejected', 'design_pending', 'pending'].includes(t.status)
    ).slice(0, 3);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const taskStatusData = getTaskStatusData();
  const tasksPerProjectData = getTasksPerProjectData();
  const recentTasks = getRecentTasks();
  const needsAttention = getTasksNeedingAttention();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600">
            <Video size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Video Editor Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, {user?.name?.split(' ')[0] || 'Editor'}! Here's your video editing overview.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/projects')}>
            <FolderKanban size={18} className="mr-2" />
            Projects
          </Button>
          <Button onClick={() => navigate('/tasks')}>
            <Clock size={18} className="mr-2" />
            My Tasks
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Videos"
          value={String(stats.totalTasks)}
          icon={Film}
          iconBg="bg-gradient-to-br from-cyan-400 to-cyan-600"
        />
        <StatCard
          title="Pending Edits"
          value={String(stats.pendingEdits)}
          change={stats.pendingEdits > 0 ? `${stats.pendingEdits} awaiting` : null}
          changeType="neutral"
          icon={Clock}
          iconBg="bg-gradient-to-br from-yellow-400 to-yellow-600"
        />
        <StatCard
          title="In Review"
          value={String(stats.submittedEdits)}
          change={stats.submittedEdits > 0 ? 'Being reviewed' : null}
          changeType="neutral"
          icon={Send}
          iconBg="bg-gradient-to-br from-blue-400 to-blue-600"
        />
        <StatCard
          title="Approved"
          value={String(stats.approvedEdits)}
          change={stats.approvedEdits > 0 ? '+this week' : null}
          changeType="positive"
          icon={CheckCircle}
          iconBg="bg-gradient-to-br from-green-400 to-green-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart - Video Status */}
        <div className="lg:col-span-1 chart-container-enhanced">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-500">
              <PieChartIcon size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Video Progress</h3>
              <p className="text-sm text-gray-500">Status distribution</p>
            </div>
          </div>

          {/* Custom legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
            {taskStatusData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-500">{item.name}</span>
                <span className="text-xs font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>

          {taskStatusData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      padding: '10px 14px',
                      fontSize: '13px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-sm text-gray-400">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No video tasks yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Bar Chart - Tasks per Project */}
        <div className="lg:col-span-2 chart-container-enhanced">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tasks by Project</h3>
                <p className="text-sm text-gray-500">Completed vs pending</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-500" />
                <span className="text-xs text-gray-500">Approved</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-yellow-500" />
                <span className="text-xs text-gray-500">Pending</span>
              </div>
            </div>
          </div>

          {tasksPerProjectData.length > 0 ? (
            <div style={{ height: `${Math.max(tasksPerProjectData.length * 42 + 60, 180)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tasksPerProjectData}
                  layout="vertical"
                  barSize={22}
                  margin={{ left: 0, right: 28, top: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    horizontal={false}
                    vertical={true}
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    width={100}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      const label = name === 'completed' ? 'Approved' : 'Pending';
                      return [`${value} task${value !== 1 ? 's' : ''}`, label];
                    }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      padding: '10px 14px',
                      fontSize: '13px',
                    }}
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  />
                  <Bar dataKey="completed" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill="#F59E0B" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              <div className="text-center">
                <FolderKanban className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No project data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tasks Needing Attention */}
      {needsAttention.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-amber-900">Tasks Needing Attention</h3>
              <p className="text-sm text-amber-600">
                {stats.rejectedEdits > 0 ? `${stats.rejectedEdits} rejected, ` : ''}
                {stats.pendingEdits} pending video edits
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {needsAttention.map((task) => (
              <div
                key={task._id}
                onClick={() => navigate(`/tasks/${task._id}`)}
                className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={STATUS_CONFIG[task.status]?.color || 'bg-gray-100 text-gray-700'}>
                    {STATUS_CONFIG[task.status]?.label || task.status}
                  </Badge>
                </div>
                <p className="font-medium text-gray-900 text-sm truncate">
                  {task.creativeName || task.taskTitle}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {task.projectId?.projectName || task.projectId?.businessName}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Overview Section */}
      <div className="chart-container-enhanced">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-500">
              <Video size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Recent Video Tasks</h3>
              <p className="text-sm text-gray-500">Your editing assignments</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/tasks')}>
            View All Tasks
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>

        {recentTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => navigate(`/tasks/${task._id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Video className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Video Tasks</h4>
            <p className="text-sm text-gray-500 mb-4">
              You haven't been assigned any video tasks yet. Tasks will appear here once they're created.
            </p>
            <Button variant="outline" onClick={() => navigate('/projects')}>
              Browse Projects
            </Button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/tasks')}
          className="p-4 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl text-white text-left hover:shadow-lg transition-all duration-200"
        >
          <Film size={24} className="mb-2" />
          <p className="font-semibold">View All Tasks</p>
          <p className="text-sm text-white/80 mt-1">See all your video assignments</p>
        </button>
        <button
          onClick={() => navigate('/projects')}
          className="enhanced-card p-4 text-gray-900 text-left"
        >
          <FolderKanban size={24} className="mb-2 text-primary-500" />
          <p className="font-semibold">My Projects</p>
          <p className="text-sm text-gray-500 mt-1">View assigned projects</p>
        </button>
        <button
          onClick={() => navigate('/tasks?status=pending')}
          className="enhanced-card p-4 text-gray-900 text-left"
        >
          <Upload size={24} className="mb-2 text-yellow-500" />
          <p className="font-semibold">Upload Video</p>
          <p className="text-sm text-gray-500 mt-1">Submit your video edits</p>
        </button>
      </div>

      {/* Rejected Videos Alert */}
      {stats.rejectedEdits > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-900">Videos Need Revision</p>
              <p className="text-sm text-red-600">
                You have {stats.rejectedEdits} video{stats.rejectedEdits !== 1 ? 's' : ''} that need{stats.rejectedEdits === 1 ? 's' : ''} revision.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/tasks?status=rejected')}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            View Revisions
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}