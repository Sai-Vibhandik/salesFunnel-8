import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardBody, Button, Spinner } from '@/components/ui';
import { Plus, FileText, Edit, Trash2, ArrowRight, Users, Code, Palette, AlertCircle } from 'lucide-react';
import { projectService, authService } from '@/services/api';

const FUNNEL_TYPES = {
  video_sales_letter: 'Video Sales Letter',
  long_form: 'Long Form',
  lead_magnet: 'Lead Magnet',
  ebook: 'E-book',
  webinar: 'Webinar'
};

const PLATFORMS = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  google: 'Google',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  twitter: 'Twitter',
  whatsapp: 'WhatsApp',
  multi: 'Multi-Platform'
};

export default function LandingPagesList({ projectId }) {
  const navigate = useNavigate();
  const [landingPages, setLandingPages] = useState([]);
  const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Get designer/developer name from all team members
  const getDesignerName = (designerId) => {
    if (!designerId) return 'Not assigned';
    // Handle populated object or raw ID
    const id = designerId?._id?.toString() || designerId?.toString();
    if (!id) return 'Not assigned';
    const designers = teamMembers.ui_ux_designer || [];
    const designer = designers.find(d => (d._id || d)?.toString() === id);
    return designer?.name || 'Unknown';
  };

  const getDeveloperName = (developerId) => {
    if (!developerId) return 'Not assigned';
    // Handle populated object or raw ID
    const id = developerId?._id?.toString() || developerId?.toString();
    if (!id) return 'Not assigned';
    const developers = teamMembers.developer || [];
    const developer = developers.find(d => (d._id || d)?.toString() === id);
    return developer?.name || 'Unknown';
  };

  useEffect(() => {
    fetchLandingPages();
  }, [projectId]);

  const fetchLandingPages = async () => {
    try {
      setLoading(true);
      // Fetch project and team members in parallel
      const [projectRes, teamRes] = await Promise.all([
        projectService.getProject(projectId),
        authService.getTeamByRole()
      ]);

      setProject(projectRes.data);
      setLandingPages(projectRes.data.landingPages || []);
      setTeamMembers(teamRes.data || {});
    } catch (error) {
      console.error('Error fetching landing pages:', error);
      toast.error(error?.message || 'Failed to load landing pages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLandingPage = async () => {
    try {
      setSaving(true);
      const response = await projectService.addLandingPage(projectId, {
        name: `Landing Page ${(landingPages?.length || 0) + 1}`
      });
      toast.success('Landing page created');
      // Navigate to edit the new landing page
      const newLandingPageId = response.data._id;
      navigate(`/landing-page-strategy?projectId=${projectId}&landingPageId=${newLandingPageId}`);
    } catch (error) {
      console.error('Error creating landing page:', error);
      toast.error(error?.message || 'Failed to create landing page');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLandingPage = async (landingPageId, event) => {
    event.stopPropagation();

    if (!confirm('Are you sure you want to delete this landing page? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      await projectService.deleteLandingPage(projectId, landingPageId);
      toast.success('Landing page deleted');
      fetchLandingPages();
    } catch (error) {
      console.error('Error deleting landing page:', error);
      toast.error(error?.message || 'Failed to delete landing page');
    } finally {
      setSaving(false);
    }
  };

  const handleEditLandingPage = (landingPageId) => {
    navigate(`/landing-page-strategy?projectId=${projectId}&landingPageId=${landingPageId}`);
  };

  const handleContinue = async () => {
    if (!landingPages || landingPages.length === 0) {
      toast.error('Please add at least one landing page before continuing');
      return;
    }

    try {
      setCompleting(true);
      // Mark the landing page stage as complete
      await projectService.completeLandingPageStage(projectId);
      toast.success('Landing page stage completed!');
      // Navigate to creative strategy
      navigate(`/creative-strategy?projectId=${projectId}`);
    } catch (error) {
      console.error('Error completing landing page stage:', error);
      // Even if completion fails, try to navigate if there are landing pages
      navigate(`/creative-strategy?projectId=${projectId}`);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Landing Pages</h3>
        <Button onClick={handleCreateLandingPage} loading={saving}>
          <Plus className="w-4 h-4 mr-2" />
          Add Landing Page
        </Button>
      </div>

      {(!landingPages || landingPages.length === 0) ? (
        <Card>
          <CardBody className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No landing pages created yet</p>
            <Button onClick={handleCreateLandingPage} loading={saving}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Landing Page
            </Button>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {landingPages.map((lp) => {
              const hasAssignments = lp.assignedDesigner && lp.assignedDeveloper;
              return (
                <Card
                  key={lp._id}
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${!hasAssignments ? 'border-amber-300' : ''}`}
                  onClick={() => handleEditLandingPage(lp._id)}
                >
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{lp.name}</h4>
                        <p className="text-sm text-gray-500">
                          {FUNNEL_TYPES[lp.funnelType] || lp.funnelType?.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${hasAssignments ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {hasAssignments ? 'Ready' : 'Needs Setup'}
                      </span>
                    </div>

                    {/* Ad Platforms */}
                    {lp.adPlatforms && lp.adPlatforms.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {lp.adPlatforms.slice(0, 3).map(platform => (
                            <span key={platform} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {PLATFORMS[platform] || platform}
                            </span>
                          ))}
                          {lp.adPlatforms.length > 3 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              +{lp.adPlatforms.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Team Assignments */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs flex items-center gap-1 text-purple-600">
                        <Palette className="w-3 h-3" />
                        {getDesignerName(lp.assignedDesigner)}
                      </span>
                      <span className="text-xs flex items-center gap-1 text-green-600">
                        <Code className="w-3 h-3" />
                        {getDeveloperName(lp.assignedDeveloper)}
                      </span>
                    </div>

                    {!hasAssignments && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 mb-3">
                        <AlertCircle className="w-3 h-3" />
                        Click to assign team members
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLandingPage(lp._id);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => handleDeleteLandingPage(lp._id, e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {/* Continue Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleContinue} loading={completing}>
              Continue to Creative Strategy
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}