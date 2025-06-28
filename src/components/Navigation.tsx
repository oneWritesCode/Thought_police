import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Trophy, Search, User, TrendingUp, Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-primary-800 shadow-lg border-b border-primary-200 dark:border-primary-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <Shield className="h-8 w-8 text-reddit-orange" />
              <div className="absolute inset-0 bg-reddit-orange/20 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl font-bold text-primary-900 dark:text-white">Thought Police</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive('/') 
                    ? 'bg-reddit-blue text-white shadow-lg shadow-reddit-blue/25' 
                    : 'text-primary-600 dark:text-primary-300 hover:text-reddit-blue dark:hover:text-white hover:bg-primary-100 dark:hover:bg-primary-700'
                }`}
              >
                <Search className="h-4 w-4" />
                <span>Analyze</span>
              </Link>
              
              <Link
                to="/leaderboard"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive('/leaderboard') 
                    ? 'bg-reddit-blue text-white shadow-lg shadow-reddit-blue/25' 
                    : 'text-primary-600 dark:text-primary-300 hover:text-reddit-blue dark:hover:text-white hover:bg-primary-100 dark:hover:bg-primary-700'
                }`}
              >
                <Trophy className="h-4 w-4" />
                <span>Leaderboard</span>
              </Link>
              
              <Link
                to="/stats"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive('/stats') 
                    ? 'bg-reddit-blue text-white shadow-lg shadow-reddit-blue/25' 
                    : 'text-primary-600 dark:text-primary-300 hover:text-reddit-blue dark:hover:text-white hover:bg-primary-100 dark:hover:bg-primary-700'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Stats</span>
              </Link>
              
              <Link
                to="/profile"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive('/profile') 
                    ? 'bg-reddit-blue text-white shadow-lg shadow-reddit-blue/25' 
                    : 'text-primary-600 dark:text-primary-300 hover:text-reddit-blue dark:hover:text-white hover:bg-primary-100 dark:hover:bg-primary-700'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </div>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle />
            <button className="text-primary-600 dark:text-primary-300 hover:text-primary-900 dark:hover:text-white transition-colors">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;