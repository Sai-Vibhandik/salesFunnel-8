import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { projectService } from '@/services/api';
import { Spinner, Badge } from '@/components/ui';
import {
  FolderKanban,
  Search,
  Gift,
  TrendingUp,
  FileText,
  Lightbulb,
  ChevronRight,
  AlertCircle,
  Calendar,
  Briefcase,
  Activity,
  Timer,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
} from 'recharts';

// ============================================
// DESIGN SYSTEM CONSTANTS
// ============================================

const STAGE_ICONS = {
  marketResearch: Search,
  offerEngineering: Gift,
  trafficStrategy: TrendingUp,
  landingPage: FileText,
  creativeStrategy: Lightbulb,
};

const STAGE_NAMES = {
  marketResearch: 'Market Research',
  offerEngineering: 'Offer Engineering',
  trafficStrategy: 'Traffic Strategy',
  landingPage: 'Landing Page',
  creativeStrategy: 'Creative Strategy',
};

const STAGE_PATHS = {
  marketResearch: '/market-research',
  offerEngineering: '/offer-engineering',
  trafficStrategy: '/traffic-strategy',
  landingPage: '/landing-pages',
  creativeStrategy: '/creative-strategy',
};

// Chart Colors
const COLORS = {
  primary: '#FFC107',
  secondary: '#FFD54F',
  success: '#10B981',
  info: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  cyan: '#06B6D4',
  orange: '#F97316',
  red: '#EF4444',
};

// ============================================
// COMPONENTS
// ============================================

// Stat Card Component
function StatCard({ title, value, icon: Icon, iconBg, accent }) {
  return (
    <div className="stat-card-enhanced group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={cn('p-3 rounded-2xl', iconBg)}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      {accent && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">{accent}</p>
        </div>
      )}
    </div>
  );
}

// Project Card Component
function ProjectCard({ project, getNextStage, getStageProgress, navigate }) {
  const nextStage = getNextStage(project);
  const progress = getStageProgress(project);
  const progressPercent = (progress.completed / progress.total) * 100;

  const getStatusBadge = () => {
    switch (project.status) {
      case 'completed':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed', dot: 'bg-emerald-500' };
      case 'paused':
        return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Paused', dot: 'bg-amber-500' };
      case 'archived':
        return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Archived', dot: 'bg-gray-400' };
      case 'active':
      default:
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Active', dot: 'bg-blue-500' };
    }
  };

  const status = getStatusBadge();

  return (
    <div
      onClick={() => navigate(`/projects/${project._id}`)}
      className="project-card-enhanced"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Briefcase size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{project.projectName || project.businessName}</h3>
            <p className="text-sm text-gray-500">{project.customerName}</p>
          </div>
        </div>
        <Badge className={cn(status.bg, status.text)}>
          <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', status.dot)} />
          {status.label}
        </Badge>
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-500">Strategy Progress</span>
          <span className="font-semibold text-gray-900">{progress.completed}/{progress.total} stages</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              background: progressPercent >= 100
                ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                : 'linear-gradient(90deg, #FFC107 0%, #FFD54F 100%)'
            }}
          />
        </div>
      </div>

      {/* Stage Progress Pills */}
      <div className="flex gap-1 mb-4">
        {['Onboarding', 'Research', 'Offer', 'Traffic', 'Landing', 'Creative'].map((stage, i) => {
          const isCompleted = i < progress.completed;
          const isCurrent = i === progress.completed;
          return (
            <div
              key={stage}
              className={cn(
                'flex-1 h-1.5 rounded-full transition-all',
                isCompleted ? 'bg-gradient-to-r from-primary-400 to-primary-500' :
                isCurrent ? 'bg-primary-200' : 'bg-gray-100'
              )}
            />
          );
        })}
      </div>

      {/* Next Stage Card */}
      {nextStage && (
        <div
          className="p-4 bg-gradient-to-r from-primary-50 via-amber-50 to-yellow-50 rounded-xl border border-primary-100/50"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`${STAGE_PATHS[nextStage.key]}?projectId=${project._id}`);
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-sm">
                {(() => {
                  const Icon = STAGE_ICONS[nextStage.key] || Search;
                  return <Icon size={18} className="text-primary-600" />;
                })()}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Next Stage</p>
                <p className="font-semibold text-gray-900">{nextStage.name}</p>
              </div>
            </div>
            <button
              className="px-4 py-2 bg-white text-sm font-medium text-gray-700 rounded-xl hover:shadow-md transition-all flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`${STAGE_PATHS[nextStage.key]}?projectId=${project._id}`);
              }}
            >
              Continue
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar size={14} />
          <span>Updated {formatDate(project.updatedAt)}</span>
        </div>
        <ChevronRight size={18} className="text-gray-400" />
      </div>
    </div>
  );
}

// Custom Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-100 p-3">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-500">{entry.name}:</span>
            <span className="font-semibold text-gray-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function PerformanceMarketerDashboard({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    paused: 0,
    strategyComplete: 0,
    completionRate: 0,
    avgProgress: 0,
  });

  // Stage completion data for charts
  const [stageStats, setStageStats] = useState({
    marketResearch: 0,
    offerEngineering: 0,
    trafficStrategy: 0,
    landingPage: 0,
    creativeStrategy: 0,
  });

  // Projects over time data
  const [projectsTimeline, setProjectsTimeline] = useState([]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    fetchAssignedProjects();
  }, []);

  const fetchAssignedProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await projectService.getProjects({ limit: 50 });
      const assignedProjects = response.data || [];
      setProjects(assignedProjects);

      const total = assignedProjects.length;
      const active = assignedProjects.filter(p => p.status === 'active').length;
      const completed = assignedProjects.filter(p => p.status === 'completed').length;
      const paused = assignedProjects.filter(p => p.status === 'paused').length;
      const strategyComplete = assignedProjects.filter(p => p.overallProgress === 100 && p.status !== 'completed').length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Calculate average progress
      const totalProgress = assignedProjects.reduce((sum, p) => {
        const stageKeys = ['onboarding', 'marketResearch', 'offerEngineering', 'trafficStrategy', 'landingPage', 'creativeStrategy'];
        const completed = stageKeys.filter(key => p.stages?.[key]?.isCompleted).length;
        return sum + (completed / stageKeys.length) * 100;
      }, 0);
      const avgProgress = total > 0 ? Math.round(totalProgress / total) : 0;

      // Stage completion stats
      const stageKeys = ['marketResearch', 'offerEngineering', 'trafficStrategy', 'landingPage', 'creativeStrategy'];
      const stageCounts = {};
      stageKeys.forEach(key => {
        stageCounts[key] = assignedProjects.filter(p => p.stages?.[key]?.isCompleted).length;
      });

      // Projects timeline - group by month
      const last6Months = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        last6Months.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          year: date.getFullYear(),
          monthIndex: date.getMonth(),
          projects: 0,
          completed: 0,
        });
      }

      assignedProjects.forEach(project => {
        const createdDate = new Date(project.createdAt);
        const monthIndex = createdDate.getMonth();
        const year = createdDate.getFullYear();

        last6Months.forEach(item => {
          if (item.monthIndex === monthIndex && item.year === year) {
            item.projects++;
          }
        });

        // Count completed by completion date (using updatedAt as proxy)
        if (project.status === 'completed' && project.updatedAt) {
          const completedDate = new Date(project.updatedAt);
          last6Months.forEach(item => {
            if (item.monthIndex === completedDate.getMonth() && item.year === completedDate.getFullYear()) {
              item.completed++;
            }
          });
        }
      });

      setStats({ total, active, completed, paused, strategyComplete, completionRate, avgProgress });
      setStageStats(stageCounts);
      setProjectsTimeline(last6Months);

    } catch (err) {
      console.error('Failed to load projects:', err);
      setError(err.response?.data?.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getNextStage = (project) => {
    const stageKeys = ['onboarding', 'marketResearch', 'offerEngineering', 'trafficStrategy', 'landingPage', 'creativeStrategy'];

    for (let i = 1; i < stageKeys.length; i++) {
      const key = stageKeys[i];
      const prevKey = stageKeys[i - 1];
      const prevCompleted = project.stages?.[prevKey]?.isCompleted;

      if (!project.stages?.[key]?.isCompleted && prevCompleted) {
        return { key, name: STAGE_NAMES[key], index: i };
      }
    }

    for (let i = 1; i < stageKeys.length; i++) {
      const key = stageKeys[i];
      if (!project.stages?.[key]?.isCompleted) {
        let canAccess = true;
        for (let j = 1; j < i; j++) {
          if (!project.stages?.[stageKeys[j]]?.isCompleted) {
            canAccess = false;
            break;
          }
        }
        if (canAccess) {
          return { key, name: STAGE_NAMES[key], index: i };
        }
      }
    }
    return null;
  };

  const getStageProgress = (project) => {
    const stageKeys = ['onboarding', 'marketResearch', 'offerEngineering', 'trafficStrategy', 'landingPage', 'creativeStrategy'];
    const completed = stageKeys.filter(key => project.stages?.[key]?.isCompleted).length;
    return { completed, total: 6 };
  };

  // Chart data
  const projectStatusData = [
    { name: 'Active', value: stats.active, color: COLORS.info },
    { name: 'Strategy Done', value: stats.strategyComplete, color: COLORS.primary },
    { name: 'Completed', value: stats.completed, color: COLORS.success },
    { name: 'Paused', value: stats.paused, color: COLORS.orange },
  ].filter(d => d.value > 0);

  const stageCompletionData = [
    { name: 'Market Research', value: stageStats.marketResearch, color: COLORS.info },
    { name: 'Offer Engineering', value: stageStats.offerEngineering, color: COLORS.purple },
    { name: 'Traffic Strategy', value: stageStats.trafficStrategy, color: COLORS.primary },
    { name: 'Landing Page', value: stageStats.landingPage, color: COLORS.success },
    { name: 'Creative Strategy', value: stageStats.creativeStrategy, color: COLORS.pink },
  ];

  // Line chart data for projects timeline
  const timelineData = projectsTimeline.map(item => ({
    name: item.month,
    projects: item.projects,
    completed: item.completed,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Marketer'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={String(stats.total)}
          icon={FolderKanban}
          iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Active"
          value={String(stats.active)}
          icon={Activity}
          iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatCard
          title="Strategy Complete"
          value={String(stats.strategyComplete)}
          icon={Timer}
          iconBg="bg-gradient-to-br from-amber-500 to-amber-600"
        />
        <StatCard
          title="Completed"
          value={String(stats.completed)}
          icon={Award}
          iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Pie Chart */}
        <div className="stat-card-enhanced">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-400 to-primary-500">
                <PieChartIcon size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Project Status</h3>
                <p className="text-sm text-gray-500">Distribution by status</p>
              </div>
            </div>
          </div>

          {projectStatusData.length > 0 ? (
            <>
              <div className="h-52 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <linearGradient id="completionGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#FFC107" />
                        <stop offset="100%" stopColor="#FFD54F" />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                {projectStatusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <span className="text-sm font-semibold text-gray-900 ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-52 flex items-center justify-center">
              <div className="text-center">
                <PieChartIcon size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No projects yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Stage Completion Bar Chart */}
        <div className="stat-card-enhanced">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                <Layers size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Stage Completion</h3>
                <p className="text-sm text-gray-500">Projects per stage</p>
              </div>
            </div>
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageCompletionData} layout="vertical" barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#9CA3AF" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#9CA3AF"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 193, 7, 0.1)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {stageCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Projects Timeline Line Chart */}
      <div className="stat-card-enhanced">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Projects Timeline</h3>
              <p className="text-sm text-gray-500">Created & completed over last 6 months</p>
            </div>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <defs>
                <linearGradient id="projectsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="projects"
                name="Created"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#projectsGradient)"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                name="Completed"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#completedGradient)"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-8 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-600">Projects Created</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-gray-600">Projects Completed</span>
          </div>
        </div>
      </div>

      {/* Completion Rate Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card-enhanced md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
              <Target size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Completion Rate</h3>
              <p className="text-sm text-gray-500">Projects completed</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${stats.completionRate * 2.51} ${251}`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#34D399" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl font-bold text-gray-900">{stats.completionRate}</span>
                  <span className="text-lg font-medium text-gray-500">%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500">
            {stats.completed} of {stats.total} projects completed
          </div>
        </div>

        {/* Average Progress */}
        <div className="stat-card-enhanced md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-400 to-primary-500">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Average Progress</h3>
              <p className="text-sm text-gray-500">Across all projects</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {stats.avgProgress}<span className="text-2xl text-gray-400">%</span>
              </div>
              <p className="text-gray-500">Average strategy completion</p>
              <div className="mt-4 flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-primary-600">{stats.active}</div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center">
                  <div className="text-2xl font-semibold text-amber-600">{stats.strategyComplete}</div>
                  <div className="text-xs text-gray-500">Strategy Done</div>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center">
                  <div className="text-2xl font-semibold text-emerald-600">{stats.completed}</div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
              </div>
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
              <p className="text-sm text-gray-500">Manage and track your work</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View All
            <ArrowRight size={14} />
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FolderKanban size={32} className="text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900">No projects yet</h4>
            <p className="text-gray-500 mt-1">Your assigned projects will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.slice(0, 4).map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                getNextStage={getNextStage}
                getStageProgress={getStageProgress}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-xl border border-red-100 p-4 max-w-sm z-50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle size={18} className="text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
              <button
                onClick={fetchAssignedProjects}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}