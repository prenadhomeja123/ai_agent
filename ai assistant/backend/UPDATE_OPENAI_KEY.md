# How to Update Your OpenAI API Key

## Step 1: Get Your New API Key

1. Go to https://platform.openai.com/api-keys
2. Make sure you're logged in with your **NEW email account** (the one with credits)
3. Click **"Create new secret key"**
4. Give it a name (e.g., "Infinite Base Agent")
5. **Copy the key immediately** - you won't be able to see it again!

## Step 2: Update the .env File

Replace the old key in `backend/.env` with your new key:

**Current format:**
```
OPENAI_API_KEY=sk-proj-OLD_KEY_HERE
```

**New format (with your new key):**
```
OPENAI_API_KEY=sk-proj-YOUR_NEW_KEY_HERE
```

## Step 3: Restart Django Server

After updating the key:
1. Stop the Django server (Ctrl+C)
2. Start it again: `python manage.py runserver`

## Quick Update Command

You can also update it via command line:

```powershell
cd backend
# Replace YOUR_NEW_KEY with your actual new API key
Set-Content -Path .env -Value "OPENAI_API_KEY=YOUR_NEW_KEY_HERE" -Encoding UTF8
```

## Verify It Works

After updating, test it:
```bash
cd backend
venv\Scripts\Activate.ps1
python manage.py shell -c "from django.conf import settings; print('Key loaded:', 'YES' if settings.OPENAI_API_KEY else 'NO'); print('Key starts with:', settings.OPENAI_API_KEY[:20] if settings.OPENAI_API_KEY else 'N/A')"
```

## Important Notes

- ⚠️ Make sure you're using the account that has credits/quota
- ⚠️ The API key must start with `sk-proj-` or `sk-`
- ⚠️ Never commit the .env file to git (it's already in .gitignore)
- ⚠️ Restart Django server after changing the key

