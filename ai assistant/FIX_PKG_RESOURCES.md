# Fix: ModuleNotFoundError: No module named 'pkg_resources'

## The Problem
Python 3.13 doesn't include `setuptools` by default, but `djangorestframework-simplejwt` needs it.

## Quick Fix

### Install setuptools:

```bash
# Make sure virtual environment is activated
venv\Scripts\Activate.ps1

# Install setuptools
pip install setuptools>=65.0.0
```

Or install from updated requirements.txt:
```bash
pip install -r requirements.txt
```

## Verify

After installing, try again:
```bash
python manage.py makemigrations
python manage.py migrate
```

## Why This Happens

- Python 3.13 removed `setuptools` from the standard library
- `djangorestframework-simplejwt` uses `pkg_resources` which is part of `setuptools`
- Need to install `setuptools` separately

## Solution Applied

✅ Added `setuptools>=65.0.0` to `requirements.txt`

Just run `pip install -r requirements.txt` again to install it!

