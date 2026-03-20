import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardBody, Button, Badge, Spinner } from '@/components/ui';
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
} from 'lucide-react';

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

  const getTaskTypeIcon = (type) => {
    switch (type) {
      case 'imageCreatives':
        return <Image className="w-4 h-4" />;
      case 'videoCreatives':
        return <Video className="w-4 h-4" />;
      case 'uiuxDesigns':
        return <Layout className="w-4 h-4" />;
      case 'landingPages':
        return <Code className="w-4 h-4" />;
      default:
        return <FileCheck className="w-4 h-4" />;
    }
  };

  const getTaskTypeLabel = (type) => {
    switch (type) {
      case 'imageCreatives':
        return 'Image Creatives';
      case 'videoCreatives':
        return 'Video Creatives';
      case 'uiuxDesigns':
        return 'UI/UX Designs';
      case 'landingPages':
        return 'Landing Pages';
      default:
        return type;
    }
  };

  // Calculate total stats across all projects
  const getTotalStats = () => {
    return projects.reduce((acc, project) => ({
      total: acc.total + (project.taskStats?.total || 0),
      finalApproved: acc.finalApproved + (project.taskStats?.finalApproved || 0),
      rejected: acc.rejected + (project.taskStats?.rejected || 0),
    }), { total: 0, finalApproved: 0, rejected: 0 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalStats = getTotalStats();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assets Pipeline</h1>
          <p className="text-gray-600 mt-1">Track all tasks and assets across your projects</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{totalStats.total}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Final Approved</p>
            <p className="text-2xl font-bold text-green-600">{totalStats.finalApproved}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{totalStats.rejected}</p>
          </CardBody>
        </Card>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No projects found</p>
            <p className="text-sm text-gray-400 mt-2">
              Projects assigned to you will appear here
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card
              key={project._id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/assets/project/${project._id}`)}
            >
              <CardBody className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {project.projectName || project.businessName}
                      </h3>
                      <Badge variant={project.isActive ? 'success' : 'default'}>
                        {project.status || 'Active'}
                      </Badge>
                    </div>

                    {project.industry && (
                      <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded mb-3">
                        {project.industry}
                      </span>
                    )}

                    {/* Task Stats */}
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <FileCheck className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">{project.taskStats?.total || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">Final Approved:</span>
                        <span className="font-medium text-green-600">{project.taskStats?.finalApproved || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-gray-600">Rejected:</span>
                        <span className="font-medium text-red-600">{project.taskStats?.rejected || 0}</span>
                      </div>
                    </div>

                    {/* Task Type Breakdown */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {Object.entries(project.tasksByType?.all || {}).map(([type, tasks]) => {
                        const count = tasks?.length || 0;
                        if (count === 0) return null;
                        return (
                          <span
                            key={type}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                          >
                            {getTaskTypeIcon(type)}
                            <span>{getTaskTypeLabel(type)}: {count}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/assets/project/${project._id}`);
                      }}
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}