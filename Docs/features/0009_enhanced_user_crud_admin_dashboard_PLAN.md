# Feature Plan: Enhanced User CRUD Operations in Admin Dashboard

## Brief Description

Enhance the existing User CRUD functionality in the admin dashboard with advanced features including order by functionality, improved filters, bulk action confirmations, fix for user editing 404 error, and polished user profile UI. This addresses critical issues in the current user management system and adds essential administrative capabilities.

## Current State Analysis

**Existing Capabilities:**
- Basic user listing with pagination (`GET /api/admin/users`)
- User creation via admin interface (`POST /api/admin/users`)
- User updates (`PUT /api/admin/users/:id`)
- User soft delete (`DELETE /api/admin/users/:id`)
- Basic filters (role, school_id, is_active, search query)
- Advanced search with date ranges and credit ranges
- Bulk operations (activate, deactivate, add/deduct credits, delete)
- User profile page with activity tracking (`GET /api/admin/users/:id/profile`)

**Critical Issues Identified:**
- **Missing GET endpoint**: No `GET /api/admin/users/:id` endpoint for individual user retrieval (causing 404 error)
- **No order by functionality**: Users cannot sort by role, name, credits, etc.
- **Limited filtering options**: Current filters don't suit the application needs
- **No bulk action confirmations**: Bulk operations execute without user confirmation
- **Profile editing issues**: User profile editing doesn't work properly
- **UI polish needed**: User profile interface needs improvement

## Files and Functions to Modify/Create

### Backend API Endpoints (`backend/src/routes/admin.ts`)

**New Endpoints to Implement:**
- `GET /admin/users/:id` - Get individual user details (missing endpoint causing 404)
- `GET /admin/users?order_by=&order_direction=` - Add sorting functionality to existing users endpoint

**Existing Endpoints to Enhance:**
- `GET /admin/users` - Add order_by and order_direction query parameters
- `PUT /admin/users/:id` - Ensure proper validation and error handling

### Backend Models (`backend/src/models/User.ts`)

**Functions to Modify:**
- `UserModel.findAll()` - Add sorting parameters (order_by, order_direction)
- `UserModel.advancedSearch()` - Add sorting to advanced search
- `UserModel.findById()` - Ensure this method exists and works properly

### Frontend Components

**Components to Modify:**
- `frontend/src/pages/admin/UserManagementPage.tsx` - Add sorting controls and bulk action confirmations
- `frontend/src/components/admin/UserForm.tsx` - Fix user editing functionality
- `frontend/src/components/admin/AdvancedUserFilters.tsx` - Enhance filters for better app suitability
- `frontend/src/pages/admin/UserProfilePage.tsx` - Polish UI and fix editing issues
- `frontend/src/pages/ProfilePage.tsx` - Fix user profile editing functionality

**New Components to Create:**
- `frontend/src/components/admin/UserTableHeader.tsx` - Sortable table headers
- `frontend/src/components/admin/BulkActionConfirmDialog.tsx` - Confirmation dialog for bulk operations
- `frontend/src/components/admin/EnhancedUserFilters.tsx` - Improved filtering system

### Services

**Services to Modify:**
- `frontend/src/services/apiClient.ts` - Add methods for individual user retrieval and sorting
- `backend/src/services/UserService.ts` - Add sorting and enhanced filtering logic

## Technical Implementation Details

### 1. Order By Functionality

**Backend Implementation:**
- Add `order_by` and `order_direction` parameters to `GET /admin/users` endpoint
- Supported sort fields: `first_name`, `last_name`, `email`, `role`, `credits_balance`, `created_at`, `last_login_at`
- Default sorting: `created_at DESC`
- SQL query modification to include `ORDER BY` clause with proper sanitization

**Frontend Implementation:**
- Add sortable column headers with up/down arrow indicators
- Implement click handlers to toggle sort direction
- Update API calls to include sorting parameters
- Persist sort preferences in component state

### 2. Enhanced Filtering System

**New Filter Options:**
- **Status filters**: Active, Inactive, Suspended, Pending Verification
- **Activity filters**: Last login (7d, 30d, 90d, never)
- **Credit range filters**: Low credits (<10), Medium (10-100), High (>100), Custom range
- **School-based filters**: Specific schools, Individual teachers only, School teachers only
- **Registration date filters**: This week, This month, Last 3 months, Custom range

**Implementation:**
- Create `EnhancedUserFilters` component with collapsible sections
- Add filter state management with URL persistence
- Implement server-side filtering in backend
- Add filter reset and save functionality

### 3. Bulk Action Confirmations

**Confirmation Dialog Features:**
- Show affected user count and names
- Display action consequences (e.g., "This will permanently delete X users")
- Require explicit confirmation for destructive actions
- Show progress indicator during bulk operations
- Display success/error summary after completion

**Implementation:**
- Create `BulkActionConfirmDialog` component
- Add confirmation step before executing bulk operations
- Implement different confirmation levels based on action severity
- Add undo functionality for reversible actions

### 4. Fix User Editing 404 Error

**Root Cause:**
- Missing `GET /admin/users/:id` endpoint in backend
- Frontend tries to fetch individual user data for editing but endpoint doesn't exist

**Solution:**
- Implement `GET /admin/users/:id` endpoint in `backend/src/routes/admin.ts`
- Return user data without password hash
- Add proper error handling for non-existent users
- Update frontend to use correct endpoint

### 5. User Profile UI Polish

**UI Improvements:**
- Modern card-based layout with proper spacing
- Responsive design for mobile devices
- Clear section separation (Personal Info, Account Settings, Activity)
- Improved form validation with real-time feedback
- Better loading states and error handling
- Action buttons with proper visual hierarchy

**Profile Editing Fixes:**
- Fix form submission handling
- Add proper validation for all fields
- Implement optimistic updates with rollback on error
- Add confirmation for sensitive changes (email, role)

## Implementation Phases

### Phase 1: Backend API Fixes (Critical)
1. **Add missing GET endpoint**: Implement `GET /admin/users/:id` endpoint
2. **Add sorting functionality**: Enhance `GET /admin/users` with order_by parameters
3. **Update User model**: Add sorting methods to UserModel
4. **Test API endpoints**: Ensure all CRUD operations work correctly

### Phase 2: Frontend Core Functionality
1. **Fix user editing**: Update components to use correct API endpoints
2. **Add sorting controls**: Implement sortable table headers
3. **Create bulk confirmation dialogs**: Add confirmation step for bulk actions
4. **Update user management page**: Integrate new sorting and confirmation features

### Phase 3: Enhanced Filtering System
1. **Create enhanced filters component**: Build comprehensive filtering interface
2. **Implement filter logic**: Add backend support for new filter types
3. **Add filter persistence**: Save filter state in URL/localStorage
4. **Test filtering combinations**: Ensure all filter combinations work correctly

### Phase 4: UI Polish and Profile Improvements
1. **Polish user profile page**: Improve layout, styling, and responsiveness
2. **Fix profile editing**: Ensure all profile editing functionality works
3. **Add loading states**: Implement proper loading indicators throughout
4. **Responsive design**: Ensure all components work on mobile devices

### Phase 5: Testing and Optimization
1. **End-to-end testing**: Test complete user management workflow
2. **Performance optimization**: Optimize queries and frontend rendering
3. **Error handling**: Ensure robust error handling throughout
4. **Documentation**: Update API documentation and user guides

## API Endpoints Summary

### New Endpoints
```
GET /api/admin/users/:id
- Purpose: Get individual user details
- Response: User object without password hash
- Error: 404 if user not found
```

### Enhanced Endpoints
```
GET /api/admin/users?order_by=field&order_direction=asc|desc&...existing_params
- Purpose: List users with sorting and filtering
- New params: order_by, order_direction
- Supported sort fields: first_name, last_name, email, role, credits_balance, created_at, last_login_at
```

## Database Schema Changes

No database schema changes required - all functionality uses existing tables and columns.

## Security Considerations

- Ensure proper authorization for all admin endpoints
- Validate and sanitize all sorting and filtering parameters
- Implement rate limiting for bulk operations
- Add audit logging for sensitive user management actions
- Validate user permissions before allowing profile edits

## Success Criteria

1. **404 Error Fixed**: User editing works without 404 errors
2. **Sorting Functional**: Users can sort by all major fields (name, role, credits, etc.)
3. **Enhanced Filters**: Comprehensive filtering system that suits application needs
4. **Bulk Confirmations**: All bulk actions require explicit user confirmation
5. **Profile Polish**: User profile page has modern, responsive UI
6. **Profile Editing**: All profile editing functionality works correctly
7. **Performance**: Page loads and operations complete within acceptable time limits
8. **Mobile Responsive**: All functionality works on mobile devices
