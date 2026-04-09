# Run and Deploy Guide

This document explains how to run the app locally and how to deploy it without Docker.

## Stack

- Frontend: Next.js
- Backend: Express + TypeScript
- Database: MongoDB
- Cache: Redis
- Monorepo: npm workspaces

## Project Layout

- `frontend/` - Next.js application
- `backend/` - Express API
- `README.md` - quick-start documentation

## Required Environment Variables

### Backend

Copy:

```bash
cp backend/.env.example backend/.env
```

Variables:

- `PORT` - backend port for local development
- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - strong secret for auth tokens
- `JWT_EXPIRES_IN` - token lifetime, default `7d`
- `FRONTEND_URL` - allowed frontend origin for CORS
- `NODE_ENV` - `development` or `production`

### Frontend

Copy:

```bash
cp frontend/.env.example frontend/.env.local
```

Variables:

- `NEXT_PUBLIC_API_URL` - backend base URL used by the Next.js API proxy

## Local Development

### 1. Start MongoDB

Use a local MongoDB instance or MongoDB Atlas.

Example local connection string:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/task-tracker
```

### 2. Start Redis

Use a local Redis instance.

Example local connection string:

```env
REDIS_URL=redis://127.0.0.1:6379
```

### 3. Verify Local Environment Values

Backend example:

```env
PORT=5500
MONGODB_URI=mongodb://127.0.0.1:27017/task-tracker
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=change-this-before-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Frontend example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5500
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Backend

```bash
npm run dev:backend
```

### 6. Run the Frontend

```bash
npm run dev:frontend
```

### 7. Open the App

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:5500/health`

## Deployment Architecture

Recommended setup:

- Frontend: Vercel
- Backend: Render web service
- Redis: Render Key Value
- MongoDB: MongoDB Atlas

## Vercel Deployment

### Frontend

1. Import the GitHub repository into Vercel.
2. Set the project Root Directory to `frontend`.
3. Add the environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com
```

4. Deploy the project.

The frontend proxies `/api/*` requests to this backend URL, so authentication cookies are issued from the frontend domain instead of relying on a third-party browser cookie.

## Render Deployment

### Backend Web Service

1. Create a new Web Service from the GitHub repository.
2. Set the Root Directory to `backend`.
3. Use the Node runtime.
4. Set the build command:

```bash
npm install && npm run build
```

5. Set the start command:

```bash
npm run start
```

6. Add backend environment variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://default:password@host:port
JWT_SECRET=use-a-long-random-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

7. Set the health check path to:

```text
/health
```

## Redis Setup

For production, use a managed Redis provider such as Render Key Value.

### Render Key Value

1. Create a Key Value instance in Render.
2. Keep it in the same region as the backend service.
3. Copy the Redis connection URL.
4. Set that value as `REDIS_URL` in the backend service environment.
5. Redeploy the backend service.

Redis is only used by the backend. The frontend should never connect directly to Redis.

## MongoDB Setup

Use MongoDB Atlas or another managed MongoDB service.

1. Create a database cluster.
2. Create a database user.
3. Allow access from the backend service.
4. Copy the connection string.
5. Set it as `MONGODB_URI` in the backend service environment.

## Smoke Test Checklist

After deployment, verify:

1. `GET /health` returns `200`
2. Signup works
3. Login works
4. Task creation works
5. Task list loads successfully
6. Redis is reachable and the backend starts without cache errors
7. Updating or deleting a task still refreshes the list correctly

## Notes on Redis

- Use Redis for backend caching only
- Do not expose Redis publicly without authentication
- Use the full connection-string format in production:

```text
redis://user:password@host:port
```

## Notes on MongoDB

- Use a managed MongoDB provider for production
- Keep the production database on a private network or restricted allowlist when possible
