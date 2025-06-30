import React, { useState, useEffect, useRef } from 'react';
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
  Medal,
  Download,
  Share2,
  Camera,
  Twitter,
  Facebook,
  Instagram,
  Copy
} from 'lucide-react';
import html2canvas from 'html2canvas';

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
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setScreenHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Determine if we need compact mode based on screen height
  const isCompactMode = screenHeight < 700;
  const cardHeight = isCompactMode ? Math.min(screenHeight - 80, 550) : 600;

  const captureCard = async () => {
    if (!cardRef.current) return;

    setIsCapturing(true);
    try {
      // Hide share buttons and close button during capture
      const shareButtons = document.querySelectorAll('.share-controls');
      const closeButtons = document.querySelectorAll('.close-button');
      
      shareButtons.forEach(btn => (btn as HTMLElement).style.display = 'none');
      closeButtons.forEach(btn => (btn as HTMLElement).style.display = 'none');

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: 'transparent',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
      });

      // Restore buttons
      shareButtons.forEach(btn => (btn as HTMLElement).style.display = '');
      closeButtons.forEach(btn => (btn as HTMLElement).style.display = '');

      return canvas;
    } catch (error) {
      console.error('Failed to capture card:', error);
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const downloadImage = async () => {
    const canvas = await captureCard();
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `thought-police-${user.username}-card.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const shareToSocial = async (platform: string) => {
    const canvas = await captureCard();
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const text = `Check out my Thought Police officer card! 🚔 Rank #${user.rank} with ${user.points} points! #ThoughtPolice #RedditAnalysis`;
      
      if (navigator.share && platform === 'native') {
        try {
          const file = new File([blob], `thought-police-${user.username}.png`, { type: 'image/png' });
          await navigator.share({
            title: 'My Thought Police Card',
            text,
            files: [file]
          });
        } catch (error) {
          console.log('Native sharing failed, falling back to download');
          downloadImage();
        }
      } else {
        // Fallback to platform-specific URLs
        const urls = {
          twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
          instagram: '', // Instagram doesn't support direct URL sharing
        };

        if (urls[platform as keyof typeof urls]) {
          window.open(urls[platform as keyof typeof urls], '_blank');
        }
        
        // Also download the image for manual sharing
        downloadImage();
      }
    }, 'image/png');
  };

  const copyToClipboard = async () => {
    const canvas = await captureCard();
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      try {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        
        // Show success feedback
        const button = document.querySelector('.copy-button');
        if (button) {
          button.textContent = 'Copied!';
          setTimeout(() => {
            button.textContent = 'Copy Image';
          }, 2000);
        }
      } catch (error) {
        console.log('Clipboard API failed, downloading instead');
        downloadImage();
      }
    }, 'image/png');
  };

  const getRankIcon = (rank: number) => {
    const iconSize = isCompactMode ? 'h-6 w-6' : 'h-8 w-8';
    switch (rank) {
      case 1:
        return <Crown className={`${iconSize} text-yellow-500 drop-shadow-lg`} />;
      case 2:
        return <Trophy className={`${iconSize} text-gray-400 drop-shadow-lg`} />;
      case 3:
        return <Medal className={`${iconSize} text-amber-600 drop-shadow-lg`} />;
      default:
        return <Shield className={`${iconSize} text-reddit-orange`} />;
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
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-y-auto"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={onClose}
        >
          {/* 3D Card Container */}
          <motion.div
            ref={cardRef}
            initial={{ scale: 0.5, rotateY: -180, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotateY: 180, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              duration: 0.8 
            }}
            className="relative w-full max-w-4xl perspective-1000 my-auto"
            style={{ 
              perspective: '1000px',
              height: `${cardHeight}px`,
              minHeight: '500px'
            }}
            onClick={(e) => e.stopPropagation()}
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
                    className="close-button absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-sm"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>

                  {/* Card Content - Scrollable */}
                  <div className="relative z-10 h-full flex flex-col text-white overflow-y-auto">
                    <div className={`p-${isCompactMode ? '6' : '8'} flex-1`}>
                      {/* Header */}
                      <div className={`flex items-center justify-between ${isCompactMode ? 'mb-4' : 'mb-6'}`}>
                        <div className="flex items-center space-x-3">
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
                              className={`${isCompactMode ? 'text-2xl' : 'text-3xl'} font-bold drop-shadow-lg`}
                            >
                              u/{user.username}
                            </motion.h1>
                            <motion.p 
                              initial={{ x: -50, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.5 }}
                              className={`text-white/80 ${isCompactMode ? 'text-base' : 'text-lg'}`}
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
                          <div className="text-xs text-white/60">Badge #</div>
                          <div className={`${isCompactMode ? 'text-lg' : 'text-xl'} font-bold`}>TP{user.rank.toString().padStart(6, '0')}</div>
                        </motion.div>
                      </div>

                      {/* Avatar and Stats */}
                      <div className={`flex items-center ${isCompactMode ? 'space-x-4 mb-4' : 'space-x-8 mb-8'}`}>
                        <motion.div
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.7, type: "spring" }}
                          className="relative flex-shrink-0"
                        >
                          <img
                            src={getRedditAvatar(user.username)}
                            alt={user.username}
                            className={`${isCompactMode ? 'w-16 h-16' : 'w-24 h-24'} rounded-full border-4 border-white/30 shadow-xl ring-4 ring-white/10`}
                          />
                          <div className={`absolute -top-1 -right-1 ${isCompactMode ? 'w-6 h-6' : 'w-8 h-8'} bg-reddit-orange rounded-full flex items-center justify-center shadow-lg border-2 border-white`}>
                            <Star className={`${isCompactMode ? 'h-3 w-3' : 'h-4 w-4'} text-white`} />
                          </div>
                        </motion.div>

                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className={`text-center bg-black/20 rounded-xl ${isCompactMode ? 'p-3' : 'p-4'} backdrop-blur-sm`}
                          >
                            <div className={`${isCompactMode ? 'text-xl' : 'text-3xl'} font-bold text-white drop-shadow-lg`}>{user.points.toLocaleString()}</div>
                            <div className="text-white/70 text-xs">Points</div>
                          </motion.div>
                          
                          <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className={`text-center bg-black/20 rounded-xl ${isCompactMode ? 'p-3' : 'p-4'} backdrop-blur-sm`}
                          >
                            <div className={`${isCompactMode ? 'text-xl' : 'text-3xl'} font-bold text-white drop-shadow-lg`}>{user.cases}</div>
                            <div className="text-white/70 text-xs">Cases</div>
                          </motion.div>
                          
                          <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.0 }}
                            className={`text-center bg-black/20 rounded-xl ${isCompactMode ? 'p-3' : 'p-4'} backdrop-blur-sm`}
                          >
                            <div className={`${isCompactMode ? 'text-xl' : 'text-3xl'} font-bold text-white drop-shadow-lg`}>{(user.accuracyRate || 89.2).toFixed(1)}%</div>
                            <div className="text-white/70 text-xs">Accuracy</div>
                          </motion.div>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.1 }}
                        className={`bg-black/20 rounded-xl ${isCompactMode ? 'p-4' : 'p-6'} backdrop-blur-sm flex-1`}
                      >
                        <h3 className={`${isCompactMode ? 'text-lg' : 'text-xl'} font-bold mb-3 flex items-center`}>
                          <Activity className="h-4 w-4 mr-2" />
                          Recent Activity
                        </h3>
                        <div className={`space-y-2 ${isCompactMode ? 'max-h-32' : 'max-h-40'} overflow-y-auto`}>
                          {mockRecentActivity.slice(0, isCompactMode ? 3 : 4).map((activity, index) => (
                            <motion.div
                              key={index}
                              initial={{ x: -30, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 1.2 + index * 0.1 }}
                              className={`flex items-center justify-between bg-white/10 rounded-lg ${isCompactMode ? 'p-2' : 'p-3'}`}
                            >
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  activity.type === 'case' ? 'bg-green-400' :
                                  activity.type === 'achievement' ? 'bg-yellow-400' :
                                  'bg-blue-400'
                                }`}></div>
                                <div className="min-w-0 flex-1">
                                  <div className={`${isCompactMode ? 'text-xs' : 'text-sm'} font-medium truncate`}>{activity.description}</div>
                                  <div className="text-xs text-white/60">{activity.time}</div>
                                </div>
                              </div>
                              {activity.points && (
                                <div className={`text-green-400 font-bold flex-shrink-0 ${isCompactMode ? 'text-xs' : 'text-sm'}`}>+{activity.points}</div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>

                    {/* Flip Indicator */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                      className={`text-center ${isCompactMode ? 'py-2' : 'py-4'}`}
                    >
                      <div className="text-white/60 text-xs flex items-center justify-center space-x-2">
                        <Zap className="h-3 w-3" />
                        <span>Click to flip card</span>
                        <Zap className="h-3 w-3" />
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
                    className="close-button absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-sm"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>

                  {/* Back Content - Scrollable */}
                  <div className="relative z-10 h-full flex flex-col text-white overflow-y-auto">
                    <div className={`p-${isCompactMode ? '6' : '8'} flex-1`}>
                      <div className="text-center mb-4">
                        <h2 className={`${isCompactMode ? 'text-xl' : 'text-2xl'} font-bold mb-2`}>Officer Profile</h2>
                        <p className="text-white/70 text-sm">Detailed Statistics & Achievements</p>
                      </div>

                      <div className={`grid grid-cols-1 ${isCompactMode ? 'gap-4 mb-4' : 'md:grid-cols-2 gap-6 mb-6'}`}>
                        {/* Detailed Stats */}
                        <div className={`bg-black/20 rounded-xl ${isCompactMode ? 'p-4' : 'p-6'} backdrop-blur-sm`}>
                          <h3 className={`${isCompactMode ? 'text-base' : 'text-lg'} font-bold mb-3 flex items-center`}>
                            <Target className="h-4 w-4 mr-2" />
                            Performance
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-white/70 text-sm">Total Karma</span>
                              <span className="font-bold text-sm">{user.karma.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70 text-sm">Badge Count</span>
                              <span className="font-bold text-sm">{user.badgeCount || 12}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70 text-sm">Join Date</span>
                              <span className="font-bold text-sm">{user.joinDate || 'Jan 2024'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70 text-sm">Rank Progress</span>
                              <span className="font-bold text-green-400 text-sm">Elite</span>
                            </div>
                          </div>
                        </div>

                        {/* Achievements */}
                        <div className={`bg-black/20 rounded-xl ${isCompactMode ? 'p-4' : 'p-6'} backdrop-blur-sm`}>
                          <h3 className={`${isCompactMode ? 'text-base' : 'text-lg'} font-bold mb-3 flex items-center`}>
                            <Trophy className="h-4 w-4 mr-2" />
                            Achievements
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            {mockAchievements.map((achievement, index) => (
                              <motion.div
                                key={index}
                                initial={{ scale: 0, rotate: 180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                                className={`text-center ${isCompactMode ? 'p-2' : 'p-3'} rounded-lg ${
                                  achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                  achievement.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                  achievement.rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                                  'bg-gradient-to-r from-green-500 to-emerald-500'
                                }`}
                              >
                                <Trophy className={`${isCompactMode ? 'h-4 w-4' : 'h-6 w-6'} text-white mx-auto mb-1`} />
                                <div className="text-xs font-medium text-white">{achievement.name}</div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Specializations */}
                      <div className={`bg-black/20 rounded-xl ${isCompactMode ? 'p-4' : 'p-6'} backdrop-blur-sm`}>
                        <h3 className={`${isCompactMode ? 'text-base' : 'text-lg'} font-bold mb-3 flex items-center`}>
                          <Shield className="h-4 w-4 mr-2" />
                          Specializations
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {['Political Analysis', 'Sentiment Detection', 'Pattern Recognition', 'Fact Checking', 'Behavioral Analysis'].slice(0, isCompactMode ? 4 : 5).map((spec, index) => (
                            <motion.span
                              key={index}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.8 + index * 0.1 }}
                              className="px-2 py-1 bg-reddit-orange/20 border border-reddit-orange/30 rounded-full text-xs text-reddit-orange-light"
                            >
                              {spec}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Flip Indicator */}
                    <div className={`text-center ${isCompactMode ? 'py-2' : 'py-4'}`}>
                      <div className="text-white/60 text-xs flex items-center justify-center space-x-2">
                        <Zap className="h-3 w-3" />
                        <span>Click to flip back</span>
                        <Zap className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Share Controls - Below the card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ delay: 0.5 }}
            className="share-controls mt-6 flex flex-col items-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Share Button */}
            <motion.button
              onClick={() => setShowShareMenu(!showShareMenu)}
              disabled={isCapturing}
              className={`flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-reddit-orange to-reddit-orange-dark text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200 ${
                isCapturing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
              whileHover={{ scale: isCapturing ? 1 : 1.05 }}
              whileTap={{ scale: isCapturing ? 1 : 0.95 }}
            >
              {isCapturing ? (
                <>
                  <Camera className="h-5 w-5 animate-pulse" />
                  <span>Capturing...</span>
                </>
              ) : (
                <>
                  <Share2 className="h-5 w-5" />
                  <span>Share Card</span>
                </>
              )}
            </motion.button>

            {/* Share Menu */}
            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  className="flex flex-wrap items-center justify-center gap-3 p-4 bg-reddit-light-bg dark:bg-reddit-dark-bg-paper rounded-2xl border border-reddit-light-border dark:border-reddit-dark-border shadow-xl backdrop-blur-sm"
                >
                  {/* Download Button */}
                  <motion.button
                    onClick={downloadImage}
                    disabled={isCapturing}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </motion.button>

                  {/* Copy to Clipboard */}
                  <motion.button
                    onClick={copyToClipboard}
                    disabled={isCapturing}
                    className="copy-button flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy Image</span>
                  </motion.button>

                  {/* Social Media Buttons */}
                  <motion.button
                    onClick={() => shareToSocial('twitter')}
                    disabled={isCapturing}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Twitter className="h-4 w-4" />
                    <span>Twitter</span>
                  </motion.button>

                  <motion.button
                    onClick={() => shareToSocial('facebook')}
                    disabled={isCapturing}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Facebook className="h-4 w-4" />
                    <span>Facebook</span>
                  </motion.button>

                  {/* Native Share (if supported) */}
                  {navigator.share && (
                    <motion.button
                      onClick={() => shareToSocial('native')}
                      disabled={isCapturing}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instructions */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-white/60 text-sm text-center max-w-md"
            >
              Capture and share your Thought Police officer card with friends!
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserProfileCard;