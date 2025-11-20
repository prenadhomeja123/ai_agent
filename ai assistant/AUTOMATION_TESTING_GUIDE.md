# Automation Testing Guide

## Step-by-Step Guide to Test Automations

### What We Need to Test Automations:

#### **Step 1: Create an Automation**
We need to create an automation rule. Here's what I need from you:

**Option A: Via Settings Page (Easiest)**
1. Go to Settings page in the app
2. Find the "Automations" section
3. Create a new automation with these details:
   - **Name**: "Test Lead Follow-up" (or any name you like)
   - **Type**: "Lead Follow-up"
   - **Trigger**: "New Lead Added"
   - **Channel**: "Email" (or SMS/WhatsApp if configured)
   - **Delay**: 0 hours, 0 days (for immediate testing)
   - **Message Template**: Leave empty (will use AI) OR provide a custom message

**Option B: Via API (I can help create this)**
- I can create an automation via the backend API

---

#### **Step 2: Test Data Setup**

We need test data to trigger the automation:

**For "New Lead" Trigger:**
- A new lead (name, email, phone)
- Example: "John Doe", "john@example.com", "+1234567890"

**For "Booking Created" Trigger:**
- A lead (existing or new)
- A booking for that lead (title, start_time, end_time)

**For "No Contact" Trigger:**
- A lead that hasn't been contacted in X days

---

#### **Step 3: Trigger the Automation**

Once we have the automation and test data, we can trigger it by:
1. Creating a new lead (triggers "new_lead" automation)
2. Creating a booking (triggers "booking_created" automation)
3. Changing lead status (triggers "lead_status_changed" automation)
4. Marking a booking as no-show (triggers "no_show" automation)

---

#### **Step 4: Verify Results**

We'll check:
- ✅ Message was created in the database
- ✅ Message was sent via the selected channel
- ✅ AgentActivity log was created
- ✅ Automation counter was incremented

---

## What I Need From You:

### **Option 1: Quick Test (Recommended)**
1. **Your login credentials** (email/password) - so I can create automations via API
2. **A test lead** - Name, Email, Phone number
3. **Which automation type** you want to test:
   - Lead Follow-up (when new lead is added)
   - Booking Reminder (X hours before booking)
   - No-Show Follow-up (when booking marked as no-show)
   - Post-Session Follow-up (after booking completed)

### **Option 2: Manual Setup**
1. Go to **Settings** page
2. Scroll to **Automations** section
3. Create a new automation
4. Tell me which automation you created
5. I'll help you trigger it

---

## Available Automation Types:

1. **Lead Follow-up** (`lead_followup`)
   - Triggers: `new_lead`, `lead_status_changed`, `no_contact_days`
   - Sends: Follow-up message to lead

2. **Booking Reminder** (`booking_reminder`)
   - Triggers: `booking_reminder_hours`
   - Sends: Reminder X hours before booking

3. **Confirmation** (`confirmation`)
   - Triggers: `booking_created`
   - Sends: Booking confirmation message

4. **Post-Session Follow-up** (`post_session`)
   - Triggers: `session_completed`
   - Sends: Follow-up after session

5. **No-Show Follow-up** (`no_show_followup`)
   - Triggers: `no_show`
   - Sends: Follow-up when booking marked as no-show

---

## Available Channels:

- **Email** (requires SMTP configuration)
- **SMS** (requires Twilio configuration)
- **WhatsApp** (requires Twilio configuration)
- **Facebook** (requires Facebook Page setup)
- **Instagram** (requires Instagram Business setup)

---

## Next Steps:

**Please provide:**
1. ✅ Which automation type you want to test
2. ✅ Your preference: Create via Settings page OR I create via API
3. ✅ Test lead information (name, email, phone)
4. ✅ Which channel you want to use (Email is easiest for testing)

Once you provide this, I'll:
1. Create the automation (if needed)
2. Create the test lead
3. Trigger the automation
4. Show you the results

---

**Ready to start?** Just tell me:
- "I want to test [automation type]"
- "Create it via API" or "I'll create it in Settings"
- Test lead details

