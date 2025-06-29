import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Target, 
  AlertTriangle, 
  Calendar,
  Award,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import LoginPage from './LoginPage';

const StatsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const { isAuthenticated } = useAuth0();
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const contradictionTrendData = [
    { date: '2024-01', contradictions: 234, accuracy: 89 },
    { date: '2024-02', contradictions: 456, accuracy: 91 },
    { date: '2024-03', contradictions: 398, accuracy: 87 },
    { date: '2024-04', contradictions: 567, accuracy: 93 },
    { date: '2024-05', contradictions: 623, accuracy: 90 },
    { date: '2024-06', contradictions: 789, accuracy: 88 }
  ];

  const categoryData = [
    { name: 'Political', value: 35, color: '#ef4444' },
    { name: 'Personal Preference', value: 28, color: '#3b82f6' },
    { name: 'Factual', value: 18, color: '#8b5cf6' },
    { name: 'Opinion', value: 12, color: '#10b981' },
    { name: 'Lifestyle', value: 5, color: '#f59e0b' },
    { name: 'Relationship', value: 2, color: '#ec4899' }
  ];

  const topSubredditsData = [
    { name: 'politics', contradictions: 1234, color: '#ef4444' },
    { name: 'unpopularopinion', contradictions: 987, color: '#f97316' },
    { name: 'changemyview', contradictions: 756, color: '#eab308' },
    { name: 'AmItheAsshole', contradictions: 543, color: '#22c55e' },
    { name: 'relationship_advice', contradictions: 432, color: '#3b82f6' },
    { name: 'food', contradictions: 321, color: '#8b5cf6' }
  ];

  const userActivityData = [
    { time: '00:00', users: 45 },
    { time: '04:00', users: 23 },
    { time: '08:00', users: 89 },
    { time: '12:00', users: 156 },
    { time: '16:00', users: 234 },
    { time: '20:00', users: 189 },
    { time: '23:59', users: 78 }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-slate-800 mb-4"
        >
          Platform Statistics
        </motion.h1>
        <p className="text-slate-600 text-lg">
          Comprehensive analytics and insights from the Thought Police community
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg p-1 shadow-lg border border-slate-200">
          {[
            { key: '7d', label: '7 Days' },
            { key: '30d', label: '30 Days' },
            { key: '90d', label: '90 Days' },
            { key: '1y', label: '1 Year' }
          ].map((period) => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period.key
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 opacity-80" />
            <span className="text-sm opacity-80">+12% vs last month</span>
          </div>
          <div className="text-3xl font-bold">1,247</div>
          <div className="opacity-80">Active Officers</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="h-8 w-8 opacity-80" />
            <span className="text-sm opacity-80">+23% vs last month</span>
          </div>
          <div className="text-3xl font-bold">8,932</div>
          <div className="opacity-80">Contradictions Found</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Target className="h-8 w-8 opacity-80" />
            <span className="text-sm opacity-80">+2.1% vs last month</span>
          </div>
          <div className="text-3xl font-bold">87.3%</div>
          <div className="opacity-80">Accuracy Rate</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="h-8 w-8 opacity-80" />
            <span className="text-sm opacity-80">+45% vs last month</span>
          </div>
          <div className="text-3xl font-bold">156K</div>
          <div className="opacity-80">Comments Analyzed</div>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contradiction Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-slate-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Contradiction Trends</h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={contradictionTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="contradictions" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-slate-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Contradiction Categories</h3>
            <Eye className="h-5 w-5 text-blue-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-sm text-slate-600">{category.name}</span>
                <span className="text-sm font-medium text-slate-800">{category.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Subreddits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-slate-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Top Subreddits</h3>
            <Award className="h-5 w-5 text-purple-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSubredditsData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis dataKey="name" type="category" stroke="#64748b" width={120} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="contradictions" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-slate-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Daily User Activity</h3>
            <Calendar className="h-5 w-5 text-orange-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white"
      >
        <h3 className="text-2xl font-bold mb-6 text-center">Platform Milestones</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8" />
            </div>
            <div className="text-xl font-bold">100K+</div>
            <div className="opacity-80">Total Analyses</div>
          </div>
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8" />
            </div>
            <div className="text-xl font-bold">1M+</div>
            <div className="opacity-80">Comments Processed</div>
          </div>
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8" />
            </div>
            <div className="text-xl font-bold">85%+</div>
            <div className="opacity-80">Community Satisfaction</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StatsPage;