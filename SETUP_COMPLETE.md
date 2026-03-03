# Shortsy Admin Dashboard - Setup Complete ✅

## Overview
The Shortsy Admin Dashboard has been set up with authentication and a Users management section.

## Features Implemented

### 🔐 Authentication
- **Login Page**: Email/password authentication using Shortsy backend API
- **Protected Routes**: All admin pages require authentication
- **Token Management**: Access and refresh tokens stored in localStorage
- **Auto-redirect**: Unauthenticated users redirected to login page
- **Logout**: Logout button in header dropdown

### 👥 Users Management
- **User Listing**: Display all registered users from AWS Cognito
- **Search**: Search by email, name, or user ID
- **Pagination**: 10 users per page
- **User Details**:
  - Email & verification status
  - Display name
  - Account status (CONFIRMED, UNCONFIRMED, etc.)
  - Premium/Free subscription badge
  - Created at & Last login timestamps
- **Real-time Data**: Refresh button to reload users
- **Responsive Design**: Mobile-friendly table layout

### 🌐 Backend API
- **Endpoint**: `GET /v1/admin/users`
- **CORS Configured**: Works with localhost:3000, localhost:5173, and production domains
- **Authentication**: Requires JWT token from login
- **Data Source**: AWS Cognito User Pool with premium status enrichment

## Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+ (required by Vite)
- Access to Shortsy backend API

### Installation
```bash
cd shortsy-admin-dashboard
npm install
```

### Environment Setup
Create a `.env` file (already created):
```env
VITE_API_BASE_URL=https://2tngsao13b.execute-api.ap-south-1.amazonaws.com/v1
```

### Running the Dashboard
```bash
npm start
# Dashboard will open at http://localhost:5173
```

### Default Login
Use any user credentials from your Shortsy app to login as admin:
- Email: `your-email@example.com`
- Password: `your-password`

## File Structure

```
shortsy-admin-dashboard/
├── src/
│   ├── services/
│   │   └── api.js                    # API client with auth
│   ├── components/
│   │   ├── ProtectedRoute.js        # Route guard component
│   │   └── header/
│   │       └── AppHeaderDropdown.js  # User menu with logout
│   ├── views/
│   │   ├── users/
│   │   │   └── Users.js              # Users management page
│   │   └── pages/
│   │       └── login/
│   │           └── Login.js          # Login page
│   ├── App.js                        # Root with protected routes
│   ├── routes.js                     # Route configuration
│   └── _nav.js                       # Sidebar navigation
└── .env                              # Environment variables
```

## API Integration

### Authentication Flow
1. User enters email/password on login page
2. POST request to `/v1/auth/login`
3. Store `accessToken` and `refreshToken` in localStorage
4. All subsequent API calls include `Authorization: Bearer {accessToken}` header

### API Service Methods
```javascript
// services/api.js
import { fetchUsers, loginAdmin, logoutAdmin, isAuthenticated } from './services/api'

// Login
const response = await loginAdmin(email, password)

// Fetch users (requires auth)
const { users, count } = await fetchUsers()

// Check auth status
const authenticated = isAuthenticated()

// Logout
logoutAdmin()
```

## Navigation

### Available Routes
- `/login` - Login page (public)
- `/dashboard` - Dashboard (protected)
- `/users` - Users management (protected)
- All other CoreUI example pages (protected)

### Sidebar Menu
```
Dashboard
Shortsy Admin
  └─ Users
Theme
  ├─ Colors
  └─ Typography
...
```

## Backend Changes

### CORS Configuration
Updated `serverless.yml` with proper CORS settings:
```yaml
httpApi:
  cors:
    allowedOrigins:
      - http://localhost:3000
      - http://localhost:5173
      - https://admin.shortsy.app
    allowedHeaders:
      - Content-Type
      - Authorization
    allowedMethods:
      - GET
      - POST
      - PUT
      - PATCH
      - DELETE
      - OPTIONS
    allowCredentials: true
```

### New Endpoint
- **GET /v1/admin/users** - List all users
  - Handler: `src/handlers/users.listAllUsers`
  - Service: `src/services/user.service.listAllUsers()`
  - Returns: Array of users with premium status

## Next Steps

### Immediate
1. ✅ Login with your Shortsy credentials
2. ✅ Navigate to Users page
3. ✅ Test search and pagination

### Future Enhancements
- [ ] Add user detail view/edit
- [ ] Content management section
- [ ] Rentals & analytics dashboard
- [ ] Admin user roles and permissions
- [ ] Bulk user operations
- [ ] Export users to CSV
- [ ] Advanced filtering options

## Troubleshooting

### CORS Errors
If you see CORS errors, ensure:
1. Backend is deployed with latest CORS config
2. You're using correct API URL in `.env`
3. Browser cache is cleared

### 401 Unauthorized
- Login first at `/login`
- Check if token is stored: `localStorage.getItem('adminToken')`
- Token may have expired - logout and login again

### Node Version Error
```bash
# Upgrade Node.js to 20.19+ or 22.12+
nvm install 22
nvm use 22
```

## Security Notes

⚠️ **Important**:
- This is an admin dashboard - implement proper admin role checks in production
- Add role-based access control (RBAC)
- Use secure token storage
- Implement token refresh mechanism
- Add activity logging
- Use HTTPS in production

## Support

For issues or questions:
1. Check backend logs in AWS CloudWatch
2. Inspect browser console for errors
3. Verify API endpoint is accessible

---

**Status**: ✅ Ready for use
**Last Updated**: March 2, 2026
