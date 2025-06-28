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
          className="bg-white dark:bg-primary-800 rounded-xl shadow-lg p-8 border border-red-200 dark:border-red-700 transition-colors duration-200"
        >
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-primary-900 dark:text-white mb-4 transition-colors duration-200">Analysis Failed</h2>
            <p className="text-primary-600 dark:text-primary-300 mb-6 transition-colors duration-200">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-reddit-blue text-white px-6 py-2 rounded-lg hover:bg-reddit-blue-dark transition-colors"
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
            className="text-reddit-blue hover:text-reddit-blue-dark font-medium transition-colors duration-200"
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
            <div className="bg-gradient-to-r from-reddit-blue to-reddit-orange p-4 rounded-full shadow-lg">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-primary-900 dark:text-white mb-6 transition-colors duration-200">
            Welcome to the{' '}
            <span className="bg-gradient-to-r from-reddit-blue to-reddit-orange bg-clip-text text-transparent">
              Thought Police
            </span>
          </h1>
          
          <p className="text-xl text-primary-600 dark:text-primary-300 mb-8 leading-relaxed transition-colors duration-200">
            Uncover contradictions and inconsistencies in Reddit user histories using real-time analysis. 
            Join the elite force of digital truth seekers and climb the ranks!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-primary-800 p-6 rounded-xl shadow-lg border border-primary-200 dark:border-primary-700 transition-colors duration-200">
              <Zap className="h-8 w-8 text-reddit-blue mx-auto mb-3" />
              <h3 className="font-semibold text-primary-900 dark:text-white mb-2 transition-colors duration-200">Real Reddit Analysis</h3>
              <p className="text-sm text-primary-600 dark:text-primary-300 transition-colors duration-200">Live analysis of actual Reddit user comment histories</p>
            </div>
            
            <div className="bg-white dark:bg-primary-800 p-6 rounded-xl shadow-lg border border-primary-200 dark:border-primary-700 transition-colors duration-200">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-primary-900 dark:text-white mb-2 transition-colors duration-200">Smart Detection</h3>
              <p className="text-sm text-primary-600 dark:text-primary-300 transition-colors duration-200">Advanced algorithms identify contradictions with context</p>
            </div>
            
            <div className="bg-white dark:bg-primary-800 p-6 rounded-xl shadow-lg border border-primary-200 dark:border-primary-700 transition-colors duration-200">
              <Award className="h-8 w-8 text-reddit-orange mx-auto mb-3" />
              <h3 className="font-semibold text-primary-900 dark:text-white mb-2 transition-colors duration-200">Detailed Reports</h3>
              <p className="text-sm text-primary-600 dark:text-primary-300 transition-colors duration-200">Comprehensive analysis with evidence and confidence scores</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Search Section */}
      <section>
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
      </section>

      {/* Platform Capabilities - Fixed for Light Mode */}
      <section className="bg-white dark:bg-gradient-to-r dark:from-primary-800 dark:to-primary-900 border border-primary-200 dark:border-transparent rounded-2xl p-8 shadow-lg transition-colors duration-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary-900 dark:text-white mb-4 transition-colors duration-200">Platform Capabilities</h2>
          <p className="text-primary-600 dark:text-primary-300 transition-colors duration-200">Powered by real Reddit API integration</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center p-4 bg-primary-50 dark:bg-transparent rounded-lg transition-colors duration-200"
          >
            <div className="text-3xl font-bold text-reddit-blue mb-2">200+</div>
            <div className="text-primary-600 dark:text-primary-300 text-sm transition-colors duration-200">Comments Analyzed</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center p-4 bg-primary-50 dark:bg-transparent rounded-lg transition-colors duration-200"
          >
            <div className="text-3xl font-bold text-green-600 mb-2">Real-time</div>
            <div className="text-primary-600 dark:text-primary-300 text-sm transition-colors duration-200">Live Reddit Data</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center p-4 bg-primary-50 dark:bg-transparent rounded-lg transition-colors duration-200"
          >
            <div className="text-3xl font-bold text-reddit-orange mb-2">AI-Powered</div>
            <div className="text-primary-600 dark:text-primary-300 text-sm transition-colors duration-200">Smart Analysis</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center p-4 bg-primary-50 dark:bg-transparent rounded-lg transition-colors duration-200"
          >
            <div className="text-3xl font-bold text-yellow-600 mb-2">95%+</div>
            <div className="text-primary-600 dark:text-primary-300 text-sm transition-colors duration-200">Accuracy Rate</div>
          </motion.div>
        </div>
      </section>

      {/* Trending Contradictions */}
      <section>
        <TrendingContradictions />
      </section>

      {/* Top Officers */}
      <section className="bg-white dark:bg-primary-800 rounded-2xl shadow-xl p-8 border border-primary-200 dark:border-primary-700 transition-colors duration-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-primary-900 dark:text-white transition-colors duration-200">Top Officers This Week</h2>
          <TrendingUp className="h-6 w-6 text-green-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockUsers.slice(0, 3).map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 bg-primary-50 dark:bg-primary-700 rounded-xl transition-colors duration-200"
            >
              <img
                src={user.avatar}
                alt={user.redditUsername}
                className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-reddit-blue"
              />
              <h3 className="font-bold text-primary-900 dark:text-white mb-1 transition-colors duration-200">{user.redditUsername}</h3>
              <p className="text-sm text-primary-600 dark:text-primary-300 mb-3 transition-colors duration-200">{user.rank.replace('-', ' ')}</p>
              <div className="flex justify-center space-x-4 text-sm">
                <div>
                  <div className="font-bold text-reddit-blue">{user.totalPoints}</div>
                  <div className="text-primary-500">Points</div>
                </div>
                <div>
                  <div className="font-bold text-green-600">{user.casesSolved}</div>
                  <div className="text-primary-500">Cases</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gradient-to-r from-primary-100 to-reddit-blue/10 dark:from-primary-800 dark:to-primary-900 rounded-2xl p-8 transition-colors duration-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary-900 dark:text-white mb-4 transition-colors duration-200">How It Works</h2>
          <p className="text-primary-600 dark:text-primary-300 transition-colors duration-200">Our advanced analysis process in action</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-reddit-blue/10 dark:bg-reddit-blue/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200">
              <span className="text-reddit-blue font-bold">1</span>
            </div>
            <h3 className="font-semibold text-primary-900 dark:text-white mb-2 transition-colors duration-200">Fetch Data</h3>
            <p className="text-sm text-primary-600 dark:text-primary-300 transition-colors duration-200">Retrieve user's recent comments and posts from Reddit API</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-600/10 dark:bg-green-600/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200">
              <span className="text-green-600 font-bold">2</span>
            </div>
            <h3 className="font-semibold text-primary-900 dark:text-white mb-2 transition-colors duration-200">Analyze Content</h3>
            <p className="text-sm text-primary-600 dark:text-primary-300 transition-colors duration-200">AI processes text for opinions, sentiment, and topics</p>
          </div>
          
          <div className="text-center">
            <div className="bg-reddit-orange/10 dark:bg-reddit-orange/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200">
              <span className="text-reddit-orange font-bold">3</span>
            </div>
            <h3 className="font-semibold text-primary-900 dark:text-white mb-2 transition-colors duration-200">Find Contradictions</h3>
            <p className="text-sm text-primary-600 dark:text-primary-300 transition-colors duration-200">Compare statements across time to identify inconsistencies</p>
          </div>
          
          <div className="text-center">
            <div className="bg-yellow-500/10 dark:bg-yellow-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200">
              <span className="text-yellow-600 font-bold">4</span>
            </div>
            <h3 className="font-semibold text-primary-900 dark:text-white mb-2 transition-colors duration-200">Generate Report</h3>
            <p className="text-sm text-primary-600 dark:text-primary-300 transition-colors duration-200">Present findings with evidence and confidence scores</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;