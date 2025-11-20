# Postman Testing Guide

## Quick Start

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select `Infinite_Base_Agent.postman_collection.json`
4. Collection will be imported with all endpoints

### 2. Set Base URL
- Collection variable `base_url` is already set to `http://localhost:8000/api`
- Change if your backend runs on different port

### 3. Start Backend
```bash
cd backend
python manage.py runserver
```

---

## Testing Workflow

### Step 1: Register a User
1. Open **Authentication → 1. Register User**
2. Click **Send**
3. Should get `201 Created` response
4. Email is saved to collection variable

### Step 2: Send OTP
1. Open **Authentication → 3. Send OTP**
2. Click **Send**
3. Check Django console for OTP code (in DEBUG mode)
4. Copy the OTP code

### Step 3: Verify OTP
1. Open **Authentication → 4. Verify OTP**
2. Update `otp_code` variable:
   - Click on collection name
   - Go to **Variables** tab
   - Set `otp_code` to the code from console
3. Click **Send**
4. JWT token is automatically saved to `jwt_token` variable

### Step 4: Test Protected Endpoints
All other endpoints now use the saved token automatically!

---

## Collection Variables

The collection uses these variables:

- `base_url`: API base URL (default: `http://localhost:8000/api`)
- `jwt_token`: JWT token (auto-saved after login/verify OTP)
- `user_email`: User email (auto-saved after registration)
- `otp_code`: OTP code (manual - get from console/email)
- `lead_id`: Lead ID (auto-saved after creating lead)

### How Variables Work

1. **Auto-saved variables:**
   - `jwt_token` - Saved after login/verify OTP
   - `user_email` - Saved after registration
   - `lead_id` - Saved after creating lead

2. **Manual variables:**
   - `otp_code` - You need to set this manually after getting OTP

### Setting Variables Manually

1. Click on collection name
2. Go to **Variables** tab
3. Edit values as needed
4. Variables are used across all requests

---

## Testing Each Endpoint

### Authentication Endpoints

#### ✅ Register User
- **Request**: POST `/auth/register`
- **Body**: User registration data
- **Response**: User object (no token yet)

#### ✅ Send OTP
- **Request**: POST `/auth/send-otp`
- **Body**: `{"email": "user@example.com"}`
- **Response**: Success message + OTP (in DEBUG mode)
- **Note**: Check Django console for OTP code

#### ✅ Verify OTP
- **Request**: POST `/auth/verify-otp`
- **Body**: `{"email": "...", "otp": "123456"}`
- **Response**: JWT token (auto-saved)
- **Note**: Set `otp_code` variable first

#### ✅ Login
- **Request**: POST `/auth/login`
- **Body**: Email and password
- **Response**: JWT token if verified, or requiresOTP flag

#### ✅ Get Current User
- **Request**: GET `/auth/me`
- **Headers**: Auto-added Bearer token
- **Response**: Current user data

---

### Leads Endpoints

#### ✅ Get All Leads
- **Request**: GET `/leads`
- **Headers**: Bearer token (auto-added)
- **Response**: Array of leads

#### ✅ Create Lead
- **Request**: POST `/leads`
- **Body**: Lead data
- **Response**: Created lead (ID auto-saved)

#### ✅ Get Lead by ID
- **Request**: GET `/leads/{id}`
- **Uses**: `lead_id` variable
- **Response**: Single lead

#### ✅ Update Lead
- **Request**: PUT `/leads/{id}`
- **Body**: Updated lead data
- **Response**: Updated lead

#### ✅ Delete Lead
- **Request**: DELETE `/leads/{id}`
- **Response**: 204 No Content

---

### Messages Endpoints

#### ✅ Get All Messages
- **Request**: GET `/messages`
- **Response**: Array of messages

#### ✅ Get Messages by Lead
- **Request**: GET `/messages?leadId={id}`
- **Response**: Filtered messages

#### ✅ Send Message
- **Request**: POST `/messages`
- **Body**: `{"leadId": 1, "channel": "email", "content": "..."}`
- **Response**: Created message

---

### AI Integration Endpoints

#### ✅ Generate AI Response
- **Request**: POST `/ai/generate`
- **Body**: Prompt and context
- **Response**: AI-generated response
- **Note**: Requires OpenAI API key in backend

#### ✅ Get Agent Activity
- **Request**: GET `/activity`
- **Response**: Array of activities

#### ✅ Get Filtered Activity
- **Request**: GET `/activity?dateFrom=...&dateTo=...&channel=...`
- **Response**: Filtered activities

---

### Automations Endpoints

#### ✅ Get All Automations
- **Request**: GET `/automations`
- **Response**: Array of automations

#### ✅ Create Automation
- **Request**: POST `/automations`
- **Body**: Automation data
- **Response**: Created automation

#### ✅ Toggle Automation
- **Request**: PATCH `/automations/{id}`
- **Body**: `{"enabled": false}`
- **Response**: Updated automation

---

### Settings Endpoints

#### ✅ Get Settings
- **Request**: GET `/settings`
- **Response**: User settings object

#### ✅ Update Settings
- **Request**: PUT `/settings`
- **Body**: Settings object
- **Response**: Updated settings

---

## Common Issues

### Issue: 401 Unauthorized
**Solution**: 
- Make sure you've verified OTP and token is saved
- Check `jwt_token` variable has a value
- Token might be expired - verify OTP again

### Issue: OTP Not Received
**Solution**:
- In DEBUG mode, check Django console
- OTP is printed to terminal where `runserver` is running
- In production, check email inbox

### Issue: 404 Not Found
**Solution**:
- Check backend is running on `http://localhost:8000`
- Verify endpoint URL is correct
- Check collection variable `base_url`

### Issue: 400 Bad Request
**Solution**:
- Check request body format
- Verify all required fields are included
- Check data types match expected format

---

## Tips

1. **Use Collection Runner**: Test entire flow automatically
2. **Save Responses**: Save example responses for reference
3. **Use Environments**: Create different environments (dev, staging, prod)
4. **Test Scripts**: Collection has auto-save scripts for tokens/IDs
5. **Check Console**: In DEBUG mode, OTP codes appear in Django console

---

## Example Test Sequence

1. ✅ Register → Get user email
2. ✅ Send OTP → Get OTP from console
3. ✅ Set `otp_code` variable
4. ✅ Verify OTP → Get JWT token (auto-saved)
5. ✅ Get Current User → Verify token works
6. ✅ Create Lead → Get lead ID (auto-saved)
7. ✅ Get Lead → Verify lead exists
8. ✅ Send Message → Test message creation
9. ✅ Generate AI Response → Test AI integration
10. ✅ Get Settings → Test settings retrieval

---

## Environment Setup (Optional)

Create a Postman Environment:

1. Click **Environments** → **+**
2. Add variables:
   - `base_url`: `http://localhost:8000/api`
   - `jwt_token`: (leave empty, auto-filled)
   - `user_email`: (leave empty, auto-filled)
3. Select environment when testing

This allows switching between dev/staging/prod easily.

