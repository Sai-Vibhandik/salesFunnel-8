import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { projectService, taskService } from '@/services/api';
import { Card, CardBody, CardHeader, Button, Badge, Spinner } from '@/components/ui';
import ProjectSummary from './ProjectSummary';
import {
  ArrowLeft, ClipboardList, Play, CheckCircle, Clock,
  Eye, Palette, Code, FileText, Video, PenTool, Send,
  XCircle, AlertCircle
} from 'lucide-react';

const TASK_TYPES = {
  graphic_design: { label: 'Graphic Design', icon: Palette },
  video_editing: { label: 'Video Editing', icon: Video },
  landing_page_design: { label: 'Landing Page Design', icon: Eye },
  landing_page_development: { label: 'Landing Page Development', icon: Code },
  content_creation: { label: 'Content Creation', icon: FileText },
  content_writing: { label: 'Content Writing', icon: PenTool },
};

const STATUS_CONFIG = {
  todo: { label: 'To Do', color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  submitted: { label: 'Submitted', color: 'bg-yellow-100 text-yellow-800' },
  approved_by_tester: { label: 'Tester Approved', color: 'bg-purple-100 text-purple-800' },
  final_approved: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  content_pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  content_submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
  content_approved: { label: 'Approved', color: 'bg-purple-100 text-purple-800' },
  content_rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  content_final_approved: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  design_pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  design_submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
  design_approved: { label: 'Approved', color: 'bg-purple-100 text-purple-800' },
  design_rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  development_pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  development_submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
  development_approved: { label: 'Approved', color: 'bg-purple-100 text-purple-800' },
};

export default function TeamMemberProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');
  const [statusFilter, setStatusFilter] = useState('all');

  const isDeveloper = user?.role === 'developer';
  const isGraphicDesigner = user?.role === 'graphic_designer';
  const isUIDesigner = user?.role === 'ui_ux_designer';
  const isContentWriter = user?.role === 'content_writer';
  const isVideoEditor = user?.role === 'video_editor';

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      setLoading(true);

      // Fetch project and tasks in parallel
      const [projectRes, tasksRes] = await Promise.all([
        projectService.getProject(id),
        taskService.getProjectTasks(id)
      ]);

      setProject(projectRes.data);
      setTasks(tasksRes.data || []);
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on role
  const filteredTasks = tasks.filter(task => {
    if (isDeveloper) {
      // Developers only see landing page development tasks
      return task.taskType === 'landing_page_development';
    }
    if (isUIDesigner) {
      // UI/UX Designers only see landing page design tasks
      return task.taskType === 'landing_page_design';
    }
    if (isGraphicDesigner) {
      // Graphic Designers see graphic design tasks (images, carousels, offers)
      return task.taskType === 'graphic_design';
    }
    if (isVideoEditor) {
      // Video Editors see video editing tasks
      return task.taskType === 'video_editing';
    }
    if (isContentWriter) {
      // Content Writers see content_creation and content_writing tasks
      return ['content_creation', 'content_writing'].includes(task.taskType);
    }
    return false;
  });

  // Get role-specific status groups
  const getPendingStatuses = () => {
    if (isContentWriter) return ['todo', 'content_pending', 'pending'];
    if (isGraphicDesigner || isUIDesigner || isVideoEditor) return ['todo', 'design_pending', 'pending'];
    if (isDeveloper) return ['todo', 'development_pending', 'pending'];
    return ['todo', 'pending'];
  };

  const getInProgressStatuses = () => {
    if (isContentWriter) return ['in_progress', 'content_submitted', 'submitted'];
    if (isGraphicDesigner || isUIDesigner || isVideoEditor) return ['in_progress', 'design_submitted', 'submitted'];
    if (isDeveloper) return ['in_progress', 'development_submitted', 'submitted'];
    return ['in_progress', 'submitted'];
  };

  const getCompletedStatuses = () => {
    if (isContentWriter) return ['content_final_approved', 'content_approved', 'approved_by_tester', 'final_approved'];
    if (isGraphicDesigner || isUIDesigner || isVideoEditor) return ['design_approved', 'approved_by_tester', 'development_pending', 'final_approved'];
    if (isDeveloper) return ['development_approved', 'approved_by_tester', 'final_approved'];
    return ['approved_by_tester', 'final_approved'];
  };

  const getRejectedStatuses = () => {
    if (isContentWriter) return ['content_rejected', 'rejected'];
    if (isGraphicDesigner || isUIDesigner || isVideoEditor) return ['design_rejected', 'rejected'];
    if (isDeveloper) return ['rejected'];
    return ['rejected'];
  };

  // Group tasks by status
  const pendingTasks = filteredTasks.filter(t => getPendingStatuses().includes(t.status));
  const inProgressTasks = filteredTasks.filter(t => getInProgressStatuses().includes(t.status));
  const completedTasks = filteredTasks.filter(t => getCompletedStatuses().includes(t.status));
  const rejectedTasks = filteredTasks.filter(t => getRejectedStatuses().includes(t.status));

  // Apply status filter
  const displayTasks = statusFilter === 'all'
    ? filteredTasks
    : filteredTasks.filter(t => {
        if (statusFilter === 'pending') return getPendingStatuses().includes(t.status);
        if (statusFilter === 'in_progress') return getInProgressStatuses().includes(t.status);
        if (statusFilter === 'completed') return getCompletedStatuses().includes(t.status);
        if (statusFilter === 'rejected') return getRejectedStatuses().includes(t.status);
        return true;
      });

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.todo;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTaskTypeBadge = (taskType) => {
    const config = TASK_TYPES[taskType] || { label: taskType, icon: ClipboardList };
    const Icon = config.icon;
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Get role label
  const getRoleLabel = () => {
    if (isContentWriter) return 'Content Writer';
    if (isGraphicDesigner) return 'Graphic Designer';
    if (isUIDesigner) return 'UI/UX Designer';
    if (isVideoEditor) return 'Video Editor';
    if (isDeveloper) return 'Developer';
    return 'Team Member';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/projects')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {project.projectName || project.businessName}
              </h1>
              <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                {project.status}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">{project.customerName}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'summary'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Project Summary
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tasks'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Tasks ({filteredTasks.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <ProjectSummary projectId={id} />
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Task Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
              className={`stat-card-enhanced cursor-pointer transition-all ${statusFilter === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>

            <div
              onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
              className={`stat-card-enhanced cursor-pointer transition-all ${statusFilter === 'in_progress' ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Send className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div
              onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
              className={`stat-card-enhanced cursor-pointer transition-all ${statusFilter === 'completed' ? 'ring-2 ring-green-500' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div
              onClick={() => setStatusFilter(statusFilter === 'rejected' ? 'all' : 'rejected')}
              className={`stat-card-enhanced cursor-pointer transition-all ${statusFilter === 'rejected' ? 'ring-2 ring-red-500' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{rejectedTasks.length}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter indicator */}
          {statusFilter !== 'all' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Showing:</span>
              <Badge
                variant="primary"
                className="cursor-pointer"
                onClick={() => setStatusFilter('all')}
              >
                {statusFilter === 'pending' && 'Pending'}
                {statusFilter === 'in_progress' && 'In Progress'}
                {statusFilter === 'completed' && 'Completed'}
                {statusFilter === 'rejected' && 'Rejected'}
                <XCircle className="w-3 h-3 ml-1" />
              </Badge>
            </div>
          )}

          {/* Tasks List */}
          {displayTasks.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <ClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  {statusFilter !== 'all'
                    ? `No ${statusFilter.replace('_', ' ')} tasks`
                    : `No tasks assigned to you for this project`}
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-3">
              {displayTasks.map((task) => (
                <Card key={task._id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/tasks/${task._id}`)}>
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTaskTypeBadge(task.taskType)}
                          {getStatusBadge(task.status)}
                        </div>
                        <h3 className="font-semibold text-gray-900">{task.creativeName || task.taskTitle}</h3>
                        {task.dueDate && (
                          <p className="text-sm text-gray-500 mt-1">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        )}

                        {/* Strategy Context Preview */}
                        {task.strategyContext && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              {task.strategyContext.platform && (
                                <div>
                                  <span className="text-gray-500">Platform:</span>{' '}
                                  <span className="font-medium">{task.strategyContext.platform}</span>
                                </div>
                              )}
                              {task.strategyContext.hook && (
                                <div className="col-span-2">
                                  <span className="text-gray-500">Hook:</span>{' '}
                                  <span className="font-medium">{task.strategyContext.hook.substring(0, 50)}...</span>
                                </div>
                              )}
                              {task.strategyContext.headline && (
                                <div className="col-span-2">
                                  <span className="text-gray-500">Headline:</span>{' '}
                                  <span className="font-medium">{task.strategyContext.headline.substring(0, 50)}...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Content Output Preview for Content Writers */}
                        {isContentWriter && task.contentOutput && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600 font-medium mb-1">Content Preview:</p>
                            {task.contentOutput.headline && (
                              <p className="text-sm font-semibold text-gray-900">{task.contentOutput.headline}</p>
                            )}
                            {task.contentOutput.bodyText && (
                              <p className="text-sm text-gray-600 line-clamp-2">{task.contentOutput.bodyText.substring(0, 100)}...</p>
                            )}
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tasks/${task._id}`);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          {filteredTasks.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-3">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/tasks?status=pending`)}
                >
                  View Pending Tasks
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/tasks?status=submitted`)}
                >
                  View Submitted Tasks
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}