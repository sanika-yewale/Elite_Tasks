const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Activity = require("./models/Activity");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(
  "mongodb://127.0.0.1:27017/productivity"
);

app.post("/track", async (req, res) => {
  const activity =
    await Activity.create(req.body);

  res.json(activity);
});

app.get("/analytics", async (req, res) => {
  const data =
    await Activity.find();

  res.json(data);
});

app.listen(5000, () => {
  console.log(
    "Server running on port 5000"
  );
});