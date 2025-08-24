# Feature Plan: Individual Teachers CRUD System for Admin Dashboard

## Brief Description

Implement a comprehensive CRUD (Create, Read, Update, Delete) system for individual teachers on the admin dashboard. This system will build upon the existing user CRUD infrastructure and provide platform administrators with complete management capabilities specifically for teacher accounts (both `teacher_individual` and `teacher_school` roles). The system will include real API integration, dedicated teacher forms, and enhanced teacher-specific functionality.

## Current State Analysis

**Existing Capabilities:**
- Backend teacher CRUD API endpoints already implemented (`/admin/teachers` - GET, POST, PUT, DELETE)
- Teacher listing endpoint with filters (`GET /admin/teachers`)
- Teacher assignment/unassignment to schools (`POST/DELETE /admin/teachers/:id/assign-school`, `/admin/teachers/:id/unassign-school`)
- Frontend `TeachersPage.tsx` with complete UI layout but using mock data
- Generic `UserForm.tsx` component that supports teacher roles
- Authentication and authorization middleware for admin access

**Missing Capabilities:**
- Frontend integration with real teacher API endpoints
- Dedicated teacher create/edit forms with teacher-specific fields
- Teacher bulk operations (similar to user management)
- Teacher profile view with detailed information
- Real-time data updates and proper error handling
- Teacher-specific filtering and search capabilities
- Teacher activity tracking and statistics

## Files and Functions to Modify/Create

### Backend API Enhancements (`backend/src/routes/admin.ts`)

**Existing Endpoints to Enhance:**
- `GET /admin/teachers` - Add more advanced filtering options (last_activity, credits_range, verification_status)
- `POST /admin/teachers/bulk` - Implement bulk operations for teachers (activate, deactivate, assign credits, delete)

**New Endpoints to Implement:**
- `GET /admin/teachers/:id/profile` - Get detailed teacher profile with usage statistics
- `GET /admin/teachers/:id/activity` - Get teacher activity logs and analytics
- `POST /admin/teachers/:id/send-notification` - Send notification to teacher
- `PUT /admin/teachers/:id/status` - Update teacher status (active, suspended, pending_verification)

### Frontend Components to Create

**Teacher-Specific Forms:**
- `frontend/src/components/admin/TeacherForm.tsx` - Dedicated form for creating/editing teachers
- `frontend/src/components/admin/TeacherCreateModal.tsx` - Modal for creating new teachers
- `frontend/src/components/admin/TeacherEditModal.tsx` - Modal for editing existing teachers
- `frontend/src/components/admin/TeacherProfileModal.tsx` - Modal for viewing detailed teacher profile

**Teacher Management Components:**
- `frontend/src/components/admin/TeacherBulkActions.tsx` - Component for bulk teacher operations
- `frontend/src/components/admin/TeacherFilters.tsx` - Advanced filtering component for teachers
- `frontend/src/components/admin/TeacherActivityLog.tsx` - Component for displaying teacher activity

### Frontend Pages to Modify

**Main Teacher Management:**
- `frontend/src/pages/admin/TeachersPage.tsx` - Replace mock data with real API calls
- `frontend/src/pages/admin/TeacherCreatePage.tsx` - Create new standalone page for teacher creation
- `frontend/src/pages/admin/TeacherEditPage.tsx` - Create new standalone page for teacher editing
- `frontend/src/pages/admin/TeacherProfilePage.tsx` - Create new page for detailed teacher view

### Services and API Integration

**API Service Extensions:**
- `frontend/src/services/teacherService.ts` - Create dedicated service for teacher API calls
- Enhance `frontend/src/services/apiClient.ts` - Add teacher-specific API methods

### Type Definitions

**Frontend Types (`frontend/src/types/index.ts`):**
- Add teacher-specific interfaces that match backend database types
- Add teacher form data interfaces
- Add teacher filter and search interfaces

## Implementation Algorithm

### Phase 1: Backend API Enhancements

1. **Enhance existing teacher endpoints:**
   - Add advanced filtering parameters to `GET /admin/teachers`
   - Implement proper pagination with teacher count
   - Add teacher status updates and bulk operations

2. **Add new teacher profile and activity endpoints:**
   - Create teacher profile endpoint with usage statistics
   - Implement teacher activity logging endpoint
   - Add teacher notification endpoint

### Phase 2: Frontend API Integration and Services

1. **Create teacher service layer:**
   - Create `teacherService.ts` with all CRUD operations
   - Implement proper error handling and response types
   - Add caching and loading states management

2. **Update TeachersPage with real API:**
   - Replace mock data with real API calls
   - Implement proper loading states and error handling
   - Add pagination and real-time updates

### Phase 3: Teacher-Specific Forms and Modals

1. **Create dedicated teacher form components:**
   - Build `TeacherForm.tsx` with teacher-specific validation
   - Create create/edit modals with proper form handling
   - Implement teacher profile modal with detailed view

2. **Add teacher bulk operations:**
   - Create bulk actions component for multiple teacher operations
   - Implement teacher status management (activate/suspend)
   - Add bulk credit allocation for teachers

### Phase 4: Enhanced Filtering and Search

1. **Implement advanced teacher filters:**
   - Create advanced filtering component for teachers
   - Add date range filters for registration and last activity
   - Implement credit balance range filters

2. **Add teacher-specific search capabilities:**
   - Implement multi-field search (name, email, school, subjects)
   - Add search suggestions and autocomplete
   - Add saved filter presets

### Phase 5: Teacher Activity and Analytics

1. **Implement teacher activity tracking:**
   - Create teacher activity log component
   - Add activity analytics and usage statistics
   - Implement teacher performance metrics

2. **Add teacher notification system:**
   - Create notification sending interface
   - Implement notification history tracking
   - Add bulk notification capabilities

## Data Flow Requirements

**Teacher CRUD Operations:**
1. Create Teacher: Form validation → API call → Database insert → UI update
2. Read Teachers: API call with filters → Database query → Paginated response → UI rendering
3. Update Teacher: Form validation → API call → Database update → UI refresh
4. Delete Teacher: Confirmation → API call → Soft delete → UI removal

**Bulk Operations:**
1. Select teachers → Choose action → Confirm → API batch call → Database updates → UI refresh

**Teacher Profile View:**
1. Click teacher → API call for detailed data → Render profile modal with statistics

## Integration Points

**With Existing User System:**
- Leverage existing user authentication and authorization
- Use existing user database schema and models
- Integrate with existing credit management system

**With School Management:**
- Connect teacher school assignments with school CRUD system
- Implement school-teacher relationship management
- Add school-based teacher filtering

**With Activity Logging:**
- Integrate with existing activity logger middleware
- Add teacher-specific activity events
- Connect with existing audit logging system

## Validation Requirements

**Teacher Form Validation:**
- Email uniqueness validation across teacher types
- Role-school consistency validation (teacher_school requires school_id)
- Credit balance validation (non-negative numbers)
- Phone number format validation for Czech numbers

**Business Logic Validation:**
- Prevent deletion of teachers with active conversations
- Validate school assignment changes
- Ensure proper role transitions (individual ↔ school teacher)

## Error Handling Strategy

**Frontend Error Handling:**
- Display user-friendly error messages in Czech
- Implement proper loading states for all operations
- Add retry mechanisms for failed API calls
- Show validation errors inline with form fields

**Backend Error Handling:**
- Return consistent error response format
- Log all teacher management operations for audit
- Handle database constraint violations gracefully
- Implement proper transaction rollbacks for bulk operations
