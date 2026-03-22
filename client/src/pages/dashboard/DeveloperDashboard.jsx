import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { projectService, taskService } from '@/services/api';
import { Card, CardBody, Badge, Spinner, Button } from '@/components/ui';
import {
  Code,
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
  GitBranch,
  Bug,
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

// Status configuration with colors for developer workflow
const STATUS_CONFIG = {
  development_pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', chartColor: '#F59E0B' },
  development_submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', chartColor: '#3B82F6' },
  development_approved: { label: 'Approved', color: 'bg-green-100 text-green-700', chartColor: '#10B981' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', chartColor: '#F59E0B' },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', chartColor: '#3B82F6' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', chartColor: '#10B981' },
  approved_by_tester: { label: 'Tester Approved', color: 'bg-purple-100 text-purple-700', chartColor: '#8B5CF6' },
  final_approved: { label: 'Completed', color: 'bg-green-100 text-green-700', chartColor: '#059669' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', chartColor: '#EF4444' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700', chartColor: '#8B5CF6' },
  todo: { label: 'To Do', color: 'bg-gray-100 text-gray-700', chartColor: '#6B7280' },
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
                <ArrowUpRight size={16} className="text-green-500" />
              ) : (
                <ArrowDownRight size={16} className="text-red-500" />
              )}
              <span className={cn('text-sm font-medium', isPositive ? 'text-green-600' : 'text-red-600')}>
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

// Task Card Component with hover effects
function TaskCard({ task, onClick }) {
  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;

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
          </div>
          <h3 className="font-semibold text-gray-900 truncate">
            {task.taskTitle || 'Development Task'}
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
          {task.taskType && (
            <Badge variant="outline" className="text-xs">
              {task.taskType.replace(/_/g, ' ')}
            </Badge>
          )}
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}

;

export default function DeveloperDashboard({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    submittedTasks: 0,
    completedTasks: 0,
    rejectedTasks: 0,
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
    const pendingTasks = taskList.filter(t =>
      ['development_pending', 'pending', 'todo'].includes(t.status)
    ).length;

    const submittedTasks = taskList.filter(t =>
      ['development_submitted', 'submitted', 'in_progress'].includes(t.status)
    ).length;

    // A task is completed for developer if:
    // 1. Status is development_approved (current stage)
    // 2. OR developmentCompletedAt is set (development was completed and task moved to next stage)
    const completedTasks = taskList.filter(t =>
      t.developmentCompletedAt ||
      ['development_approved', 'approved', 'approved_by_tester', 'final_approved'].includes(t.status)
    ).length;

    const rejectedTasks = taskList.filter(t =>
      ['rejected'].includes(t.status)
    ).length;

    setStats({
      totalTasks: taskList.length,
      pendingTasks,
      submittedTasks,
      completedTasks,
      rejectedTasks,
    });
  };

  // Prepare pie chart data for task status distribution
  const getTaskStatusData = () => {
    const data = [
      { name: 'Pending', value: stats.pendingTasks, color: '#F59E0B' },
      { name: 'In Progress', value: stats.submittedTasks, color: '#3B82F6' },
      { name: 'Completed', value: stats.completedTasks, color: '#10B981' },
      { name: 'Rejected', value: stats.rejectedTasks, color: '#EF4444' },
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

      if (['development_approved', 'approved', 'approved_by_tester', 'final_approved'].includes(task.status)) {
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

  // Get recent tasks for task overview section
  const getRecentTasks = () => {
    return [...tasks]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 6);
  };

  // Get active projects
  const getActiveProjects = () => {
    return projects
      .filter(p => p.isActive && p.status === 'active')
      .slice(0, 3);
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
  const activeProjects = getActiveProjects();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-400 to-green-600">
            <Code size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Developer Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, {user?.name?.split(' ')[0] || 'Developer'}! Here's your development work overview.
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
          title="Total Tasks"
          value={String(stats.totalTasks)}
          icon={FolderKanban}
          iconBg="bg-gradient-to-br from-green-400 to-green-600"
        />
        <StatCard
          title="Pending Development"
          value={String(stats.pendingTasks)}
          change={stats.pendingTasks > 0 ? `${stats.pendingTasks} awaiting` : null}
          changeType="neutral"
          icon={Clock}
          iconBg="bg-gradient-to-br from-yellow-400 to-yellow-600"
        />
        <StatCard
          title="In Progress"
          value={String(stats.submittedTasks)}
          change={stats.submittedTasks > 0 ? `${stats.submittedTasks} submitted` : null}
          changeType="neutral"
          icon={GitBranch}
          iconBg="bg-gradient-to-br from-blue-400 to-blue-600"
        />
        <StatCard
          title="Completed"
          value={String(stats.completedTasks)}
          change={stats.completedTasks > 0 ? '+this week' : null}
          changeType="positive"
          icon={CheckCircle}
          iconBg="bg-gradient-to-br from-emerald-400 to-emerald-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Task Status Distribution */}
        <div className="chart-container-enhanced">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600">
              <PieChartIcon size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Task Status Overview</h3>
              <p className="text-sm text-gray-500">Distribution of your tasks</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4">
            {taskStatusData.map((item, i) => (
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

          {taskStatusData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {taskStatusData.map((entry, index) => (
                      <linearGradient key={`gradient-${index}`} id={`color-${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={3}
                    stroke="#fff"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#color-${index})`} />
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
                  <div className="text-3xl font-bold text-gray-900">{stats.totalTasks}</div>
                  <div className="text-sm text-gray-500">Total Tasks</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Code className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No development tasks yet</p>
                <p className="text-sm text-gray-400 mt-1">Tasks will appear here once assigned</p>
              </div>
            </div>
          )}
        </div>

        {/* Bar Chart - Tasks per Project */}
        <div className="chart-container-enhanced">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tasks by Project</h3>
                <p className="text-sm text-gray-500">Workload distribution</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded-sm bg-gradient-to-r from-emerald-400 to-emerald-500" />
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded-sm bg-gradient-to-r from-amber-400 to-amber-500" />
              <span className="text-sm text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded-sm bg-gradient-to-r from-gray-300 to-gray-400" />
              <span className="text-sm text-gray-600">Pending</span>
            </div>
          </div>

          {tasksPerProjectData.length > 0 ? (
            <div style={{ height: `${Math.max(tasksPerProjectData.length * 50 + 40, 200)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tasksPerProjectData}
                  layout="vertical"
                  barSize={28}
                  margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="completedGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#34D399" />
                    </linearGradient>
                    <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#FBBF24" />
                    </linearGradient>
                    <linearGradient id="pendingGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#9CA3AF" />
                      <stop offset="100%" stopColor="#D1D5DB" />
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
                    width={90}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      const label = name === 'completed' ? 'Completed' : name === 'pending' ? 'Pending' : 'In Progress';
                      return [`${value} task${value !== 1 ? 's' : ''}`, label];
                    }}
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
                  <Bar dataKey="completed" stackId="a" fill="url(#completedGradient)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill="url(#pendingGradient)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <FolderKanban className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No project data available</p>
                <p className="text-sm text-gray-400 mt-1">Projects will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Overview Section */}
      <div className="chart-container-enhanced">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-400 to-green-500">
              <Code size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Recent Development Tasks</h3>
              <p className="text-sm text-gray-500">Your assigned development work</p>
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
            <Code className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Development Tasks</h4>
            <p className="text-sm text-gray-500 mb-4">
              You haven't been assigned any development tasks yet. Tasks will appear here once they're created.
            </p>
            <Button variant="outline" onClick={() => navigate('/projects')}>
              Browse Projects
            </Button>
          </div>
        )}
      </div>

      {/* Active Projects Quick View */}
      {activeProjects.length > 0 && (
        <div className="chart-container-enhanced">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500">
                <FolderKanban size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Active Projects</h3>
                <p className="text-sm text-gray-500">Projects you're assigned to</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
              View All
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeProjects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="project-card-enhanced cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {project.projectName || project.businessName}
                    </h4>
                    <p className="text-sm text-gray-500">{project.customerName}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/tasks')}
          className="p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl text-white text-left hover:shadow-lg transition-all duration-200"
        >
          <Code size={24} className="mb-2" />
          <p className="font-semibold">View All Tasks</p>
          <p className="text-sm text-white/80 mt-1">See all your development work</p>
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
          <Clock size={24} className="mb-2 text-yellow-500" />
          <p className="font-semibold">Pending Tasks</p>
          <p className="text-sm text-gray-500 mt-1">Tasks awaiting development</p>
        </button>
      </div>

      {/* Rejected Tasks Alert (if any) */}
      {stats.rejectedTasks > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-900">Rejected Tasks Need Attention</p>
              <p className="text-sm text-red-600">
                You have {stats.rejectedTasks} task{stats.rejectedTasks !== 1 ? 's' : ''} that need{stats.rejectedTasks === 1 ? 's' : ''} revision.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/tasks?status=rejected')}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            View Rejected
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}