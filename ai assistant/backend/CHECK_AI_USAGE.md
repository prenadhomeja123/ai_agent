# How to Check if Your App is Using AI Features

## Quick Checklist ✅

### 1. Check API Key is Loaded
```bash
cd backend
venv\Scripts\Activate.ps1
python manage.py shell
```

Then in the shell:
```python
from django.conf import settings
print("API Key loaded:", "YES" if settings.OPENAI_API_KEY else "NO")
print("Key starts with:", settings.OPENAI_API_KEY[:20] if settings.OPENAI_API_KEY else "N/A")
```

**Expected:** `API Key loaded: YES` and key starts with `sk-proj-`

---

### 2. Check AI Endpoint is Accessible

**Endpoint:** `POST http://localhost:8000/api/ai/generate`

**Required:**
- Authentication token (from login)
- Request body with `prompt` field

**Test with Postman:**
1. Login first: `POST /api/auth/login` with test user credentials
2. Copy the `token` from response
3. Make request to `/api/ai/generate` with:
   - Header: `Authorization: Bearer <token>`
   - Body: `{"prompt": "Say hello", "context": {}}`

**Expected Response:**
```json
{
  "response": "Hello! How can I assist you today?"
}
```

---

### 3. Check Activity Logs

After making an AI request, check if it's logged:

**Endpoint:** `GET http://localhost:8000/api/activity`

**Or in Django shell:**
```python
from ai_integration.models import AgentActivity
from accounts.models import User

user = User.objects.get(email='test@example.com')
activities = AgentActivity.objects.filter(user=user)
print(f"Total AI activities: {activities.count()}")
for activity in activities[:3]:
    print(f"- {activity.type}: {activity.description}")
```

**Expected:** You should see activities with type `message_sent`

---

### 4. Check Django Server Logs

When you make an AI request, watch the Django server terminal. You should see:
- ✅ No errors about missing API key
- ✅ Successful responses (200 status)
- ✅ No timeout errors

---

## Signs AI is Working ✅

1. **API Key Configured**
   - ✅ Key exists in `.env` file
   - ✅ Key loads in Django settings
   - ✅ Key format is correct (`sk-proj-...`)

2. **Endpoint Responds**
   - ✅ `/api/ai/generate` returns 200 status
   - ✅ Response contains generated text
   - ✅ Text is coherent and relevant

3. **Activity Logged**
   - ✅ New `AgentActivity` records created
   - ✅ Activities visible in `/api/activity` endpoint

4. **No Errors**
   - ✅ No "API key not configured" errors
   - ✅ No authentication errors
   - ✅ No connection timeouts

---

## Signs AI is NOT Working ❌

1. **Error Messages:**
   - ❌ `"OpenAI API key not configured"`
   - ❌ `"Authentication failed"`
   - ❌ `"Connection error"` or timeout

2. **Empty/No Response:**
   - ❌ Empty `response` field
   - ❌ 500 Internal Server Error
   - ❌ No activity logged

3. **Configuration Issues:**
   - ❌ Key not in `.env` file
   - ❌ Key not loading in settings
   - ❌ Wrong key format

---

## Simple Test Steps

### Step 1: Verify Key
```bash
python manage.py shell -c "from django.conf import settings; print('Key:', 'YES' if settings.OPENAI_API_KEY else 'NO')"
```

### Step 2: Test via Postman
1. Start Django server: `python manage.py runserver`
2. Login: `POST /api/auth/login`
3. Test AI: `POST /api/ai/generate` with token

### Step 3: Check Results
- Response contains generated text ✅
- Activity logged in database ✅
- No errors in server logs ✅

---

## Current Status

Based on our tests:
- ✅ API Key is configured (164 characters, starts with `sk-proj-`)
- ✅ Key loads in Django settings
- ✅ `.env` file is properly formatted
- ✅ Settings are configured correctly

**Your AI features should be working!** 

To fully verify, test the endpoint with Postman or the frontend.

---

## Need Help?

If AI is not working:
1. Check `.env` file exists and has correct key
2. Restart Django server after changing `.env`
3. Verify user is authenticated (has valid token)
4. Check OpenAI API status and your account credits
5. Review Django server logs for specific errors

