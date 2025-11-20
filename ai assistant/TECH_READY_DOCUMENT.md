# Infinite Base Agent - Tech Ready Document (Simple Terms)

## What This Document Is

This document explains the frontend application in simple terms so your backend team knows exactly what to build and how to connect everything together.

---

## What We Built (Frontend)

We built a complete web application that practitioners will use to manage their leads and automate their communications. The frontend is **ready to connect** to your backend - you just need to build the backend API that matches what the frontend expects.

---

## The Application Structure

### 1. **Login Page** (`/`)
- Users enter email and password
- Sends login request to: `POST /api/auth/login`
- After successful login, redirects to dashboard

### 2. **Dashboard** (`/dashboard`)
- Shows overview of everything:
  - Total leads count
  - Messages sent count
  - Active automations count
  - Conversion rate
- Displays recent leads in a table
- Shows recent AI agent activity
- **API Calls Needed:**
  - `GET /api/leads` - Get all leads
  - `GET /api/messages` - Get recent messages
  - `GET /api/automations` - Get automation status
  - `GET /api/activity` - Get recent agent activity

### 3. **AI Chat** (`/chat`)
- Shows list of leads on the left
- Main chat area where users can:
  - Ask AI to help craft messages
  - See AI-generated responses
  - Send messages via different channels (email, SMS, WhatsApp)
- **API Calls Needed:**
  - `GET /api/leads` - Get leads list
  - `POST /api/ai/generate` - Send prompt to ChatGPT, get response
  - `POST /api/messages` - Send message to a lead via a channel

### 4. **Audit History** (`/audit`)
- Shows complete log of all AI agent actions
- Can filter by:
  - Date range (from/to)
  - Channel (email, SMS, WhatsApp, etc.)
  - Search text
- **API Calls Needed:**
  - `GET /api/activity?dateFrom=...&dateTo=...&channel=...` - Get filtered activity log

### 5. **Settings** (`/settings`)
- **CRM Integration Section:**
  - Shows which CRM is connected (e.g., SimplyBook.me)
  - Shows connection status and last sync time
  - (Read-only for practitioners - setup team manages this)
  
- **Messaging Channels:**
  - Toggle channels on/off (Email, SMS, WhatsApp, Facebook, Instagram)
  - Each channel shows its provider (e.g., Gmail, Twilio, Meta)
  
- **Automations:**
  - Toggle each automation on/off:
    - Lead Follow-up
    - Booking Reminder
    - Confirmation
    - Post-Session Follow-up
  
- **Notifications:**
  - Toggle notification preferences (Email, SMS, In-App)
  
- **API Calls Needed:**
  - `GET /api/settings` - Get current settings
  - `PUT /api/settings` - Update settings

---

## Data Types (What the Frontend Expects)

### Lead
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string (optional)",
  "status": "new" | "contacted" | "qualified" | "converted" | "lost",
  "source": "string",
  "createdAt": "ISO date string",
  "lastContacted": "ISO date string (optional)",
  "notes": "string (optional)"
}
```

### Message
```json
{
  "id": "string",
  "leadId": "string",
  "channel": "email" | "sms" | "whatsapp" | "facebook" | "instagram",
  "direction": "inbound" | "outbound",
  "content": "string",
  "timestamp": "ISO date string",
  "status": "sent" | "delivered" | "read" | "failed",
  "aiGenerated": "boolean (optional)"
}
```

### Automation
```json
{
  "id": "string",
  "name": "string",
  "type": "lead_followup" | "booking_reminder" | "confirmation" | "post_session",
  "enabled": "boolean",
  "trigger": "string",
  "lastTriggered": "ISO date string (optional)",
  "timesTriggered": "number"
}
```

### Agent Activity (Audit History)
```json
{
  "id": "string",
  "type": "message_sent" | "message_replied" | "followup_triggered" | "crm_updated" | "automation_ran",
  "description": "string",
  "channel": "string (optional)",
  "leadId": "string (optional)",
  "timestamp": "ISO date string",
  "details": "object (optional, can contain any additional info)"
}
```

### Settings
```json
{
  "channels": {
    "email": { "enabled": "boolean", "provider": "string" },
    "sms": { "enabled": "boolean", "provider": "string" },
    "whatsapp": { "enabled": "boolean", "provider": "string" },
    "facebook": { "enabled": "boolean", "provider": "string" },
    "instagram": { "enabled": "boolean", "provider": "string" }
  },
  "crm": {
    "provider": "string",
    "connected": "boolean",
    "lastSynced": "ISO date string (optional)"
  },
  "automations": {
    "leadFollowup": "boolean",
    "bookingReminder": "boolean",
    "confirmation": "boolean",
    "postSession": "boolean"
  },
  "notifications": {
    "email": "boolean",
    "sms": "boolean",
    "inApp": "boolean"
  }
}
```

---

## API Endpoints You Need to Build

### Authentication
- **POST** `/api/auth/login`
  - Body: `{ "email": "string", "password": "string" }`
  - Returns: `{ "token": "string", "user": {...} }`

### Leads
- **GET** `/api/leads`
  - Returns: `Array<Lead>`

- **GET** `/api/leads/:id`
  - Returns: `Lead`

### Messages
- **GET** `/api/messages?leadId=...` (optional query param)
  - Returns: `Array<Message>`

- **POST** `/api/messages`
  - Body: `{ "leadId": "string", "channel": "string", "content": "string" }`
  - Returns: `Message`

### AI Integration
- **POST** `/api/ai/generate`
  - Body: `{ "prompt": "string", "context": {...} }`
  - Returns: `{ "response": "string" }`
  - **Note:** This should call OpenAI ChatGPT API (GPT-4 or 4o Mini)

### Automations
- **GET** `/api/automations`
  - Returns: `Array<Automation>`

- **PATCH** `/api/automations/:id`
  - Body: `{ "enabled": "boolean" }`
  - Returns: `Automation`

### Agent Activity / Audit History
- **GET** `/api/activity?dateFrom=...&dateTo=...&channel=...`
  - Query params are optional
  - Returns: `Array<AgentActivity>`

### Settings
- **GET** `/api/settings`
  - Returns: `Settings`

- **PUT** `/api/settings`
  - Body: `Settings` (full settings object)
  - Returns: `Settings`

---

## Important Notes for Backend Team

1. **Authentication**: The frontend expects a token-based auth system. Store the token and include it in API requests (you may need to add this to the frontend's API client).

2. **CORS**: Make sure your backend allows requests from `http://localhost:3000` (development) and your production domain.

3. **Error Handling**: The frontend handles errors, but make sure your API returns proper HTTP status codes and error messages.

4. **OpenAI Integration**: The `/api/ai/generate` endpoint needs to:
   - Accept the prompt and context
   - Call OpenAI's ChatGPT API
   - Return the generated response
   - Log the action in the audit history

5. **CRM Integration**: For Plan A, you need to integrate with SimplyBook.me (or the CRM the client uses). The frontend just displays the connection status - you handle the actual integration.

6. **Messaging Channels**: You need to integrate with:
   - Email: Gmail/Outlook API
   - SMS: Twilio
   - WhatsApp/Facebook/Instagram: Meta Business API

7. **Automations**: The backend should:
   - Monitor triggers (new leads, bookings, etc.)
   - Execute automations when enabled
   - Log all automation runs in the audit history

8. **Audit History**: **Every action** the AI takes should be logged:
   - Messages sent
   - Messages replied to
   - Automations triggered
   - CRM updates
   - Any other AI activity

---

## Environment Variables

The frontend uses:
- `NEXT_PUBLIC_API_URL` - Your backend API URL (default: `http://localhost:3001/api`)

Set this in `.env.local` file.

---

## How to Test the Frontend

1. Install dependencies: `npm install`
2. Set `NEXT_PUBLIC_API_URL` in `.env.local` to point to your backend
3. Run: `npm run dev`
4. Open `http://localhost:3000`
5. The frontend will try to connect to your backend API

**Note:** Currently, the frontend uses mock data. Once your backend is ready, replace the mock API calls in the components with real calls (they're already set up in `lib/api.ts`).

---

## What's Ready vs. What You Need to Build

### ✅ Ready (Frontend)
- All UI pages and components
- Navigation and layout
- Forms and inputs
- Data display (tables, cards, lists)
- API client structure (`lib/api.ts`)
- TypeScript types for all data

### 🔨 You Need to Build (Backend)
- All API endpoints listed above
- Database/models for leads, messages, automations, activity
- Authentication system
- OpenAI ChatGPT API integration
- CRM integration (SimplyBook.me for MVP)
- Messaging channel integrations (Email, SMS, WhatsApp, Facebook, Instagram)
- Automation engine (triggers and execution)
- Audit logging system

---

## Questions?

If anything is unclear, check the `lib/api.ts` file - it shows exactly what API calls the frontend makes and what it expects in return.

Good luck building the backend! 🚀


