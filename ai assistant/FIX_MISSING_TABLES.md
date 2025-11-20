# Fix: no such table: accounts_user

## The Problem

The database tables for your custom apps (accounts, leads, messages, etc.) haven't been created yet. Only default Django tables exist.

## Solution

### Step 1: Stop the Server

Press `CTRL+C` in the terminal where the server is running.

### Step 2: Create Migrations for All Apps

```bash
# Make sure virtual environment is activated
venv\Scripts\Activate.ps1

# Create migrations for all apps
python manage.py makemigrations accounts
python manage.py makemigrations leads
python manage.py makemigrations messages
python manage.py makemigrations automations
python manage.py makemigrations ai_integration
python manage.py makemigrations settings
```

Or create all at once:
```bash
python manage.py makemigrations
```

### Step 3: Run Migrations

```bash
python manage.py migrate
```

This will create all the tables including:
- accounts_user
- accounts_otp
- leads_lead
- messages_message
- automations_automation
- ai_integration_agentactivity
- settings_usersettings

### Step 4: Start Server Again

```bash
python manage.py runserver
```

---

## Quick Fix (All in One)

```bash
# Stop server (CTRL+C if running)

# Create and run migrations
python manage.py makemigrations
python manage.py migrate

# Start server
python manage.py runserver
```

---

## Verify Tables Created

After migrations, you should see output like:
```
Running migrations:
  Applying accounts.0001_initial... OK
  Applying leads.0001_initial... OK
  Applying messages.0001_initial... OK
  ...
```

---

**That's it! The tables will be created and the API will work.**

