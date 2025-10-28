import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
// import { CreateTaskPage } from './pages/CreateTaskPage'; // TODO: Re-implement with gamification
// import { EditTaskPage } from './pages/EditTaskPage'; // TODO: Re-implement with gamification
import { LeaderboardPage } from './pages/LeaderboardPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes - Student */}
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - Teacher */}
          <Route
            path="/dashboard/teacher"
            element={
              <ProtectedRoute allowedRole="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          {/* TODO: Re-implement Task CRUD with gamification support */}
          {/* <Route
            path="/tasks/create"
            element={
              <ProtectedRoute allowedRole="teacher">
                <CreateTaskPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks/edit/:taskId"
            element={
              <ProtectedRoute allowedRole="teacher">
                <EditTaskPage />
              </ProtectedRoute>
            }
          /> */}

          {/* Leaderboard - accessible to all authenticated users (no role restriction) */}
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
