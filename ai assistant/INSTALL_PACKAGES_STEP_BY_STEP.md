# Step-by-Step Package Installation Guide

## If `pip install -r requirements.txt` Fails

Install packages one by one to identify which one is causing issues:

### Step 1: Install Core Django Packages

```bash
# Make sure virtual environment is activated
venv\Scripts\Activate.ps1

# Upgrade pip first
python -m pip install --upgrade pip

# Install Django
pip install Django==4.2.7

# Install Django REST Framework
pip install djangorestframework==3.14.0

# Install CORS headers
pip install django-cors-headers==4.3.1
```

### Step 2: Install Supporting Packages

```bash
# Environment variables
pip install python-dotenv==1.0.0

# JWT authentication
pip install djangorestframework-simplejwt==5.3.0
```

### Step 3: Install OpenAI (May Take Time)

```bash
# OpenAI package (may timeout, just retry)
pip install openai==1.3.0
```

If it times out, try:
```bash
pip install --timeout=1000 openai==1.3.0
```

### Step 4: Install Pillow (With Pre-built Wheel)

```bash
# Install Pillow with pre-built wheel (no compilation needed)
pip install --only-binary :all: Pillow
```

Or install newer version:
```bash
pip install Pillow>=10.2.0
```

### Step 5: Verify Installation

```bash
# Check Django
python -m django --version

# Check all installed packages
pip list
```

---

## Complete Installation Script

Copy and paste this entire block:

```bash
# Activate virtual environment
venv\Scripts\Activate.ps1

# Upgrade pip
python -m pip install --upgrade pip

# Install packages one by one
pip install Django==4.2.7
pip install djangorestframework==3.14.0
pip install django-cors-headers==4.3.1
pip install python-dotenv==1.0.0
pip install djangorestframework-simplejwt==5.3.0
pip install --timeout=1000 openai==1.3.0
pip install --only-binary :all: Pillow
```

---

## Troubleshooting

### Issue: Package times out
**Solution:** Increase timeout or retry
```bash
pip install --timeout=1000 <package-name>
```

### Issue: Package needs compilation
**Solution:** Use pre-built wheel
```bash
pip install --only-binary :all: <package-name>
```

### Issue: Still failing
**Solution:** Install Visual C++ Build Tools (see FIX_PILLOW_WINDOWS.md)

---

## What's Already Fixed

✅ **psycopg2-binary** - Commented out (using SQLite instead)  
✅ **Pillow** - Updated to version with pre-built wheels  

You should be able to install everything now!

