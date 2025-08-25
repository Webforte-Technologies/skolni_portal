# Enhanced User CRUD API Documentation

## Overview

This document describes the enhanced User CRUD API endpoints that provide comprehensive user management functionality for the EduAI-Asistent platform. The API includes advanced features like sorting, filtering, bulk operations, and optimized performance.

## Base URL

```
Production: https://api.eduai-asistent.cz
Development: http://localhost:3001/api
```

## Authentication

All admin endpoints require authentication with a valid JWT token and admin privileges.

```http
Authorization: Bearer <jwt_token>
```

## API Endpoints

### 1. List Users with Advanced Filtering and Sorting

**Endpoint:** `GET /admin/users`

**Description:** Retrieve a paginated list of users with advanced filtering and sorting capabilities.

**Query Parameters:**

| Parameter | Type | Description | Default | Example |
|-----------|------|-------------|---------|---------|
| `page` | number | Page number (1-based) | 1 | `?page=2` |
| `limit` | number | Items per page (max 100) | 50 | `?limit=25` |
| `search` | string | Search in name and email | - | `?search=john` |
| `role` | string | Filter by user role | all | `?role=teacher_individual` |
| `school_id` | string | Filter by school ID | all | `?school_id=123` |
| `status` | string | Filter by status | all | `?status=active` |
| `is_active` | boolean | Filter by active status | - | `?is_active=true` |
| `order_by` | string | Sort field | created_at | `?order_by=first_name` |
| `order_direction` | string | Sort direction (asc/desc) | desc | `?order_direction=asc` |
| `email_verified` | boolean | Filter by email verification | - | `?email_verified=true` |
| `last_login` | string | Filter by last login | all | `?last_login=30d` |
| `credit_range_type` | string | Filter by credit range | all | `?credit_range_type=low` |
| `registration_date` | string | Filter by registration date | all | `?registration_date=this_month` |
| `school_type` | string | Filter by school association | all | `?school_type=individual_only` |

**Supported Sort Fields:**
- `first_name` - User's first name
- `last_name` - User's last name  
- `email` - User's email address
- `role` - User's role
- `school_name` - Associated school name
- `credits_balance` - User's credit balance
- `status` - User's status
- `created_at` - Registration date
- `last_login_at` - Last login timestamp

**Supported Filter Values:**

*Role:*
- `platform_admin` - Platform administrators
- `school_admin` - School administrators
- `teacher_school` - School teachers
- `teacher_individual` - Individual teachers

*Status:*
- `active` - Active users
- `inactive` - Inactive users
- `suspended` - Suspended users
- `pending` - Pending verification

*Last Login:*
- `7d` - Last 7 days
- `30d` - Last 30 days
- `90d` - Last 90 days
- `never` - Never logged in

*Credit Range:*
- `low` - Less than 10 credits
- `medium` - 10-100 credits
- `high` - More than 100 credits

*Registration Date:*
- `this_week` - This week
- `this_month` - This month
- `last_3_months` - Last 3 months

*School Type:*
- `individual_only` - Individual teachers only
- `school_only` - School-associated users only

**Example Request:**
```http
GET /admin/users?page=1&limit=25&search=john&role=teacher_individual&order_by=first_name&order_direction=asc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user123",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "role": "teacher_individual",
        "is_active": true,
        "status": "active",
        "school_id": null,
        "school_name": null,
        "school_city": null,
        "credits_balance": 150,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-20T14:45:00Z",
        "last_login_at": "2024-01-25T09:15:00Z",
        "email_verified": true,
        "total_logins": 45,
        "total_activities": 128
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 156,
      "totalPages": 7,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "applied": {
        "search": "john",
        "role": "teacher_individual",
        "order_by": "first_name",
        "order_direction": "asc"
      }
    }
  }
}
```

### 2. Get Individual User

**Endpoint:** `GET /admin/users/:id`

**Description:** Retrieve detailed information about a specific user.

**Path Parameters:**
- `id` (string, required) - User ID

**Example Request:**
```http
GET /admin/users/user123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "teacher_individual",
    "is_active": true,
    "status": "active",
    "school_id": null,
    "school_name": null,
    "school_city": null,
    "credits_balance": 150,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:45:00Z",
    "last_login_at": "2024-01-25T09:15:00Z",
    "last_activity_at": "2024-01-25T11:30:00Z",
    "email_verified": true,
    "total_logins": 45,
    "total_activities": 128,
    "total_credits_used": 850,
    "total_credits_earned": 1000,
    "preferences": {
      "language": "cs",
      "notifications": true
    },
    "contact_info": {
      "phone": "+420123456789",
      "address": "Prague, Czech Republic"
    }
  }
}
```

### 3. Create User

**Endpoint:** `POST /admin/users`

**Description:** Create a new user account.

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "role": "teacher_school",
  "school_id": "school456",
  "credits_balance": 100,
  "is_active": true,
  "send_welcome_email": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user789",
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "role": "teacher_school",
    "school_id": "school456",
    "credits_balance": 100,
    "is_active": true,
    "status": "pending",
    "created_at": "2024-01-25T15:30:00Z",
    "updated_at": "2024-01-25T15:30:00Z"
  },
  "message": "Uživatel byl úspěšně vytvořen"
}
```

### 4. Update User

**Endpoint:** `PUT /admin/users/:id`

**Description:** Update user information.

**Path Parameters:**
- `id` (string, required) - User ID

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Johnson",
  "email": "jane.johnson@example.com",
  "credits_balance": 200,
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user789",
    "first_name": "Jane",
    "last_name": "Johnson",
    "email": "jane.johnson@example.com",
    "credits_balance": 200,
    "updated_at": "2024-01-25T16:45:00Z"
  },
  "message": "Uživatel byl úspěšně aktualizován"
}
```

### 5. Delete User

**Endpoint:** `DELETE /admin/users/:id`

**Description:** Soft delete a user (sets is_active to false).

**Path Parameters:**
- `id` (string, required) - User ID

**Response:**
```json
{
  "success": true,
  "message": "Uživatel byl úspěšně smazán"
}
```

### 6. Bulk Operations

**Endpoint:** `POST /admin/users/bulk`

**Description:** Perform bulk operations on multiple users.

**Request Body:**
```json
{
  "action": "add_credits",
  "user_ids": ["user123", "user456", "user789"],
  "data": {
    "credits": 50
  }
}
```

**Supported Actions:**
- `activate` - Activate users
- `deactivate` - Deactivate users
- `add_credits` - Add credits to users
- `deduct_credits` - Deduct credits from users
- `delete` - Soft delete users
- `change_role` - Change user role
- `send_notification` - Send notification to users

**Response:**
```json
{
  "success": true,
  "data": {
    "processed": 3,
    "successful": 3,
    "failed": 0,
    "results": [
      {
        "user_id": "user123",
        "success": true,
        "message": "Kredity byly úspěšně přidány"
      },
      {
        "user_id": "user456", 
        "success": true,
        "message": "Kredity byly úspěšně přidány"
      },
      {
        "user_id": "user789",
        "success": true,
        "message": "Kredity byly úspěšně přidány"
      }
    ]
  },
  "message": "Hromadná operace byla dokončena"
}
```

### 7. User Profile with Activity

**Endpoint:** `GET /admin/users/:id/profile`

**Description:** Get comprehensive user profile with activity statistics.

**Path Parameters:**
- `id` (string, required) - User ID

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "role": "teacher_individual",
      "is_active": true,
      "status": "active",
      "credits_balance": 150,
      "created_at": "2024-01-15T10:30:00Z",
      "last_login_at": "2024-01-25T09:15:00Z"
    },
    "statistics": {
      "total_sessions": 45,
      "total_credits_used": 850,
      "total_credits_purchased": 1000,
      "average_session_duration": 25.5,
      "last_login": "2024-01-25T09:15:00Z",
      "account_age_days": 10,
      "most_used_feature": "AI Generator",
      "activity_score": 85
    },
    "recent_activity": [
      {
        "id": "activity123",
        "action_type": "ai_generation",
        "timestamp": "2024-01-25T11:30:00Z",
        "details": "Generated math worksheet",
        "credits_used": 5
      }
    ]
  }
}
```

### 8. User Activity Log

**Endpoint:** `GET /admin/users/:id/activity`

**Description:** Get detailed activity log for a user.

**Path Parameters:**
- `id` (string, required) - User ID

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Items per page
- `action_type` (string) - Filter by action type
- `date_from` (string) - Start date (ISO format)
- `date_to` (string) - End date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity123",
        "user_id": "user123",
        "action_type": "login",
        "timestamp": "2024-01-25T09:15:00Z",
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0...",
        "session_id": "session456",
        "details": "User logged in successfully"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 128,
      "totalPages": 3
    }
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message in Czech",
  "code": "ERROR_CODE",
  "details": {
    "field": "field_name",
    "value": "invalid_value"
  }
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email, etc.)
- `422` - Unprocessable Entity (validation error)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **General endpoints**: 100 requests per minute per IP
- **Bulk operations**: 10 requests per minute per user
- **Search endpoints**: 60 requests per minute per user

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Performance Considerations

### Caching
- User list responses are cached for 5 minutes
- Individual user data is cached for 2 minutes
- Cache is invalidated on user updates

### Pagination
- Maximum limit is 100 items per page
- Default limit is 50 items per page
- Use cursor-based pagination for large datasets

### Filtering
- Complex filters may impact performance
- Use indexed fields for better performance
- Combine filters efficiently to reduce query time

### Bulk Operations
- Maximum 1000 users per bulk operation
- Operations are processed in batches of 100
- Long-running operations return job IDs for status tracking

## SDK Examples

### JavaScript/TypeScript
```typescript
import { AdminAPI } from '@eduai-asistent/sdk';

const api = new AdminAPI({
  baseURL: 'https://api.eduai-asistent.cz',
  token: 'your-jwt-token'
});

// List users with filtering
const users = await api.users.list({
  page: 1,
  limit: 25,
  role: 'teacher_individual',
  order_by: 'first_name',
  order_direction: 'asc'
});

// Get individual user
const user = await api.users.get('user123');

// Create user
const newUser = await api.users.create({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  role: 'teacher_individual'
});

// Bulk operations
const result = await api.users.bulk({
  action: 'add_credits',
  user_ids: ['user1', 'user2'],
  data: { credits: 50 }
});
```

### cURL Examples
```bash
# List users
curl -X GET "https://api.eduai-asistent.cz/admin/users?page=1&limit=25" \
  -H "Authorization: Bearer your-jwt-token"

# Get user
curl -X GET "https://api.eduai-asistent.cz/admin/users/user123" \
  -H "Authorization: Bearer your-jwt-token"

# Create user
curl -X POST "https://api.eduai-asistent.cz/admin/users" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe", 
    "email": "john@example.com",
    "role": "teacher_individual"
  }'

# Bulk operation
curl -X POST "https://api.eduai-asistent.cz/admin/users/bulk" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add_credits",
    "user_ids": ["user1", "user2"],
    "data": {"credits": 50}
  }'
```

## Changelog

### Version 2.0.0 (Current)
- Added advanced filtering and sorting
- Implemented bulk operations
- Enhanced error handling
- Added performance optimizations
- Improved API documentation

### Version 1.0.0
- Basic CRUD operations
- Simple filtering
- Basic pagination
