/**
 * AUTH MIDDLEWARE
 * File: backend/middleware/auth.js
 */

const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');
const { AppError } = require('./errorHandler');
const { HTTP_STATUS } = require('../config/constants');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      throw new AppError('User no longer exists', HTTP_STATUS.UNAUTHORIZED);
    }

    req.user = { userId: user.id, email: user.email, name: user.name };
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid token', HTTP_STATUS.UNAUTHORIZED));
    }
  }
};

module.exports = authMiddleware;
