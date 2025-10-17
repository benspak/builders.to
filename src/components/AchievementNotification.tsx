'use client';

import { useEffect, useState, useCallback } from 'react';

interface AchievementNotificationProps {
  show: boolean;
  achievement: string;
  onClose: () => void;
}

const ACHIEVEMENT_MESSAGES = {
  'cadet-badge': {
    title: '🎉 Cadet Badge Unlocked!',
    message: 'You\'ve completed your first startup milestone! Keep building!',
    color: 'from-green-500 to-emerald-600'
  },
  'pathfinder-badge': {
    title: '🌟 Pathfinder Badge Unlocked!',
    message: 'Market exploration complete! You\'re finding your way.',
    color: 'from-blue-500 to-cyan-600'
  },
  'builder-badge': {
    title: '🔨 Builder Badge Unlocked!',
    message: 'Prototype complete! You\'re becoming a true builder.',
    color: 'from-purple-500 to-violet-600'
  },
  'operator-badge': {
    title: '⚡ Operator Badge Unlocked!',
    message: 'Revenue flowing! You\'re operating like a pro.',
    color: 'from-orange-500 to-red-600'
  },
  'strategist-badge': {
    title: '🧠 Strategist Badge Unlocked!',
    message: 'Investor-ready! You\'re thinking strategically.',
    color: 'from-indigo-500 to-purple-600'
  },
  'trailblazer-badge': {
    title: '🚀 Trailblazer Badge Unlocked!',
    message: 'Scaling master! You\'re blazing new trails.',
    color: 'from-pink-500 to-rose-600'
  }
};

export default function AchievementNotification({
  show,
  achievement,
  onClose
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const achievementData = ACHIEVEMENT_MESSAGES[achievement as keyof typeof ACHIEVEMENT_MESSAGES];

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (show && achievementData) {
      setIsVisible(true);
      setIsExiting(false);

      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [show, achievement, achievementData, handleClose]);

  if (!isVisible || !achievementData) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`transform transition-all duration-300 ${
        isExiting
          ? 'translate-x-full opacity-0'
          : 'translate-x-0 opacity-100'
      }`}>
        <div className={`bg-gradient-to-r ${achievementData.color} p-4 rounded-lg shadow-2xl border border-white/20 max-w-sm`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">
                {achievementData.title}
              </h3>
              <p className="text-white/90 text-sm">
                {achievementData.message}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="ml-3 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Progress indicator */}
          <div className="mt-3 bg-white/20 rounded-full h-1">
            <div className="bg-white/60 h-1 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
