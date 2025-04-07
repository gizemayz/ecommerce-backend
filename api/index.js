const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("DB Error:", err));

app.use("/items", require("./routes/items"));
app.use("/users", require("./routes/users"));
app.use("/authentication", require("./routes/authentication"));

app.get("/", (req, res) => res.send("hellü from backend"));

module.exports = app;
module.exports.handler = serverless(app); 
