# Automation System Documentation

## Overview

The automation system automatically performs actions based on triggers and conditions. It's now **fully functional** and ready to use!

## ✅ What's Implemented

### 1. **Automation Model** ✅
- Enhanced with configuration fields:
  - `delay_hours` / `delay_days`: When to trigger
  - `channel`: Which channel to use (email, SMS, WhatsApp, etc.)
  - `message_template`: Optional custom template
  - `conditions`: Additional filtering conditions
  - `trigger`: What event triggers it

### 2. **Automation Execution Engine** ✅
- `AutomationExecutor` class handles execution
- Supports all automation types:
  - Lead Follow-up
  - Booking Reminder
  - Confirmation
  - Post-Session Follow-up
  - CRM Update

### 3. **Automatic Triggers** ✅
- **Signal-based triggers** (automatic):
  - New lead added → Triggers "new_lead" automations
  - Lead status changed → Triggers "lead_status_changed" automations
  - Inbound message received → Triggers "message_received" automations

### 4. **Scheduled Automations** ✅
- "No contact for X days" automations
- Booking reminders
- Run via: `python manage.py run_automations`

### 5. **Manual Testing** ✅
- Test automations via API
- Trigger automations manually
- View execution logs

---

## 🚀 How It Works

### Automatic Execution Flow:

```
1. Event Occurs (e.g., new lead added)
   ↓
2. Signal Fires (signals.py)
   ↓
3. Find Matching Automations (enabled, correct trigger)
   ↓
4. Check Conditions (delay, filters)
   ↓
5. Execute Automation (services.py)
   ↓
6. Generate Message (AI or template)
   ↓
7. Create Message Record
   ↓
8. Log Activity
   ↓
9. Update Automation Stats
```

---

## 📋 Automation Types

### 1. **Lead Follow-up** (`lead_followup`)
**Triggers:**
- `new_lead`: When a new lead is added
- `no_contact_days`: When lead hasn't been contacted for X days
- `lead_status_changed`: When lead status changes

**What it does:**
- Sends follow-up message to lead
- Updates `last_contacted` timestamp
- Logs activity

### 2. **Booking Reminder** (`booking_reminder`)
**Triggers:**
- `booking_reminder_hours`: X hours before booking
- `booking_created`: When booking is created

**What it does:**
- Sends reminder message
- Includes booking details (if available)

### 3. **Confirmation** (`confirmation`)
**Triggers:**
- `booking_created`: When booking is created

**What it does:**
- Sends confirmation message
- Confirms booking details

### 4. **Post-Session Follow-up** (`post_session`)
**Triggers:**
- `session_completed`: When session ends

**What it does:**
- Sends follow-up message after session
- Asks for feedback

### 5. **CRM Update** (`crm_update`)
**Triggers:**
- `lead_status_changed`: When lead status changes

**What it does:**
- Updates CRM records
- Logs updates

---

## 🛠️ Usage

### Creating an Automation

**Via API:**
```json
POST /api/automations
{
  "name": "Welcome New Leads",
  "type": "lead_followup",
  "trigger": "new_lead",
  "delay_hours": 0,
  "delay_days": 0,
  "channel": "email",
  "enabled": true
}
```

**Via Python:**
```python
from automations.models import Automation

automation = Automation.objects.create(
    user=user,
    name="Follow-up After 3 Days",
    type="lead_followup",
    trigger="no_contact_days",
    delay_days=3,
    channel="email",
    enabled=True
)
```

### Testing an Automation

**Via API:**
```json
POST /api/automations/{id}/test
{
  "lead_id": 123
}
```

**Via Python:**
```python
from automations.services import AutomationExecutor

executor = AutomationExecutor(automation, {
    'user': user,
    'lead': lead
})
executor.execute()
```

### Running Scheduled Automations

**Manual:**
```bash
python manage.py run_automations
```

**Scheduled (Cron):**
```bash
# Run every hour
0 * * * * cd /path/to/backend && python manage.py run_automations
```

---

## 📊 API Endpoints

### List/Create Automations
- `GET /api/automations` - List all automations
- `POST /api/automations` - Create new automation

### Manage Automations
- `PATCH /api/automations/{id}` - Toggle enabled/disabled
- `POST /api/automations/{id}/test` - Test run automation
- `POST /api/automations/trigger` - Manually trigger automations

### Example: Create Lead Follow-up
```bash
curl -X POST http://localhost:8000/api/automations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Welcome New Leads",
    "type": "lead_followup",
    "trigger": "new_lead",
    "delay_hours": 0,
    "channel": "email",
    "enabled": true
  }'
```

---

## 🎯 Example Scenarios

### Scenario 1: Welcome New Leads
**Setup:**
- Type: `lead_followup`
- Trigger: `new_lead`
- Delay: 0 hours
- Channel: `email`

**Result:**
- When a new lead is added, immediately sends welcome email
- Message is AI-generated or uses template
- Activity is logged

### Scenario 2: Follow-up After 3 Days
**Setup:**
- Type: `lead_followup`
- Trigger: `no_contact_days`
- Delay: 3 days
- Channel: `email`

**Result:**
- Checks daily for leads not contacted in 3+ days
- Sends follow-up message
- Updates last_contacted

### Scenario 3: Booking Reminder
**Setup:**
- Type: `booking_reminder`
- Trigger: `booking_reminder_hours`
- Delay: 24 hours
- Channel: `sms`

**Result:**
- Sends SMS 24 hours before booking
- Includes booking details

---

## 🔧 Configuration

### Delay Settings
- `delay_hours`: Hours to wait before triggering
- `delay_days`: Days to wait before triggering
- Both can be used together (e.g., 2 days + 6 hours)

### Conditions
JSON field for additional filtering:
```json
{
  "lead_status": "new",
  "source": "Website"
}
```

### Message Template
Optional custom template:
```
Hi {lead_name},

Thank you for your interest! We'd love to help you...

Best regards
```

If empty, AI generates the message.

---

## 📝 Logging & Tracking

### Activity Logs
All automation executions are logged in `AgentActivity`:
- Type: `automation_ran`
- Description: What happened
- Details: Automation ID, message ID, etc.

### Automation Stats
Each automation tracks:
- `times_triggered`: How many times executed
- `last_triggered`: Last execution time

---

## ⚠️ Important Notes

### 1. **Message Sending**
Currently, automations **create message records** but don't actually send emails/SMS yet. This is the next step (messaging channel integration).

### 2. **Scheduled Automations**
Run `python manage.py run_automations` periodically (via cron) to execute delayed automations.

### 3. **AI Message Generation**
Uses Google Gemini API. Make sure `GEMINI_API_KEY` is set in `.env`.

### 4. **Signal Registration**
Signals are automatically registered when Django starts (via `apps.py`).

---

## 🧪 Testing

### Test New Lead Automation:
1. Create a new lead
2. Check messages - should see welcome message
3. Check audit history - should see automation activity

### Test Scheduled Automation:
1. Create automation with `no_contact_days` trigger
2. Create a lead with old `last_contacted` date
3. Run: `python manage.py run_automations`
4. Check if message was created

### Test Manual Trigger:
```python
from automations.services import trigger_automations

trigger_automations('new_lead', {
    'user': user,
    'lead': lead
})
```

---

## 🚀 Next Steps

1. **Messaging Integration**: Connect to actual email/SMS services
2. **Booking Integration**: Connect to SimplyBook.me for booking triggers
3. **Advanced Conditions**: More complex filtering rules
4. **Automation Templates**: Pre-built automation sets
5. **Analytics**: Track automation performance

---

## 📚 Files

- `automations/models.py` - Automation model
- `automations/services.py` - Execution engine
- `automations/signals.py` - Event triggers
- `automations/views.py` - API endpoints
- `automations/management/commands/run_automations.py` - Scheduled runner

---

**Status**: ✅ **Fully Functional** - Automations execute automatically on events!

