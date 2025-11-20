# Infinite Base Agent - Django Backend

Django REST API backend for Infinite Base Agent with PostgreSQL database.

## Setup Instructions

### 1. Create Virtual Environment (IMPORTANT!)

**Always use a virtual environment to avoid package conflicts!**

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
venv\Scripts\Activate.ps1

# On Windows (Command Prompt):
venv\Scripts\activate.bat

# On Mac/Linux:
source venv/bin/activate
```

**You'll see `(venv)` in your terminal when activated.**

### 2. Install Python Dependencies

**Make sure virtual environment is activated first!**

```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install all dependencies
pip install -r requirements.txt
```

### 3. Install PostgreSQL

- Download from: https://www.postgresql.org/download/
- Install PostgreSQL
- Create a database:
  ```sql
  CREATE DATABASE infinite_base_agent;
  ```

### 4. Configure Environment

Create a `.env` file in the `backend` directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=infinite_base_agent
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
OPENAI_API_KEY=your-openai-api-key
```

### 5. Run Migrations

**Make sure virtual environment is activated!**

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser (Optional)

**Make sure virtual environment is activated!**

```bash
python manage.py createsuperuser
```

### 7. Run Development Server

**Make sure virtual environment is activated!**

```bash
python manage.py runserver
```

The API will be available at: `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Leads
- `GET /api/leads` - List all leads
- `POST /api/leads` - Create new lead
- `GET /api/leads/<id>` - Get lead details
- `PUT /api/leads/<id>` - Update lead
- `DELETE /api/leads/<id>` - Delete lead

### Messages
- `GET /api/messages` - List messages (optional: ?leadId=<id>)
- `POST /api/messages` - Send message

### AI Integration
- `POST /api/ai/generate` - Generate AI response
- `GET /api/activity` - Get agent activity log

### Automations
- `GET /api/automations` - List automations
- `POST /api/automations` - Create automation
- `PATCH /api/automations/<id>` - Toggle automation

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## Testing

Use the Django admin panel at: `http://localhost:8000/admin/`

Or use tools like Postman/Insomnia to test API endpoints.

