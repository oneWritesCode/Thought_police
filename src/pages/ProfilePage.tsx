import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit3, 
  Settings, 
  Award, 
  Target, 
  TrendingUp, 
  Calendar,
  Star,
  Shield,
  Trophy,
  Medal,
  Users
} from 'lucide-react';
import PoliceCard from '../components/PoliceCard';
import { mockUsers, mockAchievements } from '../data/mockData';
import { useAuth0 } from '@auth0/auth0-react';
import LoginPage from './LoginPage';

const ProfilePage: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  
  // Using first mock user as current user
  const currentUser = mockUsers[0];

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Shield },
    { key: 'achievements', label: 'Achievements', icon: Trophy },
    { key: 'settings', label: 'Settings', icon: Settings }
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'contradiction_found',
      description: 'Found contradiction in u/hypocrite_user about climate change',
      points: 50,
      date: '2024-03-15',
      confidence: 91
    },
    {
      id: '2',
      type: 'rank_up',
      description: 'Promoted to Detective rank',
      points: 0,
      date: '2024-03-12',
      confidence: null
    },
    {
      id: '3',
      type: 'achievement_unlocked',
      description: 'Unlocked "Eagle Eye" achievement',
      points: 25,
      date: '2024-03-10',
      confidence: null
    },
    {
      id: '4',
      type: 'contradiction_found',
      description: 'Analyzed u/flip_flopper for food preferences',
      points: 35,
      date: '2024-03-08',
      confidence: 87
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contradiction_found':
        return <Target className="h-4 w-4 text-red-600" />;
      case 'rank_up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'achievement_unlocked':
        return <Award className="h-4 w-4 text-purple-600" />;
      default:
        return <Star className="h-4 w-4 text-blue-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'contradiction_found':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'rank_up':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'achievement_unlocked':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4 transition-colors duration-200"
        >
          Officer Profile
        </motion.h1>
        <p className="text-slate-600 dark:text-slate-300 text-lg transition-colors duration-200">
          Manage your digital identity and track your progress
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center w-full">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-1 shadow-lg border border-slate-200 dark:border-slate-700 transition-colors duration-200 w-full max-w-md">
          <div className="grid grid-cols-3 gap-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Police ID Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 transition-colors duration-200">Digital Badge</h2>
              <PoliceCard user={currentUser} />
            </div>
          </motion.div>

          {/* Stats and Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 transition-colors duration-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors duration-200">Quick Stats</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm transition-colors duration-200"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors duration-200">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentUser.totalPoints}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Total Points</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg transition-colors duration-200">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{currentUser.casesSolved}</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Cases Solved</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg transition-colors duration-200">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{currentUser.accuracyRate}%</div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Accuracy</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg transition-colors duration-200">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{currentUser.badgeCount}</div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">Badges</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 transition-colors duration-200">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 transition-colors duration-200">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className={`p-4 rounded-lg border transition-colors duration-200 ${getActivityColor(activity.type)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-800 dark:text-slate-100 font-medium transition-colors duration-200">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-400 transition-colors duration-200">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(activity.date).toLocaleDateString()}</span>
                            </div>
                            {activity.confidence && (
                              <span className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded transition-colors duration-200">
                                {activity.confidence}% confidence
                              </span>
                            )}
                          </div>
                          {activity.points > 0 && (
                            <div className="text-sm font-bold text-green-600 dark:text-green-400 transition-colors duration-200">
                              +{activity.points} pts
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 transition-colors duration-200">Achievement Gallery</h2>
            <p className="text-slate-600 dark:text-slate-300 transition-colors duration-200">
              Your collection of badges and accomplishments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl shadow-lg border transition-colors duration-200 ${
                  achievement.unlockedAt 
                    ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 opacity-60'
                }`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    achievement.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                    achievement.rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                    'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}>
                    {achievement.icon === 'award' && <Award className="h-8 w-8 text-white" />}
                    {achievement.icon === 'eye' && <Target className="h-8 w-8 text-white" />}
                    {achievement.icon === 'target' && <Trophy className="h-8 w-8 text-white" />}
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors duration-200">{achievement.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 transition-colors duration-200">{achievement.description}</p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      achievement.rarity === 'legendary' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                      achievement.rarity === 'epic' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
                      achievement.rarity === 'rare' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    } transition-colors duration-200`}>
                      {achievement.rarity}
                    </span>
                    {achievement.unlockedAt && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700 transition-colors duration-200">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 transition-colors duration-200">Account Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-200">
                  Display Name
                </label>
                <input
                  type="text"
                  value={currentUser.redditUsername}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-200">
                  Email Notifications
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600" defaultChecked />
                    <span className="ml-2 text-sm text-slate-600 dark:text-slate-300 transition-colors duration-200">New contradiction alerts</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600" defaultChecked />
                    <span className="ml-2 text-sm text-slate-600 dark:text-slate-300 transition-colors duration-200">Weekly leaderboard updates</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600" />
                    <span className="ml-2 text-sm text-slate-600 dark:text-slate-300 transition-colors duration-200">Achievement notifications</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-200">
                  Privacy Settings
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600" defaultChecked />
                    <span className="ml-2 text-sm text-slate-600 dark:text-slate-300 transition-colors duration-200">Show profile on leaderboard</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600" defaultChecked />
                    <span className="ml-2 text-sm text-slate-600 dark:text-slate-300 transition-colors duration-200">Allow direct messages</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700 transition-colors duration-200">
                <button className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors duration-200">
                  Cancel
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;