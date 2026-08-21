const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const register = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: "Champs manquants" });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email déjà utilisé" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
  });

  res.cookie("token", signToken(user.id), cookieOptions);
  res.status(201).json({ id: user.id, email: user.email, name: user.name });
};

const login = (req, res) => {
  res.cookie("token", signToken(req.user.id), cookieOptions);
  res.json({ id: req.user.id, email: req.user.email, name: req.user.name });
};

const googleCallback = (req, res) => {
  res.cookie("token", signToken(req.user.id), cookieOptions);
  res.redirect(process.env.CLIENT_URL + "/dashboard");
};

const me = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true, avatarUrl: true },
  });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
  res.json(user);
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Déconnecté" });
};

module.exports = { register, login, googleCallback, me, logout };
