import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-dark px-6 py-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-4 text-text-primary-dark">
          <div className="size-6 text-primary">
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z"></path>
            </svg>
          </div>
          <h2 className="text-text-primary-dark text-lg font-bold leading-tight tracking-[-0.015em]">
            SCHOOL-TASK-LIST
          </h2>
        </div>

        {/* Navigation */}
        <div className="hidden md:flex flex-1 justify-center gap-8">
          <div className="flex items-center gap-9">
            <NavLink
              to={profile?.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'}
              className={({ isActive }) =>
                isActive 
                  ? 'text-primary text-sm font-bold leading-normal' 
                  : 'text-text-primary-dark hover:text-primary text-sm font-medium leading-normal transition-colors'
              }
            >
              Dashboard
            </NavLink>
            
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                isActive 
                  ? 'text-primary text-sm font-bold leading-normal' 
                  : 'text-text-primary-dark hover:text-primary text-sm font-medium leading-normal transition-colors'
              }
            >
              Leaderboard
            </NavLink>
            
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                isActive 
                  ? 'text-primary text-sm font-bold leading-normal' 
                  : 'text-text-primary-dark hover:text-primary text-sm font-medium leading-normal transition-colors'
              }
            >
              Shop
            </NavLink>

            {profile?.role === 'student' && (
              <NavLink
                to="/inventory"
                className={({ isActive }) =>
                  isActive 
                    ? 'text-primary text-sm font-bold leading-normal' 
                    : 'text-text-primary-dark hover:text-primary text-sm font-medium leading-normal transition-colors'
                }
              >
                Inventory
              </NavLink>
            )}

            <NavLink
              to="/profile/me"
              className={({ isActive }) =>
                isActive 
                  ? 'text-primary text-sm font-bold leading-normal' 
                  : 'text-text-primary-dark hover:text-primary text-sm font-medium leading-normal transition-colors'
              }
            >
              My Profile
            </NavLink>
          </div>
        </div>

        {/* User Avatar & Logout */}
        <div className="flex items-center gap-4">
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            style={{
              backgroundImage: `url(https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'User')}&background=607AFB&color=fff)`
            }}
            title={profile?.full_name || 'User'}
          ></div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-text-secondary-dark hover:text-primary transition-colors"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      {children}
    </div>
  );
};
