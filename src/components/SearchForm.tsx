import React, { useState, useEffect } from 'react';
import { Search, User, ExternalLink, Loader, CheckCircle, XCircle, AlertCircle, DollarSign, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { analysisService } from '../services/analysisService';

interface SearchFormProps {
  onSearch: (username: string) => void;
  isLoading?: boolean;
}

interface UserPreview {
  exists: boolean;
  karma: number;
  accountAge: string;
  recentActivity: boolean;
  estimatedComments: number;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading = false }) => {
  const [username, setUsername] = useState('');
  const [searchType, setSearchType] = useState<'username' | 'url'>('username');
  const [userPreview, setUserPreview] = useState<UserPreview | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [budgetStatus, setBudgetStatus] = useState<any>(null);

  // Load budget status
  useEffect(() => {
    const budget = analysisService.getBudgetStats();
    setBudgetStatus(budget.budget);
  }, []);

  // Debounced username validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username.trim() && username.length > 2) {
        validateUser(username);
      } else {
        setUserPreview(null);
        setValidationError('');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const validateUser = async (usernameToValidate: string) => {
    setIsValidating(true);
    setValidationError('');
    
    try {
      const cleanUsername = usernameToValidate.replace(/^(https?:\/\/)?(www\.)?reddit\.com\/(u|user)\//, '');
      const preview = await analysisService.getUserPreview(cleanUsername);
      
      if (!preview.exists) {
        setValidationError('User not found on Reddit');
        setUserPreview(null);
      } else if (!preview.recentActivity) {
        setValidationError('User has no recent public activity to analyze');
        setUserPreview(preview);
      } else {
        setUserPreview(preview);
      }
    } catch (error) {
      setValidationError('Unable to validate user');
      setUserPreview(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && userPreview?.exists && userPreview?.recentActivity) {
      const cleanUsername = username.replace(/^(https?:\/\/)?(www\.)?reddit\.com\/(u|user)\//, '');
      onSearch(cleanUsername);
    }
  };

  const isValidForAnalysis = userPreview?.exists && userPreview?.recentActivity && !validationError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 transition-colors duration-200">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full transition-colors duration-200">
            <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2 transition-colors duration-200">
          Analyze Reddit User
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-center mb-8 transition-colors duration-200">
          Enter a Reddit username to analyze their complete comment history for contradictions
        </p>

        {/* Budget Status */}
        {budgetStatus && (
          <div className={`mb-6 p-4 rounded-lg border transition-colors duration-200 ${
            budgetStatus.isExceeded ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
            budgetStatus.isWarning ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
            'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className={`h-4 w-4 ${
                  budgetStatus.isExceeded ? 'text-red-600 dark:text-red-400' :
                  budgetStatus.isWarning ? 'text-amber-600 dark:text-amber-400' :
                  'text-green-600 dark:text-green-400'
                }`} />
                <span className={`text-sm font-medium transition-colors duration-200 ${
                  budgetStatus.isExceeded ? 'text-red-800 dark:text-red-200' :
                  budgetStatus.isWarning ? 'text-amber-800 dark:text-amber-200' :
                  'text-green-800 dark:text-green-200'
                }`}>
                  AI Budget: ${budgetStatus.spent.toFixed(2)} / ${budgetStatus.remaining.toFixed(2)} remaining
                </span>
              </div>
              <div className={`text-xs px-2 py-1 rounded transition-colors duration-200 ${
                budgetStatus.isExceeded ? 'bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300' :
                budgetStatus.isWarning ? 'bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-300' :
                'bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300'
              }`}>
                {budgetStatus.percentage.toFixed(1)}% used
              </div>
            </div>
            {budgetStatus.isExceeded && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 transition-colors duration-200">
                Budget exceeded. Analysis will use enhanced fallback methods.
              </p>
            )}
          </div>
        )}

        <div className="flex mb-6 bg-slate-100 dark:bg-slate-700 rounded-lg p-1 transition-colors duration-200">
          <button
            type="button"
            onClick={() => setSearchType('username')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              searchType === 'username'
                ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Username</span>
          </button>
          <button
            type="button"
            onClick={() => setSearchType('url')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              searchType === 'url'
                ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100'
            }`}
          >
            <ExternalLink className="h-4 w-4" />
            <span>Profile URL</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-200">
              {searchType === 'username' ? 'Reddit Username' : 'Reddit Profile URL'}
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  searchType === 'username' 
                    ? 'Enter username (e.g., spez)' 
                    : 'Enter profile URL (e.g., reddit.com/user/spez)'
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 ${
                  validationError ? 'border-red-300 dark:border-red-600' : 
                  userPreview?.exists ? 'border-green-300 dark:border-green-600' : 'border-slate-300 dark:border-slate-600'
                }`}
                disabled={isLoading}
              />
              
              {/* Validation indicator */}
              <div className="absolute right-3 top-3">
                {isValidating && <Loader className="h-5 w-5 animate-spin text-blue-500" />}
                {!isValidating && validationError && <XCircle className="h-5 w-5 text-red-500" />}
                {!isValidating && userPreview?.exists && userPreview?.recentActivity && <CheckCircle className="h-5 w-5 text-green-500" />}
                {!isValidating && userPreview?.exists && !userPreview?.recentActivity && <AlertCircle className="h-5 w-5 text-yellow-500" />}
              </div>
            </div>

            {/* User preview */}
            {userPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-100 transition-colors duration-200">u/{username.replace(/^(https?:\/\/)?(www\.)?reddit\.com\/(u|user)\//, '')}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-200">
                      {userPreview.karma.toLocaleString()} karma • Account age: {userPreview.accountAge}
                    </div>
                    {userPreview.estimatedComments > 0 && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center space-x-1 transition-colors duration-200">
                        <Zap className="h-3 w-3" />
                        <span>~{userPreview.estimatedComments} comments estimated for comprehensive analysis</span>
                      </div>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                    userPreview.recentActivity 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {userPreview.recentActivity ? 'Ready for Analysis' : 'Limited Activity'}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Validation error */}
            {validationError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-200"
              >
                {validationError}
              </motion.p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={!isValidForAnalysis || isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
            whileHover={{ scale: isValidForAnalysis && !isLoading ? 1.02 : 1 }}
            whileTap={{ scale: isValidForAnalysis && !isLoading ? 0.98 : 1 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader className="h-5 w-5 animate-spin" />
                <span>Analyzing Complete Reddit History...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Start Comprehensive Analysis</span>
              </div>
            )}
          </motion.button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors duration-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 transition-colors duration-200">Unlimited History Analysis</h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300 transition-colors duration-200">
                Our enhanced system now fetches ALL available comments and posts using Reddit's pagination API + Pushshift for historical data. 
                This ensures comprehensive analysis of the user's complete history (up to 5,000+ comments), not just recent activity.
              </p>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 transition-colors duration-200">
                <strong>Features:</strong> Streaming pagination • Smart deduplication • Budget-aware AI models • Enhanced fallback analysis
              </div>
            </div>
          </div>
        </div>

        {/* Analysis details */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
            Optimized 2-stage pipeline • Token budget management • Persistent caching • 30-90 seconds processing time
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchForm;