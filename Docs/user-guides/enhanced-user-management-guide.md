# Enhanced User Management - User Guide

## Overview

The Enhanced User Management system provides comprehensive tools for managing users in the EduAI-Asistent platform. This guide covers all the new features and improvements implemented in the latest version.

## Table of Contents

1. [Getting Started](#getting-started)
2. [User List and Navigation](#user-list-and-navigation)
3. [Advanced Sorting](#advanced-sorting)
4. [Enhanced Filtering](#enhanced-filtering)
5. [Bulk Operations](#bulk-operations)
6. [User Profile Management](#user-profile-management)
7. [Search Functionality](#search-functionality)
8. [Mobile and Responsive Design](#mobile-and-responsive-design)
9. [Performance Features](#performance-features)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### Accessing User Management

1. **Login** to the admin dashboard with your administrator credentials
2. **Navigate** to the user management section via:
   - Main navigation menu → "Uživatelé"
   - Direct URL: `/admin/users`
3. **Wait** for the user list to load (you'll see a loading skeleton)

### Interface Overview

The user management interface consists of several key components:

- **Header Bar**: Contains page title, user count, and main action buttons
- **Filter Section**: Basic and enhanced filtering options
- **User Table**: Sortable table with user information
- **Pagination**: Navigation controls for large datasets
- **Bulk Actions Bar**: Appears when users are selected

## User List and Navigation

### Understanding the User Table

The user table displays the following columns:

| Column | Description | Sortable |
|--------|-------------|----------|
| **Checkbox** | Select users for bulk operations | No |
| **Jméno** | User's full name | Yes |
| **Email** | User's email address | Yes |
| **Role** | User's role with color-coded badge | Yes |
| **Škola** | Associated school (if any) | Yes |
| **Kredity** | Current credit balance | Yes |
| **Status** | Account status (Active/Inactive) | Yes |
| **Registrován** | Registration date | Yes |
| **Akce** | Action buttons (View, Edit, Delete) | No |

### User Status Indicators

Users are displayed with color-coded status badges:

- 🟢 **Aktivní** (Green) - Active user account
- 🔴 **Neaktivní** (Red) - Inactive user account
- 🟡 **Pozastaveno** (Yellow) - Suspended account
- 🟠 **Čekající ověření** (Orange) - Pending email verification

### Role Indicators

User roles are displayed with distinct colors:

- 🔴 **Platform Admin** - System administrators
- 🔵 **Správce školy** - School administrators  
- 🟢 **Učitel školy** - School-affiliated teachers
- 🟣 **Individuální učitel** - Independent teachers

## Advanced Sorting

### How to Sort Users

1. **Click** on any column header to sort by that field
2. **Click again** to reverse the sort direction
3. **Look for** the sort indicator (▲ for ascending, ▼ for descending)

### Available Sort Fields

- **Jméno** - Alphabetical by first name
- **Email** - Alphabetical by email address
- **Role** - Grouped by role type
- **Škola** - Alphabetical by school name
- **Kredity** - Numerical by credit balance
- **Status** - Grouped by status (Active first)
- **Registrován** - Chronological by registration date

### Sort Persistence

- Sort preferences are **saved in the URL**
- **Share** sorted views by copying the URL
- Sort settings **persist** when navigating back to the page

## Enhanced Filtering

### Switching Filter Modes

The system offers two filtering modes:

#### Basic Filters (Default)
- **Simple interface** with essential filters
- **Quick access** to common filtering options
- **Suitable** for everyday tasks

#### Enhanced Filters (Advanced)
- **Comprehensive filtering** options
- **Multiple criteria** can be combined
- **Filter presets** can be saved and loaded

**To switch modes:**
1. Click **"Rozšířené filtry"** to enable advanced mode
2. Click **"Základní filtry"** to return to simple mode

### Basic Filter Options

- **Search**: Find users by name or email
- **Role**: Filter by user role
- **School**: Filter by associated school
- **Status**: Filter by account status

### Enhanced Filter Options

#### User Role Filters
- **Platform Admin** - System administrators only
- **School Admin** - School administrators only
- **Teacher School** - School-affiliated teachers only
- **Teacher Individual** - Independent teachers only

#### Activity-Based Filters
- **Last Login**:
  - Last 7 days
  - Last 30 days
  - Last 90 days
  - Never logged in

#### Credit-Based Filters
- **Low Credits** - Users with less than 10 credits
- **Medium Credits** - Users with 10-100 credits
- **High Credits** - Users with more than 100 credits

#### Registration Date Filters
- **This Week** - Users registered in the last 7 days
- **This Month** - Users registered in the last 30 days
- **Last 3 Months** - Users registered in the last 90 days

#### School Association Filters
- **Individual Only** - Users not associated with any school
- **School Only** - Users associated with a school

#### Account Status Filters
- **Active** - Currently active accounts
- **Inactive** - Deactivated accounts
- **Suspended** - Temporarily suspended accounts
- **Pending Verification** - Accounts awaiting email verification

### Filter Presets

#### Saving Filter Presets
1. **Configure** your desired filters
2. **Enter** a name in the "Název filtru" field
3. **Click** "Uložit filtr"
4. **Preset** appears in the saved filters dropdown

#### Loading Filter Presets
1. **Select** a preset from the "Uložené filtry" dropdown
2. **Filters** are automatically applied
3. **Click** "Použít filtry" to execute the search

#### Managing Presets
- **Delete** presets using the "Smazat" button next to each preset
- **Modify** existing presets by loading, changing, and saving with the same name

### Filter Persistence

- **URL Parameters** - Filters are saved in the browser URL
- **Local Storage** - Filter presets are saved locally
- **Session Persistence** - Filters remain active during your session

## Bulk Operations

### Selecting Users

#### Individual Selection
- **Click** the checkbox next to each user you want to select
- **Selected count** appears in the bulk actions bar

#### Select All
- **Click** the header checkbox to select all visible users
- **Note**: Only selects users on the current page

### Available Bulk Actions

#### Activate Users
- **Purpose**: Activate multiple inactive user accounts
- **Confirmation**: Shows list of users to be activated
- **Result**: Users can log in and use the platform

#### Deactivate Users  
- **Purpose**: Deactivate multiple user accounts
- **Confirmation**: Shows warning about access removal
- **Result**: Users cannot log in until reactivated

#### Add Credits
- **Purpose**: Add credits to multiple user accounts
- **Input Required**: Number of credits to add
- **Confirmation**: Shows total credits to be distributed
- **Result**: Credit balances are increased

#### Deduct Credits
- **Purpose**: Remove credits from multiple user accounts
- **Input Required**: Number of credits to deduct
- **Confirmation**: Shows potential negative balances
- **Result**: Credit balances are decreased

#### Delete Users
- **Purpose**: Soft delete multiple user accounts
- **Confirmation**: Strong warning with user list
- **Result**: Users are marked as deleted (recoverable)

### Bulk Operation Process

1. **Select** users using checkboxes
2. **Choose** action from the bulk actions bar
3. **Review** the confirmation dialog
4. **Enter** additional data if required (e.g., credit amount)
5. **Click** "Potvrdit" to execute
6. **Wait** for completion notification
7. **Review** results summary

### Bulk Operation Safety

- **Confirmation Required** - All bulk operations require explicit confirmation
- **User List Display** - See exactly which users will be affected
- **Reversible Actions** - Most actions can be undone if needed
- **Error Handling** - Failed operations are reported individually

## User Profile Management

### Accessing User Profiles

#### From User List
1. **Click** the "Upravit" button in the user row
2. **Navigate** to the detailed profile page

#### Direct URL
- Access via `/admin/users/{user-id}/profile`

### Profile Page Sections

#### User Information Card
- **Header** with gradient background and user avatar
- **Basic Info** - Name, email, role, status
- **Quick Actions** - Edit, notifications, status changes

#### Quick Edit Mode
1. **Click** "Rychlá úprava" in the profile header
2. **Modify** basic information inline
3. **Real-time validation** shows errors immediately
4. **Click** "Uložit" to save changes
5. **Click** "Zrušit" to discard changes

#### Activity Statistics
- **Usage Metrics** - Sessions, credits used, activity score
- **Visual Charts** - Activity over time
- **Performance Indicators** - Color-coded metrics

#### Activity Log
- **Recent Activities** - Chronological list of user actions
- **Filtering Options** - Filter by activity type and date
- **Export Capability** - Download activity data

### Profile Editing Features

#### Quick Edit Validation
- **Real-time Feedback** - Errors shown as you type
- **Field Validation**:
  - Name fields cannot be empty
  - Email must be valid format
  - Credits cannot be negative
- **Save States** - Loading indicator during save

#### Detailed Edit Mode
- **Full Form** - Access to all user properties
- **Advanced Options** - Role changes, school assignments
- **Audit Trail** - Track all changes made

## Search Functionality

### Basic Search
- **Location**: Search box at the top of the user list
- **Scope**: Searches in user names and email addresses
- **Real-time**: Results update as you type (with debouncing)

### Search Tips
- **Partial Matches** - Search for part of a name or email
- **Case Insensitive** - Capitalization doesn't matter
- **Multiple Terms** - Separate terms with spaces
- **Email Domains** - Search by email domain (e.g., "@gmail.com")

### Search Performance
- **Debounced Input** - Reduces server requests while typing
- **Cached Results** - Repeated searches are faster
- **Highlighted Results** - Search terms are highlighted in results

## Mobile and Responsive Design

### Mobile Features
- **Touch-Friendly** - Large touch targets for mobile devices
- **Responsive Tables** - Tables adapt to small screens
- **Mobile Navigation** - Simplified navigation for mobile
- **Swipe Actions** - Swipe gestures for common actions

### Tablet Optimization
- **Grid Layouts** - Optimized for tablet screen sizes
- **Touch Interactions** - Designed for touch input
- **Landscape Mode** - Full functionality in landscape orientation

### Desktop Features
- **Keyboard Shortcuts** - Efficient keyboard navigation
- **Multi-Column Layouts** - Take advantage of large screens
- **Hover States** - Rich hover interactions

## Performance Features

### Loading States
- **Skeleton Screens** - Show content structure while loading
- **Progressive Loading** - Load critical content first
- **Smooth Transitions** - Animated transitions between states

### Caching
- **Client-Side Caching** - Reduce server requests
- **Smart Invalidation** - Update cache when data changes
- **Offline Support** - Basic functionality when offline

### Optimization
- **Virtual Scrolling** - Handle large datasets efficiently
- **Lazy Loading** - Load content as needed
- **Debounced Inputs** - Reduce unnecessary API calls

## Troubleshooting

### Common Issues

#### Users Not Loading
**Symptoms**: Empty user list or loading spinner doesn't disappear
**Solutions**:
1. **Refresh** the page
2. **Check** your internet connection
3. **Clear** browser cache
4. **Contact** support if issue persists

#### Filters Not Working
**Symptoms**: Filters don't affect the user list
**Solutions**:
1. **Click** "Použít filtry" after setting filters
2. **Clear** all filters and try again
3. **Switch** between basic and enhanced filter modes
4. **Check** if you have permission to view filtered users

#### Bulk Operations Failing
**Symptoms**: Bulk operations don't complete or show errors
**Solutions**:
1. **Reduce** the number of selected users
2. **Check** that you have permission for the operation
3. **Verify** that selected users are in the correct state
4. **Try** the operation on individual users first

#### Profile Page Not Loading
**Symptoms**: User profile page shows error or doesn't load
**Solutions**:
1. **Verify** the user ID in the URL
2. **Check** that the user exists and you have permission
3. **Try** accessing from the user list instead of direct URL
4. **Clear** browser cache and cookies

### Performance Issues

#### Slow Loading
**Causes**: Large datasets, slow network, server issues
**Solutions**:
1. **Use filters** to reduce the dataset size
2. **Reduce** the page size (items per page)
3. **Check** your network connection
4. **Contact** support for server issues

#### Browser Compatibility
**Supported Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Unsupported Features**:
- Internet Explorer (not supported)
- Very old mobile browsers

### Getting Help

#### Documentation
- **API Documentation** - Technical details for developers
- **Feature Guides** - Detailed guides for specific features
- **Video Tutorials** - Visual guides for common tasks

#### Support Channels
- **Help Desk** - Submit support tickets
- **Live Chat** - Real-time support during business hours
- **Knowledge Base** - Searchable help articles
- **Community Forum** - User community discussions

#### Reporting Issues
When reporting issues, please include:
1. **Browser** and version
2. **Steps** to reproduce the issue
3. **Screenshots** or screen recordings
4. **Error messages** (if any)
5. **User account** information (if relevant)

## Best Practices

### User Management
- **Regular Reviews** - Periodically review user accounts
- **Bulk Operations** - Use bulk operations for efficiency
- **Filter Presets** - Save commonly used filter combinations
- **Activity Monitoring** - Monitor user activity regularly

### Performance
- **Use Filters** - Filter large datasets for better performance
- **Pagination** - Use appropriate page sizes
- **Cache Awareness** - Understand when data is cached
- **Mobile Optimization** - Consider mobile users

### Security
- **Regular Audits** - Review user permissions regularly
- **Activity Monitoring** - Watch for suspicious activity
- **Access Control** - Ensure proper role assignments
- **Data Protection** - Handle user data responsibly

## Conclusion

The Enhanced User Management system provides powerful tools for efficiently managing users in the EduAI-Asistent platform. With advanced filtering, sorting, bulk operations, and responsive design, administrators can effectively handle user accounts at scale while maintaining a smooth user experience.

For additional help or feature requests, please contact our support team or refer to the technical documentation.
