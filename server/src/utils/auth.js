const Project = require('../models/Project');

/**
 * Check if a user has access to a project
 * @param {Object} project - The project document (should have assignedTeam populated)
 * @param {Object} user - The user object from req.user
 * @returns {boolean} - True if user has access
 */
exports.hasProjectAccess = (project, user) => {
  // Admin always has access
  if (user.role === 'admin') {
    return true;
  }

  const userId = user._id.toString();

  // Check if user is the creator
  if (project.createdBy && project.createdBy.toString() === userId) {
    return true;
  }

  // Check if user is assigned to the team (support both singular and plural field names)
  const assignedTeam = project.assignedTeam || {};

  // Check all possible team assignments
  const isAssigned =
    // Singular fields (legacy)
    assignedTeam.performanceMarketer?._id?.toString() === userId ||
    assignedTeam.performanceMarketer?.toString() === userId ||
    assignedTeam.contentCreator?._id?.toString() === userId ||
    assignedTeam.contentCreator?.toString() === userId ||
    assignedTeam.contentWriter?._id?.toString() === userId ||
    assignedTeam.contentWriter?.toString() === userId ||
    assignedTeam.uiUxDesigner?._id?.toString() === userId ||
    assignedTeam.uiUxDesigner?.toString() === userId ||
    assignedTeam.graphicDesigner?._id?.toString() === userId ||
    assignedTeam.graphicDesigner?.toString() === userId ||
    assignedTeam.videoEditor?._id?.toString() === userId ||
    assignedTeam.videoEditor?.toString() === userId ||
    assignedTeam.developer?._id?.toString() === userId ||
    assignedTeam.developer?.toString() === userId ||
    assignedTeam.tester?._id?.toString() === userId ||
    assignedTeam.tester?.toString() === userId ||
    // Plural fields (arrays)
    (assignedTeam.performanceMarketers && assignedTeam.performanceMarketers.some(m => (m._id || m)?.toString() === userId)) ||
    (assignedTeam.contentWriters && assignedTeam.contentWriters.some(m => (m._id || m)?.toString() === userId)) ||
    (assignedTeam.uiUxDesigners && assignedTeam.uiUxDesigners.some(m => (m._id || m)?.toString() === userId)) ||
    (assignedTeam.graphicDesigners && assignedTeam.graphicDesigners.some(m => (m._id || m)?.toString() === userId)) ||
    (assignedTeam.videoEditors && assignedTeam.videoEditors.some(m => (m._id || m)?.toString() === userId)) ||
    (assignedTeam.developers && assignedTeam.developers.some(m => (m._id || m)?.toString() === userId)) ||
    (assignedTeam.testers && assignedTeam.testers.some(m => (m._id || m)?.toString() === userId));

  return isAssigned;
};

/**
 * Middleware to check project access
 * @param {string} projectIdParam - The request param name for project ID (default: 'projectId')
 * @returns {Function} Express middleware
 */
exports.checkProjectAccess = (projectIdParam = 'projectId') => {
  return async (req, res, next) => {
    try {
      const projectId = req.params[projectIdParam];

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Project ID is required'
        });
      }

      const project = await Project.findById(projectId)
        .populate('assignedTeam.performanceMarketer', '_id')
        .populate('assignedTeam.performanceMarketers', '_id')
        .populate('assignedTeam.contentCreator', '_id')
        .populate('assignedTeam.contentWriter', '_id')
        .populate('assignedTeam.contentWriters', '_id')
        .populate('assignedTeam.uiUxDesigner', '_id')
        .populate('assignedTeam.uiUxDesigners', '_id')
        .populate('assignedTeam.graphicDesigner', '_id')
        .populate('assignedTeam.graphicDesigners', '_id')
        .populate('assignedTeam.videoEditor', '_id')
        .populate('assignedTeam.videoEditors', '_id')
        .populate('assignedTeam.developer', '_id')
        .populate('assignedTeam.developers', '_id')
        .populate('assignedTeam.tester', '_id')
        .populate('assignedTeam.testers', '_id');

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      if (!exports.hasProjectAccess(project, req.user)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this project'
        });
      }

      req.project = project;
      next();
    } catch (error) {
      next(error);
    }
  };
};