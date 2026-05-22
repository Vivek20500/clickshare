# ClickShare - Project Documentation

## 1. PROJECT OVERVIEW

**What is ClickShare?**
ClickShare is a real-time event gallery application where multiple users can create events (rooms), invite friends via unique codes, and collaboratively upload photos to a shared gallery.

**Use Cases:**
- Weddings: Guests capture moments, all shared instantly
- Birthday Parties: Friends upload photos to one album
- Corporate Events: Employees share event highlights
- Conferences: Attendees build a visual record

**Key Features:**
- User registration and authentication
- Create multiple events with unique invite codes
- Join multiple events
- Real-time image gallery per event
- Admin controls (delete images)
- Multi-user collaboration

---

## 2. TECHNOLOGY STACK

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | React 19 + Vite | User interface, real-time updates |
| Backend | Node.js + Express | API server, business logic |
| Database | MongoDB + Mongoose | Store users, events, image metadata |
| Image Storage | Cloudinary | Cloud storage for actual image files |
| Authentication | JWT (JSON Web Tokens) | Secure user sessions |
| Port | 5000 (backend) | API server runs here |

---

## 3. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                         │
│  (React App - Vite Development Server)                  │
│                                                          │
│  - Login/Register Page                                  │
│  - Event Creation/Joining                               │
│  - Image Gallery                                        │
│  - Camera Capture                                       │
└────────────────┬────────────────────────────────────────┘
                 │ (HTTP Requests with JWT Token)
                 │ Authorization: Bearer <token>
                 │
┌────────────────▼────────────────────────────────────────┐
│            EXPRESS SERVER (Port 5000)                    │
│                                                          │
│  - User Registration/Login (Password Hashing)           │
│  - Event Management                                     │
│  - Image Upload/Delete                                 │
│  - Authorization Middleware                            │
│  - Cloudinary Integration                              │
└────────────────┬────────────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
┌──────────────┐      ┌────────────────┐
│   MongoDB    │      │  Cloudinary    │
│              │      │                │
│ - Users      │      │ - Image Files  │
│ - Events     │      │ - Compression  │
│ - Images     │      │ - Delivery     │
│   metadata   │      │ - Scaling      │
└──────────────┘      └────────────────┘
```

---

## 4. AUTHENTICATION SYSTEM

### Registration Process
1. User enters Name, Email, Password
2. Backend validates all fields are present
3. Email checked for uniqueness (can't register twice with same email)
4. Password is hashed using bcrypt (converts to unrecognizable string)
5. New user saved in database
6. JWT token generated (valid for 7 days)
7. Token & user info sent to frontend
8. Frontend stores token in browser's localStorage

### Login Process
1. User enters Email, Password
2. Backend finds user by email
3. Password compared with stored hash
4. If match: New JWT token generated
5. Token sent to frontend
6. Stored in localStorage

### Token Verification (Happens on Every Protected Request)
1. Frontend sends: `Authorization: Bearer {token}` header
2. Backend middleware extracts token
3. Verifies signature is valid (wasn't tampered with)
4. Extracts userId from token
5. Allows request to proceed
6. If invalid/expired: Returns 401 error

### Why This Approach?
- **JWT instead of Sessions:** Stateless, works for distributed systems
- **Password Hashing:** If database leaks, passwords are useless
- **Token Expiry:** 7 days means stolen token has limited lifetime
- **localStorage:** Keeps user logged in even after browser refresh

---

## 5. DATA STORAGE

### User Data
```
Database Collection: users

Each user record contains:
├── User ID (auto-generated unique identifier)
├── Full Name
├── Email (must be unique)
├── Password (hashed/encrypted)
└── Account Created Date
```

**Where stored:** MongoDB
**How accessed:** By email during login, by ID during requests

### Event Data (Rooms)
```
Database Collection: events

Each event record contains:
├── Event ID (unique identifier)
├── Event Name (e.g., "Wedding 2024")
├── Join Code (e.g., "ABC123" - 6 characters, must be unique)
├── Admin ID (user who created event)
├── Members List (array of users who joined)
└── Creation Date
```

**Where stored:** MongoDB
**Key point:** Admin field determines who can delete images from this event

### Image Data
```
Database Collection: images

Each image record contains:
├── Image ID (unique identifier)
├── Event ID (which event it belongs to)
├── Uploader ID (which user uploaded it)
├── Cloudinary URL (link to actual image file)
└── Upload Date
```

**Where actual image stored:** Cloudinary cloud storage
**Why separate?** Cloudinary handles image compression, resizing, optimization

### Database Relationships

```
User 1 ──── creates ──── Event 1 (admin)
             joins     
                       
User 2 ────┐            Event 2 (admin is User 3)
           └─ joins ────┤
                       
User 3 ────── creates ──┘

Event 1 ──┬─ contains ─ Image 1 (uploaded by User 1)
          ├─ contains ─ Image 2 (uploaded by User 2)
          └─ contains ─ Image 3 (uploaded by User 1)

Event 2 ──┬─ contains ─ Image 4 (uploaded by User 2)
          └─ contains ─ Image 5 (uploaded by User 3)
```

---

## 6. EVENT MANAGEMENT (Multi-Event & Multi-User)

### Creating an Event
1. Authenticated user clicks "Create Event"
2. Enters event name (e.g., "Birthday Party")
3. Backend generates random 6-character code (e.g., "XYZ789")
4. Backend checks if this code already exists
5. If exists, generates new code (keeps checking until unique)
6. Event created with:
   - Creator as Admin
   - Creator automatically added to members list
7. Code displayed to user
8. User can copy/screenshot code to share

### Joining an Event
1. User receives code from someone (e.g., "ABC123")
2. User enters code in "Join Event"
3. Backend searches database for event with this code
4. Verifies user isn't already a member
5. Adds user to event's members list
6. User now sees all images from this event

### Multi-Event Support
**Same user can:**
- Create unlimited events (each is a separate room)
- Join unlimited events (created by others)
- Appears in members list of all joined events
- Has admin privileges only in events they created

**Example:**
```
User "Alice" creates "Wedding" → She's admin
User "Alice" joins "Birthday" → She's member (Bob is admin)
User "Alice" joins "Reunion" → She's member (Carol is admin)

Alice can:
✓ Upload to all 3 events
✓ Delete images in "Wedding" only
✓ See images from all 3 events on her home page
```

---

## 7. IMAGE STORAGE & MANAGEMENT

### Where Images Are Stored

**Image Files:**
- Stored on Cloudinary (cloud service)
- Returns URL: `https://res.cloudinary.com/.../image123.jpg`
- Cloudinary handles compression, resizing, scaling

**Image Metadata:**
- Stored in MongoDB
- Links image to event and uploader
- Contains: eventId, userId, imageUrl, timestamp

### Upload Process

1. User takes/selects photo from camera
2. Frontend converts image to compressed format
3. Sends to backend with event ID
4. Backend verifies user is member of event
5. Image uploaded to Cloudinary
6. Cloudinary returns URL
7. Metadata saved in MongoDB
8. Gallery instantly updated

### Image Visibility
- Images only visible to members of that event
- If user joins event, they see all previous images
- If user leaves event, they lose access

### Image Deletion
- Only event admin can delete images
- Non-admin users cannot delete
- Admin can delete any image from their event
- Metadata removed from database (Cloudinary URL becomes orphaned)

---

## 8. API ENDPOINTS (What Each URL Does)

### Authentication Endpoints
| Method | Endpoint | What It Does | Requires Auth? |
|--------|----------|-------------|---|
| POST | `/auth/register` | Create new user account | No |
| POST | `/auth/login` | Log in existing user | No |

### Event Management Endpoints
| Method | Endpoint | What It Does | Requires Auth? |
|--------|----------|-------------|---|
| POST | `/events/create` | Create new event | Yes |
| POST | `/events/join` | Join event by code | Yes |
| GET | `/events/:eventId` | Get event details | Yes* |
| GET | `/my-events` | Get all user's events | Yes |

*Must be member of event

### Image Endpoints
| Method | Endpoint | What It Does | Requires Auth? |
|--------|----------|-------------|---|
| GET | `/images` | Get all images from user's events | Yes |
| GET | `/events/:eventId/images` | Get images from specific event | Yes* |
| POST | `/upload` | Upload new image to event | Yes* |
| DELETE | `/images/:imageId` | Delete image (admin only) | Yes* |

*Must be member/admin of event

---

## 9. COMPLETE USER JOURNEY

### Scenario: Alice & Bob share wedding photos

**Day 1 - Alice creates event:**
1. Alice registers: email, password, name
2. Receives JWT token, logged in
3. Clicks "Create Event"
4. Names event "Wedding 2024"
5. Backend generates code "ABC123"
6. Alice sees code "ABC123"
7. Alice copies and sends to Bob

**Day 2 - Bob joins event:**
1. Bob registers or logs in
2. Enters code "ABC123"
3. Bob now member of "Wedding 2024" event
4. Bob can see event details and members

**Day 3 - Photo sharing:**
1. Alice takes photo at wedding (clicks camera)
2. Photo uploaded to event
3. Bob takes photo at wedding (clicks camera)
4. Photo uploaded to event
5. Both Alice and Bob open gallery
6. Both see all photos from "Wedding 2024"
7. Alice (admin) can delete bad photos
8. Bob (member) can only view

---

## 10. SECURITY FEATURES

| Security Feature | How It Works | Why Needed |
|-----------------|-------------|-----------|
| **Password Hashing** | bcrypt algorithm with salt | If DB stolen, passwords useless |
| **JWT Tokens** | Signed with secret key | Can't fake valid token without secret |
| **Token Expiry** | Expires after 7 days | Limits damage if token stolen |
| **Authorization Header** | Required for all requests | Backend knows which user is requesting |
| **Membership Check** | Verify user in event members | Can't access other events' images |
| **Admin Verification** | Check if user = event.admin | Only admin can delete images |
| **Email Uniqueness** | Can't register twice with same email | Prevents account duplication |

---

## 11. DATA FLOW DIAGRAMS

### Login Data Flow
```
Frontend                              Backend                        Database
   │                                    │                               │
   ├─ User enters email & password     │                               │
   │                                    │                               │
   ├─ POST /auth/login                 │                               │
   ├─ {email, password}          ────► │ Find user by email            │
   │                                    ├──────────────────────────► Find
   │                                    │                              │
   │                                    │ ◄──────────────────────── Return user
   │                                    │                              │
   │                                    │ Verify password match        
   │                                    │ (bcrypt.compare)             
   │                                    │                              │
   │                                    │ Generate JWT token           
   │                                    │ {userId, exp: 7days}         
   │                                    │                              │
   │ ◄─ {token, user} ──────────────── │                               │
   │                                    │                              
   ├─ Store token in localStorage
   ├─ Set user in React Context
   ├─ Redirect to home page
   │
   └─ User is now logged in
```

### Event Creation Data Flow
```
Frontend                           Backend                          Database
   │                                 │                                │
   ├─ User clicks Create Event       │                                │
   ├─ Enters event name              │                                │
   │                                  │                               │
   ├─ POST /events/create       ────► │ Verify token (JWT check)     
   ├─ {name, Authorization...}       │ Get userId from token         
   │                                  │                               │
   │                                  ├─ Generate random code         
   │                                  │ "ABC123"                      
   │                                  │                               │
   │                                  ├─ Check if code exists ────► Check
   │                                  │                               │
   │                                  │ ◄────────────────────── No
   │                                  │                               │
   │                                  ├─ Create event            ────► Save
   │                                  │ {name, code, admin, members}  │
   │                                  │                               │
   │ ◄─ {event, code: "ABC123"} ────│                                │
   │                                  │                              
   ├─ Display code "ABC123"
   ├─ Show copy button
   └─ Redirect to event gallery
```

### Image Upload Data Flow
```
Frontend                            Backend                         Database
   │                                  │                               │
   ├─ User takes photo                │                               │
   ├─ Converts to base64              │                               │
   │                                   │                              │
   ├─ POST /upload               ────► │ Verify token               
   ├─ {image, eventId, token}         │ Get userId from token        
   │                                   │                              │
   │                                   ├─ Check user is member of  ──► Check
   │                                   │   event                       │
   │                                   │                           ◄──
   │                                   │ (If no: return 403 error)    │
   │                                   │                              │
   │                                   ├─ Upload to Cloudinary    ────► Cloudinary
   │                                   │ base64 ─────────────────────► Cloud
   │                                   │                              │
   │                                   │ ◄────────────────────────── URL
   │                                   │                              │
   │                                   ├─ Save metadata in DB     ────► Save
   │                                   │ {eventId, userId,             │
   │                                   │  imageUrl, timestamp}         │
   │                                   │                              │
   │ ◄─ {image metadata} ────────────│                                │
   │                                   │                              
   ├─ Add image to gallery display
   ├─ Show new photo to user
   └─ Photo visible to all event members
```

### Gallery View Data Flow
```
Frontend                            Backend                         Database
   │                                  │                               │
   ├─ User navigates to Home          │                               │
   ├─ useEffect: fetch images         │                               │
   │                                   │                              │
   ├─ GET /images               ────► │ Verify token               
   ├─ Authorization: Bearer...        │ Get userId from token        
   │                                   │                              │
   │                                   ├─ Find all events where  ────► Query
   │                                   │   user is admin or member    │
   │                                   │                           ◄──
   │                                   │ Returns: [event1, event2]   
   │                                   │                              │
   │                                   ├─ Get images from these  ────► Query
   │                                   │   events (eventId in list)   │
   │                                   │                           ◄──
   │                                   │ Returns: [img1, img2...]    
   │                                   │                              │
   │ ◄─ {images: [...], total, ...} ──│                               │
   │                                   │                              
   ├─ Display 18 images per page
   ├─ Show pagination controls
   └─ User can view/delete (if admin)
```

---

## 12. KEY CONCEPTS TO REMEMBER

### Authentication vs Authorization
- **Authentication:** Proving who you are (login)
- **Authorization:** Proving you have permission (accessing event)

### JWT Token
- Small encrypted package containing userId
- Sent with every request to prove identity
- Backend verifies signature wasn't tampered with
- Expires automatically after 7 days

### Hashing vs Encryption
- **Hashing:** One-way process (can't reverse)
- **Encryption:** Two-way process (can decrypt)
- Passwords use hashing because they should never be known

### Database References (ObjectId)
- Instead of storing full user data in events collection
- Store only reference (ID) to user
- When needed, fetch full user data
- Saves storage, prevents data duplication

### Pagination
- Instead of loading 1000s of images
- Load 18 at a time (better performance)
- User clicks "Next" to load more
- Reduces memory usage and network traffic

---

## 13. SCALABILITY & FUTURE ENHANCEMENTS

**Current Capacity:**
- ✓ Multiple users simultaneously
- ✓ Multiple events per user
- ✓ High resolution image storage (Cloudinary)
- ✓ Distributed across cloud services

**Possible Future Features:**
- Real-time notifications (Socket.io integration)
- Comments on photos
- User mentions/tags
- Photo albums/folders within events
- Video support
- Mobile app
- Analytics dashboard
- Payment integration (premium events)

---

## 14. INTERVIEW TALKING POINTS

When explaining this project:

1. **Architecture:** "We use React frontend, Express backend, MongoDB database, and Cloudinary for image storage - a modern MERN stack"

2. **Authentication:** "We implemented JWT-based authentication with 7-day token expiry and bcrypt password hashing for security"

3. **Multi-Tenancy:** "Each event is isolated - users can create/join multiple events, and only see images from events they're a member of"

4. **Image Handling:** "Images are stored in Cloudinary cloud storage while metadata is in MongoDB - this keeps database size small and images optimized"

5. **Authorization:** "We use middleware to verify JWT tokens on every protected request, and verify event membership before allowing image access"

6. **Performance:** "We implemented pagination (18 images/page) to ensure smooth performance even with thousands of images"

7. **Security:** "Password hashing, JWT token verification, membership checks, and admin verification ensure only authorized users can access data"

---

**Last Updated:** May 2026
**Version:** 1.0
**Status:** Production Ready
