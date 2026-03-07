// server/middleware/auth.js
// JWT middleware for Studie4SU
//
// requireAuth  — blocks the request with 401 if no valid token
// optionalAuth — attaches req.userId if token is valid, but never blocks

const jwt = require("jsonwebtoken");

// ── requireAuth ────────────────────────────────────────────────
// Use on routes that must be authenticated (e.g. register for open house)
exports.requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Login required" });
  }

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId   = payload.id;
    req.userRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ── optionalAuth ───────────────────────────────────────────────
// Use on public routes that return personalised data when logged in.
// Never returns 401 — just continues as a guest if no token.
exports.optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return next();

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId   = payload.id;
    req.userRole = payload.role;
  } catch {
    // Invalid/expired token — continue as guest
  }
  next();
};

// ── adminOnly ──────────────────────────────────────────────────
// Use after requireAuth on admin-only routes
exports.adminOnly = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};