# C++ Premium E-Learning Platfor

A modern, premium SaaS-style e-learning platform designed for teaching C++ programming. The project features a beautiful, responsive frontend built with React and Tailwind CSS, and a robust, production-ready Express backend.

## 🌟 Features

### Frontend (React + Vite + Tailwind CSS)
- **Premium UI/UX**: Clean, modern design system with micro-interactions, skeleton loaders, and smooth animations.
- **Role-Based Dashboards**: Separate experiences for Students and Administrators.
- **Course Management**: Admins can add, edit, and delete courses with YouTube and Audio integrations.
- **Real-time Data**: Uses Firebase Client SDK for real-time course updates and synchronization.
- **Authentication**: Integrated with Firebase Authentication (Email/Password).
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop screens.

### Backend (Node.js + Express)
- **Production-Ready Architecture**: Clean separation of concerns (routes, controllers, middleware, utils).
- **Secure API**: Configured with Helmet, CORS, and Morgan logging.
- **Firebase Admin Integration**: Secure token verification and role-based access control (RBAC).
- **Centralized Error Handling**: Consistent JSON error responses across all endpoints.
- **Firestore Utilities**: Modular CRUD operations for courses with schema validation.
- **Cloudinary Ready**: Pre-configured for future media upload requirements.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Firebase Project (with Authentication and Firestore enabled)

### 1. Frontend Setup

The frontend is currently configured to use the Firebase Client SDK directly for a seamless "serverless" experience during development.

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure your `.env` file is populated with your Firebase Client credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   **Live Link:** [http://localhost:5173](http://localhost:5173)

### 2. Backend Setup

The backend is a robust REST API designed to take over data operations for production environments.

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file. **Crucially, you must provide a Firebase Service Account** for the backend to access Firestore and verify tokens:
   ```env
   # Option A: Path to your downloaded service account JSON file
   FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json
   
   # Option B: Paste the entire JSON string
   FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
   
   PORT=5000
   NODE_ENV=development
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   **Live Link:** [http://localhost:5000/health](http://localhost:5000/health)

---

## 🏗️ Architecture & Integration Notes

Currently, the **Frontend** communicates directly with Firebase (Firestore & Auth) using the Client SDK. This allows the app to function immediately without requiring complex backend credential setup.

The **Backend** has been fully refactored into a production-ready REST API (`/api/courses`). It includes:
- `verifyFirebaseToken` middleware to authenticate requests.
- `requireRole(['admin'])` middleware to protect sensitive routes.
- Firestore utility helpers to manage data securely.

**To fully integrate the Frontend with the Backend API (Production Mode):**
1. Ensure the Backend has a valid Firebase Service Account configured.
2. Update `Frontend/src/services/coursesService.js` to use `fetch()` calls pointing to `http://localhost:5000/api/courses` instead of the Firebase Client SDK.
3. Pass the Firebase ID token (`auth.currentUser.getIdToken()`) in the `Authorization: Bearer <token>` header for protected requests.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router v7, Firebase Client SDK, Lucide React (Icons).
- **Backend**: Node.js, Express, Firebase Admin SDK, Cloudinary, Cors, Helmet, Morgan.
