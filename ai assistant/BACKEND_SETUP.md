# Backend Setup Guide - Django + PostgreSQL

## Step-by-Step Setup

### 1. Install Python
- Download Python 3.11+ from: https://www.python.org/downloads/
- During installation, check "Add Python to PATH"
- Verify: `python --version`

### 2. Create Virtual Environment (IMPORTANT!)

**Why?** Virtual environments isolate your project dependencies and prevent conflicts with other Python projects.

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
venv\Scripts\Activate.ps1

# On Windows (Command Prompt):
venv\Scripts\activate.bat

# On Mac/Linux:
source venv/bin/activate
```

**You'll know it's activated when you see `(venv)` at the start of your terminal prompt.**

### 3. Install Python Dependencies

**Make sure virtual environment is activated first!**

```bash
# Upgrade pip (recommended)
python -m pip install --upgrade pip

# Install all dependencies
pip install -r requirements.txt
```

### 4. Install PostgreSQL
- Download from: https://www.postgresql.org/download/windows/
- Install PostgreSQL
- Remember your postgres password (default: postgres)
- Open pgAdmin or psql and create database:
  ```sql
  CREATE DATABASE infinite_base_agent;
  ```

### 5. Configure Environment

Create `.env` file in `backend` folder:

```env
SECRET_KEY=django-insecure-change-this-in-production-12345
DEBUG=True
DB_NAME=infinite_base_agent
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
OPENAI_API_KEY=your-openai-api-key-here
```

### 6. Run Migrations

**Make sure virtual environment is activated!**

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser (Optional)

**Make sure virtual environment is activated!**

```bash
python manage.py createsuperuser
```

### 8. Run Development Server

**Make sure virtual environment is activated!**

```bash
python manage.py runserver
```

Backend will run at: `http://localhost:8000`

API available at: `http://localhost:8000/api/`

## Testing

1. Register: `POST http://localhost:8000/api/auth/register`
2. Login: `POST http://localhost:8000/api/auth/login`
3. Use the token in Authorization header: `Bearer <token>`

## Frontend Connection

Update frontend `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Troubleshooting

- **PostgreSQL connection error**: Check database credentials in `.env`
- **Module not found**: Make sure virtual environment is activated and run `pip install -r requirements.txt`
- **Migration errors**: Delete `db.sqlite3` and run migrations again
- **Port 8000 in use**: Change port: `python manage.py runserver 8001`
- **Virtual environment not activating**: See `VIRTUAL_ENVIRONMENT_GUIDE.md`

## Important Notes

⚠️ **Always activate virtual environment before running Django commands!**

Every time you open a new terminal:
1. Navigate to `backend` folder
2. Activate: `venv\Scripts\Activate.ps1` (Windows) or `source venv/bin/activate` (Mac/Linux)
3. Then run Django commands

See `VIRTUAL_ENVIRONMENT_GUIDE.md` for detailed virtual environment instructions.
