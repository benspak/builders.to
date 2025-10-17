import { useState, useEffect, useCallback } from 'react';

export interface Task {
  id: string;
  name: string;
  xp: number;
  completed: boolean;
}

export interface Stage {
  id: string;
  name: string;
  xpGoal: number;
  tasks: Task[];
  completed: boolean;
}

export interface ProgressData {
  completedTasks: string[];
  totalXP: number;
  currentStage: number;
  achievements: string[];
  lastUpdated: number;
}

const STAGE_CONFIG = {
  cadet: {
    id: 'cadet',
    name: 'Cadet Founder (Novice)',
    xpGoal: 100,
    tasks: [
      { id: 'build-base', name: 'Build Your Base (website/landing page)', xp: 30 },
      { id: 'shape-offer', name: 'Shape Your Offer (clear value prop)', xp: 20 },
      { id: 'create-lead-magnet', name: 'Create a Lead Magnet (free content)', xp: 20 },
      { id: 'share-story', name: 'Share Your Founder Story (LinkedIn/X intro post)', xp: 30 },
    ]
  },
  pathfinder: {
    id: 'pathfinder',
    name: 'Pathfinder (Market Explorer)',
    xpGoal: 300,
    tasks: [
      { id: 'talk-customers', name: 'Talk to 10 Potential Customers (interviews)', xp: 100 },
      { id: 'grow-connections', name: 'Grow First 100 Connections (followers)', xp: 50 },
      { id: 'join-communities', name: 'Join 2 Communities (online groups)', xp: 50 },
      { id: 'first-sale', name: 'Earn Your First Sale (or pre-order)', xp: 100 },
    ]
  },
  builder: {
    id: 'builder',
    name: 'Builder (Prototype Creator)',
    xpGoal: 600,
    tasks: [
      { id: 'build-prototype', name: 'Build a Prototype (demo or clickable mockup)', xp: 150 },
      { id: 'launch-waitlist', name: 'Launch a Waitlist (100 signups)', xp: 100 },
      { id: 'write-objections', name: 'Write Out Objections (and your answers)', xp: 50 },
      { id: 'test-users', name: 'Test With First 5 Users', xp: 100 },
    ]
  },
  operator: {
    id: 'operator',
    name: 'Operator (Early Revenue)',
    xpGoal: 1000,
    tasks: [
      { id: 'reach-1k-mrr', name: 'Reach $1K MRR', xp: 200 },
      { id: 'press-mention', name: 'Land Your First Press Mention', xp: 100 },
      { id: 'improve-mvp', name: 'Improve Your MVP (iteration round)', xp: 100 },
      { id: 'track-progress', name: 'Track Progress (metrics dashboard)', xp: 100 },
    ]
  },
  strategist: {
    id: 'strategist',
    name: 'Strategist (Investor-Ready)',
    xpGoal: 2000,
    tasks: [
      { id: 'pitch-investors', name: 'Pitch 5 Investors', xp: 200 },
      { id: 'setup-foundation', name: 'Set Up the Foundation (legal, compliance, payments)', xp: 100 },
      { id: 'share-message', name: 'Share Your Message (event, podcast, or panel)', xp: 100 },
      { id: 'key-partner', name: 'Bring on a Key Partner (co-founder, advisor, or contractor)', xp: 200 },
    ]
  },
  trailblazer: {
    id: 'trailblazer',
    name: 'Trailblazer (Scaling Founder)',
    xpGoal: 5000,
    tasks: [
      { id: 'expand-channels', name: 'Expand Channels (ads, partnerships, distribution)', xp: 300 },
      { id: 'automate-process', name: 'Automate a Process (AI or tools)', xp: 200 },
      { id: 'reach-10k-mrr', name: 'Reach $10K MRR', xp: 500 },
      { id: 'grow-team', name: 'Grow the Team (hire 3–5 people)', xp: 300 },
    ]
  }
};

const STORAGE_KEY = 'builders-startup-progress';

export const useProgressTracker = () => {
  const [progressData, setProgressData] = useState<ProgressData>({
    completedTasks: [],
    totalXP: 0,
    currentStage: 0,
    achievements: [],
    lastUpdated: Date.now(),
  });

  // Load progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setProgressData(parsed);
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
  }, [progressData]);

  // Toggle task completion
  const toggleTask = useCallback((taskId: string) => {
    setProgressData(prev => {
      const isCompleted = prev.completedTasks.includes(taskId);
      const newCompletedTasks = isCompleted
        ? prev.completedTasks.filter(id => id !== taskId)
        : [...prev.completedTasks, taskId];

      // Calculate new total XP
      const newTotalXP = newCompletedTasks.reduce((total, id) => {
        for (const stage of Object.values(STAGE_CONFIG)) {
          const task = stage.tasks.find(t => t.id === id);
          if (task) return total + task.xp;
        }
        return total;
      }, 0);

      // Calculate current stage
      const stageKeys = Object.keys(STAGE_CONFIG);
      let newCurrentStage = 0;
      for (let i = 0; i < stageKeys.length; i++) {
        const stageKey = stageKeys[i] as keyof typeof STAGE_CONFIG;
        const stage = STAGE_CONFIG[stageKey];
        if (newTotalXP >= stage.xpGoal) {
          newCurrentStage = i + 1;
        }
      }

      // Check for new achievements
      const newAchievements = [...prev.achievements];
      stageKeys.forEach((stageKey, _index) => {
        const stage = STAGE_CONFIG[stageKey as keyof typeof STAGE_CONFIG];
        const stageCompleted = stage.tasks.every(task =>
          newCompletedTasks.includes(task.id)
        );
        const achievementId = `${stageKey}-badge`;

        if (stageCompleted && !newAchievements.includes(achievementId)) {
          newAchievements.push(achievementId);
        }
      });

      return {
        ...prev,
        completedTasks: newCompletedTasks,
        totalXP: newTotalXP,
        currentStage: newCurrentStage,
        achievements: newAchievements,
        lastUpdated: Date.now(),
      };
    });
  }, []);

  // Get stage data with completion status
  const getStageData = useCallback((stageKey: keyof typeof STAGE_CONFIG): Stage => {
    const stage = STAGE_CONFIG[stageKey];
    const tasks = stage.tasks.map(task => ({
      ...task,
      completed: progressData.completedTasks.includes(task.id),
    }));

    const completed = tasks.every(task => task.completed);

    return {
      ...stage,
      tasks,
      completed,
    };
  }, [progressData.completedTasks]);

  // Get all stages
  const getAllStages = useCallback(() => {
    return Object.keys(STAGE_CONFIG).map(key =>
      getStageData(key as keyof typeof STAGE_CONFIG)
    );
  }, [getStageData]);

  // Check if task is completed
  const isTaskCompleted = useCallback((taskId: string) => {
    return progressData.completedTasks.includes(taskId);
  }, [progressData.completedTasks]);

  // Get completion percentage for a stage
  const getStageCompletion = useCallback((stageKey: keyof typeof STAGE_CONFIG) => {
    const stage = STAGE_CONFIG[stageKey];
    const completedTasksInStage = stage.tasks.filter(task =>
      progressData.completedTasks.includes(task.id)
    );
    return (completedTasksInStage.length / stage.tasks.length) * 100;
  }, [progressData.completedTasks]);

  // Get XP for a specific stage
  const getStageXP = useCallback((stageKey: keyof typeof STAGE_CONFIG) => {
    const stage = STAGE_CONFIG[stageKey];
    return stage.tasks.reduce((total, task) => {
      return progressData.completedTasks.includes(task.id) ? total + task.xp : total;
    }, 0);
  }, [progressData.completedTasks]);

  // Reset progress
  const resetProgress = useCallback(() => {
    setProgressData({
      completedTasks: [],
      totalXP: 0,
      currentStage: 0,
      achievements: [],
      lastUpdated: Date.now(),
    });
  }, []);

  return {
    progressData,
    toggleTask,
    getStageData,
    getAllStages,
    isTaskCompleted,
    getStageCompletion,
    getStageXP,
    resetProgress,
    STAGE_CONFIG,
  };
};
