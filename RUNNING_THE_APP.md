# Running the Bug Tracker App

## ✅ Current Project Status

This project now includes a **complete MERN Bug Tracker application** with full testing integration:

- ✅ **Backend:** Express.js API (`server/src/app.js`) with bug CRUD routes
- ✅ **Frontend:** React application with bug reporting, listing, and status management
- ✅ **Database:** Mongoose models for Bug tracking
- ✅ **Tests:** 82+ passing unit and integration tests
- ✅ **Production Ready:** Full app with dev and production scripts

---

## 🚀 Quick Start (Development)

### Step 1: Install Dependencies (Already Done ✅)
```bash
npm install
```

### Step 2: Start MongoDB
```bash
# Option A: MongoDB local installation
mongod

# Option B: MongoDB Atlas (cloud)
# Update MONGODB_URI in your environment
```

### Step 3: Start the Application
```bash
# Both backend and frontend together
npm run dev

# OR run separately in different terminals:
# Terminal 1:
npm run dev:server

# Terminal 2:
npm run dev:client
```

### Step 4: Open the App
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/bugs

---

## 🎯 Available Commands

---

## How to Run Tests (What Works Now ✅)

### Production Scripts
```bash
npm start                 # Start backend server only
npm run build             # Build frontend for production
npm run preview           # Preview production build
```

### Testing Scripts
