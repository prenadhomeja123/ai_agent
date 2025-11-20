# Fix: InconsistentMigrationHistory Error

## The Problem

Django's default migrations (admin, auth) were already applied, but now we're adding a custom User model in accounts. This creates a dependency conflict.

## Solution: Reset Database (Easiest for Development)

Since you're in development with SQLite, the easiest fix is to delete the database and start fresh.

### Step 1: Stop the Server

Press `CTRL+C` if server is running.

### Step 2: Delete the Database

```bash
# Navigate to backend folder
cd backend

# Delete the SQLite database
del db.sqlite3
```

Or in PowerShell:
```powershell
Remove-Item db.sqlite3
```

### Step 3: Delete Migration Files (Keep folders)

```bash
# Delete migration files (but keep the migrations folders)
del accounts\migrations\*.py
del leads\migrations\*.py
del messages\migrations\*.py
del automations\migrations\*.py
del ai_integration\migrations\*.py
del settings\migrations\*.py
```

**Keep the `__init__.py` files!** Only delete the numbered migration files like `0001_initial.py`.

### Step 4: Recreate Migrations

```bash
python manage.py makemigrations
```

### Step 5: Run Migrations

```bash
python manage.py migrate
```

### Step 6: Start Server

```bash
python manage.py runserver
```

---

## Quick Fix (All Commands)

```bash
# Stop server (CTRL+C)

# Delete database
del db.sqlite3

# Delete migration files (keep __init__.py)
del accounts\migrations\0*.py
del leads\migrations\0*.py
del messages\migrations\0*.py
del automations\migrations\0*.py
del ai_integration\migrations\0*.py
del settings\migrations\0*.py

# Recreate migrations
python manage.py makemigrations

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

---

## Why This Works

- Fresh database = no migration history conflicts
- Custom User model will be created first
- All other migrations will apply correctly
- Clean slate for development

---

**This is safe for development!** In production, you'd use a different approach.

