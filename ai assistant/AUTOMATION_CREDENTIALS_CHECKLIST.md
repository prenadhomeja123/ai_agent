# Automation Credentials Checklist

## 📋 Complete List of Credentials Needed for All Automation Channels

---

## 1. 📧 **EMAIL (SMTP) - Gmail/Outlook/etc.**

### **What You Need:**
- ✅ **SMTP Host** (e.g., `smtp.gmail.com` or `smtp.outlook.com`)
- ✅ **SMTP Port** (usually `587` for TLS or `465` for SSL)
- ✅ **Email Address** (your sending email)
- ✅ **App Password** (NOT your regular password!)

### **For Gmail:**
1. Go to: https://myaccount.google.com/apppasswords
2. Generate an "App Password"
3. Use that password (not your regular Gmail password)

### **For Outlook/Hotmail:**
1. Go to: https://account.microsoft.com/security
2. Enable "App passwords"
3. Generate a new app password

### **Add to `backend/.env`:**
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password-here
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

### **Note:**
- ✅ **Works WITHOUT credentials** (uses console backend - prints to terminal)
- ✅ **Needs credentials** for actual email sending

---

## 2. 📱 **SMS (Twilio)**

### **What You Need:**
- ✅ **Twilio Account SID** (starts with `AC...`)
- ✅ **Twilio Auth Token** (secret key)
- ✅ **Twilio Phone Number** (your Twilio number, format: `+1234567890`)

### **How to Get:**
1. Sign up at: https://www.twilio.com/try-twilio
2. Get free trial account
3. Go to: https://console.twilio.com/
4. Find:
   - **Account SID** (on dashboard)
   - **Auth Token** (click to reveal)
   - **Phone Number** (buy a number or use trial number)

### **Add to `backend/.env`:**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### **Note:**
- ❌ **Won't work** without credentials
- ⚠️ **Free trial** available (limited messages)

---

## 3. 💬 **WhatsApp (Twilio)**

### **What You Need:**
- ✅ **Twilio Account SID** (same as SMS - `AC...`)
- ✅ **Twilio Auth Token** (same as SMS)
- ✅ **WhatsApp Sandbox Number** (default: `whatsapp:+14155238886`)

### **How to Get:**
1. Use **same Twilio account** as SMS
2. Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
3. Join Twilio WhatsApp Sandbox (for testing)
4. Or get approved WhatsApp Business API access

### **Add to `backend/.env`:**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### **Note:**
- ❌ **Won't work** without credentials
- ⚠️ **Sandbox mode** for testing (limited)
- ⚠️ **Production** requires WhatsApp Business API approval

---

## 4. 📘 **Facebook Messenger**

### **What You Need:**
- ✅ **Facebook Page ID** (your business page ID)
- ✅ **Page Access Token** (long-lived token)

### **How to Get:**
1. Go to: https://developers.facebook.com/
2. Create a Facebook App
3. Add "Messenger" product
4. Get Page Access Token
5. Subscribe to webhooks (for receiving messages)

### **Add via Onboarding Page:**
- Go to `/onboarding` page
- Complete "Channels Setup" step
- Enter:
  - **Facebook Page ID**: `your_page_id`
  - **Access Token**: `your_access_token`

### **Note:**
- ⚠️ **Requires Facebook Developer account**
- ⚠️ **Requires Facebook Business Page**
- ⚠️ **Requires app review** for production

---

## 5. 📷 **Instagram DM**

### **What You Need:**
- ✅ **Instagram Business Account ID** (not personal account)
- ✅ **Instagram Access Token** (long-lived token)

### **How to Get:**
1. Convert Instagram to Business Account
2. Connect to Facebook Page
3. Go to: https://developers.facebook.com/
4. Create Facebook App
5. Add "Instagram" product
6. Get Instagram Business Account ID
7. Generate Access Token

### **Add via Onboarding Page:**
- Go to `/onboarding` page
- Complete "Channels Setup" step
- Enter:
  - **Instagram Account ID**: `your_account_id`
  - **Access Token**: `your_access_token`

### **Note:**
- ⚠️ **Requires Instagram Business Account**
- ⚠️ **Requires Facebook Page connection**
- ⚠️ **Requires app review** for production

---

## 📝 **Summary Table**

| Channel | Credentials Needed | Works Without? | Where to Add |
|---------|-------------------|----------------|--------------|
| **Email** | SMTP Host, Port, User, Password | ✅ Yes (console mode) | `backend/.env` |
| **SMS** | Twilio SID, Token, Phone | ❌ No | `backend/.env` |
| **WhatsApp** | Twilio SID, Token, WhatsApp From | ❌ No | `backend/.env` |
| **Facebook** | Page ID, Access Token | ❌ No | Onboarding page |
| **Instagram** | Account ID, Access Token | ❌ No | Onboarding page |

---

## 🚀 **Quick Start for Testing**

### **Easiest Option: Email (Console Mode)**
- ✅ **No credentials needed!**
- ✅ Works immediately
- ✅ Prints messages to terminal/console
- ✅ Perfect for testing automations

### **For Real Email Sending:**
1. Get Gmail App Password
2. Add to `backend/.env`:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   ```

### **For SMS/WhatsApp:**
1. Sign up for Twilio (free trial)
2. Get credentials
3. Add to `backend/.env`:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxx
   TWILIO_AUTH_TOKEN=xxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   ```

---

## 📋 **What I Need From You:**

### **For Email Testing:**
- Option 1: **Nothing!** (uses console mode - prints to terminal)
- Option 2: **Gmail credentials** (for real email sending)

### **For SMS/WhatsApp Testing:**
- ✅ Twilio Account SID
- ✅ Twilio Auth Token
- ✅ Twilio Phone Number (for SMS)
- ✅ WhatsApp Sandbox number (for WhatsApp)

### **For Facebook/Instagram:**
- ✅ Facebook Page ID
- ✅ Facebook/Instagram Access Token

---

## 🎯 **Recommended Testing Order:**

1. **Start with Email (Console Mode)** - No setup needed!
2. **Then Email (SMTP)** - Add Gmail credentials
3. **Then SMS** - Add Twilio credentials
4. **Then WhatsApp** - Same Twilio account
5. **Then Facebook/Instagram** - If needed

---

**Ready to test?** Just tell me:
- "Test with Email (console mode)" - No credentials needed!
- "Test with Email (SMTP)" - I'll need Gmail credentials
- "Test with SMS" - I'll need Twilio credentials
- "Test with WhatsApp" - I'll need Twilio credentials

