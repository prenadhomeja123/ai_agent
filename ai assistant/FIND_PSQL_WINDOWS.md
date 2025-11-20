# Find and Use psql on Windows

## Problem: 'psql' is not recognized

This means PostgreSQL's bin folder is not in your system PATH.

## Solutions

### Solution 1: Use Full Path (Easiest)

Find where PostgreSQL is installed and use the full path:

```bash
# Common locations (try these):
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE infinite_base_agent;"

# Or if version 15:
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE infinite_base_agent;"

# Or version 14:
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -c "CREATE DATABASE infinite_base_agent;"
```

**Replace the version number with your PostgreSQL version!**

---

### Solution 2: Find PostgreSQL Installation

1. **Open File Explorer**
2. **Navigate to:** `C:\Program Files\PostgreSQL\`
3. **Look for folders** like `16`, `15`, `14`, etc.
4. **Note the version number**

Then use:
```bash
cd "C:\Program Files\PostgreSQL\[VERSION]\bin"
psql -U postgres -c "CREATE DATABASE infinite_base_agent;"
```

---

### Solution 3: Use pgAdmin (GUI - No Command Line Needed!)

**This is the EASIEST method:**

1. **Open pgAdmin** from Start Menu
2. **Connect to PostgreSQL:**
   - Enter your postgres password
3. **Create Database:**
   - Right-click **Databases** → **Create** → **Database**
   - Name: `infinite_base_agent`
   - Click **Save**

**Done!** ✅ No command line needed!

---

### Solution 4: Use SQL Shell from Start Menu

1. **Press Windows Key**
2. **Type:** "SQL Shell" or "psql"
3. **Open "SQL Shell (psql)"**
4. **Press Enter** for all defaults
5. **Enter your postgres password**
6. **Run:**
   ```sql
   CREATE DATABASE infinite_base_agent;
   ```
7. **Exit:** `\q`

---

### Solution 5: Add PostgreSQL to PATH (Permanent Fix)

1. **Find PostgreSQL bin folder:**
   - Usually: `C:\Program Files\PostgreSQL\16\bin`
   - (Replace 16 with your version)

2. **Add to PATH:**
   - Press `Win + X` → **System**
   - Click **Advanced system settings**
   - Click **Environment Variables**
   - Under **System variables**, find **Path**
   - Click **Edit**
   - Click **New**
   - Add: `C:\Program Files\PostgreSQL\16\bin`
   - Click **OK** on all windows
   - **Restart PowerShell/Command Prompt**

3. **Then you can use:**
   ```bash
   psql -U postgres -c "CREATE DATABASE infinite_base_agent;"
   ```

---

## Recommended: Use pgAdmin (Solution 3)

**It's the easiest - no command line, no PATH issues!**

Just:
1. Open pgAdmin
2. Right-click Databases → Create → Database
3. Name: `infinite_base_agent`
4. Save

**That's it!** 🎯

---

## After Creating Database

1. **Create `.env` file** in `backend` folder:
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

**I recommend using pgAdmin (Solution 3) - it's the simplest!** 🚀

