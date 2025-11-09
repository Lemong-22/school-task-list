import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signIn, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Show success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && role) {
      const redirectPath = role === 'student' ? '/dashboard/student' : '/dashboard/teacher';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
      // Navigation will be handled by useEffect when role is set
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-component-dark rounded-lg shadow-md border border-border-dark p-8">
        <div className="mb-8">
          <h2 className="text-center text-text-primary-dark text-3xl font-bold">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary-dark">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Create one now
            </Link>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {successMessage && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4">
              <div className="text-sm text-green-300">{successMessage}</div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
              <div className="text-sm text-red-400">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary-dark mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="bg-background-dark text-text-primary-dark border border-border-dark rounded-lg px-4 py-3 w-full focus:border-primary focus:ring-0 focus:outline-none transition-colors placeholder-text-secondary-dark"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary-dark mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="bg-background-dark text-text-primary-dark border border-border-dark rounded-lg px-4 py-3 w-full focus:border-primary focus:ring-0 focus:outline-none transition-colors placeholder-text-secondary-dark"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white font-bold rounded-lg h-12 px-4 w-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
