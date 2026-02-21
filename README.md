# Fullstack Application Project

A scalable, production-ready fullstack application utilizing a modern two-folder architecture. The backend is powered by Node.js, Express, and MongoDB natively wrapped in TypeScript. The frontend is built on Next.js 14 (App Router), Tailwind CSS, and Shadcn UI components.

## Features Included
- **Robust Authentication**: JWT Token-based authentication, Bcrypt password hashing, and secure protected routes natively handling Next.js server/client side constraints.
- **Support System (Entity Management)**: Full Task CRUD functionality (Create, Read, Update, Delete) strictly authorized and pinned directly to the authenticated user object via MongoDB references.
- **Dynamic Dashboard**: 
  - Real-time Task Search and Status Filtering (All, Completed, Pending).
  - Inline Task editing directly alongside standard UI components.
  - Quick-access overlay Profile updates (extending password change capabilities and name modifications).
- **Security Checkpoints**: 
  - Standardized JSON responses for API routes. 
  - Backend strictly guarded by middleware `protect(req, res, next)` blocks enforcing token validity headers (`Bearer XXX`).
- **Clean Tooling**: TypeScript configurations for strong typing, `nodemon` hot-reloading for the server, and `helmet`/`cors`/`morgan` active logic for baseline request safety.

---

## Getting Started

### 1. Requirements
Ensure you have the following installed on your machine:
- Node.js (v18 or higher recommended)
- MongoDB Database (Running locally on the default `mongodb://localhost:27017` or through an external Mongo URI).

### 2. Backend Setup (`/backend`)
1. Open a terminal instance and resolve to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the necessary Node packages:
   ```bash
   npm install
   ```
3. Establish your `.env` configuration file in the root of `/backend`. Example schema provided:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/assignment01
   JWT_SECRET=yoursecretjwtkeyhere
   ```
4. Start the development server (Defaults to Port `5000`):
   ```bash
   npm run dev
   ```

### 3. Frontend Setup (`/frontend`)
1. Open a separate terminal instance and resolve to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Cleanly install Next.js dependencies:
   ```bash
   npm install
   ```
3. Initialize the UI server:
   ```bash
   npm run dev
   ```
4. Navigate locally to `http://localhost:3000` inside your browser.

---

## Designing for Scale (Production Notes)

### *"How would you scale this app for production?"*

While this system functions cleanly as an assignment scope, scaling it for millions of active requests requires expanding standard bottlenecks across three tiers: Data, Application, and Infrastructure networking. 

**1. Data Layer Scaling (MongoDB)**
- **Indexing Constraints**: The `User` schemas query actively using checking constraints against `{ email }`. We would apply explicit DB compound indexes to quicken lookup retrievals under heavy read volumes.
- **Caching Layer (Redis)**: Current requests explicitly ping MongoDB for every profile query. Integrating Redis to cache the `getProfile` query alongside highly-read `getTasks` requests drops backend database loads by 70%.
- **Database Sharding**: As datasets swell, splitting collections across physical clusters dynamically expands throughput without risking un-optimized table scans.

**2. Application Layer (Backend Refinements)**
- **Clustering API Modules**: Right now `app.ts` is running synchronously on a single Node core execution thread. Implementing Node's native `cluster` module (or using PM2 ecosystem handlers) allows the server to fork across multiple available CPU cores.
- **Microservices Shift**: The "Auth" and "Tasks" controllers are bundled. Extracting Authentication logic into an isolated Microservice mitigates cross-pollution. If the Task service is under heavy load, it shouldn't throttle Auth validations.
- **Rate-Limiting Defense**: While `helmet` defends core injection vectors, aggressive polling attempts aren't mitigated. We would deploy `express-rate-limit` explicitly shielding `/api/auth/login` and `/api/auth/register` endpoints against brute-force DDoS.

**3. Frontend and Infrastructure Layer (Next.js & DevOps)**
- **Dockerization**: The entire `backend` and `frontend` setup would be containerized securely using `Dockerfile` instances, standardizing the runtime environment across development to staging deployment via CI/CD pipelines (e.g., GitHub Actions).
- **Stateless Tokens**: The system is naturally scaling-ready since JWT handles stateless authentication headers eliminating sticky-session persistence problems across server instance load balancers like Nginx.

---

## Required Testing Routes

The Postman endpoints used to manage this architecture:

### Auth Endpoints
- **Register**: `POST /api/auth/register` | Body `{"name":"x", "email":"y", "password":"z"}`
- **Login**: `POST /api/auth/login` | Body `{"email":"y", "password":"z"}`
- **Update Profile**: `PUT /api/auth/profile` | Auth Header Required

### Task Endpoints (Require Auth Headers)
- **Get Tasks**: `GET /api/tasks` 
- **Create Task**: `POST /api/tasks` | Body `{"title":"...", "description":"..."}`
- **Update Task**: `PUT /api/tasks/:id` | Body `{"isCompleted": true}`
- **Delete Task**: `DELETE /api/tasks/:id`
