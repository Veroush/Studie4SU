/**
 * Studie4SU — Gmail SMTP test script
 * 
 * DROP THIS FILE in your project root (next to package.json).
 * Run: node test-email.js
 *
 * This bypasses the entire Express app and tests Gmail directly.
 * If this works, the controller will work. If this fails, the error
 * message will tell you exactly what's wrong.
 */

require("dotenv").config();
const nodemailer = require("nodemailer");

// ── Config (pulled from your .env) ────────────────────────────────────────────
const config = {
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  user:   process.env.SMTP_USER,
  pass:   process.env.SMTP_PASS,
  from:   process.env.SMTP_USER, // use plain email to avoid parsing issues
};

// ── Send to yourself ───────────────────────────────────────────────────────────
const TEST_RECIPIENT = process.env.SMTP_USER; // sends to yourself

async function main() {
  console.log("\n── Studie4SU Email Test ──────────────────────────────");
  console.log("SMTP_HOST  :", config.host);
  console.log("SMTP_PORT  :", config.port);
  console.log("SMTP_SECURE:", config.secure);
  console.log("SMTP_USER  :", config.user);
  console.log("SMTP_PASS  :", config.pass ? `✅ set (${config.pass.length} chars)` : "❌ MISSING");
  console.log("Sending to :", TEST_RECIPIENT);
  console.log("─────────────────────────────────────────────────────\n");

  if (!config.pass || config.pass === "placeholder_data") {
    console.error("❌ SMTP_PASS is not set. Add your 16-character Gmail App Password to .env");
    console.error("   Go to: https://myaccount.google.com/apppasswords");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host:   config.host,
    port:   config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  // Step 1: Verify SMTP connection
  console.log("Step 1: Verifying SMTP connection...");
  try {
    await transporter.verify();
    console.log("✅ SMTP connection OK\n");
  } catch (err) {
    console.error("❌ SMTP connection FAILED:");
    console.error("   Error code   :", err.code);
    console.error("   Error message:", err.message);
    console.error("\n── Common fixes ──────────────────────────────────────");
    if (err.code === "EAUTH") {
      console.error("  → Wrong App Password. Make sure you copied all 16 chars.");
      console.error("    Go to: https://myaccount.google.com/apppasswords");
      console.error("    Create a new one for 'Mail' + 'Windows/Other'.");
    } else if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") {
      console.error("  → Can't reach smtp.gmail.com:587.");
      console.error("    Check your internet connection or firewall.");
    } else if (err.message?.includes("Less secure")) {
      console.error("  → You're using your real Gmail password, not an App Password.");
      console.error("    App Passwords only work when 2-Step Verification is ON.");
    }
    process.exit(1);
  }

  // Step 2: Send a test email
  console.log("Step 2: Sending test email...");
  try {
    const info = await transporter.sendMail({
      from:    `"Studie4SU Test" <${config.from}>`,
      to:      TEST_RECIPIENT,
      subject: "✅ Studie4SU — Email test geslaagd",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0d2b1f;color:#f0f0f0;border-radius:12px;padding:32px;">
          <h2 style="color:#e8b84b;margin:0 0 16px;">✅ Email werkt!</h2>
          <p style="color:rgba(255,255,255,0.8);line-height:1.6;">
            De Studie4SU SMTP-configuratie is correct ingesteld.<br>
            De wachtwoord-reset e-mails worden verstuurd via <strong>${config.user}</strong>.
          </p>
          <p style="color:rgba(255,255,255,0.4);font-size:0.8rem;margin-top:24px;">
            Sent at: ${new Date().toISOString()}
          </p>
        </div>
      `,
    });
    console.log("✅ Email sent successfully!");
    console.log("   Message ID:", info.messageId);
    console.log("\n   Check your inbox at:", TEST_RECIPIENT);
    console.log("   (Also check Spam folder if it doesn't appear)\n");
  } catch (err) {
    console.error("❌ Sending FAILED:");
    console.error("   Error:", err.message);
    process.exit(1);
  }
}

main();