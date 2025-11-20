# How to Test AI Features

This guide shows you how to verify that your app is using AI features correctly.

## Quick Test Methods

### Method 1: Using the Test Script (Easiest)

Run the automated test script:

```bash
cd backend
venv\Scripts\Activate.ps1
python test_ai_features.py
```

This will:
- ✅ Check if API key is configured
- ✅ Test the AI endpoint
- ✅ Show you the AI-generated response
- ✅ Verify activity logging

---

### Method 2: Using Postman/API Client

#### Step 1: Get Authentication Token

First, you need to login and get a token:

**Endpoint:** `POST http://localhost:8000/api/auth/login`

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "test123456"
}
```

**Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {...}
}
```

**Note:** If you get `requiresOTP: true`, you need to verify OTP first (see TEST_USER_CREDENTIALS.md)

#### Step 2: Test AI Generation

**Endpoint:** `POST http://localhost:8000/api/ai/generate`

**Headers:**
```
Authorization: Bearer <your-token-here>
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "Write a professional email greeting for a new client",
  "context": {}
}
```

**Expected Response:**
```json
{
  "response": "Dear [Client Name],\n\nI hope this message finds you well..."
}
```

#### Step 3: Check Activity Log

**Endpoint:** `GET http://localhost:8000/api/activity`

**Headers:**
```
Authorization: Bearer <your-token-here>
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "type": "message_sent",
    "description": "AI generated response: Write a professional...",
    "timestamp": "2025-01-12T10:30:00Z",
    "details": {...}
  }
]
```

---

### Method 3: Using cURL (Command Line)

```bash
# 1. Login and get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'

# 2. Use the token to test AI (replace YOUR_TOKEN with actual token)
curl -X POST http://localhost:8000/api/ai/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Say hello in a professional way","context":{}}'
```

---

### Method 4: Check Django Server Logs

When you make an AI request, check the Django server terminal. You should see:
- No errors about missing API key
- Successful API calls to OpenAI
- Activity logs being created

---

## What to Look For

### ✅ Signs AI is Working:

1. **API Response:** You get a generated text response (not an error)
2. **Response Quality:** The text is coherent and relevant to your prompt
3. **Activity Log:** New entries appear in `/api/activity` endpoint
4. **No Errors:** No "API key not configured" errors
5. **Database:** `AgentActivity` records are created in the database

### ❌ Signs AI is NOT Working:

1. **Error Messages:**
   - `"OpenAI API key not configured"`
   - `"Authentication failed"`
   - `"Connection error"`

2. **Empty Responses:**
   - Empty `response` field
   - No activity logged

3. **Server Errors:**
   - 500 Internal Server Error
   - Timeout errors

---

## Troubleshooting

### Problem: "OpenAI API key not configured"

**Solution:**
1. Check `.env` file exists in `backend/` folder
2. Verify key is in format: `OPENAI_API_KEY=sk-proj-...`
3. Restart Django server after adding key

### Problem: "Authentication failed"

**Solution:**
1. Make sure you're logged in and have a valid token
2. Token might be expired - get a new one
3. User might need OTP verification first

### Problem: "Connection error" or Timeout

**Solution:**
1. Check internet connection
2. Verify OpenAI API is accessible
3. Check if Django server is running on port 8000

### Problem: No response from AI

**Solution:**
1. Check OpenAI API key is valid
2. Verify you have API credits/quota
3. Check Django server logs for errors

---

## Testing Different Prompts

Try these prompts to test various AI capabilities:

```json
{"prompt": "Write a short welcome message for a new client"}
{"prompt": "Create a follow-up email for a lead who hasn't responded"}
{"prompt": "Write a professional thank you message"}
{"prompt": "Draft a meeting confirmation email"}
```

---

## Verify in Database

You can also check directly in the database:

```bash
python manage.py shell
```

```python
from ai_integration.models import AgentActivity
from accounts.models import User

user = User.objects.get(email='test@example.com')
activities = AgentActivity.objects.filter(user=user)
print(f"Total AI activities: {activities.count()}")
for activity in activities[:5]:
    print(f"- {activity.type}: {activity.description[:50]}")
```

---

## Expected Behavior

When AI features are working correctly:

1. ✅ API key is loaded from `.env`
2. ✅ OpenAI client initializes successfully
3. ✅ API calls to OpenAI succeed
4. ✅ Responses are generated and returned
5. ✅ Activities are logged in the database
6. ✅ Activity endpoint returns logged activities

If all these work, your AI features are fully functional! 🎉

