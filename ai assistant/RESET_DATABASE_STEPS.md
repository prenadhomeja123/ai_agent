# Reset Database - Step by Step

## What I Did

✅ Deleted `db.sqlite3` (database file)
✅ Deleted all migration files (0001_initial.py) from all apps

## Now Run These Commands

### Step 1: Create Fresh Migrations

```bash
# Make sure virtual environment is activated
venv\Scripts\Activate.ps1

# Create migrations (accounts will be created first this time)
python manage.py makemigrations
```

You should see:
```
Migrations for 'accounts':
  accounts/migrations/0001_initial.py
    - Create model User
    - Create model OTP
Migrations for 'leads':
  ...
```

### Step 2: Run Migrations

```bash
python manage.py migrate
```

You should see:
```
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying accounts.0001_initial... OK  ← Custom User created first!
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  Applying leads.0001_initial... OK
  ...
```

### Step 3: Start Server

```bash
python manage.py runserver
```

---

## Why This Works

- Fresh database = no conflicts
- Custom User model created BEFORE Django's default auth migrations
- All dependencies resolved correctly
- Clean migration history

---

**Run the commands above and everything will work!** 🚀

