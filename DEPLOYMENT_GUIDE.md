# Deployment Guide

This guide will walk you through deploying your fullstack application. Since we have a decoupled architecture (separate Frontend and Backend), we will deploy them to two different services that specialize in their respective environments:

*   **Frontend (Next.js):** [Vercel](https://vercel.com/) (The creators of Next.js, making it the easiest and most optimized platform).
*   **Backend (Node.js/Express):** [Render](https://render.com/) or [Railway](https://railway.app/) (Excellent and free-tier friendly platforms for Node.js backends).
*   **Database (MongoDB):** [MongoDB Atlas](https://www.mongodb.com/atlas/database) (Cloud-hosted MongoDB).

---

## Step 1: Prepare Your Code for Production

Before deploying, ensure your code is pushed to a Git repository (like GitHub).

1.  **If you haven't already, push your code to GitHub.** You should have your `backend` and `frontend` folders in a single repository, or you can split them into two separate repositories. (For this guide, we'll assume they are in one repository).
2.  **Ensure Environment Variables are Ready:** You will need to know your `.env` values (like `JWT_SECRET`, and soon, your `MONGO_URI` from Atlas).

---

## Step 2: Set up the Database (MongoDB Atlas)

Since you can't use `localhost` in production, you need a cloud database.

1.  Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database) and create a free account.
2.  Create a new **Free Cluster** (M0).
3.  **Database Access:** Create a database user with a username and password. **Save this password!**
4.  **Network Access:** In the "Network Access" tab, click "Add IP Address" and select "Allow Access from Anywhere" (`0.0.0.0/0`). This is necessary so your backend hosted on Render/Railway can connect to it.
5.  **Get your Connection String (URI):** Click "Connect" on your cluster, select "Connect your application" (Node.js driver), and copy the provided URI. It will look something like this:
    `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/assignment01?retryWrites=true&w=majority`
    *(Replace `<password>` with the user password you created).*

---

## Step 3: Deploy the Backend (Render)

Render is great for Node.js APIs and has a free tier.

1.  Create an account on [Render](https://render.com/).
2.  Click **"New"** and select **"Web Service"**.
3.  Connect your GitHub account and select your repository containing the assignment.
4.  **Important Configuration:**
    *   **Name:** `assignment01-backend` (or whatever you prefer)
    *   **Root Directory:** `backend` (This is crucial since your backend code is in this folder).
    *   **Environment:** `Node`
    *   **Build Command:** `npm install && npm run build` (This installs packages and compiles your TypeScript).
    *   **Start Command:** `npm start` (This runs the compiled JS from the `dist` folder).
5.  **Environment Variables:** Scroll down to the "Environment Variables" section and add the following:
    *   `PORT`: `5000` (Render might enforce its own port, but it's good practice to set it).
    *   `MONGO_URI`: *Paste the connection string you got from MongoDB Atlas in Step 2.*
    *   `JWT_SECRET`: *Enter a long, random secure string (or reuse your local one).*
6.  Click **"Create Web Service"**. Render will now build and deploy your backend.
7.  **Save the Backend URL:** Once deployed, Render will give you a live URL (e.g., `https://assignment01-backend.onrender.com`). You will need this for the frontend!

---

## Step 4: Update the Frontend to Point to Production

Before deploying the frontend, it needs to know where the live backend is. Currently, your frontend is likely trying to reach `http://localhost:5000`.

1.  In your `frontend/src/lib/axios.ts` setup, ensure the `baseURL` is configured via an environment variable.
    *   It should look like this: `baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'`
2.  Commit and push this change to GitHub if you made it.

*(Note: In the current code we built together, `axios` might be hardcoded. If it is, update `d:\Assignment01\frontend\src\lib\axios.ts` to use `process.env.NEXT_PUBLIC_API_URL`).*

---

## Step 5: Deploy the Frontend (Vercel)

Vercel is tailored for Next.js and makes this incredibly easy.

1.  Create an account on [Vercel](https://vercel.com/) (Sign up with GitHub).
2.  From the Vercel dashboard, click **"Add New..."** -> **"Project"**.
3.  Import the same GitHub repository.
4.  **Important Configuration:**
    *   **Root Directory:** Click "Edit" and select the `frontend` folder. (Vercel needs to know the Next.js app is inside a subfolder).
    *   **Framework Preset:** Vercel should automatically detect `Next.js`.
5.  **Environment Variables:** Expand the "Environment Variables" section and add:
    *   **Name:** `NEXT_PUBLIC_API_URL`
    *   **Value:** *The URL you got from Render in Step 3 + `/api`* (e.g., `https://assignment01-backend.onrender.com/api`).
6.  Click **"Deploy"**.

## Final Verification
Once Vercel finishes deploying, it will give you a live URL for your frontend (e.g., `https://assignment01-frontend.vercel.app`).

1. Open that Vercel URL in your browser.
2. Register a new user and try to create a task to verify full end-to-end cloud connectivity!
