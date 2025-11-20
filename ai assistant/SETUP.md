# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Update the URL to match your backend API endpoint.

## Step 3: Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Step 4: Connect to Backend

1. Make sure your backend API is running
2. Update `NEXT_PUBLIC_API_URL` in `.env.local` to point to your backend
3. The frontend will automatically connect to your backend API

## Current Status

- ✅ Frontend is fully built and ready
- ⏳ Backend API needs to be implemented
- ⏳ Replace mock data with real API calls (already structured in `lib/api.ts`)

## Next Steps

1. Build your backend API following the endpoints defined in `TECH_READY_DOCUMENT.md`
2. Test the connection between frontend and backend
3. Replace any remaining mock data with real API calls
4. Deploy both frontend and backend to production

## Troubleshooting

- **Port already in use?** Change the port: `npm run dev -- -p 3001`
- **API connection errors?** Check that `NEXT_PUBLIC_API_URL` is correct and your backend is running
- **Build errors?** Make sure all dependencies are installed: `npm install`


