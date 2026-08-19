const router = require("express").Router();
const passport = require("passport");
const requireAuth = require("../middleware/requireAuth");
const { register, login, googleCallback, me, logout } = require("../controllers/authController");

// Inscription classique
router.post("/register", register);

// Connexion classique
router.post("/login", passport.authenticate("local", { session: false }), login);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login" }), googleCallback);

// Infos user connecté
router.get("/me", requireAuth, me);

// Déconnexion
router.post("/logout", logout);

module.exports = router;
