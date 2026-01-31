# 3W Social Post

A premium public social feed built with the MERN stack (MongoDB, Express, React, Node.js) and Material UI.

## Features
- **User Authentication**: Secure signup and login with JWT.
- **Social Feed**: View posts from everyone in a clean, card-based layout.
- **Create Posts**: Share thoughts with text, images, or both.
- **Interactions**: Real-time likes and comments on any post.
- **Responsive Design**: Fully optimized for mobile and desktop.

## Tech Stack
- **Frontend**: React (Vite), Axios, React Router, Material UI (MUI).
- **Backend**: Node.js, Express, Mongoose, JWT, Multer (for image uploads).
- **Database**: MongoDB.

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed locally or a MongoDB Atlas account

### 1. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your configuration:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   npm start
   ```

### 2. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Usage
- Open your browser to the URL provided by Vite (usually `http://localhost:5173`).
- Sign up for a new account.
- Start posting and interacting with the feed!

## Constraints Followed
- **2 Collections Only**: Optimized schema for Users and Posts.
- **No Tailwind**: Styled using Material UI and Vanilla CSS for a premium feel.
- **Clean Structure**: Professional folder organization for both frontend and backend.
- **Instant UI Updates**: Likes and comments update immediately for a lag-free experience.
