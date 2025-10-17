'use client';

import { useState } from 'react';

interface TaskItemProps {
  taskId: string;
  taskName: string;
  xp: number;
  completed: boolean;
  onToggle: (taskId: string) => void;
  emoji?: string;
}

export default function TaskItem({
  taskId,
  taskName,
  xp,
  completed,
  onToggle,
  emoji
}: TaskItemProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    onToggle(taskId);

    // Reset animation after completion
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
      completed
        ? 'bg-green-900/20 border border-green-600/30'
        : 'bg-gray-800/20 border border-gray-700/30 hover:border-gray-600'
    }`}>
      {/* Custom Checkbox */}
      <button
        onClick={handleToggle}
        className={`relative w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-300 ${
          completed
            ? 'bg-spotify-green border-spotify-green text-black'
            : 'border-gray-500 hover:border-spotify-green hover:bg-gray-700/20'
        } ${isAnimating ? 'scale-110' : ''}`}
      >
        {completed && (
          <svg
            className="w-4 h-4 transition-all duration-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Task Content */}
      <div className="flex-1 flex items-center gap-3">
        {emoji && (
          <span className="text-xl">{emoji}</span>
        )}
        <span className={`text-sm transition-all duration-300 ${
          completed
            ? 'text-green-400 line-through'
            : 'text-gray-300'
        }`}>
          {taskName}
        </span>
      </div>

      {/* XP Display */}
      <div className={`px-2 py-1 rounded text-xs font-medium transition-all duration-300 ${
        completed
          ? 'bg-green-600/20 text-green-400'
          : 'bg-gray-700/20 text-gray-400'
      }`}>
        +{xp} XP
      </div>

      {/* XP Gain Animation */}
      {isAnimating && completed && (
        <div className="absolute -top-2 -right-2 bg-spotify-green text-black text-xs font-bold px-2 py-1 rounded-full animate-bounce">
          +{xp} XP
        </div>
      )}
    </div>
  );
}
