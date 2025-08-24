# Feature Plan: Admin CRUD Operations for Users, Schools and Teachers

## Brief Description

Implement comprehensive CRUD (Create, Read, Update, Delete) operations for users, schools, and teachers in the admin dashboard. This feature will provide platform administrators with complete management capabilities for all entities in the system, including user creation, role management, school administration, and teacher oversight.

## Current State Analysis

**Existing Capabilities:**
- User listing with filters (`/admin/users` GET)
- User updates (role, is_active) (`/admin/users/:id` PUT)
- User credit management (`/admin/users/:id/credits` POST)
- Bulk user operations (`/admin/users/bulk` POST)
- School listing (`/admin/schools` GET)
- Basic school details view (`/schools/:schoolId` GET)
- School updates (`/schools/:schoolId` PUT)
- User registration endpoints (`/auth/register`, `/auth/register-school`)

**Missing Capabilities:**
- User creation via admin interface
- User deletion
- School creation via admin interface
- School deletion
- Dedicated teacher management interface
- Teacher CRUD operations
- Advanced user role management
- Unified entity management workflow

## Files and Functions to Modify/Create

### Backend API Endpoints (`backend/src/routes/admin.ts`)

**New Endpoints to Implement:**
- `POST /admin/users` - Create new user
- `DELETE /admin/users/:id` - Delete user
- `POST /admin/schools` - Create new school  
- `PUT /admin/schools/:id` - Update school
- `DELETE /admin/schools/:id` - Delete school
- `GET /admin/teachers` - List teachers with filters
- `POST /admin/teachers` - Create new teacher
- `PUT /admin/teachers/:id` - Update teacher
- `DELETE /admin/teachers/:id` - Delete teacher
- `POST /admin/teachers/:id/assign-school` - Assign teacher to school
- `DELETE /admin/teachers/:id/unassign-school` - Remove teacher from school

**Existing Endpoints to Enhance:**
- `GET /admin/users` - Add more filtering options
- `PUT /admin/users/:id` - Add more updateable fields
- `GET /admin/schools` - Add detailed information and relationships

### Backend Models

**Files to Modify:**
- `backend/src/models/User.ts` - Add admin-specific user creation methods
- `backend/src/models/School.ts` - Create school model if doesn't exist
- `backend/src/types/database.ts` - Add admin-specific request/response types

**New Types to Add:**
```typescript
export interface AdminCreateUserRequest extends CreateUserRequest {
  role: 'platform_admin' | 'school_admin' | 'teacher_school' | 'teacher_individual';
  school_id?: string;
  credits_balance?: number;
  is_active?: boolean;
}

export interface AdminUpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  school_id?: string;
  is_active?: boolean;
  credits_balance?: number;
}

export interface AdminCreateSchoolRequest {
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
}

export interface AdminUpdateSchoolRequest extends Partial<AdminCreateSchoolRequest> {
  is_active?: boolean;
}
```

### Frontend Pages

**New Pages to Create:**
- `frontend/src/pages/admin/UserCreatePage.tsx` - Create new user form
- `frontend/src/pages/admin/UserEditPage.tsx` - Edit user details form  
- `frontend/src/pages/admin/SchoolCreatePage.tsx` - Create new school form
- `frontend/src/pages/admin/SchoolEditPage.tsx` - Edit school details form
- `frontend/src/pages/admin/SchoolDetailPage.tsx` - Detailed school view with teachers
- `frontend/src/pages/admin/TeacherManagementPage.tsx` - Teacher management interface

**Existing Pages to Enhance:**
- `frontend/src/pages/admin/UserManagementPage.tsx` - Add create/edit/delete actions
- `frontend/src/pages/admin/SchoolsManagementPage.tsx` - Add CRUD operations
- `frontend/src/pages/admin/AdminDashboardPage.tsx` - Add quick action buttons

### Frontend Components

**New Components to Create:**
- `frontend/src/components/admin/UserForm.tsx` - Reusable user create/edit form
- `frontend/src/components/admin/SchoolForm.tsx` - Reusable school create/edit form
- `frontend/src/components/admin/TeacherForm.tsx` - Teacher-specific form component
- `frontend/src/components/admin/DeleteConfirmDialog.tsx` - Delete confirmation modal
- `frontend/src/components/admin/BulkActionsToolbar.tsx` - Bulk operations component
- `frontend/src/components/admin/EntityDetailsCard.tsx` - Detailed entity view component

**Existing Components to Enhance:**
- `frontend/src/components/admin/AdminSidebar.tsx` - Navigation already includes needed routes
- Update existing table components with CRUD action buttons

### Database Schema

**No schema changes required** - existing tables support all needed operations:
- `users` table has all required fields
- `schools` table has all required fields  
- Existing constraints and indexes support the operations

### API Client

**Files to Modify:**
- `frontend/src/services/apiClient.ts` - Add admin-specific API methods if needed

## Implementation Algorithm

### User CRUD Operations

**Create User Flow:**
1. Admin navigates to Users page and clicks "Create User"
2. UserCreatePage renders UserForm component
3. Form validates user input (email uniqueness, role-school consistency)
4. POST request to `/admin/users` with AdminCreateUserRequest payload
5. Backend validates data and role permissions
6. User created in database with appropriate role and school assignment
7. Success response redirects to user list or user detail view

**Update User Flow:**
1. Admin clicks edit button on user row or navigates to user detail page
2. UserEditPage pre-populates UserForm with existing user data
3. Form allows modification of role, school assignment, status, and profile fields
4. PUT request to `/admin/users/:id` with AdminUpdateUserRequest payload
5. Backend validates changes and role consistency
6. Database updated with new values
7. Success response shows updated user information

**Delete User Flow:**
1. Admin clicks delete button on user row
2. DeleteConfirmDialog shows impact assessment (assigned schools, created content, etc.)
3. Confirmation triggers DELETE request to `/admin/users/:id`
4. Backend performs soft delete or hard delete based on data dependencies
5. User removed from system and associated data handled appropriately

### School CRUD Operations

**Create School Flow:**
1. Admin navigates to Schools page and clicks "Create School"
2. SchoolCreatePage renders SchoolForm component
3. Form collects school details and optional admin user creation
4. POST request to `/admin/schools` with AdminCreateSchoolRequest payload
5. Backend creates school and optionally creates associated admin user
6. School appears in schools list with proper navigation links

**Update School Flow:**
1. Admin accesses school detail page or edit form
2. SchoolEditPage allows modification of school information and status
3. PUT request to `/admin/schools/:id` updates school data
4. Changes reflected across all associated users and content

**Delete School Flow:**
1. Admin triggers delete action from school management page
2. System checks for dependencies (users, content, subscriptions)
3. DeleteConfirmDialog shows impact and offers data migration options
4. Confirmation executes DELETE request with dependency handling
5. School and associated data managed according to retention policies

### Teacher Management Operations

**Teacher Listing:**
1. GET `/admin/teachers` endpoint filters users with teacher roles
2. Enhanced filtering by school, status, and teaching subjects
3. Bulk operations for role changes and school assignments

**Teacher-School Assignment:**
1. Teacher assignment form allows multiple school selection
2. POST `/admin/teachers/:id/assign-school` creates school relationship
3. Role automatically updated to `teacher_school` when assigned
4. DELETE `/admin/teachers/:id/unassign-school` removes school relationship

## Implementation Phases

### Phase 1: Backend API Enhancement
- Implement missing CRUD endpoints in `admin.ts`
- Add validation and error handling for all operations
- Create admin-specific request/response types
- Add comprehensive input validation and business logic
- Implement soft delete functionality where appropriate
- Add audit logging for all admin operations

### Phase 2: Frontend Form Components
- Create reusable form components for Users, Schools, Teachers
- Implement form validation and error display
- Add proper TypeScript interfaces for form data
- Create delete confirmation dialogs with impact assessment
- Implement responsive design for mobile and tablet views

### Phase 3: Page Implementation
- Create dedicated CRUD pages for each entity type
- Enhance existing management pages with create/edit/delete actions
- Add navigation between list views and detail views
- Implement proper breadcrumb navigation
- Add loading states and error handling

### Phase 4: Integration and Enhancement
- Connect frontend components to backend APIs
- Add bulk operations functionality
- Implement advanced filtering and search capabilities
- Add export functionality for entity lists
- Implement proper error handling and user feedback
- Add confirmation dialogs and undo functionality where appropriate

### Phase 5: Testing and Optimization
- Add comprehensive error handling and edge case management
- Implement proper access control and permission checks
- Add API rate limiting for admin operations
- Optimize database queries for large datasets
- Add caching for frequently accessed data
- Implement proper logging and monitoring
