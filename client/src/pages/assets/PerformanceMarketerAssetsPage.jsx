import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardBody, Badge, Spinner } from '@/components/ui';
import { taskService } from '@/services/api';
import {
  FolderKanban,
  Image,
  Video,
  Layout,
  Code,
  FileCheck,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Layers,
  Briefcase,
} from 'lucide-react';

// Task type configuration with colors
const TASK_TYPE_CONFIG = {
  imageCreatives: {
    icon: Image,
    label: 'Image Creatives',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700'
  },
  videoCreatives: {
    icon: Video,
    label: 'Video Creatives',
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  },
  uiuxDesigns: {
    icon: Layout,
    label: 'UI/UX Designs',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  landingPages: {
    icon: Code,
    label: 'Landing Pages',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700'
  },
};

// Project Card Component
function ProjectCard({ project, navigate }) {
  const taskStats = project.taskStats || { total: 0, finalApproved: 0, rejected: 0, inProgress: 0 };
  const completionRate = taskStats.total > 0
    ? Math.round((taskStats.finalApproved / taskStats.total) * 100)
    : 0;

  // Get task type counts
  const taskTypes = Object.entries(project.tasksByType?.all || {})
    .filter(([type, tasks]) => tasks?.length > 0)
    .map(([type, tasks]) => ({
      type,
      count: tasks.length,
      config: TASK_TYPE_CONFIG[type] || {
        icon: FileCheck,
        label: type,
        color: 'from-gray-500 to-gray-600',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700'
      }
    }));

  return (
    <div
      onClick={() => navigate(`/assets/project/${project._id}`)}
      className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1"
    >
      {/* Top gradient accent */}
      <div className="h-1.5 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />

      {/* Card Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Briefcase size={22} className="text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {project.projectName || project.businessName}
                </h3>
                {project.industry && (
                  <span className="text-xs text-gray-500">{project.industry}</span>
                )}
              </div>
            </div>
          </div>
          <Badge
            className={project.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'}
          >
            {project.status || 'Active'}
          </Badge>
        </div>

        {/* Progress Section */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Completion</span>
            <span className="text-sm font-bold text-primary-600">{completionRate}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total</div>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-xl">
            <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-emerald-600">{taskStats.finalApproved}</div>
            <div className="text-xs text-emerald-600">Approved</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-xl">
            <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-red-600">{taskStats.rejected}</div>
            <div className="text-xs text-red-600">Rejected</div>
          </div>
        </div>

        {/* Task Type Pills */}
        {taskTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {taskTypes.slice(0, 4).map(({ type, count, config }) => {
              const Icon = config.icon;
              return (
                <div
                  key={type}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
                >
                  <Icon size={14} />
                  <span>{count} {config.label.split(' ')[0]}</span>
                </div>
              );
            })}
            {taskTypes.length > 4 && (
              <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{taskTypes.length - 4} more
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock size={14} />
            <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-primary-600 group-hover:gap-2 transition-all">
            <span>View Details</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PerformanceMarketerAssetsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjectsWithAssets();
  }, []);

  const fetchProjectsWithAssets = async () => {
    try {
      setLoading(true);
      const response = await taskService.getPMProjectsWithAssets();
      setProjects(response.data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error(error.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total stats across all projects
  const getTotalStats = () => {
    return projects.reduce((acc, project) => ({
      total: acc.total + (project.taskStats?.total || 0),
      finalApproved: acc.finalApproved + (project.taskStats?.finalApproved || 0),
      rejected: acc.rejected + (project.taskStats?.rejected || 0),
      inProgress: acc.inProgress + (project.taskStats?.inProgress || 0),
    }), { total: 0, finalApproved: 0, rejected: 0, inProgress: 0 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalStats = getTotalStats();
  const overallCompletion = totalStats.total > 0
    ? Math.round((totalStats.finalApproved / totalStats.total) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assets Pipeline</h1>
          <p className="text-gray-500 mt-1">Track all tasks and assets across your projects</p>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="stat-card-enhanced">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.total}</p>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="stat-card-enhanced">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{overallCompletion}%</p>
            </div>
          </div>
        </div>

        {/* Final Approved */}
        <div className="stat-card-enhanced">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Final Approved</p>
              <p className="text-2xl font-bold text-emerald-600">{totalStats.finalApproved}</p>
            </div>
          </div>
        </div>

        {/* Rejected */}
        <div className="stat-card-enhanced">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-red-600">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{totalStats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="stat-card-enhanced">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800">
              <FolderKanban size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Your Projects</h3>
              <p className="text-sm text-gray-500">{projects.length} projects with assets</p>
            </div>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={36} className="text-gray-300" />
            </div>
            <h4 className="text-lg font-medium text-gray-900">No projects found</h4>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              Projects assigned to you will appear here with their assets and tasks
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}