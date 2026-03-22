import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { projectService, taskService } from '@/services/api';
import { Card, CardBody, Button, Badge, Spinner } from '@/components/ui';
import {
  FileText,
  Clock,
  Play,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Send,
  Eye,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  FolderOpen
} from 'lucide-react';
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
  Legend
} from 'recharts';
import { formatDate } from '@/lib/utils';

const STATUS_COLORS = {
  content_pending: '#F97316',
  content_submitted: '#FBBF24',
  content_final_approved: '#10B981',
  content_rejected: '#EF4444',
  approved_by_tester: '#8B5CF6',
  final_approved: '#10B981',
  rejected: '#EF4444',
  pending: '#F97316',
  todo: '#6B7280',
  in_progress: '#3B82F6'
};

const STATUS_CONFIG = {
  content_pending: { label: 'Content Pending', color: 'bg-orange-100 text-orange-800' },
  content_submitted: { label: 'Content Review', color: 'bg-yellow-100 text-yellow-800' },
  content_approved: { label: 'Content Approved', color: 'bg-purple-100 text-purple-800' },
  content_final_approved: { label: 'Final Approved', color: 'bg-green-100 text-green-800' },
  content_rejected: { label: 'Content Rejected', color: 'bg-red-100 text-red-800' },
  pending: { label: 'Pending', color: 'bg-orange-100 text-orange-800' },
  todo: { label: 'To Do', color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  submitted: { label: 'Submitted', color: 'bg-yellow-100 text-yellow-800' },
  approved_by_tester: { label: 'Tester Approved', color: 'bg-purple-100 text-purple-800' },
  final_approved: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
};

const TASK_TYPE_CONFIG = {
  content_creation: { label: 'Content Creation', icon: FileText, color: 'emerald' }
};

export default function ContentWriterDashboard({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [chartData, setChartData] = useState({
    pieData: [],
    barData: []
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    submitted: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user?.role]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch projects
      const projectsRes = await projectService.getProjects({ limit: 50 });
      const assignedProjects = projectsRes.data || [];
      setProjects(assignedProjects);

      // Fetch tasks - use my-role-tasks for content_writer
      const tasksRes = taskService.getMyRoleTasks
        ? await taskService.getMyRoleTasks()
        : await taskService.getMyTasks();
      const assignedTasks = tasksRes.data || [];
      setTasks(assignedTasks);

      // Process data for charts
      processChartData(assignedTasks);

      // Calculate stats
      const pending = assignedTasks.filter(t =>
        ['content_pending', 'pending', 'todo'].includes(t.status)
      ).length;
      const submitted = assignedTasks.filter(t =>
        ['content_submitted', 'submitted', 'in_progress'].includes(t.status)
      ).length;
      const approved = assignedTasks.filter(t =>
        ['content_final_approved', 'final_approved', 'content_approved', 'approved_by_tester'].includes(t.status)
      ).length;
      const rejected = assignedTasks.filter(t =>
        ['content_rejected', 'rejected'].includes(t.status)
      ).length;

      setStats({
        total: assignedTasks.length,
        pending,
        submitted,
        approved,
        rejected
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (taskList) => {
    // Pie chart data - task distribution by status
    const statusCounts = {
      'Content Pending': 0,
      'Content Submitted': 0,
      'Approved': 0,
      'Rejected': 0
    };

    taskList.forEach(task => {
      const status = task.status;
      if (['content_pending', 'pending', 'todo'].includes(status)) {
        statusCounts['Content Pending']++;
      } else if (['content_submitted', 'submitted', 'in_progress'].includes(status)) {
        statusCounts['Content Submitted']++;
      } else if (['content_final_approved', 'final_approved', 'content_approved', 'approved_by_tester'].includes(status)) {
        statusCounts['Approved']++;
      } else if (['content_rejected', 'rejected'].includes(status)) {
        statusCounts['Rejected']++;
      }
    });

    const pieData = Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: name === 'Content Pending' ? '#F97316' :
               name === 'Content Submitted' ? '#FBBF24' :
               name === 'Approved' ? '#10B981' : '#EF4444'
      }));

    // Bar chart data - tasks per project
    const projectTaskCounts = {};
    taskList.forEach(task => {
      const projectName = task.projectId?.businessName || task.projectId?.projectName || 'Unknown';
      projectTaskCounts[projectName] = (projectTaskCounts[projectName] || 0) + 1;
    });

    const barData = Object.entries(projectTaskCounts)
      .slice(0, 6)
      .map(([name, count]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        fullName: name,
        tasks: count
      }));

    setChartData({ pieData, barData });
  };

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.todo;
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const hasNoTasks = tasks.length === 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header with Role Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Content Writer Dashboard
            </h1>
            <p className="text-gray-600 mt-0.5">
              Welcome back, {user?.name?.split(' ')[0] || 'Writer'}! Here's your content overview.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/projects')}>
            <FolderOpen className="w-4 h-4 mr-2" />
            Projects
          </Button>
          <Button onClick={() => navigate('/tasks')}>
            <Clock className="w-4 h-4 mr-2" />
            My Tasks
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="stat-card-enhanced group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>

        <div className="stat-card-enhanced group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Pending</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pending}</p>
        </div>

        <div className="stat-card-enhanced group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl">
              <Send className="w-5 h-5 text-yellow-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Submitted</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.submitted}</p>
        </div>

        <div className="stat-card-enhanced group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Approved</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.approved}</p>
        </div>

        <div className="stat-card-enhanced group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-gradient-to-br from-red-100 to-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Rejected</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Task Distribution */}
        <Card className="chart-container-enhanced">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg">
                <PieChartIcon className="w-4 h-4 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Task Distribution</h3>
            </div>

            {chartData.pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {chartData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        padding: '12px'
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <PieChartIcon className="w-12 h-12 mb-2 opacity-40" />
                <p className="text-sm">No tasks assigned yet</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Bar Chart - Tasks per Project */}
        <Card className="chart-container-enhanced">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Tasks by Project</h3>
            </div>

            {chartData.barData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        padding: '12px'
                      }}
                      formatter={(value, name, props) => [
                        value,
                        props.payload.fullName ? `Tasks in ${props.payload.fullName}` : 'Tasks'
                      ]}
                    />
                    <Bar
                      dataKey="tasks"
                      fill="#FFC107"
                      radius={[6, 6, 0, 0]}
                      animationBegin={200}
                      animationDuration={800}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <BarChart3 className="w-12 h-12 mb-2 opacity-40" />
                <p className="text-sm">No project data available</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* My Tasks Section */}
      {tasks.length > 0 && (
        <Card className="enhanced-card">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg">
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">My Creative Assignments</h2>
              </div>
              <Button variant="secondary" size="sm" onClick={() => navigate('/tasks')}>
                View All Tasks
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => {
                const isCreativeTask = task.taskType === 'content_generation' || task.creativeType;

                return (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 hover:border-gray-200 transition-all duration-200 cursor-pointer"
                    onClick={() => navigate(`/tasks/${task._id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(task.status)}
                        <span className="text-sm text-gray-500">
                          {isCreativeTask
                            ? `${task.creativeType || 'Creative'} • ${task.subType || task.taskType}`
                            : task.taskType?.replace(/_/g, ' ')
                          }
                        </span>
                      </div>
                      <p className="font-medium text-gray-900">
                        {isCreativeTask ? task.creativeName : task.taskTitle}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{task.projectId?.businessName || task.projectId?.projectName || 'Unknown Project'}</span>
                        {task.platforms && task.platforms.length > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            {task.platforms.join(', ')}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {task.notes && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">{task.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tasks/${task._id}`);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Active Projects */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
            <Play className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects
            .filter(p => p.isActive && p.status === 'active')
            .slice(0, 6)
            .map((project) => (
              <div
                key={project._id}
                className="project-card-enhanced cursor-pointer"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {project.projectName || project.businessName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">{project.customerName}</p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{project.overallProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${project.overallProgress}%`,
                          background: project.overallProgress === 100
                            ? '#10B981'
                            : 'linear-gradient(90deg, #FFC107 0%, #FFD54F 100%)'
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(project.updatedAt)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project._id}`);
                      }}
                    >
                      View <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* No Tasks State */}
      {hasNoTasks && (
        <Card>
          <CardBody className="py-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Assigned</h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                You haven't been assigned any tasks yet. Content writing tasks will appear here once they're created for your projects.
              </p>
              <Button variant="secondary" onClick={() => navigate('/projects')}>
                View Projects
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}