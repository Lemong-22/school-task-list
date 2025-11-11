import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { signIn, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Show success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location]);

  // Redirect if already authenticated (but not during loading animation)
  useEffect(() => {
    if (isAuthenticated && role && !isLoggingIn) {
      const redirectPath = role === 'student' ? '/dashboard/student' : '/dashboard/teacher';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, role, navigate, isLoggingIn]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    setLoading(true);
    setIsLoggingIn(true); // Show splash screen

    try {
      await signIn(email, password);
      // Wait for progress bar to complete (2 seconds) before allowing navigation
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Now allow the useEffect to navigate
      setIsLoggingIn(false);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      setIsLoggingIn(false); // Hide splash screen on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Epic HoK-style Background - Cosmic Dragon Theme */}
      <div className="absolute inset-0 z-0 h-full w-full">
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
      <div className="absolute inset-0 z-10 bg-black/60" />
      
      {/* Elegant Fade Animation with AnimatePresence */}
      <AnimatePresence>
        {isLoggingIn ? (
          // LOADING SPLASH SCREEN WITH PROGRESS BAR
          <motion.div
            key="loading"
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background-dark"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center max-w-md w-full px-4">
              {/* Loading Text */}
              <h2 className="text-xl font-display font-bold text-text-primary-dark mb-2">Signing you in...</h2>
              <p className="text-sm text-text-secondary-dark mb-8">Please wait a moment</p>
              
              {/* Progress Bar with Running Stickman */}
              <div className="relative">
                {/* Progress Bar Track */}
                <div className="w-full bg-component-dark rounded-full h-3 overflow-hidden border border-border-dark">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-purple-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </div>
                
                {/* Running Character */}
                <motion.div
                  className="absolute -top-8 text-2xl"
                  initial={{ left: "0%" }}
                  animate={{ left: "calc(100% - 24px)" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                >
                  𐀪
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          // LOGIN FORM
          <motion.div
            key="login-form"
            className="relative z-20 flex flex-col items-center justify-center w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            {/* SCHOOL TASK LIST Title */}
            <h1 
              className="text-5xl md:text-6xl font-display font-black tracking-tight text-white mb-8" 
              style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.7)' }}
            >
              SCHOOL TASK LIST
            </h1>
            
            {/* Login Card */}
            <div className="max-w-md w-full bg-component-dark/80 backdrop-blur-md rounded-lg shadow-2xl border border-border-dark p-8">
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

            {/* Creator Watermark - Unified Design */}
            <div className="mt-8 text-center">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/10">
                {/* XII-4 Badge */}
                <div className="mb-3 flex justify-center">
                  <div className="relative overflow-hidden px-4 py-1 rounded-md bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30">
                    <span className="animate-shimmer absolute inset-0"></span>
                    <span className="text-white text-xl font-black relative z-10 drop-shadow-lg tracking-wider">XII-4</span>
                  </div>
                </div>
                
                {/* Creator Info */}
                <div className="space-y-1">
                  <p className="text-gray-200 text-sm drop-shadow-md">
                    Created by <span className="text-white font-bold">Yosia Edmund Herlianto</span>
                  </p>
                  <p className="text-gray-400 text-xs drop-shadow-md">
                    with Quinlan • Ralph • Wilson • Jason
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        )}
      </AnimatePresence>
    </div>
  );
};
