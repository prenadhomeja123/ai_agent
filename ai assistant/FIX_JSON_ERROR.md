# Fix: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

## The Problem

This error means the frontend is receiving HTML (like an error page) instead of JSON from the backend API.

## Common Causes

1. **Backend server is not running** ⚠️ Most common!
2. **Wrong API URL** - Backend running on different port
3. **Backend error** - Server returning error page instead of JSON
4. **CORS issue** - Request being blocked

## Solution

### Step 1: Make Sure Backend is Running

**Open a terminal and run:**
```bash
cd backend
venv\Scripts\Activate.ps1
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

### Step 2: Verify Backend is Accessible

Open in browser: http://localhost:8000/api/

You should see a Django REST Framework page (not an error).

### Step 3: Check Frontend API URL

Make sure `.env.local` in the frontend root has:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Step 4: Test the Endpoint Directly

Try in Postman or browser:
- **POST** http://localhost:8000/api/auth/send-otp
- Body: `{"email": "test@example.com"}`

Should return JSON, not HTML.

## Quick Checklist

- [ ] Backend server running? (`python manage.py runserver`)
- [ ] Backend accessible? (http://localhost:8000)
- [ ] Frontend `.env.local` has correct API URL?
- [ ] No firewall blocking port 8000?
- [ ] CORS settings correct in `settings.py`?

## Error Handling Improved

I've updated the API client to:
- Check response status before parsing JSON
- Show helpful error messages
- Detect when backend is not running

## Still Getting Error?

1. **Check browser console** - Look for the actual error
2. **Check backend terminal** - Look for Django errors
3. **Test endpoint directly** - Use Postman to test API
4. **Check network tab** - See what response you're getting

---

**Most likely fix: Just make sure the backend server is running!** 🚀

