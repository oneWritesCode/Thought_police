import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, LogIn, UserCheck, Lock, Target, Award, ArrowLeft, Users } from 'lucide-react';

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
      <div className="min-h-screen bg-reddit-light-bg-light dark:bg-reddit-dark-bg flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-reddit-orange border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary transition-colors duration-200">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-reddit-light-bg-light dark:bg-reddit-dark-bg transition-colors duration-200">
      {/* Reddit-style Header */}
      <div className="bg-reddit-light-bg dark:bg-reddit-dark-bg-light shadow-sm border-b border-reddit-light-border dark:border-reddit-dark-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Shield className="h-8 w-8 text-reddit-orange" />
                <div className="absolute inset-0 bg-reddit-orange/20 rounded-full animate-pulse"></div>
              </div>
              <span className="text-xl font-bold text-reddit-light-text dark:text-reddit-dark-text transition-colors duration-200">Thought Police</span>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary hover:text-reddit-orange transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Home</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-reddit-orange to-reddit-orange-dark p-4 rounded-full shadow-lg mx-auto w-20 h-20 flex items-center justify-center mb-6"
            >
              <Shield className="h-10 w-10 text-white" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-reddit-light-text dark:text-reddit-dark-text mb-2 transition-colors duration-200">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-reddit-orange to-reddit-orange-dark bg-clip-text text-transparent">
                Thought Police
              </span>
            </h1>
            <p className="text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary transition-colors duration-200">
              Sign in to access your officer profile and track your progress
            </p>
          </div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-reddit-light-bg dark:bg-reddit-dark-bg-paper rounded-2xl shadow-xl p-8 border border-reddit-light-border dark:border-reddit-dark-border transition-colors duration-200"
          >
            <div className="text-center mb-6">
              <Lock className="h-8 w-8 text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary mx-auto mb-4 transition-colors duration-200" />
              <h2 className="text-xl font-bold text-reddit-light-text dark:text-reddit-dark-text mb-2 transition-colors duration-200">Authentication Required</h2>
              <p className="text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary text-sm transition-colors duration-200">
                You need to be signed in to access your profile and track your detective work.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-sm text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary transition-colors duration-200">
                <UserCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Secure authentication with Auth0</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary transition-colors duration-200">
                <Target className="h-4 w-4 text-reddit-orange flex-shrink-0" />
                <span>Track your contradiction discoveries</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary transition-colors duration-200">
                <Award className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span>Earn badges and climb the leaderboard</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary transition-colors duration-200">
                <Users className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span>Join the community of digital detectives</span>
              </div>
            </div>

            {/* Login Button */}
            <motion.button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-reddit-orange to-reddit-orange-dark text-white py-3 px-6 rounded-lg font-medium hover:from-reddit-orange-dark hover:to-reddit-orange focus:outline-none focus:ring-2 focus:ring-reddit-orange focus:ring-offset-2 focus:ring-offset-reddit-light-bg dark:focus:ring-offset-reddit-dark-bg-paper transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In to Continue</span>
            </motion.button>

            <p className="text-xs text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary text-center mt-4 transition-colors duration-200">
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </motion.div>

          {/* Reddit-style Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <div className="flex items-center justify-center space-x-4 text-sm text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary transition-colors duration-200">
              <span>Powered by AI</span>
              <span>•</span>
              <span>Real-time Analysis</span>
              <span>•</span>
              <span>Community Driven</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;