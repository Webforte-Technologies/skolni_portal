# Feature Plan: Dynamic Admin Analytics Dashboard

## 1. Feature Analysis

The current admin analytics page (`/admin/analytics`) contains hardcoded mock data for several key metrics that need to be made dynamic by pulling real data from the database. The specific blocks that need to be converted from static to dynamic are:

- **"Aktivní uživatelé"** (Active Users) - Currently shows hardcoded value of 156
- **"Vytvořené materiály"** (Created Materials) - Currently shows hardcoded value of 23 "dnes" (today)  
- **"Růst uživatelů"** (User Growth) - Currently shows hardcoded monthly data
- **"Využití kreditů"** (Credit Usage) - Currently shows hardcoded monthly data
- **"Nejaktivnější školy"** (Most Active Schools) - Currently shows hardcoded school list
- **"Trend vytváření materiálů"** (Material Creation Trend) - Currently shows hardcoded data and needs improvement

The goal is to replace all mock data with real database queries and create proper API endpoints to serve this dynamic data.

## 2. Technical Specification

### Affected Stack
- **Backend**: New analytics methods in existing services, new API endpoints
- **Frontend**: Update AnalyticsPage component to fetch real data
- **Database**: Utilize existing tables (users, schools, generated_files, credit_transactions, user_activity_logs)

### API Endpoints

#### New endpoint: `GET /admin/analytics/platform-overview`
**Request**: Query parameters for time range filtering
```typescript
{
  timeRange?: '7d' | '30d' | '90d' | '1y'
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    activeUsers: {
      total: number;
      todayActive: number;
      weeklyActive: number;
      monthlyActive: number;
    };
    materialsCreated: {
      today: number;
      thisWeek: number;
      thisMonth: number;
      total: number;
    };
    userGrowth: Array<{
      month: string;
      users: number;
      newUsers: number;
    }>;
    creditUsage: Array<{
      month: string;
      credits: number;
      transactions: number;
    }>;
    topSchools: Array<{
      id: string;
      name: string;
      users: number;
      credits: number;
      materialsCreated: number;
    }>;
    materialCreationTrend: {
      daily: Array<{
        date: string;
        materials: number;
        uniqueUsers: number;
      }>;
      bySubject: Array<{
        subject: string;
        materials: number;
        percentage: number;
      }>;
      byType: Array<{
        type: string;
        materials: number;
        percentage: number;
      }>;
    };
  }
}
```

### Database Schema
No new tables needed. Will utilize existing tables:
- `users` - for user counts and activity
- `schools` - for school information
- `generated_files` - for material creation data
- `credit_transactions` - for credit usage data
- `user_activity_logs` - for user activity tracking

### Files to Modify

#### Backend Files:
- `backend/src/services/AnalyticsService.ts` - Add new method `getPlatformOverviewMetrics()`
- `backend/src/routes/admin/analytics.ts` - Add new endpoint `/platform-overview`

#### Frontend Files:
- `frontend/src/pages/admin/AnalyticsPage.tsx` - Replace mock data with API calls
- `frontend/src/services/apiClient.ts` - Add new API method (if needed)

## 3. Implementation Phases

### Phase 1: Backend Analytics Service Enhancement
1. **Add new method to AnalyticsService**: `getPlatformOverviewMetrics(timeRange?: string)`
   - Implement active users calculation (users with recent activity)
   - Implement materials created counting with time-based filtering
   - Implement user growth calculation with monthly aggregation
   - Implement credit usage calculation with monthly aggregation
   - Implement top schools ranking by activity and credit usage
   - Implement improved material creation trend analysis (daily breakdown, subject/type distribution)

2. **Add new API endpoint**: `GET /admin/analytics/platform-overview`
   - Add route handler in `backend/src/routes/admin/analytics.ts`
   - Implement time range parameter parsing
   - Call AnalyticsService method and return formatted response
   - Add proper error handling and validation

### Phase 2: Frontend Integration
1. **Update AnalyticsPage component**:
   - Remove hardcoded mock data from `useState` initialization
   - Add API call to fetch real analytics data using new endpoint
   - Update data structure to match new API response format
   - Implement proper loading states and error handling
   - Update time range filtering to work with backend

2. **Improve Material Creation Trend visualization**:
   - Replace simple monthly chart with daily trend chart
   - Add subject breakdown visualization
   - Add material type breakdown visualization
   - Improve chart styling and interactivity

### Phase 3: Testing and Optimization
1. **Test all dynamic data flows**:
   - Verify active users calculation accuracy
   - Verify material creation counts
   - Verify user growth and credit usage trends
   - Verify top schools ranking logic
   - Test time range filtering functionality

2. **Performance optimization**:
   - Add database query optimization if needed
   - Implement caching for expensive queries
   - Add loading states for better UX

### Phase 4: Enhanced Analytics Features
1. **Improve "Trend vytváření materiálů" section**:
   - Add daily material creation chart instead of monthly
   - Add breakdown by subject categories
   - Add breakdown by material types (worksheet, test, assignment, etc.)
   - Add user engagement metrics (unique creators per day)

2. **Add real-time updates**:
   - Consider adding periodic refresh for live data
   - Add manual refresh button
   - Show last updated timestamp

## 4. Specific Query Requirements

### Active Users Calculation
- Total registered active users: `SELECT COUNT(*) FROM users WHERE is_active = true`
- Today active: Users with activity in last 24 hours from `user_activity_logs`
- Weekly active: Users with activity in last 7 days
- Monthly active: Users with activity in last 30 days

### Materials Created Calculation  
- Today: `SELECT COUNT(*) FROM generated_files WHERE DATE(created_at) = CURRENT_DATE`
- This week: Materials created in last 7 days
- This month: Materials created in current month
- Total: All materials count

### User Growth Trend
- Monthly new user registrations for last 6-12 months
- Group by month from `users.created_at`

### Credit Usage Trend
- Monthly credit transactions aggregated by month
- Sum of credit amounts from `credit_transactions` where `transaction_type = 'usage'`

### Top Schools Ranking
- Schools ranked by: total users, total credit usage, total materials created
- Join `schools`, `users`, `credit_transactions`, `generated_files`

### Material Creation Trend Enhancement
- Daily material creation count for last 30 days
- Breakdown by AI category/subject from `generated_files.ai_category`
- Breakdown by file type from `generated_files.file_type`
