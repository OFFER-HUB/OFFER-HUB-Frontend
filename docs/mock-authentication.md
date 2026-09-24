# Mock Authentication Flow

## Overview

This document explains the mock authentication system used in the OfferHub frontend for development purposes. The authentication flow simulates a real backend authentication system without requiring an actual API.

## Architecture

### Components

1. **Auth Store** (`src/stores/auth-store.ts`)
   - Zustand store with cookie persistence
   - Manages user state and authentication status
   - Stores non-sensitive user info (id, email, username)

2. **Middleware** (`src/middleware.ts`)
   - Protects `/app/*` routes (requires authentication)
   - Redirects authenticated users away from auth pages
   - Handles redirect query parameters for post-login navigation

3. **Auth Pages**
   - **Login** (`src/app/login/page.tsx`)
   - **Register** (`src/app/register/page.tsx`)

## Authentication Flow

### Login Flow

1. User navigates to `/login`
2. User enters email and password (any valid format accepted)
3. Form validation occurs
4. Mock API call simulated (1.5s delay)
5. Mock user object created:
   ```typescript
   {
     id: "1",
     email: "user@example.com",
     username: "user" // extracted from email
   }
   ```
6. `login(mockUser)` updates Zustand store
7. Auth state persisted to `auth-state` cookie
8. 100ms delay ensures cookie is written
9. Page redirects to `/app/dashboard` (or redirect parameter if present)

### Register Flow

1. User navigates to `/register`
2. User enters email, username, password, and confirm password
3. Form validation occurs (password requirements, matching passwords)
4. Mock API call simulated (1.5s delay)
5. Success animation displayed
6. Mock user object created with provided details
7. `login(mockUser)` auto-authenticates the user
8. Auth state persisted to `auth-state` cookie
9. 100ms delay ensures cookie is written
10. After 1.5s animation, redirects to `/app/dashboard`

### Logout Flow

1. User clicks logout button in navbar/header
2. `logout()` called from auth store
3. Server API endpoint `/api/auth/token` called to clear httpOnly cookies
4. Client-side auth state cleared from Zustand store
5. `auth-state` cookie removed
6. Page redirects to `/` (home page)

## Cookie Storage

### Auth State Cookie

- **Name**: `auth-state`
- **Content**: JSON-encoded auth state
- **Expiry**: 7 days
- **SameSite**: Lax
- **Structure**:
  ```json
  {
    "state": {
      "user": {
        "id": "1",
        "email": "user@example.com",
        "username": "user"
      },
      "isAuthenticated": true
    },
    "version": 0
  }
  ```

### Security Notes

⚠️ **For Development Only**: This mock authentication is NOT secure and should never be used in production.

- No password validation or hashing
- No token-based authentication
- No session management
- Any email/password combination is accepted
- Auth state stored in client-accessible cookies

## Protected Routes

### Private Routes (Require Authentication)

All routes under `/app/*`:
- `/app/dashboard`
- `/app/client/*`
- `/app/freelancer/*`
- `/app/messages/*`
- `/app/profile/*`
- `/app/settings/*`
- etc.

### Public Routes

- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/marketplace` - Public marketplace
- `/faq` - FAQ page
- `/help` - Help page
- `/terms` - Terms of service
- `/privacy` - Privacy policy

### Auth Route Behavior

When authenticated:
- Accessing `/login` or `/register` → Redirected to `/app/dashboard`

When not authenticated:
- Accessing `/app/*` → Redirected to `/login?redirect=/app/...`

## Edge Cases Handled

### Page Refresh
- Auth state persists via `auth-state` cookie
- Middleware checks cookie on every navigation
- User remains authenticated after refresh

### Direct URL Access
- Unauthenticated access to `/app/*` → Redirected to login
- Redirect parameter captured for post-login navigation
- Example: `/app/profile` → `/login?redirect=/app/profile`

### Redirect After Login
- URL parameter `redirect` captured in login page
- After successful login, user redirected to intended destination
- Default redirect: `/app/dashboard`

### Already Authenticated
- Accessing `/login` or `/register` while authenticated
- Middleware redirects to `/app/dashboard`
- Prevents unnecessary re-authentication

## Testing the Flow

### Test Login

1. Navigate to home page `/`
2. Click "Login" button
3. Enter any email (e.g., `test@example.com`)
4. Enter any password
5. Click "Sign in"
6. Should redirect to `/app/dashboard`
7. User menu should show username "test"

### Test Register

1. Navigate to home page `/`
2. Click "Register" button
3. Fill in all fields:
   - Email: `newuser@example.com`
   - Username: `newuser`
   - Password: `password123` (min 8 chars)
   - Confirm password: `password123`
4. Click "Create account"
5. Success animation shown
6. Should auto-login and redirect to `/app/dashboard`
7. User menu should show username "newuser"

### Test Logout

1. While authenticated, click user avatar/menu
2. Click "Logout" option
3. Should redirect to home page `/`
4. "Login" and "Register" buttons should be visible again

### Test Protected Routes

1. Log out if authenticated
2. Try to access `/app/dashboard` directly
3. Should redirect to `/login?redirect=/app/dashboard`
4. After login, should redirect back to `/app/dashboard`

### Test Page Refresh

1. Log in successfully
2. Refresh the page
3. Should remain authenticated
4. User state should persist

## Code Examples

### Using Auth Store in Components

```tsx
import { useAuthStore } from '@/stores/auth-store';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.username}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Manual Login (for testing)

```tsx
// In any component
const login = useAuthStore((state) => state.login);

const mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'test'
};

login(mockUser);
```

### Check Auth Status

```tsx
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
const user = useAuthStore((state) => state.user);

console.log('Authenticated:', isAuthenticated);
console.log('User:', user);
```

## Migration to Real Authentication

When integrating with a real backend, update the following:

1. **Login Page**: Replace mock API call with real API endpoint
2. **Register Page**: Replace mock API call with real registration endpoint
3. **Auth Store**: Update login/logout functions to call real API
4. **Middleware**: Verify JWT tokens instead of reading cookie state
5. **Cookie Storage**: Use httpOnly cookies for tokens (handled server-side)
6. **Token Refresh**: Implement token refresh logic
7. **Error Handling**: Add proper error handling for network failures
8. **Validation**: Add server-side validation feedback

## Troubleshooting

### Login doesn't redirect to dashboard

**Possible causes:**
- Cookie not being set properly
- Middleware not reading cookie correctly
- JavaScript disabled in browser

**Solution:**
- Check browser console for errors
- Verify `auth-state` cookie is set in DevTools → Application → Cookies
- Ensure 100ms delay is present before redirect

### Auth state lost on refresh

**Possible causes:**
- Cookie expired or deleted
- Browser privacy settings blocking cookies
- Cookie domain mismatch

**Solution:**
- Check cookie expiry (default 7 days)
- Verify browser allows cookies
- Check cookie settings in `src/lib/cookies.ts`

### Middleware not protecting routes

**Possible causes:**
- Route not matching middleware config
- Cookie not accessible to middleware
- Middleware config issue

**Solution:**
- Verify route matches pattern in middleware config
- Check cookie is set and accessible
- Review middleware matcher in `src/middleware.ts`

## Related Files

- Auth Store: [src/stores/auth-store.ts](../src/stores/auth-store.ts)
- Middleware: [src/middleware.ts](../src/middleware.ts)
- Login Page: [src/app/login/page.tsx](../src/app/login/page.tsx)
- Register Page: [src/app/register/page.tsx](../src/app/register/page.tsx)
- Cookie Utils: [src/lib/cookies.ts](../src/lib/cookies.ts)
- Auth Types: [src/types/auth.types.ts](../src/types/auth.types.ts)

## See Also

- [Architecture Documentation](./architecture.md)
- [API Response Standards](./api-response-standard.md)
- [UI States Documentation](./ui-states.md)
