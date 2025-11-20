# Step-by-Step Setup Guide

Follow these steps exactly to get your frontend running.

## Step 1: Download Node.js

1. Go to: https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Install it (just click Next, Next, Next)
4. **Restart your computer** after installation

**Verify it worked:**
- Open PowerShell or Command Prompt
- Type: `node --version`
- You should see something like: `v20.x.x`
- Type: `npm --version`
- You should see something like: `10.x.x`

---

## Step 2: Open Your Project Folder

1. Open File Explorer
2. Navigate to: `C:\Users\Admin\Desktop\ai assistant`
3. **Right-click** in the folder
4. Select **"Open in Terminal"** or **"Open PowerShell window here"**

---

## Step 3: Install Dependencies

In the terminal/PowerShell window, type:

```bash
npm install
```

**Wait for it to finish** (this might take 2-5 minutes)

You'll see a lot of text scrolling. When it's done, you'll see something like:
```
added 500 packages in 2m
```

---

## Step 4: Create Environment File

1. In your project folder (`C:\Users\Admin\Desktop\ai assistant`)
2. Create a new file named: `.env.local`
   - Right-click → New → Text Document
   - Name it exactly: `.env.local` (including the dot at the start)
   - If Windows asks about the file extension, click "Yes"

3. Open `.env.local` in Notepad
4. Copy and paste this inside:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

5. Save the file (Ctrl+S)

---

## Step 5: Start the Development Server

In the same terminal/PowerShell window, type:

```bash
npm run dev
```

**Wait for it to start** (about 10-20 seconds)

You'll see something like:
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
```

---

## Step 6: Open in Browser

1. Open your web browser (Chrome, Edge, Firefox, etc.)
2. Go to: `http://localhost:3000`
3. You should see the **Login Page**!

---

## ✅ Success!

If you see the login page, everything is working!

---

## Troubleshooting

### Problem: "node is not recognized"
**Solution:** Node.js isn't installed or you need to restart your computer

### Problem: "npm is not recognized"
**Solution:** Node.js isn't installed properly. Reinstall Node.js

### Problem: Port 3000 is already in use
**Solution:** 
- Close any other programs using port 3000
- Or change the port: `npm run dev -- -p 3001`

### Problem: Can't create .env.local file
**Solution:**
- Open Notepad
- Type: `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- Save As → File name: `.env.local` → Save as type: "All Files" → Save

### Problem: "Cannot find module"
**Solution:** Run `npm install` again

---

## What You'll See

- **Login Page** - You can enter any email/password (it's mock for now)
- **Dashboard** - Shows stats and leads (mock data)
- **AI Chat** - Chat interface (mock AI responses)
- **Audit History** - Activity logs (mock data)
- **Settings** - Configuration options

---

## Next Steps (After Frontend Works)

1. Build your backend API
2. Update `.env.local` with your backend URL
3. Connect frontend to backend

---

**Need help? Check the other documentation files!**

