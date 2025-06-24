import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Calendar, 
  ExternalLink, 
  ThumbsUp, 
  ThumbsDown, 
  TrendingUp,
  Clock,
  MessageSquare,
  Target,
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Analysis, Contradiction } from '../types';

interface AnalysisResultsProps {
  analysis: Analysis;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis }) => {
  const { reportData } = analysis;

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-red-600 bg-red-100';
    if (score >= 70) return 'text-orange-600 bg-orange-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      political: 'bg-red-100 text-red-800',
      'personal-preference': 'bg-blue-100 text-blue-800',
      factual: 'bg-purple-100 text-purple-800',
      opinion: 'bg-green-100 text-green-800',
      lifestyle: 'bg-yellow-100 text-yellow-800',
      relationship: 'bg-pink-100 text-pink-800',
      technology: 'bg-indigo-100 text-indigo-800',
      entertainment: 'bg-cyan-100 text-cyan-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const verifiedCount = reportData.contradictions.filter(c => c.verified).length;
  const humanReviewCount = reportData.contradictions.filter(c => c.requiresHumanReview).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Analysis Summary */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Analysis Results</h2>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Clock className="h-4 w-4" />
            <span>{new Date(analysis.analysisDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <span className="text-2xl font-bold text-red-600">
                {analysis.contradictionsFound}
              </span>
            </div>
            <p className="text-sm text-red-700 mt-2">Contradictions Found</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <Target className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">
                {analysis.confidenceScore}%
              </span>
            </div>
            <p className="text-sm text-blue-700 mt-2">Avg Confidence</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {verifiedCount}
              </span>
            </div>
            <p className="text-sm text-green-700 mt-2">Verified</p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <Eye className="h-8 w-8 text-amber-600" />
              <span className="text-2xl font-bold text-amber-600">
                {humanReviewCount}
              </span>
            </div>
            <p className="text-sm text-amber-700 mt-2">Needs Review</p>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-lg">
          <h3 className="font-semibold text-slate-800 mb-3">Executive Summary</h3>
          <p className="text-slate-700">{reportData.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-slate-600">Top Subreddits:</span>
            {reportData.stats.topSubreddits.map((sub, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-sm"
              >
                r/{sub}
              </span>
            ))}
          </div>
        </div>

        {/* Quality Indicators */}
        {(verifiedCount > 0 || humanReviewCount > 0) && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {verifiedCount > 0 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">High Confidence Findings</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  {verifiedCount} contradictions verified with 80%+ confidence and clear evidence
                </p>
              </div>
            )}
            
            {humanReviewCount > 0 && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <span className="font-medium text-amber-800">Complex Context Detected</span>
                </div>
                <p className="text-sm text-amber-700 mt-1">
                  {humanReviewCount} findings require human review due to nuanced context
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contradictions List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800">Detailed Contradictions</h3>
        {reportData.contradictions.map((contradiction, index) => (
          <ContradictionCard key={contradiction.id} contradiction={contradiction} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

interface ContradictionCardProps {
  contradiction: Contradiction;
  index: number;
}

const ContradictionCard: React.FC<ContradictionCardProps> = ({ contradiction, index }) => {
  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-red-600 bg-red-100';
    if (score >= 70) return 'text-orange-600 bg-orange-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      political: 'bg-red-100 text-red-800',
      'personal-preference': 'bg-blue-100 text-blue-800',
      factual: 'bg-purple-100 text-purple-800',
      opinion: 'bg-green-100 text-green-800',
      lifestyle: 'bg-yellow-100 text-yellow-800',
      relationship: 'bg-pink-100 text-pink-800',
      technology: 'bg-indigo-100 text-indigo-800',
      entertainment: 'bg-cyan-100 text-cyan-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white rounded-xl shadow-lg p-6 border-2 hover:shadow-xl transition-shadow ${
        contradiction.requiresHumanReview ? 'border-amber-200' : 
        contradiction.verified ? 'border-green-200' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
            <span className="text-red-600 font-bold text-sm">#{index + 1}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(contradiction.category)}`}>
              {contradiction.category.replace('-', ' ')}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(contradiction.confidenceScore)}`}>
              {contradiction.confidenceScore}% confidence
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-slate-600">
          <div className="flex items-center space-x-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{contradiction.upvotes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ThumbsDown className="h-4 w-4" />
            <span>{contradiction.downvotes}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-700">Earlier Statement</span>
            <div className="flex items-center space-x-2 text-xs text-red-600">
              <Calendar className="h-3 w-3" />
              <span>{new Date(contradiction.dates[0]).toLocaleDateString()}</span>
              <span>r/{contradiction.subreddits[0]}</span>
            </div>
          </div>
          <p className="text-slate-800 italic">"{contradiction.statement1}"</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Later Statement</span>
            <div className="flex items-center space-x-2 text-xs text-blue-600">
              <Calendar className="h-3 w-3" />
              <span>{new Date(contradiction.dates[1]).toLocaleDateString()}</span>
              <span>r/{contradiction.subreddits[1]}</span>
            </div>
          </div>
          <p className="text-slate-800 italic">"{contradiction.statement2}"</p>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg">
        <h4 className="font-medium text-slate-800 mb-2">Analysis Context</h4>
        <p className="text-slate-700 text-sm">{contradiction.context}</p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center space-x-2">
          {contradiction.verified && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </span>
          )}
          {contradiction.requiresHumanReview && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              <Eye className="h-3 w-3 mr-1" />
              Needs Review
            </span>
          )}
        </div>
        
        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
          <ExternalLink className="h-4 w-4" />
          <span>View on Reddit</span>
        </button>
      </div>
    </motion.div>
  );
};

export default AnalysisResults;