# Virtual Environment Setup Guide

## Why Use Virtual Environment?

✅ **Isolate dependencies** - Each project has its own packages  
✅ **Avoid conflicts** - No conflicts with system Python or other projects  
✅ **Easy cleanup** - Just delete the `venv` folder  
✅ **Reproducible** - Same packages across different machines  

---

## Step-by-Step Setup

### Step 1: Navigate to Backend Folder

```bash
cd backend
```

### Step 2: Create Virtual Environment

```bash
python -m venv venv
```

This creates a `venv` folder with isolated Python environment.

### Step 3: Activate Virtual Environment

**Windows (PowerShell):**
```powershell
venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

**✅ Success indicator:** You'll see `(venv)` at the start of your terminal prompt:
```
(venv) PS C:\Users\Admin\Desktop\ai assistant\backend>
```

### Step 4: Install Dependencies

**Make sure `(venv)` is visible in your terminal!**

```bash
# Upgrade pip first (recommended)
python -m pip install --upgrade pip

# Install all project dependencies
pip install -r requirements.txt
```

### Step 5: Verify Installation

```bash
# Check Django is installed
python -m django --version

# Check all packages
pip list
```

---

## Working with Virtual Environment

### Activating (Every Time You Work)

**Before working on the project, always activate:**
```bash
cd backend
venv\Scripts\Activate.ps1  # Windows PowerShell
# or
venv\Scripts\activate.bat   # Windows CMD
# or
source venv/bin/activate    # Mac/Linux
```

### Deactivating

When you're done working:
```bash
deactivate
```

The `(venv)` will disappear from your prompt.

### Running Commands

**Always activate first, then run:**
```bash
# Activate
venv\Scripts\Activate.ps1

# Then run Django commands
python manage.py runserver
python manage.py migrate
python manage.py createsuperuser
```

---

## Common Issues

### Issue: "venv\Scripts\Activate.ps1 cannot be loaded"

**Solution (PowerShell):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try activating again.

### Issue: "python: command not found"

**Solution:**
- Make sure Python is installed
- Try `python3` instead of `python`
- Check Python is in PATH

### Issue: Packages installed but not found

**Solution:**
- Make sure virtual environment is activated (check for `(venv)`)
- Reinstall: `pip install -r requirements.txt`

### Issue: "No module named django"

**Solution:**
- Virtual environment not activated
- Activate it first: `venv\Scripts\Activate.ps1`
- Then install: `pip install -r requirements.txt`

---

## Quick Reference

### Daily Workflow

```bash
# 1. Navigate to backend
cd backend

# 2. Activate virtual environment
venv\Scripts\Activate.ps1

# 3. Work on project
python manage.py runserver
# ... do your work ...

# 4. Deactivate when done
deactivate
```

### First Time Setup

```bash
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---

## Best Practices

1. ✅ **Always activate** before running Django commands
2. ✅ **Never commit** `venv/` folder to git (already in .gitignore)
3. ✅ **Recreate** if virtual environment gets corrupted
4. ✅ **One venv per project** - Don't share between projects
5. ✅ **Activate in each terminal** - Each new terminal needs activation

---

## Troubleshooting

### Virtual Environment Corrupted?

Delete and recreate:
```bash
# Delete old venv
rm -rf venv  # Mac/Linux
rmdir /s venv  # Windows

# Create new one
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Check if Activated

Look for `(venv)` in terminal prompt. If you don't see it, it's not activated!

### Check Python Version

```bash
python --version
# Should show Python 3.8 or higher
```

---

**Remember: Always activate virtual environment before working on the project!** 🐍

