# Fix Pillow Installation Error on Windows

## The Problem
Pillow 10.1.0 tries to build from source on Windows, which requires Visual C++ Build Tools.

## Quick Solution

### Option 1: Use Newer Pillow (Recommended)

I've updated `requirements.txt` to use `Pillow>=10.2.0` which has pre-built wheels for Windows.

**Just run:**
```bash
pip install -r requirements.txt
```

This should work now!

---

### Option 2: Install Pillow Separately with Pre-built Wheel

```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Install Pillow with pre-built wheel
pip install --only-binary :all: Pillow

# Then install other packages
pip install Django==4.2.7
pip install djangorestframework==3.14.0
pip install django-cors-headers==4.3.1
pip install python-dotenv==1.0.0
pip install openai==1.3.0
pip install djangorestframework-simplejwt==5.3.0
```

---

### Option 3: Install Visual C++ Build Tools (If Above Don't Work)

1. Download: https://visualstudio.microsoft.com/downloads/
2. Select "Build Tools for Visual Studio"
3. Install "C++ build tools"
4. Restart terminal
5. Try installing again

---

### Option 4: Skip Pillow (If Not Needed)

If you don't need image processing right now, you can skip Pillow:

1. **Comment out Pillow in requirements.txt:**
   ```
   # Pillow>=10.2.0
   ```

2. **Install other packages:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Pillow later when needed**

---

## Verify Installation

After successful installation:
```bash
python -c "from PIL import Image; print('Pillow installed successfully!')"
```

---

## Why This Happens

- Older Pillow versions don't have pre-built wheels for Windows
- Building from source requires C compiler (Visual C++ Build Tools)
- Newer versions (10.2.0+) have pre-built wheels, so no compilation needed

---

## Recommended Approach

**Just use the updated requirements.txt** - it now uses `Pillow>=10.2.0` which has pre-built wheels and should install without issues!

