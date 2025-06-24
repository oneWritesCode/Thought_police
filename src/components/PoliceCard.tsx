import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Star, Award, QrCode } from 'lucide-react';
import { User, PoliceCard as PoliceCardType } from '../types';
import { rankInfo } from '../data/mockData';

interface PoliceCardProps {
  user: User;
  className?: string;
}

const PoliceCard: React.FC<PoliceCardProps> = ({ user, className = '' }) => {
  const rank = rankInfo[user.rank];
  const badgeNumber = `TP${user.id.padStart(6, '0')}`;
  const issueDate = new Date(user.joinDate).toLocaleDateString();
  const expireDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString();

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -180 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.8, type: "spring" }}
      className={`relative perspective-1000 ${className}`}
    >
      <div className="relative w-96 h-64 mx-auto">
        {/* Card Background with Holographic Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl shadow-2xl transform-gpu">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-amber-600/20 rounded-2xl animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)] rounded-2xl"></div>
        </div>

        {/* Holographic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-shimmer rounded-2xl"></div>

        {/* Card Content */}
        <div className="relative z-10 p-6 h-full flex flex-col text-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-amber-400" />
              <span className="text-xs font-bold text-amber-400">THOUGHT POLICE</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-300">BADGE #</div>
              <div className="text-sm font-bold text-amber-400">{badgeNumber}</div>
            </div>
          </div>

          {/* Officer Info */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <img
                src={user.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2'}
                alt={user.redditUsername}
                className="w-16 h-16 rounded-full border-2 border-amber-400 shadow-lg"
              />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                <Star className="h-3 w-3 text-slate-900" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold">Officer {user.redditUsername}</div>
              <div className="text-sm text-slate-300" style={{ color: rank.color }}>
                {rank.name}
              </div>
              <div className="text-xs text-slate-400">
                Accuracy: {user.accuracyRate}% • Cases: {user.casesSolved}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-amber-400">{user.totalPoints}</div>
              <div className="text-xs text-slate-400">Points</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{user.badgeCount}</div>
              <div className="text-xs text-slate-400">Badges</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{user.casesSolved}</div>
              <div className="text-xs text-slate-400">Cases</div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto">
            <div className="text-xs text-slate-400">
              <div>Issued: {issueDate}</div>
              <div>Expires: {expireDate}</div>
            </div>
            <div className="flex items-center space-x-2">
              <QrCode className="h-8 w-8 text-slate-400" />
              <div className="text-xs text-slate-400">
                <div>DEPT. OF</div>
                <div>DIGITAL TRUTH</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-8 h-8 border-2 border-amber-400/30 rounded-full animate-ping"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 border border-blue-400/30 rounded-full animate-pulse"></div>
      </div>
    </motion.div>
  );
};

export default PoliceCard;