# Infinite Base Agent - API Documentation

Complete API documentation for testing in Postman.

**Base URL**: `http://localhost:8000/api`

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirm": "password123",
  "phone": "+1234567890"
}
```

**Success Response (201):**
```json
{
  "user": {
    "id": 1,
    "username": "john@example.com",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890"
  },
  "message": "Registration successful. Please verify your email with OTP."
}
```

**Error Response (400):**
```json
{
  "email": ["This field is required."],
  "password": ["This field is required."]
}
```

---

### 2. Login
**POST** `/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200) - Email Verified:**
```json
{
  "user": {
    "id": 1,
    "username": "john@example.com",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "requiresOTP": false
}
```

**Response (200) - Email Not Verified:**
```json
{
  "requiresOTP": true,
  "message": "Please verify your email with OTP first."
}
```

**Error Response (400):**
```json
{
  "non_field_errors": ["Invalid email or password"]
}
```

---

### 3. Send OTP
**POST** `/auth/send-otp`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "purpose": "verification"
}
```

**Success Response (200):**
```json
{
  "message": "OTP sent successfully to your email.",
  "otp": "123456"
}
```
*Note: `otp` field only appears in DEBUG mode*

**Error Response (404):**
```json
{
  "error": "User with this email does not exist"
}
```

---

### 4. Verify OTP
**POST** `/auth/verify-otp`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "message": "OTP verified successfully.",
  "user": {
    "id": 1,
    "username": "john@example.com",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Error Response (400):**
```json
{
  "error": "Invalid OTP code."
}
```
or
```json
{
  "error": "OTP has expired. Please request a new one."
}
```

---

### 5. Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "id": 1,
  "username": "john@example.com",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

**Error Response (401):**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

## Leads Endpoints

### 6. Get All Leads
**GET** `/leads`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Success Response (200):**
```json
[
  {
    "id": 1,
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "phone": "+1234567890",
    "status": "new",
    "source": "Website",
    "notes": "",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "last_contacted": null,
    "user": 1
  }
]
```

---

### 7. Create Lead
**POST** `/leads`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Mike Chen",
  "email": "mike@example.com",
  "phone": "+1234567891",
  "status": "new",
  "source": "Referral",
  "notes": "Interested in coaching services"
}
```

**Success Response (201):**
```json
{
  "id": 2,
  "name": "Mike Chen",
  "email": "mike@example.com",
  "phone": "+1234567891",
  "status": "new",
  "source": "Referral",
  "notes": "Interested in coaching services",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "last_contacted": null,
  "user": 1
}
```

---

### 8. Get Lead by ID
**GET** `/leads/{id}`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "id": 1,
  "name": "Sarah Johnson",
  "email": "sarah@example.com",
  "phone": "+1234567890",
  "status": "new",
  "source": "Website",
  "notes": "",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z",
  "last_contacted": null,
  "user": 1
}
```

**Error Response (404):**
```json
{
  "error": "Lead not found"
}
```

---

### 9. Update Lead
**PUT** `/leads/{id}`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Sarah Johnson",
  "email": "sarah@example.com",
  "phone": "+1234567890",
  "status": "contacted",
  "source": "Website",
  "notes": "Followed up via email"
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "name": "Sarah Johnson",
  "email": "sarah@example.com",
  "status": "contacted",
  ...
}
```

---

### 10. Delete Lead
**DELETE** `/leads/{id}`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Success Response (204):** No content

---

## Messages Endpoints

### 11. Get Messages
**GET** `/messages`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Query Parameters (optional):**
- `leadId`: Filter messages by lead ID

**Example:** `/messages?leadId=1`

**Success Response (200):**
```json
[
  {
    "id": 1,
    "lead": 1,
    "channel": "email",
    "direction": "outbound",
    "content": "Thank you for your interest!",
    "status": "sent",
    "ai_generated": true,
    "timestamp": "2024-01-15T10:30:00Z",
    "user": 1
  }
]
```

---

### 12. Send Message
**POST** `/messages`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "leadId": 1,
  "channel": "email",
  "content": "Hi Sarah, thank you for your interest in our services!"
}
```

**Success Response (201):**
```json
{
  "id": 2,
  "lead": 1,
  "channel": "email",
  "direction": "outbound",
  "content": "Hi Sarah, thank you for your interest in our services!",
  "status": "sent",
  "ai_generated": false,
  "timestamp": "2024-01-15T11:00:00Z",
  "user": 1
}
```

---

## AI Integration Endpoints

### 13. Generate AI Response
**POST** `/ai/generate`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "prompt": "Write a follow-up email to a new lead",
  "context": {
    "lead": {
      "id": 1,
      "name": "Sarah Johnson",
      "email": "sarah@example.com"
    }
  }
}
```

**Success Response (200):**
```json
{
  "response": "Hi Sarah,\n\nThank you for your interest! I'd love to help you achieve your goals. Would you be available for a quick call this week?\n\nBest regards"
}
```

**Error Response (400):**
```json
{
  "error": "Prompt is required"
}
```

---

### 14. Get Agent Activity
**GET** `/activity`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Query Parameters (optional):**
- `dateFrom`: Filter from date (ISO format)
- `dateTo`: Filter to date (ISO format)
- `channel`: Filter by channel (email, sms, whatsapp, facebook, instagram)

**Example:** `/activity?dateFrom=2024-01-15&dateTo=2024-01-16&channel=email`

**Success Response (200):**
```json
[
  {
    "id": 1,
    "type": "message_sent",
    "description": "AI generated response: Write a follow-up email",
    "channel": "email",
    "leadId": 1,
    "timestamp": "2024-01-15T10:30:00Z",
    "details": {
      "prompt": "Write a follow-up email",
      "response": "Hi Sarah...",
      "context": {...}
    }
  }
]
```

---

## Automations Endpoints

### 15. Get All Automations
**GET** `/automations`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Success Response (200):**
```json
[
  {
    "id": 1,
    "name": "Lead Follow-up",
    "type": "lead_followup",
    "enabled": true,
    "trigger": "New lead added",
    "last_triggered": "2024-01-15T10:00:00Z",
    "times_triggered": 5,
    "created_at": "2024-01-15T09:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "user": 1
  }
]
```

---

### 16. Create Automation
**POST** `/automations`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Booking Reminder",
  "type": "booking_reminder",
  "enabled": true,
  "trigger": "24h before booking"
}
```

**Success Response (201):**
```json
{
  "id": 2,
  "name": "Booking Reminder",
  "type": "booking_reminder",
  "enabled": true,
  "trigger": "24h before booking",
  "last_triggered": null,
  "times_triggered": 0,
  "created_at": "2024-01-15T11:00:00Z",
  "updated_at": "2024-01-15T11:00:00Z",
  "user": 1
}
```

---

### 17. Toggle Automation
**PATCH** `/automations/{id}`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "enabled": false
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "name": "Lead Follow-up",
  "type": "lead_followup",
  "enabled": false,
  ...
}
```

---

## Settings Endpoints

### 18. Get Settings
**GET** `/settings`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "channels": {
    "email": {
      "enabled": true,
      "provider": "Gmail"
    },
    "sms": {
      "enabled": true,
      "provider": "Twilio"
    },
    "whatsapp": {
      "enabled": false,
      "provider": "Meta"
    },
    "facebook": {
      "enabled": false,
      "provider": "Meta"
    },
    "instagram": {
      "enabled": false,
      "provider": "Meta"
    }
  },
  "crm": {
    "provider": "SimplyBook.me",
    "connected": true,
    "lastSynced": "2024-01-15T10:00:00Z"
  },
  "automations": {
    "leadFollowup": true,
    "bookingReminder": true,
    "confirmation": true,
    "postSession": true
  },
  "notifications": {
    "email": true,
    "sms": false,
    "inApp": true
  }
}
```

---

### 19. Update Settings
**PUT** `/settings`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "channels": {
    "email": {
      "enabled": true,
      "provider": "Gmail"
    },
    "whatsapp": {
      "enabled": true,
      "provider": "Meta"
    }
  },
  "automations": {
    "leadFollowup": true,
    "bookingReminder": false
  },
  "notifications": {
    "email": true,
    "sms": true,
    "inApp": true
  }
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "email_enabled": true,
  "whatsapp_enabled": true,
  ...
}
```

---

## Testing Workflow

### Complete Authentication Flow:

1. **Register** → `POST /auth/register`
2. **Send OTP** → `POST /auth/send-otp` (check console for OTP in dev mode)
3. **Verify OTP** → `POST /auth/verify-otp` (get JWT token)
4. **Use Token** → Add `Authorization: Bearer <token>` header to all protected endpoints

### Quick Test Sequence:

1. Register a user
2. Send OTP (check Django console for code)
3. Verify OTP (save the token)
4. Get current user (use token in header)
5. Create a lead (use token)
6. Send a message (use token)
7. Generate AI response (use token)

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 400 Bad Request
```json
{
  "field_name": ["Error message"]
}
```

---

## Notes

- All protected endpoints require JWT token in Authorization header
- OTP expires in 10 minutes
- OTP can only be used once
- In DEBUG mode, OTP is returned in response and printed to console
- Date filters use ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SSZ`

