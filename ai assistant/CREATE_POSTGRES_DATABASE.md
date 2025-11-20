# How to Create PostgreSQL Database

## Method 1: Using pgAdmin (Easiest - GUI)

1. **Open pgAdmin** (from Start Menu)
2. **Connect to server:**
   - Enter your postgres password (set during installation)
3. **Create database:**
   - Right-click **Databases** → **Create** → **Database**
   - Name: `infinite_base_agent`
   - Click **Save**

Done! ✅

---

## Method 2: Using psql Command Line

### Step 1: Open Command Prompt

### Step 2: Navigate to PostgreSQL bin folder

```bash
cd "C:\Program Files\PostgreSQL\16\bin"
```
*(Replace `16` with your PostgreSQL version number)*

### Step 3: Connect to PostgreSQL

```bash
psql -U postgres
```

Enter your postgres password when prompted.

### Step 4: Create Database

```sql
CREATE DATABASE infinite_base_agent;
```

### Step 5: Verify

```sql
\l
```

You should see `infinite_base_agent` in the list.

### Step 6: Exit

```sql
\q
```

---

## Method 3: Using SQL Shell (psql) from Start Menu

1. **Open "SQL Shell (psql)"** from Start Menu
2. **Press Enter** for all defaults:
   - Server: [localhost]
   - Database: [postgres]
   - Port: [5432]
   - Username: [postgres]
3. **Enter your postgres password**
4. **Create database:**
   ```sql
   CREATE DATABASE infinite_base_agent;
   ```
5. **Exit:**
   ```sql
   \q
   ```

---

## Quick One-Liner (If psql is in PATH)

```bash
psql -U postgres -c "CREATE DATABASE infinite_base_agent;"
```

Enter password when prompted.

---

## After Creating Database

1. **Update `.env` file** in `backend` folder:
   ```env
   DB_NAME=infinite_base_agent
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

2. **Install psycopg2:**
   ```bash
   pip install psycopg2-binary
   ```

3. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

---

## Find PostgreSQL Installation Path

If you don't know where PostgreSQL is installed:

1. Open **pgAdmin**
2. Right-click on your server → **Properties**
3. Check the path, or
4. Search for "psql.exe" in Windows Explorer
5. Usually: `C:\Program Files\PostgreSQL\[version]\bin\`

---

**Choose the method you prefer! pgAdmin (Method 1) is the easiest.** 🎯

