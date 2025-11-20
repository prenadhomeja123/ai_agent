# How to Run the Backend

## Step 1: Make Sure Virtual Environment is Activated

```bash
cd backend
venv\Scripts\Activate.ps1
```

You should see `(venv)` at the start of your prompt.

## Step 2: Run the Development Server

```bash
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

## Step 3: Test the API

The API is now running at: **http://localhost:8000/api/**

### Quick Test in Browser:
- Open: http://localhost:8000/api/auth/register
- You should see an error (that's normal - it expects POST, not GET)

### Test with Postman:
1. Import the Postman collection: `Infinite_Base_Agent.postman_collection.json`
2. Test the endpoints (see `POSTMAN_TESTING_GUIDE.md`)

## Step 4: Connect Frontend (Optional)

1. **Open a NEW terminal** (keep backend running)
2. Navigate to frontend:
   ```bash
   cd ..
   npm run dev
   ```
3. Frontend will run at: **http://localhost:3000**

---

## Quick API Test Commands

### Test Registration (using curl or Postman):

**POST** http://localhost:8000/api/auth/register
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "password_confirm": "password123"
}
```

### Test Login:
**POST** http://localhost:8000/api/auth/login
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

---

## Common Commands

### Stop the Server:
Press `CTRL+C` in the terminal

### Run Migrations (if you add new models):
```bash
python manage.py makemigrations
python manage.py migrate
```

### Create Superuser (for admin panel):
```bash
python manage.py createsuperuser
```
Then access: http://localhost:8000/admin/

### Check if server is running:
Open browser: http://localhost:8000

---

## Full Workflow

### Terminal 1 (Backend):
```bash
cd backend
venv\Scripts\Activate.ps1
python manage.py runserver
```

### Terminal 2 (Frontend - Optional):
```bash
cd "C:\Users\Admin\Desktop\ai assistant"
npm run dev
```

---

## Verify Everything Works

1. ✅ Backend running: http://localhost:8000
2. ✅ API accessible: http://localhost:8000/api/
3. ✅ Test registration in Postman
4. ✅ Frontend running: http://localhost:3000 (if started)

---

## Troubleshooting

### Port 8000 already in use?
```bash
python manage.py runserver 8001
```

### Module not found errors?
Make sure virtual environment is activated!

### Database errors?
Run migrations:
```bash
python manage.py migrate
```

---

**You're all set! The backend is ready to use!** 🚀

