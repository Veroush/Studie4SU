require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ─── REGISTER ───────────────────────────────────────────────
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // Basic presence check
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    // Return a token so the frontend can log the user in straight away
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ message: "Registration successful", token });

  } catch (error) {
    // Prisma unique constraint violation = email already taken
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Email already in use" });
    }
    console.error("[register error]", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// ─── LOGIN ───────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token });

  } catch (error) {
    console.error("[login error]", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};