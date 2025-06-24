import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, MessageSquare, ThumbsUp, ExternalLink, Clock } from 'lucide-react';
import { mockContradictions } from '../data/mockData';

const TrendingContradictions: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Trending Contradictions</h2>
        <div className="flex items-center text-orange-600">
          <TrendingUp className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Hot Right Now</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockContradictions.map((contradiction, index) => (
          <motion.div
            key={contradiction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  {contradiction.category.replace('-', ' ')}
                </span>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                  {contradiction.confidenceScore}% match
                </span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-600">
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{contradiction.upvotes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>24</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-700">Earlier</span>
                  <div className="flex items-center space-x-2 text-xs text-red-600">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(contradiction.dates[0]).toLocaleDateString()}</span>
                    <span>r/{contradiction.subreddits[0]}</span>
                  </div>
                </div>
                <p className="text-slate-800 text-sm italic">
                  "{contradiction.statement1.length > 100 
                    ? contradiction.statement1.substring(0, 100) + '...' 
                    : contradiction.statement1}"
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">Later</span>
                  <div className="flex items-center space-x-2 text-xs text-blue-600">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(contradiction.dates[1]).toLocaleDateString()}</span>
                    <span>r/{contradiction.subreddits[1]}</span>
                  </div>
                </div>
                <p className="text-slate-800 text-sm italic">
                  "{contradiction.statement2.length > 100 
                    ? contradiction.statement2.substring(0, 100) + '...' 
                    : contradiction.statement2}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
              <span className="text-sm text-slate-600">
                Found by <span className="font-medium text-blue-600">truth_seeker_99</span>
              </span>
              <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                <ExternalLink className="h-4 w-4" />
                <span>View Full Analysis</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-colors">
          View All Trending
        </button>
      </div>
    </div>
  );
};

export default TrendingContradictions;