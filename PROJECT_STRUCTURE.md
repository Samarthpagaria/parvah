# Parvah - Civic Issue Tracking Platform

## Project Overview

Parvah is a comprehensive civic issue tracking and management platform that connects citizens, administrators, and staff members. The platform enables efficient reporting, management, and resolution of civic issues using real-time dynamic data.

## Project Structure

### App Routes

#### Public Pages
- **`/`** - Landing page with feature overview and quick access to all portals
- **`/login`** - Citizen login portal
- **`/dashboard`** - Citizen dashboard (Real-time tracking, reporting)

#### Admin Portal
- **`/admin/login`** - Admin login and registration portal
- **`/admin/organizations`** - Multi-node management (Super Admin view / Personal orgs view)
- **`/admin/organizations/[orgId]/dashboard`** - Organization analytics hub
- **`/admin/organizations/[orgId]/kanban`** - Interactive Board for issue management
- **`/admin/organizations/[orgId]/members`** - Staff and admin membership management
- **`/admin/organizations/[orgId]/categories`** - Organization-specific category management
- **`/admin/organizations/[orgId]/settings`** - Organization profile settings

#### User (Citizen) Portal
- **`/dashboard`** - Dynamic dashboard with:
  - Personal issue statistics
  - Live issue list with status filtering
  - Detailed issue tracking and commenting

#### Staff Portal
- **`/staff/register`** - Staff registration portal
- **`/admin/organizations/[orgId]/kanban`** - Staff members use the interactive board for issue resolution

### Component Structure

#### Core Components
- **`components/admin/OrgSidebar.tsx`** - Sidebar navigation for organization context
- **`components/admin/OrgAssistant.tsx`** - Context-aware AI assistant
- **`utils/backend_api_endpoints.js`** - Centralized API utility for backend communication

#### Shared UI
- **`components/ui/`** - Base UI components (Button, Card, Input, etc.)

## Data Management

### Backend Integration
- **Database**: Supabase (PostgreSQL)
- **Server**: Express.js
- **API**: RESTful endpoints authenticated via JWT
- **Real-time**: Leverages Supabase real-time capabilities and direct backend queries

### Authentication
- Role-based access control (RBAC): Super Admin, Owner, Edit, Staff, Public User
- Multi-tenant isolation for organizations

## Key Features

### Admin & Organization Management
- ✅ Multi-organization oversight
- ✅ Real-time analytics and performance trends
- ✅ Role-based membership and invitations
- ✅ Interactive Kanban Board for rapid issue resolution
- ✅ Organization-specific category and settings management

### Citizen Engagement
- ✅ Dynamic issue reporting with location and category data
- ✅ Status tracking with automated activity logs
- ✅ Direct engagement via comments and updates
- ✅ Personal dashboard for historical reporting

### AI Intelligence
- ✅ Context-aware AI Assistant in the admin portal
- ✅ Real-time data synthesis for organizational health checks

## Navigation Flow

### Admin Flow
1. Land on `/admin/login`
2. Redirects to `/admin/organizations`
3. Enter specific organization context (Dashboard/Board)
4. Manage personnel, categories, and issue lifecycle

### Citizen Flow
1. Login/Register at `/login`
2. Land on `/dashboard`
3. View active reports or submit new issues via `/dashboard/new-issue`
4. Track resolve progress in real-time

---

*Note: This documentation reflects the transition from mock-up to a fully functional, backend-driven platform as of March 2026.*
