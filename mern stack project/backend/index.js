const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const sequelize = require("./src/config/db");
const User = require("./src/models/user");
const authRoutes = require("./src/routes/authroutes");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "src", "public", "uploads"))
);

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT ;

(async () => {
  try {
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error("Failed to start", err);
  }
})();
