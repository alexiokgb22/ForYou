require("dotenv").config();
require("./config/passport");

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("./config/cors");

const authRoutes = require("./routes/auth");
const collectionRoutes = require("./routes/collections");
const writeRoutes = require("./routes/write");

const app = express();

app.use(cors);
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/collections", collectionRoutes);
app.use("/write", writeRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
