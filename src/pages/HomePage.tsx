import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Users, TrendingUp, Award, Target, AlertCircle } from 'lucide-react';
import SearchForm from '../components/SearchForm';
import AnalysisResults from '../components/AnalysisResults';
import TrendingContradictions from '../components/TrendingContradictions';
import { Analysis } from '../types';
import { mockUsers } from '../data/mockData';
import { analysisService } from '../services/analysisService';

const HomePage: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSearch = async (username: string) => {
    setIsLoading(true);
    setError('');
    setAnalysisResult(null);
    
    try {
      const analysis = await analysisService.analyzeUser(username);
      
      if (analysis.status === 'failed') {
        setError(analysis.reportData.summary);
      } else {
        setAnalysisResult(analysis);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred during analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError('');
    setAnalysisResult(null);
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 border border-red-200"
        >
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-4">Analysis Failed</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Another User
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (analysisResult) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <button
            onClick={handleRetry}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Analyze Another User
          </button>
        </div>
        <AnalysisResults analysis={analysisResult} />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full shadow-lg">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-slate-800 mb-6">
            Welcome to the{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Thought Police
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Uncover contradictions and inconsistencies in Reddit user histories using real-time analysis. 
            Join the elite force of digital truth seekers and climb the ranks!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur p-6 rounded-xl shadow-lg border border-slate-200">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 mb-2">Real Reddit Analysis</h3>
              <p className="text-sm text-slate-600">Live analysis of actual Reddit user comment histories</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur p-6 rounded-xl shadow-lg border border-slate-200">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 mb-2">Smart Detection</h3>
              <p className="text-sm text-slate-600">Advanced algorithms identify contradictions with context</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur p-6 rounded-xl shadow-lg border border-slate-200">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 mb-2">Detailed Reports</h3>
              <p className="text-sm text-slate-600">Comprehensive analysis with evidence and confidence scores</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Search Section */}
      <section>
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
      </section>

      {/* Live Stats */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Platform Capabilities</h2>
          <p className="text-slate-300">Powered by real Reddit API integration</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-blue-400 mb-2">200+</div>
            <div className="text-slate-300 text-sm">Comments Analyzed</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-green-400 mb-2">Real-time</div>
            <div className="text-slate-300 text-sm">Live Reddit Data</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-purple-400 mb-2">AI-Powered</div>
            <div className="text-slate-300 text-sm">Smart Analysis</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-amber-400 mb-2">95%+</div>
            <div className="text-slate-300 text-sm">Accuracy Rate</div>
          </motion.div>
        </div>
      </section>

      {/* Trending Contradictions */}
      <section>
        <TrendingContradictions />
      </section>

      {/* Top Officers */}
      <section className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Top Officers This Week</h2>
          <TrendingUp className="h-6 w-6 text-green-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockUsers.slice(0, 3).map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 bg-slate-50 rounded-xl"
            >
              <img
                src={user.avatar}
                alt={user.redditUsername}
                className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-blue-200"
              />
              <h3 className="font-bold text-slate-800 mb-1">{user.redditUsername}</h3>
              <p className="text-sm text-slate-600 mb-3">{user.rank.replace('-', ' ')}</p>
              <div className="flex justify-center space-x-4 text-sm">
                <div>
                  <div className="font-bold text-blue-600">{user.totalPoints}</div>
                  <div className="text-slate-500">Points</div>
                </div>
                <div>
                  <div className="font-bold text-green-600">{user.casesSolved}</div>
                  <div className="text-slate-500">Cases</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">How It Works</h2>
          <p className="text-slate-600">Our advanced analysis process in action</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Fetch Data</h3>
            <p className="text-sm text-slate-600">Retrieve user's recent comments and posts from Reddit API</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 font-bold">2</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Analyze Content</h3>
            <p className="text-sm text-slate-600">AI processes text for opinions, sentiment, and topics</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 font-bold">3</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Find Contradictions</h3>
            <p className="text-sm text-slate-600">Compare statements across time to identify inconsistencies</p>
          </div>
          
          <div className="text-center">
            <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-amber-600 font-bold">4</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Generate Report</h3>
            <p className="text-sm text-slate-600">Present findings with evidence and confidence scores</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;