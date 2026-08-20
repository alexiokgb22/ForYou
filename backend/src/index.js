require("dotenv").config();
require("./config/passport");

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const collectionRoutes = require("./routes/collections");
const writeRoutes = require("./routes/write");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/collections", collectionRoutes);
app.use("/write", writeRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
