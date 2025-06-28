import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, Target, Users, Clock } from 'lucide-react';
import { LeaderboardEntry, LeaderboardCategory } from '../types';
import { mockLeaderboard, rankInfo } from '../data/mockData';

const Leaderboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>('total-points');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'alltime'>('alltime');

  const categories = [
    { key: 'total-points', label: 'Total Points', icon: Trophy },
    { key: 'contradictions-found', label: 'Contradictions Found', icon: Target },
    { key: 'accuracy-rate', label: 'Accuracy Rate', icon: Award },
    { key: 'cases-solved', label: 'Cases Solved', icon: Users }
  ];

  const periods = [
    { key: 'daily', label: 'Today' },
    { key: 'weekly', label: 'This Week' },
    { key: 'monthly', label: 'This Month' },
    { key: 'alltime', label: 'All Time' }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-slate-600 dark:text-slate-400">#{rank}</span>;
    }
  };

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-800';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700';
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
          Leaderboard
        </motion.h1>
        <p className="text-slate-600 dark:text-slate-300 text-lg transition-colors duration-200">
          Top contradiction hunters and their achievements
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 transition-colors duration-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 transition-colors duration-200">Category</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key as LeaderboardCategory)}
                    className={`flex items-center space-x-2 p-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.key
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-700'
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border-2 border-transparent'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="truncate">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Period Filter */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 transition-colors duration-200">Time Period</h3>
            <div className="grid grid-cols-4 gap-2">
              {periods.map((period) => (
                <button
                  key={period.key}
                  onClick={() => setSelectedPeriod(period.key as any)}
                  className={`flex items-center justify-center p-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period.key
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-700'
                      : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border-2 border-transparent'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-4">
        {mockLeaderboard.map((entry, index) => (
          <motion.div
            key={entry.user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${getRankBackground(entry.rank)} rounded-xl p-6 border-2 shadow-lg hover:shadow-xl transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Rank */}
                <div className="flex items-center justify-center w-12 h-12">
                  {getRankIcon(entry.rank)}
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-4">
                  <img
                    src={entry.user.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2'}
                    alt={entry.user.redditUsername}
                    className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-600 shadow-md"
                  />
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors duration-200">
                      {entry.user.redditUsername}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span 
                        className="text-sm font-medium"
                        style={{ color: rankInfo[entry.user.rank].color }}
                      >
                        {rankInfo[entry.user.rank].name}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">•</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-200">
                        {entry.user.casesSolved} cases solved
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors duration-200">
                    {entry.points.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-200">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-200">
                    {entry.user.accuracyRate}%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-200">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-200">
                    {entry.user.badgeCount}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-200">Badges</div>
                </div>
              </div>
            </div>

            {/* Progress Bar for Top 3 */}
            {entry.rank <= 3 && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 transition-colors duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors duration-200">
                    Progress to next rank
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-200">
                    {entry.points} / {entry.points + 500}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 transition-colors duration-200">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(entry.points / (entry.points + 500)) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 rounded-xl p-8 text-white transition-colors duration-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">1,247</div>
            <div className="text-blue-100 dark:text-blue-200">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">8,932</div>
            <div className="text-blue-100 dark:text-blue-200">Contradictions Found</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">156,293</div>
            <div className="text-blue-100 dark:text-blue-200">Comments Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">87.3%</div>
            <div className="text-blue-100 dark:text-blue-200">Avg Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;