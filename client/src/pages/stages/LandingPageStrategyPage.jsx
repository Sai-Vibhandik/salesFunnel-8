import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardBody, CardHeader, Button, Input, Spinner } from '@/components/ui';
import { StageProgressTracker } from '@/components/workflow';
import { ArrowLeft, ArrowRight, Users, Code, Palette } from 'lucide-react';
import { projectService, authService } from '@/services/api';

const LANDING_PAGE_TYPES = [
  { id: 'video_sales_letter', label: 'Video Sales Letter', icon: '🎥' },
  { id: 'long_form', label: 'Long-form Page', icon: '📄' },
  { id: 'lead_magnet', label: 'Lead Magnet', icon: '🧲' },
  { id: 'ebook', label: 'Ebook Page', icon: '📚' },
  { id: 'webinar', label: 'Webinar Page', icon: '🖥️' },
];

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'google', label: 'Google Ads' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'twitter', label: 'Twitter/X' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'multi', label: 'Multi-Platform' },
];

export default function LandingPageStrategyPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const landingPageId = searchParams.get('landingPageId');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState(null);
  const [allDesigners, setAllDesigners] = useState([]);
  const [allDevelopers, setAllDevelopers] = useState([]);

  // Form state
  const [name, setName] = useState('');
  const [funnelType, setFunnelType] = useState('video_sales_letter');
  const [adPlatforms, setAdPlatforms] = useState(['facebook']);
  const [assignedDesigner, setAssignedDesigner] = useState('');
  const [assignedDeveloper, setAssignedDeveloper] = useState('');

  useEffect(() => {
    if (!projectId) {
      navigate('/projects');
      return;
    }
    fetchData();
  }, [projectId, landingPageId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch project and team members in parallel
      const [projectRes, teamRes] = await Promise.all([
        projectService.getProject(projectId),
        authService.getTeamByRole()
      ]);

      setProject(projectRes.data);

      // Extract all available UI/UX Designers and Developers from the team
      const teamByRole = teamRes.data || {};
      setAllDesigners(teamByRole.ui_ux_designer || []);
      setAllDevelopers(teamByRole.developer || []);

      // Check if traffic strategy is completed
      if (!projectRes.data.stages?.trafficStrategy?.isCompleted) {
        toast.error('Complete Traffic Strategy first to access Landing Pages');
        navigate('/projects');
        return;
      }

      if (landingPageId) {
        // Load specific landing page from embedded array
        const lp = projectRes.data.landingPages?.find(lp => lp._id.toString() === landingPageId);
        if (lp) {
          setName(lp.name || '');
          setFunnelType(lp.funnelType || 'video_sales_letter');
          setAdPlatforms(lp.adPlatforms?.length > 0 ? lp.adPlatforms : ['facebook']);
          setAssignedDesigner(lp.assignedDesigner?._id || lp.assignedDesigner?.toString() || '');
          setAssignedDeveloper(lp.assignedDeveloper?._id || lp.assignedDeveloper?.toString() || '');
        } else {
          toast.error('Landing page not found');
          navigate(`/landing-pages?projectId=${projectId}`);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = error?.message || 'Failed to load landing page';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a landing page name');
      return;
    }

    // Team assignment is optional - don't require it
    try {
      setSaving(true);

      const landingPageData = {
        name,
        funnelType,
        adPlatforms,
        assignedDesigner: assignedDesigner || null,
        assignedDeveloper: assignedDeveloper || null,
      };

      if (landingPageId) {
        // Update existing
        await projectService.updateLandingPage(projectId, landingPageId, landingPageData);
      } else {
        // Create new
        await projectService.addLandingPage(projectId, landingPageData);
      }

      toast.success('Landing page saved!');

      // Navigate back to landing pages list
      navigate(`/landing-pages?projectId=${projectId}`);
    } catch (error) {
      console.error('Error saving landing page:', error);
      toast.error(error?.message || 'Failed to save landing page');
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = async () => {
    // Save first if there are unsaved changes
    if (!name.trim()) {
      toast.error('Please enter a landing page name before continuing');
      return;
    }

    try {
      setSaving(true);

      const landingPageData = {
        name,
        funnelType,
        adPlatforms,
        assignedDesigner: assignedDesigner || null,
        assignedDeveloper: assignedDeveloper || null,
      };

      if (landingPageId) {
        await projectService.updateLandingPage(projectId, landingPageId, landingPageData);
      }

      // Mark landing page stage as complete
      try {
        await projectService.completeLandingPageStage(projectId);
        toast.success('Landing page stage completed!');
      } catch (completeError) {
        // Continue even if completion fails - backend allows access if landing pages exist
        console.error('Error completing stage:', completeError);
      }

      // Navigate to creative strategy
      navigate(`/creative-strategy?projectId=${projectId}`);
    } catch (error) {
      console.error('Error saving landing page:', error);
      toast.error(error?.message || 'Failed to save landing page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/landing-pages?projectId=${projectId}`)} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {name || 'Landing Page Strategy'}
          </h1>
          <p className="text-gray-600 mt-1">{project?.businessName}</p>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardBody className="p-4">
          <StageProgressTracker stages={project?.stages} currentStage={project?.currentStage} />
        </CardBody>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          <p className="text-sm text-gray-500">Name and platform for this landing page</p>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Landing Page Name"
            placeholder="e.g., Main Landing Page, Campaign A, etc."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Funnel Type</label>
              <select
                value={funnelType}
                onChange={(e) => setFunnelType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {LANDING_PAGE_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad Platforms</label>
              <p className="text-xs text-gray-500 mb-2">Select all platforms where this landing page will be promoted</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => {
                  const isSelected = adPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setAdPlatforms(adPlatforms.filter(id => id !== p.id));
                        } else {
                          setAdPlatforms([...adPlatforms, p.id]);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                        isSelected
                          ? 'bg-primary-100 border-primary-300 text-primary-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-primary-200 hover:bg-primary-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Team Assignment */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500" />
            Team Assignment
          </h2>
          <p className="text-sm text-gray-500">Assign team members for this landing page (optional)</p>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Palette className="w-4 h-4 text-purple-500" />
                UI/UX Designer
              </label>
              <select
                value={assignedDesigner}
                onChange={(e) => setAssignedDesigner(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Designer (optional)...</option>
                {allDesigners.map(d => (
                  <option key={d._id || d} value={(d._id || d).toString()}>
                    {d.name || 'Unknown'}
                  </option>
                ))}
              </select>
              {allDesigners.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No UI/UX Designers found in team.
                </p>
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Code className="w-4 h-4 text-green-500" />
                Developer
              </label>
              <select
                value={assignedDeveloper}
                onChange={(e) => setAssignedDeveloper(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Developer (optional)...</option>
                {allDevelopers.map(d => (
                  <option key={d._id || d} value={(d._id || d).toString()}>
                    {d.name || 'Unknown'}
                  </option>
                ))}
              </select>
              {allDevelopers.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No Developers found in team.
                </p>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            You can assign team members now or later. Assignments will be used when generating tasks.
          </p>
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="flex justify-between gap-4">
        <Button variant="secondary" onClick={() => navigate(`/landing-pages?projectId=${projectId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Landing Pages
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onSave} loading={saving}>
            Save
          </Button>
          <Button onClick={handleContinue} loading={saving}>
            Continue to Creative Strategy
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}