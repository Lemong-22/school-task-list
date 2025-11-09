import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

export const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password) {
      setError('Please enter a password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName, role);
      // Success - redirect to login
      navigate('/login', { 
        state: { message: 'Registration successful! Please log in.' } 
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark px-4 sm:px-6 lg:px-8 overflow-y-auto py-12">
      <div className="max-w-md w-full bg-component-dark rounded-lg shadow-md border border-border-dark p-8">
        <div className="mb-8">
          <h2 className="text-center text-text-primary-dark text-3xl font-bold">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary-dark">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
              <div className="text-sm text-red-400">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary-dark mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="bg-background-dark text-text-primary-dark border border-border-dark rounded-lg px-4 py-3 w-full focus:border-primary focus:ring-0 focus:outline-none transition-colors placeholder-text-secondary-dark"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

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
                autoComplete="new-password"
                required
                className="bg-background-dark text-text-primary-dark border border-border-dark rounded-lg px-4 py-3 w-full focus:border-primary focus:ring-0 focus:outline-none transition-colors placeholder-text-secondary-dark"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary-dark mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="bg-background-dark text-text-primary-dark border border-border-dark rounded-lg px-4 py-3 w-full focus:border-primary focus:ring-0 focus:outline-none transition-colors placeholder-text-secondary-dark"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-text-secondary-dark mb-2">
                I am a...
              </label>
              <select
                id="role"
                name="role"
                className="bg-background-dark text-text-primary-dark border border-border-dark rounded-lg px-4 py-3 w-full focus:border-primary focus:ring-0 focus:outline-none transition-colors"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white font-bold rounded-lg h-12 px-4 w-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
