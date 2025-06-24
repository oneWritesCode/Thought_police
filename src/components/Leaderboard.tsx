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
        return <span className="text-lg font-bold text-slate-600">#{rank}</span>;
    }
  };

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'bg-white border-slate-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-slate-800 mb-4"
        >
          Leaderboard
        </motion.h1>
        <p className="text-slate-600 text-lg">
          Top contradiction hunters and their achievements
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Category</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key as LeaderboardCategory)}
                    className={`flex items-center space-x-2 p-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.key
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-2 border-transparent'
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
            <h3 className="text-sm font-medium text-slate-700 mb-3">Time Period</h3>
            <div className="grid grid-cols-4 gap-2">
              {periods.map((period) => (
                <button
                  key={period.key}
                  onClick={() => setSelectedPeriod(period.key as any)}
                  className={`flex items-center justify-center p-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period.key
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-2 border-transparent'
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
            className={`${getRankBackground(entry.rank)} rounded-xl p-6 border-2 shadow-lg hover:shadow-xl transition-shadow`}
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
                    className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                  />
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      {entry.user.redditUsername}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span 
                        className="text-sm font-medium"
                        style={{ color: rankInfo[entry.user.rank].color }}
                      >
                        {rankInfo[entry.user.rank].name}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-sm text-slate-600">
                        {entry.user.casesSolved} cases solved
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">
                    {entry.points.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {entry.user.accuracyRate}%
                  </div>
                  <div className="text-sm text-slate-600">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {entry.user.badgeCount}
                  </div>
                  <div className="text-sm text-slate-600">Badges</div>
                </div>
              </div>
            </div>

            {/* Progress Bar for Top 3 */}
            {entry.rank <= 3 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Progress to next rank
                  </span>
                  <span className="text-sm text-slate-600">
                    {entry.points} / {entry.points + 500}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">1,247</div>
            <div className="text-blue-100">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">8,932</div>
            <div className="text-blue-100">Contradictions Found</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">156,293</div>
            <div className="text-blue-100">Comments Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">87.3%</div>
            <div className="text-blue-100">Avg Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;