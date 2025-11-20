# PostgreSQL Database Setup

## Step 1: Install PostgreSQL

1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember your postgres password (you'll need it)
4. Complete the installation

## Step 2: Create Database

### Option A: Using pgAdmin (GUI - Easier)

1. Open **pgAdmin** (installed with PostgreSQL)
2. Connect to your PostgreSQL server (use the password you set during installation)
3. Right-click on **Databases** → **Create** → **Database**
4. Database name: `infinite_base_agent`
5. Click **Save**

### Option B: Using psql (Command Line)

1. Open **Command Prompt** or **PowerShell**
2. Navigate to PostgreSQL bin folder (usually):
   ```bash
   cd "C:\Program Files\PostgreSQL\16\bin"
   ```
   (Replace `16` with your PostgreSQL version)

3. Run psql:
   ```bash
   psql -U postgres
   ```

4. Enter your postgres password when prompted

5. Create the database:
   ```sql
   CREATE DATABASE infinite_base_agent;
   ```

6. Verify it was created:
   ```sql
   \l
   ```
   (You should see `infinite_base_agent` in the list)

7. Exit psql:
   ```sql
   \q
   ```

### Option C: Using SQL Shell (psql) - Windows

1. Open **SQL Shell (psql)** from Start Menu
2. Press Enter for all defaults (Server, Database, Port, Username)
3. Enter your postgres password
4. Run:
   ```sql
   CREATE DATABASE infinite_base_agent;
   ```
5. Exit: `\q`

## Step 3: Configure Environment

Create or update `.env` file in `backend` folder:

```env
SECRET_KEY=django-insecure-change-this-in-production-12345
DEBUG=True
DB_NAME=infinite_base_agent
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
DB_HOST=localhost
DB_PORT=5432
OPENAI_API_KEY=your-openai-api-key-here
```

**Important:** Replace `your_postgres_password_here` with the password you set during PostgreSQL installation!

## Step 4: Install psycopg2

```bash
# Make sure virtual environment is activated
cd backend
venv\Scripts\Activate.ps1

# Install PostgreSQL adapter
pip install psycopg2-binary
```

If it fails, see `FIX_PSYCOPG2_WINDOWS.md` for solutions.

## Step 5: Run Migrations

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

## Step 6: Start Server

```bash
python manage.py runserver
```

---

## Quick Commands Summary

### Create Database (psql):
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE infinite_base_agent;

# Exit
\q
```

### Or using SQL:
```sql
CREATE DATABASE infinite_base_agent;
```

---

## Troubleshooting

### "psql: command not found"
- Add PostgreSQL bin folder to PATH, or
- Use full path: `"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres`
- Or use pgAdmin GUI instead

### "password authentication failed"
- Make sure you're using the correct postgres password
- Check if PostgreSQL service is running

### "could not connect to server"
- Make sure PostgreSQL service is running
- Check if port 5432 is correct
- Verify DB_HOST in .env is 'localhost'

### "database does not exist"
- Make sure you created the database (see Step 2)
- Check database name matches in .env file

---

## Verify Database Connection

After running migrations, check if tables were created:

```bash
# Connect to database
psql -U postgres -d infinite_base_agent

# List tables
\dt

# You should see tables like:
# - accounts_user
# - accounts_otp
# - leads_lead
# - etc.

# Exit
\q
```

---

**Once database is created and .env is configured, run migrations and you're ready!** 🚀

