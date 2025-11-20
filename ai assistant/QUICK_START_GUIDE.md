# Quick Start Guide - Infinite Base Agent

## 🚀 Getting Started in 5 Minutes

### Step 1: Start the Backend
```bash
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```
Backend runs on: `http://localhost:8000`

### Step 2: Start the Frontend
```bash
npm run dev
```
Frontend runs on: `http://localhost:3000`

### Step 3: Create an Account
1. Go to `http://localhost:3000`
2. Click "Register"
3. Enter your email, password, and name
4. Verify your email with OTP (check terminal/console)

### Step 4: Generate Test Data
```bash
cd backend
.\venv\Scripts\Activate.ps1
python manage.py generate_dummy_data --user-email your@email.com
```

### Step 5: Explore Features
1. **Dashboard**: See overview of your data
2. **AI Chat**: Generate messages for leads
3. **Insights**: View business intelligence
4. **Audit**: Check activity history

---

## 📋 Feature Checklist

### ✅ What's Working Now:
- [x] User registration and login
- [x] Email verification (OTP)
- [x] Lead management (CRUD)
- [x] AI message generation (Google Gemini)
- [x] Message tracking
- [x] Business Intelligence dashboard
- [x] Insights and opportunities
- [x] Performance metrics
- [x] Audit history
- [x] Settings management

### 🔄 What's Coming Next:
- [ ] Actual email/SMS sending
- [ ] Automation triggers
- [ ] Calendar integration
- [ ] Payment processing
- [ ] Mobile app
- [ ] Team collaboration

---

## 🎯 Common Tasks

### Add a Lead
1. Go to Dashboard
2. Click "Add Lead" (or use API)
3. Fill in name, email, phone
4. Save

### Generate AI Message
1. Go to AI Chat
2. Select a lead from dropdown
3. Type: "Write a follow-up email"
4. Review generated message
5. Copy or send

### View Insights
1. Go to Insights page
2. See missed opportunities
3. Check upsell potential
4. Review performance metrics

### Check Activity
1. Go to Audit History
2. See all agent activities
3. Filter by date/type

---

## 🔑 API Endpoints Quick Reference

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP

### Leads
- `GET /api/leads` - List leads
- `POST /api/leads` - Create lead
- `GET /api/leads/{id}` - Get lead details

### AI
- `POST /api/ai/generate` - Generate AI response

### Business Intelligence
- `GET /api/bi/dashboard` - Get dashboard data
- `GET /api/bi/insights` - Get insights
- `GET /api/bi/metrics` - Get metrics

---

## 🐛 Troubleshooting

### Backend not starting?
- Check if PostgreSQL is running
- Verify database credentials in `settings.py`
- Check `.env` file exists

### Frontend not loading?
- Check if backend is running
- Verify `NEXT_PUBLIC_API_URL` in `.env`
- Check browser console for errors

### No data showing?
- Generate dummy data for your user
- Check you're logged in with correct account
- Verify API is returning data (check Network tab)

### AI not working?
- Check `GEMINI_API_KEY` in `.env`
- Verify API key is valid
- Check backend logs for errors

---

## 📚 Next Steps

1. Read `APP_DOCUMENTATION.md` for detailed feature explanations
2. Check `BI_FEATURES.md` for BI system details
3. Review code in `backend/` and `app/` directories
4. Customize features for your needs

---

**Happy Building! 🎉**

