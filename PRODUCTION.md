# Production Guide

This document summarizes the steps and settings to deploy the app to production.

## Frontend (Vite)

1) Configure environment var for API base URL

Create `.env` in the project root (or set in hosting env):

VITE_API_BASE_URL=https://your-api-host.com/api

2) Build

npm run build

3) Serve the "dist" folder with your static hosting (e.g., Nginx, Netlify, Vercel).

## Backend (Express)

1) Environment variables (.env in backend/)

PORT=5000
CLIENT_ORIGIN=https://your-frontend-host.com
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=replace-with-strong-random-secret
EMAIL_USER=example@example.com
EMAIL_PASS=app-specific-password

2) Install deps and start

cd backend
npm install
npm start

3) Security and CORS

- Helmet and a basic rate limiter are enabled.
- CORS origin is restricted via CLIENT_ORIGIN.

## Notes

- Role-based auth uses three localStorage keys: adminToken, teacherToken, userToken.
- Ensure your API URL in Vite matches the backend base path (/api).
