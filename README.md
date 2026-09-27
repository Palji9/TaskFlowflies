# TaskFlow

TaskFlow is a full-stack project management app in a single repository:

- `taskflow-backend/` - Node.js and Express API
- `taskflow-frontend/` - React and Vite web app

The folders are deployed as two separate services from the same Git repository.

## Deploy the backend

Create a Node.js web service (Render, Railway, or a similar provider) with:

- **Root directory:** `taskflow-backend`
- **Build command:** `npm install`
- **Start command:** `npm start`

Add these environment variables in the service dashboard:

```env
NODE_ENV=production
MONGO_URI=your-mongodb-connection-string
ACCESS_TOKEN_SECRET=generate-a-long-random-value
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=generate-a-different-long-random-value
REFRESH_TOKEN_EXPIRY=10d
CORS_ORIGIN=https://task-flowflies.vercel.app
```

Also add the SMTP variables used by the email features. Do not upload `.env` files or put secrets in the repository.

After deployment, verify:

```text
https://your-backend-domain.example/api/v1/healthcheck
```

## Deploy the frontend

Create a static site (Vercel, Netlify, or a similar provider) with:

- **Root directory:** `taskflow-frontend`
- **Build command:** `npm run build`
- **Output directory:** `dist`

Add this environment variable in the frontend service dashboard:

```env
VITE_API_URL=https://taskflowflies.onrender.com/api/v1
```

Set these values in the hosting dashboards, not in committed environment files. `CORS_ORIGIN` must match the frontend's origin exactly (scheme and host, with no path). Add any additional Vercel preview origins as comma-separated values if those previews need API access.

The frontend uses `VITE_API_URL` when it is set. Without it, Vercel-hosted pages fall back to the Render API above, while local development falls back to `http://localhost:8000/api/v1`.

## Local development

Run each app from its own directory:

```bash
cd taskflow-backend
npm install
npm run dev
```

```bash
cd taskflow-frontend
npm install
npm run dev
```

For local development, use `http://localhost:5173` as `CORS_ORIGIN` and leave `VITE_API_URL` unset, or set it to `http://localhost:8000/api/v1`.

## Important

The credentials previously placed in a local `.env` file should be rotated if they were ever committed, shared, or exposed. Environment files belong in the hosting provider's secret settings, not in Git.
