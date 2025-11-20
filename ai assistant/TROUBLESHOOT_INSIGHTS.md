# Troubleshooting: Insights Page Loading Issue

## Quick Checks

### 1. Check if Backend is Running
```bash
# In backend directory
python manage.py runserver
```
Should see: "Starting development server at http://127.0.0.1:8000/"

### 2. Check Browser Console
Open browser DevTools (F12) → Console tab
Look for errors like:
- "401 Unauthorized" → Authentication issue
- "Network error" → Backend not running
- "CORS error" → CORS configuration issue

### 3. Check if You're Logged In
```javascript
// In browser console
localStorage.getItem('token')
```
Should return a JWT token string. If `null`, you need to log in again.

### 4. Test API Directly
Open browser DevTools → Network tab
1. Refresh the insights page
2. Look for request to `/api/bi/dashboard`
3. Check:
   - Status code (should be 200)
   - Response (should be JSON)
   - Request headers (should include `Authorization: Bearer <token>`)

## Common Issues & Fixes

### Issue 1: "Loading insights..." Forever
**Cause:** API call is hanging or failing silently

**Fix:**
1. Check browser console for errors
2. Check if backend is running
3. Check network tab for failed requests
4. Verify token exists in localStorage

### Issue 2: 401 Unauthorized
**Cause:** Token expired or invalid

**Fix:**
1. Log out and log in again
2. Check if token is in localStorage
3. Verify backend authentication is working

### Issue 3: CORS Error
**Cause:** Backend not allowing frontend origin

**Fix:**
Check `backend/infinite_base_agent/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
]
```

### Issue 4: Backend Not Running
**Cause:** Django server stopped

**Fix:**
```bash
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

## Debug Steps

1. **Check Backend Logs**
   - Look at Django terminal output
   - Should see: `[BI Dashboard] User: ...` messages

2. **Check Frontend Console**
   - Open DevTools (F12)
   - Check Console for errors
   - Check Network tab for API calls

3. **Test Authentication**
   - Try accessing another page (e.g., dashboard)
   - If that works, issue is specific to BI endpoint
   - If that fails, authentication issue

4. **Verify Data Exists**
   ```bash
   python manage.py shell
   >>> from accounts.models import User
   >>> user = User.objects.first()
   >>> from business_intelligence.models import BusinessInsight
   >>> BusinessInsight.objects.filter(user=user).count()
   ```

## Quick Fix Commands

```bash
# Restart backend
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver

# Check if data exists
python manage.py shell
# Then run: from business_intelligence.models import BusinessInsight; print(BusinessInsight.objects.count())
```

## Still Not Working?

1. Check browser console for exact error message
2. Check Django terminal for backend errors
3. Verify you're logged in (check localStorage)
4. Try logging out and back in
5. Check if other pages work (dashboard, chat, etc.)
