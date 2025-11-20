# Quick Fix: psycopg2-binary Error

## Immediate Solution (Use SQLite for Now)

The easiest fix is to use SQLite for development instead of PostgreSQL. You can switch to PostgreSQL later.

### Step 1: Install Dependencies (Skip psycopg2)

```bash
# Make sure virtual environment is activated
venv\Scripts\Activate.ps1

# Install without psycopg2
pip install Django==4.2.7
pip install djangorestframework==3.14.0
pip install django-cors-headers==4.3.1
pip install python-dotenv==1.0.0
pip install openai==1.3.0
pip install djangorestframework-simplejwt==5.3.0
pip install Pillow==10.1.0
```

### Step 2: Settings Already Updated

The `settings.py` file is already configured to use SQLite by default. No changes needed!

### Step 3: Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 4: Run Server

```bash
python manage.py runserver
```

**That's it!** You can now test the API. SQLite works perfectly for development.

---

## Switch to PostgreSQL Later

When you're ready to use PostgreSQL:

1. **Install Visual C++ Build Tools** (see FIX_PSYCOPG2_WINDOWS.md)
2. **Install psycopg2-binary:**
   ```bash
   pip install psycopg2-binary
   ```
3. **Update .env file:**
   ```env
   USE_POSTGRESQL=True
   DB_NAME=infinite_base_agent
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432
   ```
4. **Update settings.py** - Uncomment PostgreSQL config

---

## Why This Works

- SQLite doesn't need any external dependencies
- Perfect for development and testing
- Easy to switch to PostgreSQL later
- All your code works the same way

**You can start testing your APIs right away!** 🚀

