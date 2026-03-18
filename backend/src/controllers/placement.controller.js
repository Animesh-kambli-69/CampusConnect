'use strict';

const { validationResult } = require('express-validator');
const InterviewExp = require('../models/InterviewExp');
const JobOpportunity = require('../models/JobOpportunity');

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

// ─── Interview Experiences ────────────────────────────────────────────────────

async function getInterviewExps(req, res, next) {
  try {
    const collegeId = req.user.collegeId?._id || req.user.collegeId;
    const { company, role } = req.query;

    const filter = { collegeId };
    if (company) filter.company = { $regex: company, $options: 'i' };
    if (role) filter.role = { $regex: role, $options: 'i' };

    const experiences = await InterviewExp.find(filter)
      .populate('postedBy', 'name avatarUrl branch year')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, count: experiences.length, data: { experiences } });
  } catch (error) {
    next(error);
  }
}

async function createInterviewExp(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;

    const { company, role, rounds, difficulty, outcome, year, experience, tips } = req.body;
    const collegeId = req.user.collegeId?._id || req.user.collegeId;

    const exp = await InterviewExp.create({
      company,
      role,
      rounds: rounds || [],
      difficulty: difficulty || 'medium',
      outcome: outcome || 'pending',
      year,
      experience,
      tips: tips || '',
      postedBy: req.user._id,
      collegeId,
    });

    await exp.populate('postedBy', 'name avatarUrl branch year');

    res.status(201).json({ success: true, message: 'Experience shared.', data: { exp } });
  } catch (error) {
    next(error);
  }
}

async function deleteInterviewExp(req, res, next) {
  try {
    const exp = await InterviewExp.findById(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: 'Not found.' });

    if (exp.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await exp.deleteOne();
    res.status(200).json({ success: true, message: 'Deleted.' });
  } catch (error) {
    next(error);
  }
}

async function upvoteInterviewExp(req, res, next) {
  try {
    const exp = await InterviewExp.findById(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: 'Not found.' });

    const userId = req.user._id.toString();
    const alreadyUpvoted = exp.upvotes.some((id) => id.toString() === userId);

    if (alreadyUpvoted) {
      exp.upvotes = exp.upvotes.filter((id) => id.toString() !== userId);
    } else {
      exp.upvotes.push(req.user._id);
    }

    await exp.save();
    res.status(200).json({
      success: true,
      data: { upvoted: !alreadyUpvoted, upvoteCount: exp.upvotes.length },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Job Opportunities ────────────────────────────────────────────────────────

async function getOpportunities(req, res, next) {
  try {
    const collegeId = req.user.collegeId?._id || req.user.collegeId;
    const { company, type } = req.query;

    const filter = { collegeId };
    if (company) filter.company = { $regex: company, $options: 'i' };
    if (type) filter.type = type;

    const opportunities = await JobOpportunity.find(filter)
      .populate('postedBy', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, count: opportunities.length, data: { opportunities } });
  } catch (error) {
    next(error);
  }
}

async function createOpportunity(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;

    const { company, role, type, description, applyLink, deadline } = req.body;
    const collegeId = req.user.collegeId?._id || req.user.collegeId;

    const opportunity = await JobOpportunity.create({
      company,
      role,
      type: type || 'off_campus',
      description: description || '',
      applyLink: applyLink || null,
      deadline: deadline ? new Date(deadline) : null,
      postedBy: req.user._id,
      collegeId,
    });

    await opportunity.populate('postedBy', 'name avatarUrl');

    res.status(201).json({ success: true, message: 'Opportunity posted.', data: { opportunity } });
  } catch (error) {
    next(error);
  }
}

async function deleteOpportunity(req, res, next) {
  try {
    const opportunity = await JobOpportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Not found.' });

    if (opportunity.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await opportunity.deleteOne();
    res.status(200).json({ success: true, message: 'Deleted.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getInterviewExps,
  createInterviewExp,
  deleteInterviewExp,
  upvoteInterviewExp,
  getOpportunities,
  createOpportunity,
  deleteOpportunity,
};
