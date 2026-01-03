"use client";

import { useState } from "react";
import { MilestoneSection } from "./milestone-section";

interface Milestone {
  id: string;
  type: string;
  title?: string | null;
  description?: string | null;
  achievedAt: Date | string;
}

interface MilestoneSectionWrapperProps {
  projectId: string;
  initialMilestones: Milestone[];
  isOwner: boolean;
}

export function MilestoneSectionWrapper({
  projectId,
  initialMilestones,
  isOwner,
}: MilestoneSectionWrapperProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);

  const handleMilestoneAdded = (newMilestone: Milestone) => {
    setMilestones((prev) => [newMilestone, ...prev]);
  };

  const handleMilestoneDeleted = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <MilestoneSection
      projectId={projectId}
      milestones={milestones}
      isOwner={isOwner}
      onMilestoneAdded={handleMilestoneAdded}
      onMilestoneDeleted={handleMilestoneDeleted}
    />
  );
}
