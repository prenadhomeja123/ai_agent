# 📊 Sample Data Generation Guide

## Quick Start

Generate sample data for testing and demo purposes:

```bash
cd backend
python manage.py create_sample_data
```

## Command Options

### Default (Recommended for First Time)
```bash
python manage.py create_sample_data
```
Creates:
- 20 sample leads
- 15 sample bookings
- 30 sample messages
- 20 agent activities
- Sample automations

### Custom Amounts
```bash
python manage.py create_sample_data --leads 50 --bookings 30 --messages 100
```

## What Gets Created

### ✅ Leads
- **All fields populated**:
  - Name, Email, Phone
  - Status (new, contacted, qualified, converted, lost)
  - Service Type (consultation, coaching, therapy, session, workshop, other)
  - Price ($50-$500)
  - Description of Enquiry
  - Potential Value ($100-$1000)
  - Source (Website, Referral, Social Media, etc.)
  - Last Contacted date (random, some never contacted)
  - Created dates (spread over last 90 days)

### ✅ Bookings
- **All fields populated**:
  - Title, Description
  - Guest Name (linked to lead)
  - Start/End Time (past and future dates)
  - Status (scheduled, confirmed, completed, cancelled, no_show)
  - Property (random property names)
  - Revenue ($100-$500)
  - Location, Booking Type
  - Duration (60 minutes)

### ✅ Messages
- **Multi-channel messages**:
  - Email, SMS, WhatsApp, Facebook, Instagram
  - Inbound and Outbound
  - AI-generated flags
  - Status (sent, delivered, read)
  - Timestamps (spread over last 30 days)

### ✅ Agent Activities
- **Various activity types**:
  - Message Sent
  - Message Replied
  - Follow-up Triggered
  - CRM Updated
  - Automation Ran
  - Linked to leads
  - Timestamps (spread over last 30 days)

### ✅ Automations
- **Sample automations** (if they don't exist):
  - Lead Follow-up
  - Booking Reminder
  - Post-Session Follow-up
  - No-Show Follow-up

## Notes

- **Data is linked to your first user account**
- **No duplicate emails** - skips leads that already exist
- **Realistic data** - names, emails, phone numbers, dates all make sense
- **Safe to run multiple times** - won't create duplicates

## Use Cases

1. **Testing**: Test all features with realistic data
2. **Demo**: Show the app to clients with populated data
3. **Development**: Work on features without manual data entry
4. **Screenshots**: Generate data for documentation

## Clearing Sample Data

To remove sample data, you can:
1. Use Django admin to delete records
2. Reset the database: `python manage.py flush` (⚠️ deletes ALL data)
3. Delete specific records via admin or shell

---

**Ready to populate your database with realistic sample data!**

