# OTP Authentication Flow Documentation

## Authentication Flow

The application now uses OTP (One-Time Password) verification for secure authentication. Here's the complete flow:

### 1. Registration Flow
```
User fills registration form
    ↓
POST /api/auth/register
    ↓
Account created (email NOT verified yet)
    ↓
Redirect to /otp/send?email=user@email.com
    ↓
User requests OTP
    ↓
POST /api/auth/send-otp
    ↓
OTP sent to email
    ↓
Redirect to /otp/verify?email=user@email.com
    ↓
User enters OTP
    ↓
POST /api/auth/verify-otp
    ↓
Email verified + JWT token issued
    ↓
Redirect to /dashboard
```

### 2. Login Flow
```
User enters email & password
    ↓
POST /api/auth/login
    ↓
Check if email is verified
    ↓
If NOT verified:
    → Redirect to /otp/send
    → User must verify email first
    ↓
If verified:
    → JWT token issued
    → Redirect to /dashboard
```

### 3. OTP Resend Flow
```
User on verify page
    ↓
Clicks "Resend OTP"
    ↓
POST /api/auth/send-otp
    ↓
New OTP sent to email
```

## Frontend Pages

### `/register`
- Registration form
- After successful registration → redirects to `/otp/send`

### `/otp/send`
- Email input field
- Sends OTP to email
- After sending → redirects to `/otp/verify`

### `/otp/verify`
- 6-digit OTP input
- Verify button
- Resend OTP option
- After verification → redirects to `/dashboard`

### `/` (Login)
- Email & password login
- If email not verified → redirects to `/otp/send`
- If verified → redirects to `/dashboard`

## Backend API Endpoints

### `POST /api/auth/register`
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirm": "password123",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "user": {...},
  "message": "Registration successful. Please verify your email with OTP."
}
```

### `POST /api/auth/login`
**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (if not verified):**
```json
{
  "requiresOTP": true,
  "message": "Please verify your email with OTP first."
}
```

**Response (if verified):**
```json
{
  "user": {...},
  "token": "jwt_token_here",
  "refresh": "refresh_token_here",
  "requiresOTP": false
}
```

### `POST /api/auth/send-otp`
**Request:**
```json
{
  "email": "john@example.com",
  "purpose": "verification"  // optional, default: "verification"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully to your email.",
  "otp": "123456"  // Only in DEBUG mode
}
```

### `POST /api/auth/verify-otp`
**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully.",
  "user": {...},
  "token": "jwt_token_here",
  "refresh": "refresh_token_here"
}
```

## OTP Model

- **Code**: 6-digit random number
- **Expires**: 10 minutes after creation
- **Purpose**: Can be "verification" or "login"
- **One-time use**: Once verified, cannot be used again

## Email Configuration

### Development
- OTP is printed to console/terminal
- Check Django server logs for OTP codes
- Email backend: `django.core.mail.backends.console.EmailBackend`

### Production
Update `settings.py`:
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
```

## Security Features

1. **OTP Expiration**: OTPs expire after 10 minutes
2. **One-time Use**: Each OTP can only be used once
3. **Email Verification**: Users must verify email before accessing dashboard
4. **JWT Tokens**: Secure token-based authentication after verification

## Testing

### Development Testing
1. Register a new user
2. Check Django console for OTP code
3. Enter OTP in verify page
4. Should redirect to dashboard

### Production Testing
1. Register a new user
2. Check email inbox for OTP
3. Enter OTP in verify page
4. Should redirect to dashboard

## Troubleshooting

- **OTP not received**: Check email spam folder or Django console (development)
- **OTP expired**: Request a new OTP
- **Invalid OTP**: Make sure you're using the latest OTP sent
- **Email not verified**: Complete OTP verification flow

