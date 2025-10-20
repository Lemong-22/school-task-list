# User Authentication - Technical Architecture

**Feature:** User Authentication
**Date:** 2025-10-20
**Status:** Planning Phase

---

## 1. System Overview

The User Authentication system provides secure registration, login, logout, and role-based access control for Students and Teachers using Supabase Auth as the authentication provider.

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Register    │  │    Login     │  │  Dashboard   │      │
│  │  Component   │  │  Component   │  │  Components  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  Auth Context  │                        │
│                    │  (Global State)│                        │
│                    └───────┬────────┘                        │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │   useAuth Hook │                        │
│                    │  (Custom Hook) │                        │
│                    └───────┬────────┘                        │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │ Supabase Client│                        │
│                    │   (SDK/API)    │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼────────────────────────────────┘
                             │
                             │ HTTPS
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    Supabase Backend                          │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auth API    │  │  auth.users  │  │   profiles   │      │
│  │  (GoTrue)    │  │   (Table)    │  │   (Table)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────────────────────────────────────────┘
```

## 3. Component Breakdown

### 3.1 Frontend Components

#### RegisterPage Component (`/src/pages/RegisterPage.tsx`)
**Responsibility:** Render registration form and handle user registration

**Props:** None

**State:**
- `fullName`: string
- `email`: string
- `password`: string
- `confirmPassword`: string
- `role`: 'student' | 'teacher'
- `error`: string | null
- `loading`: boolean

**Key Functions:**
- `handleSubmit()`: Validates form and calls `signUp` from useAuth hook
- `handleRoleChange()`: Updates role selection
- Form validation (email format, password match, required fields)

**Navigation:**
- Success → Redirect to `/login`
- User clicks "Already have an account?" → Navigate to `/login`

---

#### LoginPage Component (`/src/pages/LoginPage.tsx`)
**Responsibility:** Render login form and handle user authentication

**Props:** None

**State:**
- `email`: string
- `password`: string
- `error`: string | null
- `loading`: boolean

**Key Functions:**
- `handleSubmit()`: Validates form and calls `signIn` from useAuth hook
- Form validation (email format, required fields)

**Navigation:**
- Success (Student) → Redirect to `/dashboard/student`
- Success (Teacher) → Redirect to `/dashboard/teacher`
- User clicks "Don't have an account?" → Navigate to `/register`

---

#### ProtectedRoute Component (`/src/components/ProtectedRoute.tsx`)
**Responsibility:** Guard routes and ensure only authenticated users can access them

**Props:**
- `children`: ReactNode
- `allowedRole?`: 'student' | 'teacher' (optional)

**Logic:**
- Check if user is authenticated via Auth Context
- If not authenticated → Redirect to `/login`
- If authenticated but role doesn't match `allowedRole` → Redirect to appropriate dashboard
- If authenticated and role matches → Render children

---

#### StudentDashboard Component (`/src/pages/StudentDashboard.tsx`)
**Responsibility:** Display student-specific dashboard

**Features:**
- Welcome message with user's full name
- Logout button
- Placeholder for future task list (Phase 2)

---

#### TeacherDashboard Component (`/src/pages/TeacherDashboard.tsx`)
**Responsibility:** Display teacher-specific dashboard

**Features:**
- Welcome message with user's full name
- Logout button
- Placeholder for future task management (Phase 2)

---

### 3.2 Custom Hooks

#### useAuth Hook (`/src/hooks/useAuth.ts`)
**Responsibility:** Provide authentication functions and state to components

**Returns:**
```typescript
{
  user: User | null,
  role: 'student' | 'teacher' | null,
  loading: boolean,
  signUp: (email, password, fullName, role) => Promise<void>,
  signIn: (email, password) => Promise<void>,
  signOut: () => Promise<void>,
  isAuthenticated: boolean
}
```

**Key Functions:**
- `signUp()`: Creates new user with Supabase Auth and stores role in profile
- `signIn()`: Authenticates user and retrieves role from profile
- `signOut()`: Logs out user and clears session
- `getUserRole()`: Fetches user role from profiles table

---

### 3.3 Context API

#### AuthContext (`/src/contexts/AuthContext.tsx`)
**Responsibility:** Provide global authentication state

**State:**
- `user`: User object from Supabase (or null)
- `role`: 'student' | 'teacher' | null
- `loading`: boolean

**Provider:**
- Wraps entire application
- Listens to Supabase auth state changes
- Persists authentication across page refreshes

---

### 3.4 Routing Configuration

#### App Routes (`/src/App.tsx`)
```typescript
<Routes>
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/login" element={<LoginPage />} />
  
  <Route path="/dashboard/student" element={
    <ProtectedRoute allowedRole="student">
      <StudentDashboard />
    </ProtectedRoute>
  } />
  
  <Route path="/dashboard/teacher" element={
    <ProtectedRoute allowedRole="teacher">
      <TeacherDashboard />
    </ProtectedRoute>
  } />
  
  <Route path="/" element={<Navigate to="/login" />} />
  <Route path="*" element={<Navigate to="/login" />} />
</Routes>
```

---

## 4. Data Model

### 4.1 Supabase Auth Users Table (Built-in)
Managed by Supabase Auth, contains:
- `id`: UUID (Primary Key)
- `email`: string (unique)
- `encrypted_password`: string
- `email_confirmed_at`: timestamp
- `created_at`: timestamp
- `updated_at`: timestamp

### 4.2 Profiles Table (Custom)
**Table Name:** `profiles`

**Schema:**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## 5. Authentication Flow

### 5.1 Registration Flow
```
1. User fills registration form
2. Frontend validates:
   - All fields are filled
   - Email is valid format
   - Password and Confirm Password match
3. Call Supabase Auth signUp()
4. Supabase creates user in auth.users table
5. Frontend creates profile record with full_name and role
6. Redirect user to /login page
```

### 5.2 Login Flow
```
1. User fills login form
2. Frontend validates required fields
3. Call Supabase Auth signInWithPassword()
4. Supabase validates credentials
5. If valid:
   - Supabase returns user session
   - Frontend fetches user role from profiles table
   - Store user and role in Auth Context
   - Redirect based on role:
     * student → /dashboard/student
     * teacher → /dashboard/teacher
6. If invalid:
   - Display error message
```

### 5.3 Protected Route Access Flow
```
1. User navigates to protected route
2. ProtectedRoute component checks Auth Context
3. If not authenticated:
   - Redirect to /login
4. If authenticated but wrong role:
   - Redirect to correct dashboard
5. If authenticated and correct role:
   - Render protected component
```

### 5.4 Logout Flow
```
1. User clicks logout button
2. Call Supabase Auth signOut()
3. Clear Auth Context (user and role)
4. Redirect to /login page
```

---

## 6. Security Considerations

### 6.1 Password Security
- Passwords are hashed by Supabase Auth (bcrypt)
- Never stored in plain text
- Supabase enforces minimum password requirements

### 6.2 Session Management
- Sessions managed by Supabase (JWT tokens)
- Tokens stored in httpOnly cookies (or secure localStorage)
- Automatic token refresh handled by Supabase SDK

### 6.3 Route Protection
- All protected routes wrapped with ProtectedRoute component
- Authentication checked on both client and server (RLS policies)
- No protected content rendered before authentication check

### 6.4 Row Level Security (RLS)
- Profiles table has RLS enabled
- Users can only read/update their own profile
- Prevents unauthorized data access

---

## 7. Error Handling

### 7.1 Registration Errors
- Email already exists → "An account with this email already exists"
- Weak password → "Password does not meet requirements"
- Network error → "Unable to connect. Please try again."

### 7.2 Login Errors
- Invalid credentials → "Invalid email or password"
- Network error → "Unable to connect. Please try again."
- Account not found → "No account found with this email"

### 7.3 Session Errors
- Expired session → Auto-redirect to /login
- Network interruption → Retry with exponential backoff

---

## 8. Environment Configuration

### 8.1 Required Environment Variables
```
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### 8.2 Supabase Client Initialization
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 9. Dependencies

### 9.1 NPM Packages
- `@supabase/supabase-js`: Supabase JavaScript client
- `react-router-dom`: Routing library
- `@heroicons/react`: Icon library (for UI elements)

### 9.2 TypeScript Types
```typescript
// src/types/auth.ts
export type UserRole = 'student' | 'teacher'

export interface UserProfile {
  id: string
  full_name: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface AuthContextType {
  user: User | null
  role: UserRole | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}
```

---

## 10. Testing Strategy

### 10.1 Unit Tests (Future Implementation)
- Test useAuth hook functions
- Test form validation logic
- Test ProtectedRoute component logic

### 10.2 Integration Tests (Future Implementation)
- Test complete registration flow
- Test complete login flow
- Test route protection
- Test role-based redirection

### 10.3 Manual Testing Checklist
- [ ] User can register as Student
- [ ] User can register as Teacher
- [ ] Student redirected to /dashboard/student after login
- [ ] Teacher redirected to /dashboard/teacher after login
- [ ] Unauthenticated users redirected to /login when accessing protected routes
- [ ] Students cannot access /dashboard/teacher
- [ ] Teachers cannot access /dashboard/student
- [ ] Logout clears session and redirects to /login
- [ ] Session persists across page refresh

---

## 11. Performance Considerations

- Lazy load dashboard components for faster initial page load
- Cache user profile data in Auth Context to avoid redundant API calls
- Debounce form validation to reduce unnecessary re-renders
- Use Supabase's built-in connection pooling for optimal database performance

---

## 12. Future Enhancements (Post-MVP)

- Password reset functionality
- Email verification
- Social authentication (Google, GitHub)
- Two-factor authentication
- Remember me functionality
- Profile editing
- Password strength indicator on registration form
