const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  eventId: {
    type: String,
  },
  userId: {
    type: String,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Image", imageSchema);