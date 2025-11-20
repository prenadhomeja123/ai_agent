# Business Intelligence Features

## Overview
The Business Intelligence (BI) system provides insights, opportunities, and performance metrics based on agent activities and CRM data.

## Features

### 1. **Business Insights**
- **Missed Opportunities**: Identifies leads that haven't been contacted recently
- **Upsell Potential**: Highlights leads with high engagement for upsell opportunities
- **Conversion Risk**: Alerts about leads at risk of being lost
- **Engagement Trends**: Tracks engagement patterns over time
- **Performance Metrics**: Key performance indicators

### 2. **Opportunities Tracking**
- Tracks upsell, cross-sell, renewal, expansion, and win-back opportunities
- Confidence scoring (0-100%)
- Estimated value tracking
- Status management (identified → in_progress → converted/lost)

### 3. **Performance Metrics**
- Conversion Rate
- Response Rate
- Engagement Rate
- Average Response Time
- Lead Velocity
- Revenue Per Lead
- Upsell Rate

## API Endpoints

All endpoints are prefixed with `/api/bi/`:

- `GET /dashboard` - Get comprehensive BI dashboard data
- `GET /insights` - Get all business insights (with filters)
- `GET /insights/missed-opportunities` - Get missed opportunities
- `GET /insights/upsell-potential` - Get upsell opportunities
- `GET /metrics` - Get performance metrics
- `POST /insights/{id}/resolve` - Mark insight as resolved
- `POST /opportunities/{id}/update-status` - Update opportunity status

## Frontend

Access the BI dashboard at: `/insights`

The dashboard includes:
- Summary cards with key metrics
- Insights list with action items
- Opportunities tracking
- Activity breakdown
- Lead status distribution

## Generating Dummy Data

To populate the database with test data:

```bash
cd backend
.\venv\Scripts\Activate.ps1
python business_intelligence/generate_dummy_data.py [user_email]
```

If no email is provided, it will use the first user in the database.

This will create:
- 20 sample leads
- 50 agent activities
- 30 messages
- 10 business insights
- 8 opportunities
- 7 performance metrics

## Models

### BusinessInsight
- Tracks insights with priority levels (high/medium/low)
- Links to leads
- Includes action items and metadata
- Can be marked as resolved

### Opportunity
- Tracks business opportunities
- Confidence scoring
- Estimated value
- Status workflow

### PerformanceMetric
- Time-series performance data
- Multiple metric types
- Period-based tracking

## Integration

The BI system automatically:
- Analyzes agent activities
- Identifies missed opportunities
- Calculates performance metrics
- Generates insights based on lead engagement

All insights are generated based on real agent actions tracked in the system.

