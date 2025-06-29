import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Trophy, Search, User, TrendingUp, LogOut, LogIn } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, logout, loginWithRedirect } = useAuth0();

  const isActive = (path: string) => location.pathname === path;

  const handleLogin = () => {
    loginWithRedirect({
      appState: {
        returnTo: location.pathname
      }
    });
  };

  return (
    <nav className="bg-slate-900 shadow-lg border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-amber-400" />
            <span className="text-xl font-bold text-white">Thought Police</span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Analyze</span>
            </Link>
            
            <Link
              to="/leaderboard"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/leaderboard') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </Link>
            
            <Link
              to="/stats"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/stats') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Stats</span>
            </Link>
            
            <Link
              to="/profile"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/profile') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            
            {isAuthenticated ? (
            <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/logout') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <LogOut className="h-4 w-4" />
                <span>Logout</span>
                </button>
            ) : (
              <button
                onClick={handleLogin}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/login') 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </button>
            )}
          </div>

          <div className="md:hidden">
            <button className="text-slate-300 hover:text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;