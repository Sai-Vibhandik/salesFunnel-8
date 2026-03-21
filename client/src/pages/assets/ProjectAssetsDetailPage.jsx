import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardBody, Button, Badge, Spinner } from '@/components/ui';
import { taskService } from '@/services/api';
import {
  ArrowLeft,
  Image,
  Video,
  Layout,
  Code,
  FileCheck,
  ExternalLink,
  Download,
  Calendar,
  User,
  Link,
  MessageSquare,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
  ClipboardList,
  Clock,
  Send,
} from 'lucide-react';

const TASK_TYPE_CONFIG = {
  graphic_design: { label: 'Graphic Design', icon: Image, color: 'bg-blue-100 text-blue-800' },
  video_editing: { label: 'Video Editing', icon: Video, color: 'bg-purple-100 text-purple-800' },
  landing_page_design: { label: 'UI/UX Design', icon: Layout, color: 'bg-orange-100 text-orange-800' },
  landing_page_development: { label: 'Landing Page', icon: Code, color: 'bg-green-100 text-green-800' },
  content_creation: { label: 'Content Creation', icon: FileCheck, color: 'bg-teal-100 text-teal-800' },
};

const STATUS_CONFIG = {
  // Pending statuses
  todo: { label: 'To Do', color: 'bg-gray-100 text-gray-800', icon: ClipboardList },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Clock },
  content_pending: { label: 'Content Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  design_pending: { label: 'Design Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  development_pending: { label: 'Dev Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  // Submitted statuses
  content_submitted: { label: 'Content Submitted', color: 'bg-indigo-100 text-indigo-800', icon: Send },
  design_submitted: { label: 'Design Submitted', color: 'bg-indigo-100 text-indigo-800', icon: Send },
  development_submitted: { label: 'Dev Submitted', color: 'bg-indigo-100 text-indigo-800', icon: Send },
  submitted: { label: 'Submitted', color: 'bg-indigo-100 text-indigo-800', icon: Send },
  // Approved statuses
  approved_by_tester: { label: 'Tester Approved', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  content_approved: { label: 'Content Approved', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  content_final_approved: { label: 'Content Final', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  design_approved: { label: 'Design Approved', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  development_approved: { label: 'Dev Approved', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  // Final approved
  final_approved: { label: 'Final Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  // Rejected statuses
  content_rejected: { label: 'Content Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  design_rejected: { label: 'Design Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const STATUS_CATEGORIES = {
  all: { label: 'All Tasks', color: 'bg-gray-100 text-gray-800' },
  finalApproved: { label: 'Final Approved', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
};

export default function ProjectAssetsDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'submitted' | 'approved' | 'finalApproved' | 'rejected'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'imageCreatives' | 'videoCreatives' | 'uiuxDesigns' | 'landingPages'

  useEffect(() => {
    fetchProjectAssets();
  }, [projectId]);

  const fetchProjectAssets = async () => {
    try {
      setLoading(true);
      const response = await taskService.getPMProjectAssets(projectId);
      setProjectData(response.data);
    } catch (error) {
      console.error('Failed to load project assets:', error);
      toast.error(error.response?.data?.message || 'Failed to load project assets');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTasks = () => {
    if (!projectData) return [];

    // Get tasks by status category
    let tasksByStatus = [];
    switch (statusFilter) {
      case 'pending':
        tasksByStatus = projectData.tasks?.pending || [];
        break;
      case 'submitted':
        tasksByStatus = projectData.tasks?.submitted || [];
        break;
      case 'approved':
        tasksByStatus = projectData.tasks?.approved || [];
        break;
      case 'finalApproved':
        tasksByStatus = projectData.tasks?.finalApproved || [];
        break;
      case 'rejected':
        tasksByStatus = projectData.tasks?.rejected || [];
        break;
      case 'all':
      default:
        tasksByStatus = projectData.tasks?.all || [];
    }

    // Filter by type
    if (typeFilter === 'all') {
      return tasksByStatus;
    }

    const typeFilters = {
      imageCreatives: (t) =>
        t.taskType === 'graphic_design' &&
        (!t.creativeOutputType || ['image_creative', 'static_ad', 'carousel_creative'].includes(t.creativeOutputType)),
      videoCreatives: (t) =>
        t.taskType === 'video_editing' ||
        (t.taskType === 'graphic_design' && ['video_creative', 'reel', 'ugc_content', 'testimonial_content', 'demo_video'].includes(t.creativeOutputType)),
      uiuxDesigns: (t) => t.taskType === 'landing_page_design',
      landingPages: (t) => t.taskType === 'landing_page_development',
    };

    return tasksByStatus.filter(typeFilters[typeFilter] || (() => true));
  };

  const renderTaskCard = (task) => {
    const typeConfig = TASK_TYPE_CONFIG[task.taskType] || { label: task.taskType, icon: FileCheck, color: 'bg-gray-100 text-gray-800' };
    const statusConfig = STATUS_CONFIG[task.status] || { label: task.status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    const Icon = typeConfig.icon;

    return (
      <Card key={task._id} className="mb-4">
        <CardBody className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={typeConfig.color}>
                  <Icon className="w-3 h-3 mr-1" />
                  {typeConfig.label}
                </Badge>
                <Badge className={statusConfig.color}>
                  {statusConfig.label}
                </Badge>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.taskTitle}</h3>

              {/* Strategy Context */}
              {task.strategyContext && (
                <div className="text-sm text-gray-500 mb-2">
                  {task.strategyContext.funnelStage && (
                    <span className="mr-3">Funnel: {task.strategyContext.funnelStage}</span>
                  )}
                  {task.strategyContext.platform && (
                    <span className="mr-3">Platform: {task.strategyContext.platform}</span>
                  )}
                </div>
              )}

              {/* Assigned To */}
              {task.assignedTo && (
                <div className="text-sm text-gray-500 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Assigned: {task.assignedTo.name || 'Unknown'}
                </div>
              )}

              {/* Creative Link */}
              {task.creativeLink && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-1 flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Creative Link
                  </h4>
                  <a
                    href={task.creativeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 text-sm break-all"
                  >
                    {task.creativeLink}
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  </a>
                </div>
              )}

              {/* Implementation URL for Landing Pages */}
              {task.implementationUrl && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="text-sm font-medium text-green-800 mb-1 flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Landing Page URL
                  </h4>
                  <a
                    href={task.implementationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline flex items-center gap-1 text-sm break-all"
                  >
                    {task.implementationUrl}
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  </a>
                </div>
              )}

              {/* Design Link */}
              {task.designLink && (
                <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="text-sm font-medium text-purple-800 mb-1 flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Design Link
                  </h4>
                  <a
                    href={task.designLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline flex items-center gap-1 text-sm break-all"
                  >
                    {task.designLink}
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  </a>
                </div>
              )}

              {/* Output Files */}
              {task.outputFiles && task.outputFiles.length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    Output Files
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {task.outputFiles.map((file, index) => (
                      <a
                        key={index}
                        href={file.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border rounded text-sm text-blue-600 hover:bg-gray-100"
                      >
                        <Download className="w-3 h-3" />
                        {file.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {task.reviewNotes && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="text-sm font-medium text-yellow-800 mb-1 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Notes
                  </h4>
                  <p className="text-sm text-gray-700">{task.reviewNotes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {task.marketerApprovedBy && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Approved by: {task.marketerApprovedBy.name || 'Marketer'}</span>
                  </div>
                )}
                {task.marketerApprovedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(task.marketerApprovedAt).toLocaleDateString()}</span>
                  </div>
                )}
                {task.createdAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 ml-4">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate(`/tasks/${task._id}`, { state: { from: `/assets/project/${projectId}` } })}
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardBody className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
            <p className="text-gray-500">Project not found or you don't have access</p>
            <Button className="mt-4" onClick={() => navigate('/assets')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assets
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const { project, stats } = projectData;
  const filteredTasks = getFilteredTasks();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/assets')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {project.projectName || project.businessName}
            </h1>
            {project.industry && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                {project.industry}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Final Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats?.finalApproved || 0}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</p>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <div className="flex flex-wrap gap-1">
                {Object.entries(STATUS_CATEGORIES).map(([key, config]) => (
                  <Button
                    key={key}
                    size="sm"
                    variant={statusFilter === key ? 'primary' : 'secondary'}
                    onClick={() => setStatusFilter(key)}
                  >
                    {config.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <div className="flex flex-wrap gap-1">
                <Button
                  size="sm"
                  variant={typeFilter === 'all' ? 'primary' : 'secondary'}
                  onClick={() => setTypeFilter('all')}
                >
                  All Types
                </Button>
                <Button
                  size="sm"
                  variant={typeFilter === 'imageCreatives' ? 'primary' : 'secondary'}
                  onClick={() => setTypeFilter('imageCreatives')}
                >
                  <Image className="w-3 h-3 mr-1" />
                  Images
                </Button>
                <Button
                  size="sm"
                  variant={typeFilter === 'videoCreatives' ? 'primary' : 'secondary'}
                  onClick={() => setTypeFilter('videoCreatives')}
                >
                  <Video className="w-3 h-3 mr-1" />
                  Videos
                </Button>
                <Button
                  size="sm"
                  variant={typeFilter === 'uiuxDesigns' ? 'primary' : 'secondary'}
                  onClick={() => setTypeFilter('uiuxDesigns')}
                >
                  <Layout className="w-3 h-3 mr-1" />
                  UI/UX
                </Button>
                <Button
                  size="sm"
                  variant={typeFilter === 'landingPages' ? 'primary' : 'secondary'}
                  onClick={() => setTypeFilter('landingPages')}
                >
                  <Code className="w-3 h-3 mr-1" />
                  Landing Pages
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <FileCheck className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No tasks found matching your filters</p>
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your filters or check back later
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(renderTaskCard)}
        </div>
      )}
    </div>
  );
}