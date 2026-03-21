import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Button, Badge, Spinner } from '@/components/ui';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Trash2,
  MoreHorizontal,
  LayoutGrid,
  List,
  Kanban,
  Users,
  TrendingUp,
  FileText,
  Image,
  Video,
  Layout,
  Code,
  CheckCircle,
  Target,
  Rocket,
  Eye,
  Edit,
  Clock,
  ArrowUpDown,
  ChevronDown,
  Calendar,
  AlertCircle,
  Sparkles,
  Crown,
  X,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

// Role configurations
const ROLE_CONFIG = {
  admin: { label: 'Admin', color: 'bg-red-100 text-red-700', gradient: 'from-red-400 to-red-600' },
  performance_marketer: { label: 'Performance Marketer', color: 'bg-blue-100 text-blue-700', gradient: 'from-blue-400 to-blue-600' },
  ui_ux_designer: { label: 'UI/UX Designer', color: 'bg-purple-100 text-purple-700', gradient: 'from-purple-400 to-purple-600' },
  graphic_designer: { label: 'Graphic Designer', color: 'bg-pink-100 text-pink-700', gradient: 'from-pink-400 to-pink-600' },
  developer: { label: 'Developer', color: 'bg-green-100 text-green-700', gradient: 'from-green-400 to-green-600' },
  tester: { label: 'Tester', color: 'bg-orange-100 text-orange-700', gradient: 'from-orange-400 to-orange-600' },
  content_writer: { label: 'Content Writer', color: 'bg-emerald-100 text-emerald-700', gradient: 'from-emerald-400 to-emerald-600' },
  video_editor: { label: 'Video Editor', color: 'bg-cyan-100 text-cyan-700', gradient: 'from-cyan-400 to-cyan-600' },
};

// Stage configurations with icons and colors
const STAGE_CONFIG = {
  onboarding: {
    name: 'Onboarding',
    icon: Target,
    color: 'bg-slate-100 text-slate-700',
    gradient: 'from-slate-400 to-slate-600'
  },
  market_research: {
    name: 'Market Research',
    icon: Search,
    color: 'bg-blue-100 text-blue-700',
    gradient: 'from-blue-400 to-blue-600'
  },
  offer_engineering: {
    name: 'Offer Engineering',
    icon: FileText,
    color: 'bg-purple-100 text-purple-700',
    gradient: 'from-purple-400 to-purple-600'
  },
  traffic_strategy: {
    name: 'Traffic Strategy',
    icon: TrendingUp,
    color: 'bg-green-100 text-green-700',
    gradient: 'from-green-400 to-green-600'
  },
  landing_page: {
    name: 'Landing Page',
    icon: Layout,
    color: 'bg-pink-100 text-pink-700',
    gradient: 'from-pink-400 to-pink-600'
  },
  creative_strategy: {
    name: 'Creative Strategy',
    icon: Image,
    color: 'bg-amber-100 text-amber-700',
    gradient: 'from-amber-400 to-amber-600'
  },
};

// Status configurations
const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  paused: { label: 'Paused', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
};

// Premium Search Input
function PremiumSearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative group flex-1 max-w-md">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-20 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400
                   focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
                   transition-all duration-200"
      />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded-lg border border-gray-200">
        ⌘K
      </kbd>
    </div>
  );
}

// Premium Filter Dropdown
function PremiumFilterDropdown({ value, onChange, options, placeholder, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
                   hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
                   transition-all duration-200 min-w-[130px]"
      >
        {Icon && <Icon size={16} className="text-gray-400" />}
        <span className="text-gray-700 font-medium">{selectedOption?.label || placeholder}</span>
        <ChevronDown size={16} className="ml-auto text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-1 animate-fadeIn">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => { onChange(option.value); setIsOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors",
                  value === option.value ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {option.icon && <option.icon size={16} />}
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Team Avatar Group
function TeamAvatarGroup({ team, maxDisplay = 4 }) {
  if (!team) return null;

  const members = [
    team.performanceMarketer,
    team.uiUxDesigner,
    team.graphicDesigner,
    team.developer,
    team.tester,
  ].filter(Boolean);

  const displayMembers = members.slice(0, maxDisplay);
  const remainingCount = members.length - maxDisplay;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {displayMembers.map((member, index) => (
          <div
            key={member._id || index}
            className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white shadow-sm hover:z-10 hover:scale-110 transition-transform cursor-pointer"
            title={member.name}
          >
            {member.name?.charAt(0).toUpperCase()}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
}

// Project Grid Card
function ProjectGridCard({ project, onClick, onDelete, isAdmin }) {
  const stageConfig = STAGE_CONFIG[project.currentStageKey] || STAGE_CONFIG.onboarding;
  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.active;
  const StageIcon = stageConfig.icon;

  return (
    <div
      onClick={() => onClick(project._id)}
      className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer
                 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 hover:border-gray-200"
    >
      {/* Gradient border on hover */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-500/20 transition-colors pointer-events-none" />

      {/* Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
          statusConfig.color
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
          {statusConfig.label}
        </span>
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="mb-4 pr-16">
          <h3 className="font-semibold text-gray-900 text-base line-clamp-1 group-hover:text-primary-600 transition-colors">
            {project.projectName || project.businessName}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{project.customerName}</p>
          {project.industry && (
            <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
              {project.industry}
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-500">Progress</span>
            <span className="font-semibold text-gray-900">{project.overallProgress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${project.overallProgress}%`,
                background: project.overallProgress >= 100
                  ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                  : 'linear-gradient(90deg, #FFC107 0%, #FFD54F 100%)'
              }}
            />
          </div>
        </div>

        {/* Current Stage */}
        <div className="flex items-center gap-2 mb-4 p-2.5 bg-gray-50 rounded-xl">
          <div className={cn("p-2 rounded-lg", stageConfig.color)}>
            <StageIcon size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Current Stage</p>
            <p className="text-sm font-medium text-gray-900 truncate">{stageConfig.name}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {isAdmin && project.assignedTeam ? (
            <TeamAvatarGroup team={project.assignedTeam} />
          ) : (
            <div className="text-xs text-gray-400">No team assigned</div>
          )}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={12} />
            {formatDate(project.updatedAt)}
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(project._id, e); }}
          className="absolute top-3 left-3 p-2 rounded-lg bg-white/80 backdrop-blur-sm text-gray-400
                     hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-10"
          title="Delete project"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

// Project List Row
function ProjectListRow({ project, onClick, onDelete, isAdmin }) {
  const stageConfig = STAGE_CONFIG[project.currentStageKey] || STAGE_CONFIG.onboarding;
  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.active;
  const StageIcon = stageConfig.icon;

  return (
    <div
      onClick={() => onClick(project._id)}
      className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100
                 hover:border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Project Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
            {project.projectName || project.businessName}
          </h3>
          <span className={cn("w-2 h-2 rounded-full flex-shrink-0", statusConfig.dot)} />
        </div>
        <p className="text-sm text-gray-500 truncate">{project.customerName}</p>
      </div>

      {/* Industry */}
      <div className="hidden lg:block w-32">
        <span className="text-sm text-gray-600">{project.industry || '-'}</span>
      </div>

      {/* Stage */}
      <div className="hidden md:flex items-center gap-2 w-40">
        <div className={cn("p-1.5 rounded-lg", stageConfig.color)}>
          <StageIcon size={14} />
        </div>
        <span className="text-sm text-gray-700 truncate">{stageConfig.name}</span>
      </div>

      {/* Status */}
      <div className="flex-shrink-0">
        <span className={cn("inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full", statusConfig.color)}>
          {statusConfig.label}
        </span>
      </div>

      {/* Progress */}
      <div className="hidden lg:flex items-center gap-3 w-36">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${project.overallProgress}%`,
              background: project.overallProgress >= 100 ? '#10B981' : 'linear-gradient(90deg, #FFC107 0%, #FFD54F 100%)'
            }}
          />
        </div>
        <span className="text-sm font-medium text-gray-900 w-10 text-right">{project.overallProgress}%</span>
      </div>

      {/* Team */}
      <div className="hidden xl:block">
        <TeamAvatarGroup team={project.assignedTeam} />
      </div>

      {/* Updated */}
      <div className="hidden md:block text-xs text-gray-400">
        {formatDate(project.updatedAt)}
      </div>

      {/* Actions */}
      {isAdmin && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onClick(project._id); }}
            className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(project._id, e); }}
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// Kanban Card (Compact)
function KanbanCardCompact({ project, onClick, onDelete, isAdmin }) {
  const stageConfig = STAGE_CONFIG[project.currentStageKey] || STAGE_CONFIG.onboarding;
  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.active;

  return (
    <div
      onClick={() => onClick(project._id)}
      className="group p-4 bg-white rounded-xl border border-gray-100 cursor-pointer
                 hover:shadow-lg hover:border-gray-200 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="font-medium text-gray-900 text-sm truncate">{project.projectName || project.businessName}</h4>
          <p className="text-xs text-gray-500 truncate">{project.customerName}</p>
        </div>
        <span className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-1.5", statusConfig.dot)} />
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-500">Progress</span>
          <span className="font-medium text-gray-700">{project.overallProgress}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${project.overallProgress}%`,
              background: project.overallProgress >= 100 ? '#10B981' : 'linear-gradient(90deg, #FFC107 0%, #FFD54F 100%)'
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {project.assignedTeam ? (
          <TeamAvatarGroup team={project.assignedTeam} maxDisplay={3} />
        ) : (
          <span className="text-xs text-gray-400">No team</span>
        )}
        {isAdmin && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(project._id, e); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// Kanban Column
function KanbanColumn({ stage, projects, onProjectClick, onDelete, isAdmin }) {
  const config = STAGE_CONFIG[stage.key] || STAGE_CONFIG.onboarding;
  const Icon = config.icon;
  const stageProjects = projects.filter(p => p.currentStageKey === stage.key);

  return (
    <div className="flex-shrink-0 w-72">
      <div className="bg-gray-50 rounded-2xl p-4 h-full">
        {/* Column Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={cn("p-2.5 rounded-xl", config.color)}>
            <Icon size={18} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{stage.name}</h3>
            <p className="text-xs text-gray-500">{stageProjects.length} projects</p>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
          {stageProjects.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                <FolderKanban size={20} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-400">No projects</p>
            </div>
          ) : (
            stageProjects.map((project) => (
              <KanbanCardCompact
                key={project._id}
                project={project}
                onClick={onProjectClick}
                onDelete={onDelete}
                isAdmin={isAdmin}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Empty State
function PremiumEmptyState({ isAdmin, onNewProject }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-50 rounded-3xl flex items-center justify-center">
          <FolderKanban size={48} className="text-primary-500" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center shadow-lg">
          <Sparkles size={20} className="text-white" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {isAdmin ? "No projects yet" : "No assigned projects"}
      </h3>
      <p className="text-gray-500 mb-6 max-w-sm text-center">
        {isAdmin
          ? "Create your first project to start managing your client work."
          : "You haven't been assigned to any projects yet. Contact your administrator."}
      </p>
      {isAdmin && (
        <Button onClick={onNewProject}>
          <Plus size={18} className="mr-2" />
          Create Your First Project
        </Button>
      )}
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ isOpen, projectId, onConfirm, onCancel, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Trash2 size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">Delete Project</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this project? This will permanently remove:
          </p>
          <ul className="text-sm text-gray-500 space-y-2">
            <li className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              All project data and settings
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              All tasks and strategy documents
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              All landing pages and notifications
            </li>
          </ul>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              onClick={() => onConfirm(projectId)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function ProjectsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'kanban', 'list'
  const [deleting, setDeleting] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const isAdmin = user?.role === 'admin';

  const statusOptions = [
    { value: '', label: 'All Status', icon: Filter },
    { value: 'active', label: 'Active', icon: CheckCircle },
    { value: 'paused', label: 'Paused', icon: Clock },
    { value: 'completed', label: 'Completed', icon: CheckCircle },
    { value: 'archived', label: 'Archived', icon: FolderKanban },
  ];

  useEffect(() => {
    fetchProjects();
  }, [status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) fetchProjects();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { projectService } = await import('@/services/api');
      const response = await projectService.getProjects({ status, search });
      setProjects(response.data || []);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = (projectId, e) => {
    e?.stopPropagation();
    setShowDeleteConfirm(projectId);
  };

  const confirmDelete = async (projectId) => {
    try {
      setDeleting(projectId);
      const { projectService } = await import('@/services/api');
      await projectService.deleteProject(projectId);
      setProjects(projects.filter(p => p._id !== projectId));
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeleting(null);
      setShowDeleteConfirm(null);
    }
  };

  // Get stages for kanban
  const getStages = () => {
    const stageKeys = ['onboarding', 'market_research', 'offer_engineering', 'traffic_strategy', 'landing_page', 'creative_strategy'];
    return stageKeys.map(key => ({
      key,
      name: STAGE_CONFIG[key]?.name || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!showDeleteConfirm}
        projectId={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(null)}
        isDeleting={!!deleting}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Projects' : 'My Projects'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? 'Manage and track all client projects' : 'View and work on your assigned projects'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                viewMode === 'grid'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                viewMode === 'kanban'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Kanban size={16} />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                viewMode === 'list'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <List size={16} />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          {/* New Project Button */}
          {isAdmin && (
            <Button onClick={() => navigate('/projects/new')}>
              <Plus size={18} className="mr-2" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Smart Control Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <PremiumSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search projects by name..."
          />
          <PremiumFilterDropdown
            value={status}
            onChange={setStatus}
            options={statusOptions}
            placeholder="All Status"
            icon={Filter}
          />
          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500 ml-auto">
            <span>{projects.length} projects</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {projects.length === 0 ? (
        <PremiumEmptyState
          isAdmin={isAdmin}
          onNewProject={() => navigate('/projects/new')}
        />
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectGridCard
              key={project._id}
              project={project}
              onClick={(id) => navigate(`/projects/${id}`)}
              onDelete={handleDeleteProject}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {getStages().map((stage) => (
            <KanbanColumn
              key={stage.key}
              stage={stage}
              projects={projects}
              onProjectClick={(id) => navigate(`/projects/${id}`)}
              onDelete={handleDeleteProject}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
            <div className="col-span-4">Project</div>
            <div className="col-span-2">Industry</div>
            <div className="col-span-2">Stage</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Progress</div>
            <div className="col-span-1">Updated</div>
          </div>
          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {projects.map((project) => (
              <ProjectListRow
                key={project._id}
                project={project}
                onClick={(id) => navigate(`/projects/${id}`)}
                onDelete={handleDeleteProject}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}