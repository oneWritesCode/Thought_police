import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  FileText, 
  Award, 
  Target, 
  Star,
  Shield,
  Trophy,
  Medal,
  Users,
  ArrowUp,
  ArrowDown,
  Share,
  Cake,
  Settings
} from 'lucide-react';
import { mockUsers, mockAchievements } from '../data/mockData';
import { useAuth0 } from '@auth0/auth0-react';
import LoginPage from './LoginPage';

const ProfilePage: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'about'>('posts');
  
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  // Using first mock user as current user
  const currentUser = mockUsers[0];

  const tabs = [
    { key: 'posts', label: 'Posts', icon: FileText, count: 42 },
    { key: 'comments', label: 'Comments', icon: MessageSquare, count: 156 },
    { key: 'about', label: 'About', icon: Users, count: null }
  ];

  const userPosts = [
    {
      id: '1',
      title: '🚨 Found major contradiction in r/politics user - Claims to hate politicians but posts in r/The_Donald daily',
      subreddit: 'ThoughtPolice',
      upvotes: 847,
      comments: 23,
      timeAgo: '2h ago',
      awards: 3,
      isUpvoted: true
    },
    {
      id: '2',
      title: 'Analysis complete: u/contradictory_carl shows 94% inconsistency rate across 200 comments',
      subreddit: 'ThoughtPolice',
      upvotes: 234,
      comments: 15,
      timeAgo: '1d ago',
      awards: 1,
      isUpvoted: false
    },
    {
      id: '3',
      title: 'Weekly Report: Top 10 most contradictory users this week',
      subreddit: 'ThoughtPolice',
      upvotes: 567,
      comments: 45,
      timeAgo: '3d ago',
      awards: 5,
      isUpvoted: true
    }
  ];

  const userComments = [
    {
      id: '1',
      content: 'Great analysis! I found similar patterns when analyzing political subreddits. The cognitive dissonance is fascinating.',
      subreddit: 'ThoughtPolice',
      postTitle: 'Study: Political bias detection in comment histories',
      upvotes: 45,
      timeAgo: '3h ago',
      isUpvoted: true
    },
    {
      id: '2',
      content: 'This is exactly why we need more transparency in online discourse. Keep up the excellent work!',
      subreddit: 'changemyview',
      postTitle: 'CMV: Social media platforms should flag contradictory users',
      upvotes: 12,
      timeAgo: '6h ago',
      isUpvoted: false
    },
    {
      id: '3',
      content: 'Have you considered using sentiment analysis alongside contradiction detection? Could provide more context.',
      subreddit: 'MachineLearning',
      postTitle: 'NLP techniques for detecting inconsistencies in text',
      upvotes: 78,
      timeAgo: '1d ago',
      isUpvoted: true
    }
  ];

  const getRedditAvatar = (username: string) => {
    const avatarIndex = username.charCodeAt(0) % 10;
    return `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${avatarIndex}.png`;
  };

  const formatKarma = (karma: number) => {
    if (karma >= 1000) {
      return `${(karma / 1000).toFixed(1)}k`;
    }
    return karma.toString();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Reddit-style Profile Header */}
      <div className="bg-reddit-light-bg dark:bg-reddit-dark-bg-paper rounded-lg border border-reddit-light-border dark:border-reddit-dark-border overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-reddit-orange via-red-500 to-reddit-orange-dark relative">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        {/* Profile Info */}
        <div className="px-6 py-4 relative">
          <div className="flex items-start space-x-4">
            <div className="relative -mt-12">
              <img
                src={getRedditAvatar(currentUser.redditUsername)}
                alt={currentUser.redditUsername}
                className="w-20 h-20 rounded-full border-4 border-reddit-light-bg dark:border-reddit-dark-bg-paper bg-reddit-light-bg dark:bg-reddit-dark-bg-paper"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-reddit-orange rounded-full border-2 border-reddit-light-bg dark:border-reddit-dark-bg-paper flex items-center justify-center">
                <Shield className="h-3 w-3 text-white" />
              </div>
            </div>
            
            <div className="flex-1 mt-2">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-reddit-light-text dark:text-reddit-dark-text">
                  u/{currentUser.redditUsername}
                </h1>
                <div className="flex items-center space-x-2">
                  <div className="bg-reddit-orange text-white px-2 py-1 rounded text-xs font-medium">
                    {currentUser.rank.replace('-', ' ').toUpperCase()}
                  </div>
                  <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                    VERIFIED
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary">
                <div className="flex items-center space-x-1">
                  <Cake className="h-4 w-4" />
                  <span>Cake day: March 15, 2022</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4" />
                  <span>{formatKarma(currentUser.totalPoints)} karma</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>{currentUser.casesSolved} cases solved</span>
                </div>
              </div>
              
              <p className="text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary mt-2">
                Digital truth seeker • Contradiction detective • Making Reddit more honest, one analysis at a time 🕵️‍♂️
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="bg-reddit-light-bg-hover dark:bg-reddit-dark-bg-hover border border-reddit-light-border dark:border-reddit-dark-border px-4 py-2 rounded-full text-sm font-medium text-reddit-light-text dark:text-reddit-dark-text hover:bg-reddit-light-border dark:hover:bg-reddit-dark-border transition-colors">
                Start Chat
              </button>
              <button className="bg-reddit-orange text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-reddit-orange-hover transition-colors">
                Follow
              </button>
              <button className="p-2 text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary hover:text-reddit-light-text dark:hover:text-reddit-dark-text">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Navigation Tabs */}
          <div className="bg-reddit-light-bg dark:bg-reddit-dark-bg-paper rounded-lg border border-reddit-light-border dark:border-reddit-dark-border overflow-hidden">
            <div className="flex border-b border-reddit-light-border dark:border-reddit-dark-border">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as 'posts' | 'comments' | 'about')}
                    className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === tab.key
                        ? 'border-reddit-orange text-reddit-orange bg-reddit-light-bg-hover dark:bg-reddit-dark-bg-hover'
                        : 'border-transparent text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary hover:text-reddit-light-text dark:hover:text-reddit-dark-text hover:bg-reddit-light-bg-hover dark:hover:bg-reddit-dark-bg-hover'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{tab.label}</span>
                    {tab.count && (
                      <span className="bg-reddit-light-bg-hover dark:bg-reddit-dark-bg-hover px-2 py-1 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-reddit-light-bg dark:bg-reddit-dark-bg-paper rounded-lg border border-reddit-light-border dark:border-reddit-dark-border overflow-hidden hover:border-reddit-light-border-hover dark:hover:border-reddit-dark-border-hover transition-colors"
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Voting */}
                      <div className="flex flex-col items-center space-y-1">
                        <ArrowUp className={`h-5 w-5 cursor-pointer ${post.isUpvoted ? 'text-reddit-orange' : 'text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary hover:text-reddit-orange'}`} />
                        <span className={`text-sm font-medium ${post.isUpvoted ? 'text-reddit-orange' : 'text-reddit-light-text dark:text-reddit-dark-text'}`}>
                          {formatKarma(post.upvotes)}
                        </span>
                        <ArrowDown className="h-5 w-5 text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary hover:text-blue-600 cursor-pointer" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 text-xs text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary mb-2">
                          <span>r/{post.subreddit}</span>
                          <span>•</span>
                          <span>Posted by u/{currentUser.redditUsername}</span>
                          <span>•</span>
                          <span>{post.timeAgo}</span>
                        </div>
                        
                        <h3 className="text-reddit-light-text dark:text-reddit-dark-text font-medium hover:text-reddit-orange cursor-pointer mb-3">
                          {post.title}
                        </h3>
                        
                        <div className="flex items-center space-x-4 text-sm text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary">
                          <div className="flex items-center space-x-1 hover:bg-reddit-light-bg-hover dark:hover:bg-reddit-dark-bg-hover px-2 py-1 rounded cursor-pointer">
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.comments} Comments</span>
                          </div>
                          <div className="flex items-center space-x-1 hover:bg-reddit-light-bg-hover dark:hover:bg-reddit-dark-bg-hover px-2 py-1 rounded cursor-pointer">
                            <Share className="h-4 w-4" />
                            <span>Share</span>
                          </div>
                          {post.awards > 0 && (
                            <div className="flex items-center space-x-1">
                              <Award className="h-4 w-4 text-reddit-orange" />
                              <span>{post.awards}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              {userComments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-reddit-light-bg dark:bg-reddit-dark-bg-paper rounded-lg border border-reddit-light-border dark:border-reddit-dark-border overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Voting */}
                      <div className="flex flex-col items-center space-y-1">
                        <ArrowUp className={`h-4 w-4 cursor-pointer ${comment.isUpvoted ? 'text-reddit-orange' : 'text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary hover:text-reddit-orange'}`} />
                        <span className={`text-xs font-medium ${comment.isUpvoted ? 'text-reddit-orange' : 'text-reddit-light-text dark:text-reddit-dark-text'}`}>
                          {comment.upvotes}
                        </span>
                        <ArrowDown className="h-4 w-4 text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary hover:text-blue-600 cursor-pointer" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="text-xs text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary mb-2">
                          <span className="hover:underline cursor-pointer">u/{currentUser.redditUsername}</span>
                          <span className="mx-1">•</span>
                          <span>{comment.timeAgo}</span>
                          <span className="mx-1">•</span>
                          <span className="hover:underline cursor-pointer">r/{comment.subreddit}</span>
                        </div>
                        
                        <div className="text-xs text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary mb-2 italic">
                          Comment on: {comment.postTitle}
                        </div>
                        
                        <p className="text-reddit-light-text dark:text-reddit-dark-text text-sm mb-3">
                          {comment.content}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary">
                          <span className="hover:bg-reddit-light-bg-hover dark:hover:bg-reddit-dark-bg-hover px-2 py-1 rounded cursor-pointer">
                            Reply
                          </span>
                          <span className="hover:bg-reddit-light-bg-hover dark:hover:bg-reddit-dark-bg-hover px-2 py-1 rounded cursor-pointer">
                            Share
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-reddit-light-bg dark:bg-reddit-dark-bg-paper rounded-lg border border-reddit-light-border dark:border-reddit-dark-border p-6"
            >
              <h3 className="text-lg font-bold text-reddit-light-text dark:text-reddit-dark-text mb-4">
                About u/{currentUser.redditUsername}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-reddit-light-text dark:text-reddit-dark-text mb-2">Bio</h4>
                  <p className="text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary">
                    Professional contradiction detective with a passion for digital truth-seeking. 
                    Specializing in political discourse analysis and behavioral pattern recognition.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-reddit-light-text dark:text-reddit-dark-text mb-2">Achievements</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-reddit-orange" />
                      <span className="text-sm text-reddit-light-text dark:text-reddit-dark-text">Top Detective</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Medal className="h-4 w-4 text-reddit-orange" />
                      <span className="text-sm text-reddit-light-text dark:text-reddit-dark-text">Eagle Eye</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-reddit-orange" />
                      <span className="text-sm text-reddit-light-text dark:text-reddit-dark-text">Truth Seeker</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-reddit-orange" />
                      <span className="text-sm text-reddit-light-text dark:text-reddit-dark-text">Pattern Master</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Karma Breakdown */}
          <div className="bg-reddit-light-bg dark:bg-reddit-dark-bg-paper rounded-lg border border-reddit-light-border dark:border-reddit-dark-border overflow-hidden">
            <div className="px-4 py-3 bg-reddit-light-bg-hover dark:bg-reddit-dark-bg-hover border-b border-reddit-light-border dark:border-reddit-dark-border">
              <h3 className="font-medium text-reddit-light-text dark:text-reddit-dark-text">
                Karma Breakdown
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary text-sm">Post Karma</span>
                <span className="font-medium text-reddit-light-text dark:text-reddit-dark-text">{formatKarma(currentUser.totalPoints * 0.7)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary text-sm">Comment Karma</span>
                <span className="font-medium text-reddit-light-text dark:text-reddit-dark-text">{formatKarma(currentUser.totalPoints * 0.3)}</span>
              </div>
              <div className="flex justify-between border-t border-reddit-light-border dark:border-reddit-dark-border pt-2">
                <span className="text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary text-sm font-medium">Total Karma</span>
                <span className="font-bold text-reddit-orange">{formatKarma(currentUser.totalPoints)}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-reddit-light-bg dark:bg-reddit-dark-bg-paper rounded-lg border border-reddit-light-border dark:border-reddit-dark-border overflow-hidden">
            <div className="px-4 py-3 bg-reddit-light-bg-hover dark:bg-reddit-dark-bg-hover border-b border-reddit-light-border dark:border-reddit-dark-border">
              <h3 className="font-medium text-reddit-light-text dark:text-reddit-dark-text">
                Profile Stats
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary text-sm">Cases Solved</span>
                <span className="font-medium text-reddit-light-text dark:text-reddit-dark-text">{currentUser.casesSolved}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary text-sm">Accuracy Rate</span>
                <span className="font-medium text-reddit-light-text dark:text-reddit-dark-text">{currentUser.accuracyRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary text-sm">Rank</span>
                <span className="font-medium text-reddit-orange">{currentUser.rank.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-reddit-light-text-secondary dark:text-reddit-dark-text-secondary text-sm">Badge Count</span>
                <span className="font-medium text-reddit-light-text dark:text-reddit-dark-text">{currentUser.badgeCount}</span>
              </div>
            </div>
          </div>

          {/* Trophy Case */}
          <div className="bg-reddit-light-bg dark:bg-reddit-dark-bg-paper rounded-lg border border-reddit-light-border dark:border-reddit-dark-border overflow-hidden">
            <div className="px-4 py-3 bg-reddit-light-bg-hover dark:bg-reddit-dark-bg-hover border-b border-reddit-light-border dark:border-reddit-dark-border">
              <h3 className="font-medium text-reddit-light-text dark:text-reddit-dark-text flex items-center">
                <Trophy className="h-4 w-4 mr-2" />
                Trophy Case
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3">
                                 {mockAchievements.filter(a => a.unlockedAt).slice(0, 6).map((achievement) => (
                   <div key={achievement.id} className="text-center">
                    <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${
                      achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      achievement.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                      achievement.rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                      'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}>
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-xs text-reddit-light-text dark:text-reddit-dark-text font-medium truncate">
                      {achievement.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Communities */}
          <div className="bg-reddit-light-bg dark:bg-reddit-dark-bg-paper rounded-lg border border-reddit-light-border dark:border-reddit-dark-border overflow-hidden">
            <div className="px-4 py-3 bg-reddit-light-bg-hover dark:bg-reddit-dark-bg-hover border-b border-reddit-light-border dark:border-reddit-dark-border">
              <h3 className="font-medium text-reddit-light-text dark:text-reddit-dark-text">
                Active Communities
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {['ThoughtPolice', 'changemyview', 'MachineLearning', 'politics', 'dataisbeautiful'].map((community) => (
                <div key={community} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-reddit-orange rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">r/</span>
                  </div>
                  <span className="text-sm text-reddit-light-text dark:text-reddit-dark-text hover:text-reddit-orange cursor-pointer">
                    r/{community}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;