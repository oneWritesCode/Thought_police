import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Shield, 
  Star, 
  Trophy, 
  Target, 
  Calendar, 
  TrendingUp, 
  Award,
  MessageSquare,
  Eye,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Users,
  Activity,
  Zap,
  Crown,
  Medal
} from 'lucide-react';

interface UserData {
  rank: number;
  username: string;
  points: number;
  cases: number;
  karma: number;
  joinDate?: string;
  accuracyRate?: number;
  badgeCount?: number;
  specializations?: string[];
  recentActivity?: Array<{
    type: 'case' | 'comment' | 'achievement';
    description: string;
    time: string;
    points?: number;
  }>;
  achievements?: Array<{
    name: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    date: string;
  }>;
}

interface UserProfileCardProps {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, isOpen, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!user) return null;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-500 drop-shadow-lg" />;
      case 2:
        return <Trophy className="h-7 w-7 text-gray-400 drop-shadow-lg" />;
      case 3:
        return <Medal className="h-7 w-7 text-amber-600 drop-shadow-lg" />;
      default:
        return <Shield className="h-6 w-6 text-reddit-orange" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 via-amber-500 to-yellow-600';
      case 2:
        return 'from-gray-300 via-gray-400 to-gray-500';
      case 3:
        return 'from-amber-400 via-orange-500 to-amber-600';
      default:
        return 'from-reddit-orange via-red-500 to-reddit-orange-dark';
    }
  };

  const getRedditAvatar = (username: string) => {
    const avatarIndex = username.charCodeAt(0) % 10;
    return `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${avatarIndex}.png`;
  };

  const mockRecentActivity = [
    { type: 'case' as const, description: 'Solved contradiction case #1247', time: '2h ago', points: 150 },
    { type: 'achievement' as const, description: 'Earned "Eagle Eye" badge', time: '1d ago' },
    { type: 'comment' as const, description: 'Top comment in r/ThoughtPolice', time: '2d ago', points: 45 },
    { type: 'case' as const, description: 'Found political contradiction', time: '3d ago', points: 200 },
  ];

  const mockAchievements = [
    { name: 'Truth Seeker', icon: 'target', rarity: 'epic' as const, date: '2024-01-15' },
    { name: 'Eagle Eye', icon: 'eye', rarity: 'rare' as const, date: '2024-02-20' },
    { name: 'First Case', icon: 'award', rarity: 'common' as const, date: '2024-01-10' },
    { name: 'Pattern Master', icon: 'activity', rarity: 'legendary' as const, date: '2024-03-01' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={onClose}
        >
          {/* 3D Card Container */}
          <motion.div
            initial={{ scale: 0.5, rotateY: -180, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotateY: 180, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              duration: 0.8 
            }}
            className="relative w-full max-w-4xl h-[600px] perspective-1000"
            onClick={(e) => e.stopPropagation()}
            style={{ perspective: '1000px' }}
          >
            <motion.div
              className="relative w-full h-full preserve-3d cursor-pointer"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front Side */}
              <div 
                className="absolute inset-0 w-full h-full backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className={`relative w-full h-full bg-gradient-to-br ${getRankColor(user.rank)} rounded-3xl shadow-2xl overflow-hidden`}>
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]"></div>
                  
                  {/* Floating particles */}
                  <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
                  <div className="absolute top-20 right-20 w-3 h-3 bg-white/15 rounded-full animate-ping"></div>
                  <div className="absolute bottom-20 left-20 w-1 h-1 bg-white/25 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-10 right-10 w-2 h-2 bg-white/10 rounded-full animate-ping"></div>

                  {/* Close Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="absolute top-6 right-6 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-sm"
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>

                  {/* Card Content */}
                  <div className="relative z-10 p-8 h-full flex flex-col text-white">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.3, type: "spring" }}
                          className="relative"
                        >
                          {getRankIcon(user.rank)}
                          <div className="absolute inset-0 bg-white/20 rounded-full blur-lg animate-pulse"></div>
                        </motion.div>
                        <div>
                          <motion.h1 
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-3xl font-bold drop-shadow-lg"
                          >
                            u/{user.username}
                          </motion.h1>
                          <motion.p 
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-white/80 text-lg"
                          >
                            Rank #{user.rank} • Elite Detective
                          </motion.p>
                        </div>
                      </div>
                      
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, type: "spring" }}
                        className="text-right"
                      >
                        <div className="text-sm text-white/60">Badge #</div>
                        <div className="text-xl font-bold">TP{user.rank.toString().padStart(6, '0')}</div>
                      </motion.div>
                    </div>

                    {/* Avatar and Stats */}
                    <div className="flex items-center space-x-8 mb-8">
                      <motion.div
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.7, type: "spring" }}
                        className="relative"
                      >
                        <img
                          src={getRedditAvatar(user.username)}
                          alt={user.username}
                          className="w-24 h-24 rounded-full border-4 border-white/30 shadow-xl ring-4 ring-white/10"
                        />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-reddit-orange rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <Star className="h-4 w-4 text-white" />
                        </div>
                      </motion.div>

                      <div className="flex-1 grid grid-cols-3 gap-6">
                        <motion.div
                          initial={{ y: 50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="text-center bg-black/20 rounded-xl p-4 backdrop-blur-sm"
                        >
                          <div className="text-3xl font-bold text-white drop-shadow-lg">{user.points.toLocaleString()}</div>
                          <div className="text-white/70 text-sm">Points</div>
                        </motion.div>
                        
                        <motion.div
                          initial={{ y: 50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.9 }}
                          className="text-center bg-black/20 rounded-xl p-4 backdrop-blur-sm"
                        >
                          <div className="text-3xl font-bold text-white drop-shadow-lg">{user.cases}</div>
                          <div className="text-white/70 text-sm">Cases</div>
                        </motion.div>
                        
                        <motion.div
                          initial={{ y: 50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 1.0 }}
                          className="text-center bg-black/20 rounded-xl p-4 backdrop-blur-sm"
                        >
                          <div className="text-3xl font-bold text-white drop-shadow-lg">{(user.accuracyRate || 89.2).toFixed(1)}%</div>
                          <div className="text-white/70 text-sm">Accuracy</div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.1 }}
                      className="flex-1 bg-black/20 rounded-xl p-6 backdrop-blur-sm"
                    >
                      <h3 className="text-xl font-bold mb-4 flex items-center">
                        <Activity className="h-5 w-5 mr-2" />
                        Recent Activity
                      </h3>
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {mockRecentActivity.map((activity, index) => (
                          <motion.div
                            key={index}
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1.2 + index * 0.1 }}
                            className="flex items-center justify-between bg-white/10 rounded-lg p-3"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${
                                activity.type === 'case' ? 'bg-green-400' :
                                activity.type === 'achievement' ? 'bg-yellow-400' :
                                'bg-blue-400'
                              }`}></div>
                              <div>
                                <div className="text-sm font-medium">{activity.description}</div>
                                <div className="text-xs text-white/60">{activity.time}</div>
                              </div>
                            </div>
                            {activity.points && (
                              <div className="text-green-400 font-bold">+{activity.points}</div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Flip Indicator */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                      className="text-center mt-4"
                    >
                      <div className="text-white/60 text-sm flex items-center justify-center space-x-2">
                        <Zap className="h-4 w-4" />
                        <span>Click to flip card</span>
                        <Zap className="h-4 w-4" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Back Side */}
              <div 
                className="absolute inset-0 w-full h-full backface-hidden"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="relative w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-3xl shadow-2xl overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-reddit-blue/20 via-reddit-orange/20 to-purple-600/20"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,69,0,0.1),transparent_50%)]"></div>
                  
                  {/* Close Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="absolute top-6 right-6 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-sm"
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>

                  {/* Back Content */}
                  <div className="relative z-10 p-8 h-full flex flex-col text-white">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold mb-2">Officer Profile</h2>
                      <p className="text-white/70">Detailed Statistics & Achievements</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      {/* Detailed Stats */}
                      <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                          <Target className="h-5 w-5 mr-2" />
                          Performance
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-white/70">Total Karma</span>
                            <span className="font-bold">{user.karma.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Badge Count</span>
                            <span className="font-bold">{user.badgeCount || 12}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Join Date</span>
                            <span className="font-bold">{user.joinDate || 'Jan 2024'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Rank Progress</span>
                            <span className="font-bold text-green-400">Elite</span>
                          </div>
                        </div>
                      </div>

                      {/* Achievements */}
                      <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                          <Trophy className="h-5 w-5 mr-2" />
                          Achievements
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {mockAchievements.map((achievement, index) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0, rotate: 180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                              className={`text-center p-3 rounded-lg ${
                                achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                achievement.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                achievement.rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                                'bg-gradient-to-r from-green-500 to-emerald-500'
                              }`}
                            >
                              <Trophy className="h-6 w-6 text-white mx-auto mb-1" />
                              <div className="text-xs font-medium text-white">{achievement.name}</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Specializations */}
                    <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm flex-1">
                      <h3 className="text-lg font-bold mb-4 flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Specializations
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {['Political Analysis', 'Sentiment Detection', 'Pattern Recognition', 'Fact Checking', 'Behavioral Analysis'].map((spec, index) => (
                          <motion.span
                            key={index}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8 + index * 0.1 }}
                            className="px-3 py-1 bg-reddit-orange/20 border border-reddit-orange/30 rounded-full text-sm text-reddit-orange-light"
                          >
                            {spec}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {/* Flip Indicator */}
                    <div className="text-center mt-4">
                      <div className="text-white/60 text-sm flex items-center justify-center space-x-2">
                        <Zap className="h-4 w-4" />
                        <span>Click to flip back</span>
                        <Zap className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserProfileCard;