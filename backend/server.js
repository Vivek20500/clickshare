require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("./config/cloudinary");
const Image = require("./models/Image");
const User = require("./models/User");
const Event = require("./models/Event");
const verifyToken = require("./middleware/auth");
const http = require("http");
const { Server } = require("socket.io");
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

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

// ==================== AUTH ROUTES ====================

// REGISTER
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== EVENT ROUTES ====================

// GENERATE UNIQUE CODE
function generateEventCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// CREATE EVENT
app.post("/events/create", verifyToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Event name is required" });
    }

    let code;
    let codeExists = true;
    while (codeExists) {
      code = generateEventCode();
      codeExists = await Event.findOne({ code });
    }

    const newEvent = await Event.create({
      name,
      code,
      admin: req.userId,
      members: [req.userId],
    });

    await newEvent.populate("admin", "name email");

    res.json({
      event: newEvent,
      code: code,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// JOIN EVENT
app.post("/events/join", verifyToken, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Event code is required" });
    }

    const event = await Event.findOne({ code });
    if (!event) {
      return res.status(400).json({ error: "Invalid event code" });
    }

    if (!event.members.includes(req.userId)) {
      event.members.push(req.userId);
      await event.save();
    }

    await event.populate("admin members", "name email");

    res.json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET EVENT DETAILS
app.get("/events/:eventId", verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate("admin", "name email")
      .populate("members", "name email");

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const isMember = event.members.some((m) => m._id.equals(req.userId));
    if (!isMember) {
      return res.status(403).json({ error: "Not a member of this event" });
    }

    res.json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET MY EVENTS
app.get("/my-events", verifyToken, async (req, res) => {
  try {
    const events = await Event.find({
      $or: [
        { admin: req.userId },
        { members: req.userId }
      ]
    })
      .populate("admin", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE EVENT (ADMIN ONLY)
app.delete("/events/:eventId", verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if user is admin
    if (!event.admin.equals(req.userId)) {
      return res.status(403).json({ error: "Only admin can delete this event" });
    }

    // Delete all images from this event
    await Image.deleteMany({ eventId: req.params.eventId });

    // Delete event
    await Event.findByIdAndDelete(req.params.eventId);

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LEAVE EVENT
app.post("/events/:eventId/leave", verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if user is member
    if (!event.members.some((m) => m.equals(req.userId))) {
      return res.status(403).json({ error: "Not a member of this event" });
    }

    // Check if user is admin
    if (event.admin.equals(req.userId)) {
      return res.status(403).json({ error: "Admin cannot leave. Delete the event instead" });
    }

    // Remove user from members
    event.members = event.members.filter((m) => !m.equals(req.userId));
    await event.save();

    res.json({ message: "Left event successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== IMAGE ROUTES ====================

// GET IMAGES BY EVENT
app.get("/events/:eventId/images", verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 18;
    const skip = parseInt(req.query.skip) || 0;

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const isMember = event.members.some((m) => m.equals(req.userId));
    if (!isMember) {
      return res.status(403).json({ error: "Not a member of this event" });
    }

    const images = await Image.find({ eventId: req.params.eventId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Image.countDocuments({ eventId: req.params.eventId });

    res.json({
      images,
      total,
      hasMore: skip + limit < total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPLOAD IMAGE
app.post("/upload", verifyToken, async (req, res) => {
  try {
    const { image, eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(400).json({ error: "Event not found" });
    }

    const isMember = event.members.some((m) => m.equals(req.userId));
    if (!isMember) {
      return res.status(403).json({ error: "Not a member of this event" });
    }

    const result = await cloudinary.uploader.upload(image);

    const newImage = await Image.create({
      eventId,
      userId: req.userId,
      imageUrl: result.secure_url,
    });

    await newImage.populate("userId", "name email");

    res.json(newImage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE IMAGE (ADMIN ONLY)
app.delete("/images/:imageId", verifyToken, async (req, res) => {
  try {
    const image = await Image.findById(req.params.imageId);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    const event = await Event.findById(image.eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const isAdmin = event.admin.equals(req.userId);
    if (!isAdmin) {
      return res.status(403).json({ error: "Only admin can delete images" });
    }

    await Image.findByIdAndDelete(req.params.imageId);

    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== OLD ROUTES (KEPT FOR COMPATIBILITY) ====================

app.get("/images", verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 18;
    const skip = parseInt(req.query.skip) || 0;

    // Find all events where user is a member or admin
    const events = await Event.find({
      $or: [
        { admin: req.userId },
        { members: req.userId }
      ]
    }).select("_id");

    const eventIds = events.map(e => e._id);

    if (eventIds.length === 0) {
      return res.json({
        images: [],
        total: 0,
        hasMore: false,
      });
    }

    // Get images from user's events
    const images = await Image.find({ eventId: { $in: eventIds } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("userId", "name email");

    const total = await Image.countDocuments({ eventId: { $in: eventIds } });

    res.json({
      images,
      total,
      hasMore: skip + limit < total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});