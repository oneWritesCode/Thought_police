import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, LogIn, UserCheck, Lock, Zap } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state, default to profile
  const from = location.state?.from?.pathname || '/profile';

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to the intended destination after successful login
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = () => {
    loginWithRedirect({
      appState: {
        returnTo: from
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full shadow-lg mx-auto w-20 h-20 flex items-center justify-center mb-6"
          >
            <Shield className="h-10 w-10 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Thought Police
            </span>
          </h1>
          <p className="text-slate-600">
            Sign in to access your officer profile and track your progress
          </p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200"
        >
          <div className="text-center mb-6">
            <Lock className="h-8 w-8 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Authentication Required</h2>
            <p className="text-slate-600 text-sm">
              You need to be signed in to access your profile and track your detective work.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <UserCheck className="h-4 w-4 text-green-500" />
              <span>Secure authentication with Auth0</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <Zap className="h-4 w-4 text-blue-500" />
              <span>Track your contradiction discoveries</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <Shield className="h-4 w-4 text-purple-500" />
              <span>Earn badges and climb the leaderboard</span>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
          >
            <LogIn className="h-5 w-5" />
            <span>Sign In to Continue</span>
          </button>

          <p className="text-xs text-slate-500 text-center mt-4">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => navigate('/')}
            className="text-slate-600 hover:text-slate-800 text-sm font-medium"
          >
            ← Back to Home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage; 