# Fix: Node.js Works in CMD but Not PowerShell

## The Problem
- ✅ Node.js works in **Command Prompt (CMD)**: `node -v` shows `v24.11.1`
- ❌ Node.js doesn't work in **PowerShell**: `node` is not recognized

This is a PowerShell PATH issue.

## Quick Fix (Choose One)

### Solution 1: Refresh PowerShell PATH (Easiest)

1. **Close your current PowerShell window completely**
2. **Open a NEW PowerShell window** (as Administrator if possible)
3. **Run this command to refresh PATH:**
   ```powershell
   $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
   ```
4. **Test it:**
   ```powershell
   node -v
   npm -v
   ```

### Solution 2: Use Command Prompt Instead

Since Node.js works in CMD, just use Command Prompt:

1. **Close PowerShell**
2. **Open Command Prompt (CMD)**
3. **Navigate to your project:**
   ```cmd
   cd "C:\Users\Admin\Desktop\ai assistant"
   ```
4. **Run your commands:**
   ```cmd
   npm install
   npm run dev
   ```

### Solution 3: Find Node.js Path and Add to PowerShell

1. **Find where Node.js is installed:**
   - In CMD (where it works), type: `where node`
   - It will show something like: `C:\Program Files\nodejs\node.exe`

2. **In PowerShell, add it to PATH for this session:**
   ```powershell
   $env:Path += ";C:\Program Files\nodejs"
   ```

3. **Test:**
   ```powershell
   node -v
   ```

### Solution 4: Restart Computer

Sometimes PowerShell needs a full restart to pick up PATH changes:

1. **Restart your computer**
2. **Open PowerShell again**
3. **Test:** `node -v`

---

## Recommended: Use Command Prompt (CMD)

Since Node.js already works in CMD, the easiest solution is to just use Command Prompt instead of PowerShell:

1. Press `Win + R`
2. Type: `cmd`
3. Press Enter
4. Navigate to your project:
   ```cmd
   cd "C:\Users\Admin\Desktop\ai assistant"
   ```
5. Run:
   ```cmd
   npm install
   npm run dev
   ```

---

## Permanent Fix for PowerShell

If you want to fix PowerShell permanently:

1. **Find Node.js path** (in CMD where it works):
   ```cmd
   where node
   ```
   Usually: `C:\Program Files\nodejs\`

2. **Add to System PATH:**
   - Press `Win + X` → System
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find "Path"
   - Click "Edit"
   - Click "New"
   - Add: `C:\Program Files\nodejs\`
   - Click OK on all windows
   - **Restart PowerShell** (or restart computer)

---

## Quick Test

After trying any solution above, test in PowerShell:

```powershell
node -v
npm -v
```

Both should show version numbers.
