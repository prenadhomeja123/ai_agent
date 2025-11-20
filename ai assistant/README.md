# Infinite Base Agent - Frontend

AI-powered client management and sales automation platform for solo practitioners and small service businesses.

## Overview

This is the frontend application for **Infinite Base Agent - Plan A (Starter Tier)**, a web-based portal that allows practitioners to manage leads, automate communications, and interact with an AI assistant powered by OpenAI's ChatGPT API.

## Features

- **Dashboard**: Overview of leads, messages, automations, and AI agent activity
- **AI Chat Interface**: Interactive chat with ChatGPT API for crafting personalized messages
- **Audit History**: Complete log of all AI actions with filtering and search
- **Settings**: Manage automations, messaging channels, and notification preferences
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **Date Handling**: date-fns
- **HTTP Client**: Native Fetch API

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── dashboard/      # Dashboard page
│   ├── chat/          # AI Chat interface
│   ├── audit/         # Audit History page
│   ├── settings/      # Settings page
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Login page
│   └── globals.css    # Global styles
├── components/
│   └── Layout.tsx     # Main layout with sidebar navigation
├── lib/
│   └── api.ts         # API client functions
├── types/
│   └── index.ts       # TypeScript type definitions
└── public/            # Static assets
```

## API Integration

The frontend is designed to connect to a backend API. All API calls are defined in `lib/api.ts` and should be updated with your actual backend endpoints.

### Expected API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/leads` - Fetch leads
- `GET /api/messages` - Fetch messages
- `POST /api/messages` - Send message
- `POST /api/ai/generate` - Generate AI response
- `GET /api/automations` - Fetch automations
- `PATCH /api/automations/:id` - Toggle automation
- `GET /api/activity` - Fetch agent activity/audit history
- `GET /api/settings` - Fetch settings
- `PUT /api/settings` - Update settings

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: http://localhost:3001/api)

## Notes

- The current implementation uses mock data for demonstration purposes
- Replace mock API calls in components with actual API calls from `lib/api.ts`
- Authentication state management should be implemented (consider using NextAuth.js or similar)
- The app is ready for backend integration - just update the API endpoints in `lib/api.ts`

