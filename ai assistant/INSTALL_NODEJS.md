# How to Install Node.js (Windows)

## The Problem
You're seeing: `node is not recognized` - This means Node.js is not installed on your computer.

## Solution: Install Node.js

### Method 1: Official Installer (Recommended)

1. **Go to Node.js website:**
   - Open your browser
   - Go to: **https://nodejs.org/**
   - You'll see two download buttons

2. **Download the LTS version:**
   - Click the **LTS button** (Long Term Support - more stable)
   - It will download a file like: `node-v20.x.x-x64.msi`

3. **Run the installer:**
   - Double-click the downloaded file
   - Click **Next** through all the steps
   - **IMPORTANT:** Make sure "Add to PATH" is checked (it should be by default)
   - Click **Install**
   - Wait for installation to complete
   - Click **Finish**

4. **RESTART YOUR COMPUTER:**
   - This is very important!
   - Close all programs
   - Restart Windows
   - This ensures Node.js is added to your system PATH

5. **Verify installation:**
   - Open a NEW PowerShell window
   - Type: `node --version`
   - You should see: `v20.x.x` (or similar)
   - Type: `npm --version`
   - You should see: `10.x.x` (or similar)

---

## Method 2: Using Chocolatey (If you have it)

If you have Chocolatey package manager installed:

```powershell
choco install nodejs-lts
```

Then restart your computer.

---

## Method 3: Using Winget (Windows 11)

If you have Windows 11 with winget:

```powershell
winget install OpenJS.NodeJS.LTS
```

Then restart your computer.

---

## After Installation

1. **Close ALL PowerShell/Terminal windows**
2. **Restart your computer** (very important!)
3. **Open a NEW PowerShell window**
4. **Navigate to your project:**
   ```powershell
   cd "C:\Users\Admin\Desktop\ai assistant"
   ```
5. **Test Node.js:**
   ```powershell
   node --version
   npm --version
   ```

If both commands show version numbers, you're ready!

---

## Still Not Working?

### Check if Node.js is installed but PATH is wrong:

1. Search for "Environment Variables" in Windows
2. Click "Edit the system environment variables"
3. Click "Environment Variables"
4. Under "System variables", find "Path"
5. Click "Edit"
6. Look for entries like:
   - `C:\Program Files\nodejs\`
   - `C:\Program Files (x86)\nodejs\`
7. If they're missing, add them:
   - Click "New"
   - Add: `C:\Program Files\nodejs\`
   - Click OK on all windows
8. **Restart your computer**

### Or reinstall Node.js:
- Uninstall Node.js from Control Panel
- Restart computer
- Download and install again from nodejs.org
- Restart computer again

---

## Quick Test After Installation

Once Node.js is installed and you've restarted:

```powershell
# Test Node.js
node --version

# Test npm
npm --version

# If both work, you're ready!
```

---

**After Node.js is installed, come back and continue with Step 3: `npm install`**


