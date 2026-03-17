// src/constants.js
// Central place for fixed configuration values used across the app.
// Val — added Session 3

module.exports = {
  SALT_ROUNDS:        12,           // bcrypt cost factor for password hashing
  JWT_EXPIRES_IN:     "7d",         // how long a login token stays valid
  RESET_TOKEN_TTL_MS: 60 * 60 * 1000, // password-reset link lifetime: 1 hour
};