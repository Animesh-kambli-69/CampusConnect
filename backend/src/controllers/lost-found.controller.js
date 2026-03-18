'use strict';

const { validationResult } = require('express-validator');
const LostFound = require('../models/LostFound');
const { uploadImage } = require('../config/cloudinary');

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

async function getLostFoundItems(req, res, next) {
  try {
    const collegeId = req.user.collegeId?._id || req.user.collegeId;
    const { type, status } = req.query;

    const filter = { collegeId };
    if (type && ['lost', 'found'].includes(type)) filter.type = type;
    if (status && ['open', 'resolved'].includes(status)) filter.status = status;

    const items = await LostFound.find(filter)
      .populate('postedBy', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, count: items.length, data: { items } });
  } catch (error) {
    next(error);
  }
}

async function createLostFoundItem(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;

    const { type, title, description, location } = req.body;
    const collegeId = req.user.collegeId?._id || req.user.collegeId;

    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL via multer-storage-cloudinary
    }

    const item = await LostFound.create({
      type,
      title,
      description: description || '',
      imageUrl,
      location: location || '',
      postedBy: req.user._id,
      collegeId,
    });

    await item.populate('postedBy', 'name avatarUrl');

    res.status(201).json({ success: true, message: 'Item posted.', data: { item } });
  } catch (error) {
    next(error);
  }
}

async function resolveLostFoundItem(req, res, next) {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    const collegeId = req.user.collegeId?._id || req.user.collegeId;
    if (item.collegeId.toString() !== collegeId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the poster can resolve.' });
    }

    item.status = 'resolved';
    await item.save();

    res.status(200).json({ success: true, message: 'Marked as resolved.', data: { item } });
  } catch (error) {
    next(error);
  }
}

async function deleteLostFoundItem(req, res, next) {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    const isOwner = item.postedBy.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'campusAdmin', 'superAdmin'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await item.deleteOne();
    res.status(200).json({ success: true, message: 'Item deleted.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLostFoundItems,
  createLostFoundItem,
  resolveLostFoundItem,
  deleteLostFoundItem,
};
