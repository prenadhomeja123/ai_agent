# Test User Credentials

## Test User Account

**Email:** `test@example.com`  
**Password:** `test123456`  
**Name:** Test User  
**Email Verified:** `False` (needs OTP verification)

---

## Testing Flow

### 1. Sign In (Login)
**Endpoint:** `POST http://localhost:8000/api/auth/login`

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "test123456"
}
```

**Expected Response:**
```json
{
  "requiresOTP": true,
  "message": "Please verify your email with OTP first."
}
```

---

### 2. Send OTP
**Endpoint:** `POST http://localhost:8000/api/auth/send-otp`

**Request Body:**
```json
{
  "email": "test@example.com"
}
```

**Expected Response:**
```json
{
  "message": "OTP sent successfully! Check your terminal/console for the OTP code.",
  "otp": "123456"
}
```

**Check Terminal:** The OTP will also be printed in the Django server terminal.

---

### 3. Verify OTP
**Endpoint:** `POST http://localhost:8000/api/auth/verify-otp`

**Request Body:**
```json
{
  "email": "test@example.com",
  "otp": "123456"
}
```

**Expected Response:**
```json
{
  "message": "OTP verified successfully.",
  "user": {
    "id": 1,
    "username": "test@example.com",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "phone": null
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 4. Sign In Again (After OTP Verification)
**Endpoint:** `POST http://localhost:8000/api/auth/login`

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "test123456"
}
```

**Expected Response:**
```json
{
  "user": {
    "id": 1,
    "username": "test@example.com",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "phone": null
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "requiresOTP": false
}
```

---

## Create More Test Users

Run the script to create/reset test user:
```bash
cd backend
venv\Scripts\Activate.ps1
python create_test_user.py
```

Or modify `create_test_user.py` to create different test users.

