# Parvah - Civic Issue Tracking Platform

## Project Overview

Parvah is a comprehensive civic issue tracking and management platform that connects citizens, administrators, and staff members. The platform enables efficient reporting, management, and resolution of civic issues.

## Project Structure

### App Routes

#### Public Pages
- **`/`** - Landing page with feature overview and quick access to all portals

#### Admin Portal
- **`/admin/login`** - Admin login and registration page (separate from user login)
- **`/admin/dashboard`** - Main admin dashboard with:
  - Organization selector
  - Action cards (Create Organization, Add Admin, Add Staff)
  - Quick statistics
  - Modals for managing organizations, admins, and staff
- **`/admin/organization/[orgId]/kanban`** - Kanban board for issue management with 4 columns:
  - Open (red)
  - In Progress (yellow)
  - Resolved (blue)
  - Closed (green)

#### User (Citizen) Portal
- **`/login`** - User login and registration page (separate from admin login)
- **`/user/dashboard`** - User dashboard with:
  - Dashboard with issue statistics
  - Issue reporting form (modal)
  - Issue list with filtering by status
  - Issue detail view
  - Real-time status tracking

#### Staff Portal
- **`/staff/register`** - Staff registration page
- **`/staff/dashboard`** - Staff dashboard with:
  - List of assigned issues
  - Status update functionality
  - Progress notes
  - Priority indicators
  - Completion tracking

### Component Structure

#### Admin Components
- **`components/admin/AdminHeader.tsx`** - Header for admin pages
- **`components/admin/ActionCard.tsx`** - Card component for admin actions
- **`components/admin/modals/`**
  - `OrganizationModal.tsx` - Create new organization
  - `AddAdminModal.tsx` - Add admin user
  - `AddStaffModal.tsx` - Add staff member

#### Kanban Components
- **`components/kanban/KanbanColumn.tsx`** - Kanban column container
- **`components/kanban/KanbanCard.tsx`** - Individual issue card
- **`components/kanban/IssueDetailModal.tsx`** - Issue details popup
- **`components/kanban/AssignStaffModal.tsx`** - Assign staff to issue

#### User Components
- **`components/user/UserHeader.tsx`** - Header for user pages
- **`components/user/IssueListItem.tsx`** - Issue card in list view
- **`components/user/modals/`**
  - `ReportIssueModal.tsx` - Report new issue form
  - `IssueDetailViewModal.tsx` - View issue details

#### Staff Components
- **`components/staff/StaffHeader.tsx`** - Header for staff pages
- **`components/staff/AssignedIssueCard.tsx`** - Assigned issue card
- **`components/staff/modals/`**
  - `UpdateStatusModal.tsx` - Update issue status form

### Configuration Files
- **`app/layout.tsx`** - Root layout with metadata for Parvah
- **`app/globals.css`** - Global styles with teal/aqua color theme
- **`tailwind.config.ts`** - Tailwind CSS configuration
- **`tsconfig.json`** - TypeScript configuration
- **`next.config.mjs`** - Next.js configuration

## Key Features

### Admin Features
- ✅ Separate admin login/registration (no redirect from user login)
- ✅ Organization management (create, view, select)
- ✅ Admin user management
- ✅ Staff member management with registration codes
- ✅ Kanban board for issue tracking with 4 columns
- ✅ Issue assignment to staff members
- ✅ Issue detail viewing

### User Features
- ✅ Separate user login/registration (no redirect from admin login)
- ✅ Report civic issues with detailed information
- ✅ View all reported issues
- ✅ Filter issues by status (Open, In Progress, Resolved, Closed)
- ✅ Track issue progress in real-time
- ✅ View issue details and status updates

### Staff Features
- ✅ Staff registration with staff code
- ✅ View assigned issues
- ✅ Update issue status (Pending → In Progress → Completed)
- ✅ Add progress notes
- ✅ Filter issues by status
- ✅ Priority-based alerts

## Theme & Styling

### Color Palette
- **Primary**: Teal (#45 0.15 199)
- **Secondary**: Aqua (#50 0.12 192)
- **Accent**: Cyan (#50 0.15 195)
- **Background**: Bright white
- **Status Colors**:
  - Open: Red
  - In Progress: Yellow
  - Resolved: Blue
  - Closed: Green

### Typography
- **Font Family**: Geist (sans-serif)
- **Monospace**: Geist Mono
- **Responsive**: Mobile-first design

## Navigation Flow

### Admin Flow
1. Land on `/admin/login`
2. Login/Register → Redirects to `/admin/dashboard`
3. Select organization or create new one
4. Choose action: Create Org, Add Admin, or Add Staff
5. View Kanban board at `/admin/organization/[orgId]/kanban`
6. Manage issues (view, assign, move between columns)

### User Flow
1. Land on `/login` (separate from admin)
2. Login/Register → Redirects to `/user/dashboard`
3. View issues or report new one
4. Filter by status
5. Click issue to view details and track progress

### Staff Flow
1. Register at `/staff/register` with staff code
2. Access `/staff/dashboard`
3. View assigned issues
4. Click "Update Status" to change issue status
5. Add progress notes
6. Mark issue as completed

## Development Notes

### Mock Data
All data is managed with React state (useState). No backend/database integration - purely frontend implementation.

### Form Validation
- Basic validation in forms
- Error messages displayed to users
- No password hashing (frontend only)

### Responsive Design
- Mobile-first approach
- Tailwind CSS for responsive classes
- Adaptive layouts for all screen sizes

## Future Enhancements

When backend integration is added:
- Connect to actual database for persistent storage
- Implement authentication with JWT or sessions
- Add real-time updates with WebSockets
- Implement file upload for issue images
- Add email notifications
- Implement search and advanced filtering
- Add analytics and reporting

## Testing the Platform

1. **Admin Portal**: Visit `/admin/login` to register/login as admin
2. **User Portal**: Visit `/login` to register/login as citizen
3. **Staff Portal**: Visit `/staff/register` to register as staff member
4. **Kanban Board**: From admin dashboard, click "View Kanban Board" to manage issues
5. **Issue Reporting**: From user dashboard, click "Report New Issue"
6. **Status Updates**: From staff dashboard, click "Update Status" on any issue

All flows work completely on the frontend with mock data!
