require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cloudinary = require("./config/cloudinary");
const Image = require("./models/Image");
const http = require("http");
const { Server } = require("socket.io");

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
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images);
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


server.listen(5000, () => {
  console.log("Server running on port 5000");
});