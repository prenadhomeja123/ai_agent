# Twilio Credentials Guide - Step by Step

## 📱 What Credentials You Need from Twilio

For **SMS** and **WhatsApp** automations, you need **3 credentials** from Twilio:

---

## 🔑 **Required Twilio Credentials:**

### 1. **Twilio Account SID**
- **Format**: Starts with `AC` followed by 32 characters
- **Example**: `AC1234567890abcdef1234567890abcdef`
- **What it is**: Your unique Twilio account identifier
- **Where to find**: Twilio Console Dashboard (top of page)

### 2. **Twilio Auth Token**
- **Format**: 32-character string (letters and numbers)
- **Example**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- **What it is**: Secret key to authenticate API requests
- **Where to find**: Twilio Console → Click to reveal (hidden by default)

### 3. **Twilio Phone Number** (for SMS only)
- **Format**: E.164 format with country code
- **Example**: `+1234567890` or `+14155551234`
- **What it is**: Your Twilio phone number (the "from" number)
- **Where to find**: Twilio Console → Phone Numbers → Manage → Active Numbers

### 4. **WhatsApp Sandbox Number** (for WhatsApp only)
- **Format**: `whatsapp:+14155238886` (Twilio sandbox - default)
- **What it is**: Twilio's WhatsApp sandbox number for testing
- **Note**: For production, you need your own WhatsApp Business number

---

## 📋 **Step-by-Step: How to Get Twilio Credentials**

### **Step 1: Sign Up for Twilio**
1. Go to: https://www.twilio.com/try-twilio
2. Click "Start Free Trial"
3. Enter your email and password
4. Verify your phone number
5. Complete signup

### **Step 2: Get Account SID and Auth Token**
1. Log in to: https://console.twilio.com/
2. You'll see your **Account SID** on the dashboard (top right)
   - It looks like: `AC1234567890abcdef...`
   - **Copy this!**

3. To get **Auth Token**:
   - Look for "Auth Token" on the dashboard
   - Click the eye icon 👁️ to reveal it
   - **Copy this!** (you can only see it once, so save it)

### **Step 3: Get Phone Number (for SMS)**

**Option A: Use Trial Number (Free)**
1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
2. Twilio gives you a free trial number
3. Copy the number (format: `+1234567890`)

**Option B: Buy a Number**
1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/search
2. Search for a number
3. Buy it (costs ~$1/month)
4. Copy the number

### **Step 4: Get WhatsApp Sandbox (for WhatsApp)**
1. Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. Click "Get started with WhatsApp"
3. You'll see: `whatsapp:+14155238886` (this is the sandbox number)
4. Join the sandbox by sending a code to that number
5. Use: `whatsapp:+14155238886` as your `TWILIO_WHATSAPP_FROM`

---

## 📝 **What to Add to `backend/.env` File:**

### **For SMS:**
```env
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
TWILIO_PHONE_NUMBER=+1234567890
```

### **For WhatsApp:**
```env
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### **For Both (SMS + WhatsApp):**
```env
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## 🎯 **Quick Summary:**

| Credential | Format | Example | Where to Find |
|------------|--------|---------|---------------|
| **Account SID** | `AC` + 32 chars | `AC1234...` | Dashboard (top right) |
| **Auth Token** | 32 chars | `a1b2c3...` | Dashboard (click to reveal) |
| **Phone Number** | `+` + digits | `+1234567890` | Phone Numbers page |
| **WhatsApp From** | `whatsapp:+...` | `whatsapp:+14155238886` | WhatsApp sandbox |

---

## ⚠️ **Important Notes:**

1. **Free Trial:**
   - Twilio gives you free trial credits
   - Limited to verified phone numbers
   - Perfect for testing!

2. **Auth Token Security:**
   - Keep it secret!
   - Don't share it publicly
   - If exposed, regenerate it immediately

3. **Phone Number Format:**
   - Must include country code
   - Format: `+1234567890` (no spaces, dashes, or parentheses)

4. **WhatsApp Sandbox:**
   - Only works with numbers you've joined to sandbox
   - For production, need WhatsApp Business API approval

---

## 🚀 **Once You Have Credentials:**

1. Add them to `backend/.env` file
2. Restart Django server
3. Test SMS/WhatsApp automations!

---

## 📞 **Need Help?**

- Twilio Docs: https://www.twilio.com/docs
- Console: https://console.twilio.com/
- Support: https://support.twilio.com/

---

**Ready?** Just provide:
- `TWILIO_ACCOUNT_SID=AC...`
- `TWILIO_AUTH_TOKEN=...`
- `TWILIO_PHONE_NUMBER=+...`
- `TWILIO_WHATSAPP_FROM=whatsapp:+...` (if testing WhatsApp)

