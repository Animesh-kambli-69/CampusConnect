'use strict';

const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const { getIO } = require('../config/socket');
const { logActivity } = require('../utils/activity');

function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
    return true;
  }
  return false;
}

async function getProjects(req, res, next) {
  try {
    const collegeId = req.user.collegeId?._id || req.user.collegeId;
    const { tech } = req.query;

    const filter = { collegeId };
    if (tech) filter.techStack = { $in: [new RegExp(tech, 'i')] };

    const projects = await Project.find(filter)
      .populate('createdBy', 'name avatarUrl branch year')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, count: projects.length, data: { projects } });
  } catch (error) {
    next(error);
  }
}

async function getProjectById(req, res, next) {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name avatarUrl branch year bio skills');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const collegeId = req.user.collegeId?._id || req.user.collegeId;
    if (project.collegeId.toString() !== collegeId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
}

async function getUserProjects(req, res, next) {
  try {
    const projects = await Project.find({ createdBy: req.params.userId })
      .populate('createdBy', 'name avatarUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: projects.length, data: { projects } });
  } catch (error) {
    next(error);
  }
}

async function createProject(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;

    const { title, description, techStack, githubUrl, demoUrl, imageUrls } = req.body;
    const collegeId = req.user.collegeId?._id || req.user.collegeId;

    const project = await Project.create({
      title,
      description,
      techStack: techStack || [],
      githubUrl: githubUrl || null,
      demoUrl: demoUrl || null,
      imageUrls: imageUrls || [],
      createdBy: req.user._id,
      collegeId,
    });

    await project.populate('createdBy', 'name avatarUrl branch year');

    try {
      const io = getIO();
      io.to(`college:${collegeId}`).emit('project:new', { project });
    } catch {
      // degrade gracefully
    }

    setImmediate(() => {
      logActivity({
        type: 'project:created',
        actor: req.user,
        meta: { projectId: project._id, title: project.title },
        collegeId,
      });
    });

    // Award points
    setImmediate(async () => {
      try {
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user._id, { $inc: { points: 15 } });
        await checkAndAwardBadges(req.user._id);
      } catch { /* ignore */ }
    });

    res.status(201).json({ success: true, message: 'Project created.', data: { project } });
  } catch (error) {
    next(error);
  }
}

async function updateProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { title, description, techStack, githubUrl, demoUrl, imageUrls } = req.body;
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (techStack !== undefined) project.techStack = techStack;
    if (githubUrl !== undefined) project.githubUrl = githubUrl;
    if (demoUrl !== undefined) project.demoUrl = demoUrl;
    if (imageUrls !== undefined) project.imageUrls = imageUrls;

    await project.save();
    await project.populate('createdBy', 'name avatarUrl branch year');

    res.status(200).json({ success: true, message: 'Project updated.', data: { project } });
  } catch (error) {
    next(error);
  }
}

async function deleteProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const isOwner = project.createdBy.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'campusAdmin', 'superAdmin'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await project.deleteOne();
    res.status(200).json({ success: true, message: 'Project deleted.' });
  } catch (error) {
    next(error);
  }
}

async function likeProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const collegeId = req.user.collegeId?._id || req.user.collegeId;
    if (project.collegeId.toString() !== collegeId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = project.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      project.likes = project.likes.filter((id) => id.toString() !== userId);
    } else {
      project.likes.push(req.user._id);

      // Award points to project owner on first 10 likes
      if (project.likes.length === 10) {
        setImmediate(async () => {
          try {
            const User = require('../models/User');
            await User.findByIdAndUpdate(project.createdBy, {
              $addToSet: { badges: 'Showcase Star' },
            });
          } catch { /* ignore */ }
        });
      }
    }

    await project.save();
    res.status(200).json({
      success: true,
      data: { liked: !alreadyLiked, likesCount: project.likes.length },
    });
  } catch (error) {
    next(error);
  }
}

async function checkAndAwardBadges(userId) {
  try {
    const User = require('../models/User');
    const Project = require('../models/Project');

    const user = await User.findById(userId);
    if (!user) return;

    const projectCount = await Project.countDocuments({ createdBy: userId });
    if (projectCount >= 1 && !user.badges.includes('Project Pioneer')) {
      await User.findByIdAndUpdate(userId, { $addToSet: { badges: 'Project Pioneer' } });
    }
  } catch { /* ignore */ }
}

module.exports = {
  getProjects,
  getProjectById,
  getUserProjects,
  createProject,
  updateProject,
  deleteProject,
  likeProject,
};
