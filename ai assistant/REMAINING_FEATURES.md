# 🎯 Remaining Features to Implement

## ✅ **COMPLETED**
1. ✅ Conversations/Inbox Tab - Multi-channel inbox with filters

---

## ❌ **STILL MISSING**

### **Priority 1: Critical MVP Features**

#### 1. **Lead Model Extensions** ❌
- [ ] Add `service_type` field (CharField with choices)
- [ ] Add `price` field (DecimalField)
- [ ] Add `description_of_enquiry` field (TextField)
- [ ] Add `potential_value` field (DecimalField)
- [ ] Update LeadSerializer
- [ ] Create migration
- [ ] Update frontend Leads page to show new fields
- [ ] Add Service Type filter to Leads page

#### 2. **Booking Model Extensions** ❌
- [ ] Add `property` field (CharField)
- [ ] Add `revenue` field (DecimalField)
- [ ] Update BookingSerializer
- [ ] Create migration
- [ ] Update frontend Bookings page to show new fields

#### 3. **Integrations Page** ❌
- [ ] Create `/integrations` page
- [ ] Show all integrations (CRM, Email, SMS, WhatsApp, Facebook, Instagram, Calendar)
- [ ] Visual connection status indicators (Connected/Disconnected)
- [ ] Toggle integrations on/off
- [ ] Test connection buttons
- [ ] Add to navigation

#### 4. **Dashboard Enhancements** ⚠️
- [ ] Add revenue charts/graphs
- [ ] Show trends with % changes (vs last period)
- [ ] Add more detailed graphs (bookings over time, revenue breakdown)
- [ ] Calculate and display revenue metrics

---

## 📋 **Implementation Order**

1. **Extend Lead Model** (Backend + Frontend)
2. **Extend Booking Model** (Backend + Frontend)
3. **Create Integrations Page** (Frontend + Backend endpoints)
4. **Enhance Dashboard** (Frontend + Backend metrics)

---

## 🚀 **Let's Start Implementation!**

