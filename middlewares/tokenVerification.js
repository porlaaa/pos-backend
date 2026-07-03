const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/userModel");

const isVerifiedUser = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return next(createHttpError(401, "Please provide token!"));
    }

    const decodeToken = jwt.verify(accessToken, config.accessTokenSecret);

    const user = await User.findById(decodeToken._id);
    if (!user) {
      return next(createHttpError(401, "User not exist!"));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(createHttpError(401, "Invalid Token!"));
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createHttpError(401, "Please login first!"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(createHttpError(403, "Forbidden: insufficient role"));
    }

    return next();
  };
};

module.exports = { isVerifiedUser, requireRole };