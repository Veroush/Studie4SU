const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { PrismaClient } = require("@prisma/client");
const { SALT_ROUNDS, JWT_EXPIRES_IN, RESET_TOKEN_TTL_MS } = require("../src/constants");
const prisma = new PrismaClient();

// ── helpers ────────────────────────────────────────────────────────────────────

function makeTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendResetEmail(toEmail, toName, resetUrl, lang = "nl") {
  const transporter = makeTransporter();

  const subject = lang === "nl"
    ? "Wachtwoord opnieuw instellen — Studie4SU"
    : "Reset your password — Studie4SU";

  const html = lang === "nl" ? `
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:520px;margin:0 auto;background:#0d2b1f;color:#f0f0f0;border-radius:12px;overflow:hidden;">
      <div style="padding:32px 32px 24px;border-bottom:1px solid rgba(232,184,75,0.2);">
        <span style="font-family:'Georgia',serif;font-size:1.4rem;color:#e8b84b;font-weight:700;">Studie<span style="color:#fff;">4SU</span></span>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 12px;font-size:1.3rem;">Hoi ${toName},</h2>
        <p style="color:rgba(255,255,255,0.75);line-height:1.6;margin:0 0 24px;">
          We hebben een verzoek ontvangen om het wachtwoord van je Studie4SU-account opnieuw in te stellen.
          Klik op de knop hieronder om een nieuw wachtwoord te kiezen.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#e8b84b;color:#0d2b1f;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:0.95rem;">
          Wachtwoord opnieuw instellen
        </a>
        <p style="color:rgba(255,255,255,0.45);font-size:0.8rem;margin:24px 0 0;line-height:1.5;">
          Deze link is 1 uur geldig. Als jij dit niet hebt aangevraagd, kun je deze e-mail negeren.
        </p>
      </div>
    </div>` : `
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:520px;margin:0 auto;background:#0d2b1f;color:#f0f0f0;border-radius:12px;overflow:hidden;">
      <div style="padding:32px 32px 24px;border-bottom:1px solid rgba(232,184,75,0.2);">
        <span style="font-family:'Georgia',serif;font-size:1.4rem;color:#e8b84b;font-weight:700;">Studie<span style="color:#fff;">4SU</span></span>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 12px;font-size:1.3rem;">Hi ${toName},</h2>
        <p style="color:rgba(255,255,255,0.75);line-height:1.6;margin:0 0 24px;">
          We received a request to reset the password for your Studie4SU account.
          Click the button below to choose a new password.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#e8b84b;color:#0d2b1f;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:0.95rem;">
          Reset my password
        </a>
        <p style="color:rgba(255,255,255,0.45);font-size:0.8rem;margin:24px 0 0;line-height:1.5;">
          This link is valid for 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    </div>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Studie4SU" <${process.env.SMTP_USER}>`,
    to:   toEmail,
    subject,
    html,
  });
}

// ── register ───────────────────────────────────────────────────────────────────

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields required" });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user   = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    res.status(201).json({ token });
  } catch (err) {
    console.error("[register]", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ── login ──────────────────────────────────────────────────────────────────────

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    res.json({ token });
  } catch (err) {
    console.error("[login]", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ── forgot password ────────────────────────────────────────────────────────────
// POST /auth/forgot-password
// Body: { email, lang? }

exports.forgotPassword = async (req, res) => {
  const { email, lang = "nl" } = req.body;

  if (!email)
    return res.status(400).json({ error: "Email required" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond with success — never reveal whether the account exists
    if (!user) {
      console.log(`[forgotPassword] No user found for ${email} — returning silent success`);
      return res.json({ success: true });
    }

    // Invalidate any existing unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data:  { used: true },
    });

    // Generate a secure random token
    const rawToken    = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt   = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await prisma.passwordResetToken.create({
      data: {
        id:        crypto.randomBytes(16).toString("hex"), // required — no @default in schema
        token:     hashedToken,
        userId:    user.id,
        expiresAt,
      },
    });

    const baseUrl  = process.env.APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password.html?token=${rawToken}`;

    console.log(`[forgotPassword] Sending reset email to ${user.email}`);
    await sendResetEmail(user.email, user.name, resetUrl, lang);
    console.log(`[forgotPassword] Email sent OK`);

    res.json({ success: true });
  } catch (err) {
    console.error("[forgotPassword] ERROR:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ── reset password ─────────────────────────────────────────────────────────────
// POST /auth/reset-password
// Body: { token, password }

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password)
    return res.status(400).json({ error: "Token and password required" });
  if (password.length < 8)
    return res.status(400).json({ error: "Password must be at least 8 characters" });

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const record = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });

    if (!record)
      return res.status(400).json({ error: "Invalid or expired reset link" });
    if (record.used)
      return res.status(400).json({ error: "This link has already been used" });
    if (record.expiresAt < new Date())
      return res.status(400).json({ error: "This link has expired" });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: record.userId },
      data:  { password: hashed },
    });

    await prisma.passwordResetToken.update({
      where: { id: record.id },
      data:  { used: true },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("[resetPassword]", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ── validate token ─────────────────────────────────────────────────────────────
// GET /auth/validate-reset-token?token=xxx

exports.validateResetToken = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ valid: false });

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const record = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });

    if (!record || record.used || record.expiresAt < new Date())
      return res.json({ valid: false });

    res.json({ valid: true });
  } catch (err) {
    console.error("[validateResetToken]", err);
    res.status(500).json({ valid: false });
  }
};