require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cloudinary = require("./config/cloudinary");
const Image = require("./models/Image");
const http = require("http");
const { Server } = require("socket.io");
const PORT = process.env.PORT || 5000;

const connectDB = require("./config/db");
connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
  res.send("Server running");
});
app.get("/images", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 18;
    const skip = parseInt(req.query.skip) || 0;

    const images = await Image.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Image.countDocuments();

    res.json({
      images,
      total,
      hasMore: skip + limit < total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/upload", async (req, res) => {
  try {
    const { image, eventId, userId } = req.body;

    const result = await cloudinary.uploader.upload(image);

    const newImage = await Image.create({
      eventId,
      userId,
      imageUrl: result.secure_url,
    });

    res.json(newImage);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});