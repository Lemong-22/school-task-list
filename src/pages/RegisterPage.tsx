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
    <div className="relative min-h-screen w-screen overflow-y-auto flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      {/* Epic HoK-style Background - Cosmic Dragon Theme */}
      <div className="fixed inset-0 z-0 h-full w-full">
        {/* Base Layer - Vibrant Purple/Red/Orange */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-red-600 to-orange-600"></div>
        
        {/* Animated Flowing Layer - VIVID COLORS */}
        <div className="absolute inset-0 opacity-80" 
             style={{ 
               backgroundImage: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
               backgroundSize: '400% 400%',
               animation: 'gradient-flow 15s ease infinite'
             }}></div>
        
        {/* Golden Dragon Energy Particles - VISIBLE */}
        <div className="absolute inset-0 opacity-60" 
             style={{ 
               backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255, 215, 0, 0.6) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255, 105, 180, 0.6) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.4) 0%, transparent 50%)',
               animation: 'float 12s ease-in-out infinite'
             }}></div>
      </div>
      
      {/* LIGHTER overlay for readability */}
      <div className="fixed inset-0 z-10 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      
      {/* Floating Register Card */}
      <div className="relative z-20 max-w-md w-full bg-component-dark/80 backdrop-blur-md rounded-lg shadow-2xl border border-yellow-400/30 p-8">
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
