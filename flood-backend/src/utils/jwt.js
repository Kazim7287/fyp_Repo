const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const config = require("../config/env");

function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      type: "access"
    },
    config.jwt.accessSecret,
    {
      expiresIn: config.jwt.accessExpiresIn
    }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      type: "refresh"
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn
    }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(
    token,
    config.jwt.accessSecret
  );
}

function verifyRefreshToken(token) {
  return jwt.verify(
    token,
    config.jwt.refreshSecret
  );
}

function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken
};