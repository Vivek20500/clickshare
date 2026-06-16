# ClickShare

ClickShare is a real-time event photo sharing platform that allows users to capture and upload photos directly from their devices and instantly share them in a common event gallery.

Whether it's a wedding, college fest, corporate event, birthday party, or meetup, ClickShare makes it easy for everyone to contribute their photos to a single shared collection.

---

## Features

- Capture photos directly using device camera
- Upload images instantly
- Shared event gallery
- Real-time updates using Socket.IO
- Responsive design for mobile and desktop
- Image storage and retrieval
- Automatic gallery refresh after uploads
- Simple and user-friendly interface

---

## Tech Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Real-Time Communication
- Socket.IO

---

## How It Works

1. User opens ClickShare.
2. User captures a photo using the camera.
3. Photo is uploaded to the server.
4. Image metadata is stored in MongoDB.
5. Socket.IO broadcasts the update.
6. Connected users instantly see the new photo in the gallery.

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/ClickShare.git
cd ClickShare

### Backend Setup
cd backend
npm install
npm start

### Frontend Setup
cd frontend
npm install
npm start