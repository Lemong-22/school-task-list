# User Profile Page - Functional Requirements
**Feature:** Phase 4.1 - User Profile Page  
**Date:** 2025-11-01  
**Status:** Research Complete

## Overview
The User Profile Page will serve as the foundation for the Coin Shop (Phase 4.2) by displaying user information, stats, and providing dedicated areas for future cosmetic items (Titles and Badges).

---

## 1. Akses & Visibilitas (Access & Visibility)

### 1.1 Public Profiles
- **Requirement:** All user profiles MUST be publicly viewable within the application by authenticated users.
- **Rationale:** Foster community engagement and allow students to view each other's achievements.

### 1.2 Viewing Other Profiles
- **Requirement:** Students MUST be able to view profiles of other students.
- **Primary Access Method:** Clicking on a student's name in the Leaderboard.
- **URL Pattern:** `/profile/:userId`

### 1.3 Viewing Own Profile
- **Requirement:** All users (students and teachers) MUST be able to view their own profile.
- **Primary Access Method:** "Profil Saya" link in the header navigation.
- **URL Pattern:** `/profile/me` (redirects to `/profile/:userId` where userId is the current user's ID)

---

## 2. Informasi yang Ditampilkan (Information Display)

### 2.1 Always Visible Information
The following information MUST be displayed on ALL profile pages:

| Field | Source | Display Format | Notes |
|-------|--------|----------------|-------|
| **Nama Lengkap** | `profiles.full_name` | Plain text | Primary identifier |
| **Role** | `profiles.role` | Translated ("Siswa" / "Guru") | User type indicator |
| **Total Koin** | `profiles.total_coins` | Number with icon | Main gamification metric |
| **Tanggal Bergabung** | `profiles.created_at` | Formatted date (e.g., "Bergabung sejak: 15 Oktober 2025") | User tenure |

### 2.2 Conditionally Visible Information
| Field | Source | Visibility Rule | Display Format |
|-------|--------|----------------|----------------|
| **Email** | `profiles.email` | ONLY visible when viewing your own profile | Plain text |

### 2.3 Privacy Rule
- **CRITICAL:** Email addresses MUST NOT be displayed when viewing another user's profile.
- **Implementation:** Use conditional rendering based on `currentUserId === profileUserId`

---

## 3. Kustomisasi & Future-Proofing (Customization Areas)

### 3.1 Title Display Area
- **Purpose:** Display the user's active "Gelar" (Title) - to be purchased in Phase 4.2 (Coin Shop).
- **Current State (Phase 4.1):** Empty or show default message: "Belum ada gelar dipilih"
- **Visual Design:** 
  - Prominent area below or near the user's name
  - Should be styled to look like a badge or banner
  - Must be clearly identifiable as a "Title" section

### 3.2 Badge Gallery Area
- **Purpose:** Display the user's collection of "Lencana" (Badges) - to be purchased in Phase 4.2.
- **Current State (Phase 4.1):** Empty grid with placeholder message: "Belum ada lencana yang dimiliki"
- **Visual Design:**
  - Grid layout (e.g., 3-4 columns)
  - Clear section heading: "Koleksi Lencana"
  - Each "slot" should show as an empty placeholder
  - Recommend 6-8 empty slots to indicate future capacity

### 3.3 Database Preparation
- **Note:** No database changes needed for Phase 4.1
- **Future Schema (Phase 4.2):**
  - New table: `user_titles` (id, user_id, title_id, is_active, purchased_at)
  - New table: `user_badges` (id, user_id, badge_id, purchased_at)
  - Master tables: `titles`, `badges` with pricing and metadata

---

## 4. Edit Profil (Profile Editing)

### 4.1 Editable Fields (Phase 4.1)
- **Field:** `full_name` (Nama Lengkap)
- **Access:** Users can ONLY edit their own profile
- **UI Pattern:** 
  - Show "Edit" button only when viewing your own profile
  - Inline editing OR modal dialog
  - Include "Simpan" (Save) and "Batal" (Cancel) actions

### 4.2 Validation Rules
- **full_name:** 
  - Required field
  - Minimum 2 characters
  - Maximum 100 characters
  - No special characters (allow: letters, spaces, hyphens)

### 4.3 Deferred Features
The following features are DEFERRED to future releases:
- ❌ Profile photo upload
- ❌ Editing email address
- ❌ Editing role
- ❌ Custom bio/description

---

## 5. Navigasi (Navigation)

### 5.1 Header Navigation
- **New Element:** "Profil Saya" link in the application header
- **Position:** Between main navigation and "Logout" button
- **Behavior:** Navigates to `/profile/me`
- **Visibility:** Always visible to authenticated users

### 5.2 Leaderboard Integration
- **Requirement:** Student names in the Leaderboard MUST be clickable links
- **Behavior:** Clicking a name navigates to `/profile/:userId`
- **Visual Indicator:** Underline or color change on hover to indicate clickability

### 5.3 Navigation Flow
```
User Actions:
1. Click "Profil Saya" in header → View own profile
2. Click student name in Leaderboard → View that student's profile
3. From any profile, click "Profil Saya" → Return to own profile
```

---

## 6. Technical Requirements

### 6.1 Database Schema
**Existing `profiles` table** (sufficient for Phase 4.1):
```sql
profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  total_coins INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### 6.2 API Endpoints
1. **GET `/api/profile/:userId`**
   - Fetch profile data for any user
   - Return: full_name, role, total_coins, created_at
   - Conditionally include email if requesting user owns the profile

2. **PATCH `/api/profile/:userId`**
   - Update `full_name` only
   - Authorization: User can only update their own profile
   - Validation: Check name format and length

### 6.3 Row Level Security (RLS)
- **SELECT:** All authenticated users can read all profiles (for leaderboard and public profiles)
- **UPDATE:** Users can only update their own profile record

---

## 7. User Experience Requirements

### 7.1 Responsive Design
- Profile page MUST be fully responsive (mobile, tablet, desktop)
- Badge gallery should adapt to screen size (2-4 columns based on viewport)

### 7.2 Visual Design
- Follow existing "Glassmorphism" theme
- Use gradients and blur effects consistent with Phase 4 design goals
- Prominent display of coins with icon/animation
- Clear visual hierarchy: Name > Stats > Cosmetics > Actions

### 7.3 Loading States
- Show skeleton/loading state while fetching profile data
- Handle 404 case for non-existent user profiles
- Display error message if profile load fails

---

## 8. Success Criteria

### Phase 4.1 is considered complete when:
- ✅ Users can navigate to their own profile via header link
- ✅ Users can view other profiles by clicking names in Leaderboard
- ✅ All required information (name, role, coins, join date) is displayed
- ✅ Email is ONLY visible on own profile
- ✅ Users can edit their own full_name
- ✅ Title and Badge areas are designed and displayed (even if empty)
- ✅ UI matches Glassmorphism design standards
- ✅ All features work responsively across devices

---

## 9. Out of Scope (Deferred to Future Phases)

The following are explicitly OUT OF SCOPE for Phase 4.1:
- ❌ Profile photos/avatars
- ❌ Actual Title and Badge functionality (data, purchasing)
- ❌ Activity history or stats breakdown
- ❌ Privacy settings
- ❌ Blocking/reporting users
- ❌ Custom profile themes
- ❌ Social features (following, friends)

---

## Next Steps
1. ✅ Requirements defined and documented
2. ⏭️ Create visual mockups/wireframes (save to `planning/visuals/`)
3. ⏭️ Create technical specification document
4. ⏭️ Begin implementation phase
