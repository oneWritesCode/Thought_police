import React, { useState, useEffect } from 'react';
import { Search, User, ExternalLink, Loader, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading = false }) => {
  const [username, setUsername] = useState('');
  const [searchType, setSearchType] = useState<'username' | 'url'>('username');
  const [userPreview, setUserPreview] = useState<UserPreview | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

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
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <Search className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
          Analyze Reddit User
        </h2>
        <p className="text-slate-600 text-center mb-8">
          Enter a Reddit username to analyze their comment history for contradictions
        </p>

        <div className="flex mb-6 bg-slate-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setSearchType('username')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              searchType === 'username'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
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
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <ExternalLink className="h-4 w-4" />
            <span>Profile URL</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationError ? 'border-red-300' : 
                  userPreview?.exists ? 'border-green-300' : 'border-slate-300'
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
                className="mt-3 p-3 bg-slate-50 rounded-lg border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-800">u/{username.replace(/^(https?:\/\/)?(www\.)?reddit\.com\/(u|user)\//, '')}</div>
                    <div className="text-xs text-slate-600">
                      {userPreview.karma.toLocaleString()} karma • Account age: {userPreview.accountAge}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    userPreview.recentActivity 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {userPreview.recentActivity ? 'Active' : 'Limited Activity'}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Validation error */}
            {validationError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-sm text-red-600"
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
                <span>Analyzing Reddit History...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Start Analysis</span>
              </div>
            )}
          </motion.button>
        </form>

        <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-amber-800">Privacy & Ethics Notice</h3>
              <p className="mt-1 text-sm text-amber-700">
                We only analyze publicly available Reddit comments and posts. No private information is accessed, stored, or shared. 
                Analysis is performed for educational and entertainment purposes only.
              </p>
            </div>
          </div>
        </div>

        {/* Rate limiting notice */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            Analysis may take 30-60 seconds depending on user activity level
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchForm;