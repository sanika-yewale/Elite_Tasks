const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  website: String,
  category: String,
  timeSpent: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "Activity",
  ActivitySchema
);