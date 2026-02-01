"use client";

import { useEffect, useState } from "react";
import { X, Plus, Check, ChevronDown } from "lucide-react";
import { BuildingCategory } from "@prisma/client";
import { cn } from "@/lib/utils";

interface TechStackEditorProps {
  techStack: string[];
  interests: string[];
  buildingCategory: BuildingCategory | null;
  onTechStackChange: (techStack: string[]) => void;
  onInterestsChange: (interests: string[]) => void;
  onCategoryChange: (category: BuildingCategory | null) => void;
  className?: string;
}

const categoryLabels: Record<BuildingCategory, string> = {
  SAAS: "SaaS",
  MOBILE_APP: "Mobile App",
  DEVELOPER_TOOLS: "Developer Tools",
  ECOMMERCE: "E-commerce",
  AI_ML: "AI/ML",
  FINTECH: "Fintech",
  HEALTHTECH: "Healthtech",
  EDTECH: "Edtech",
  MARKETPLACE: "Marketplace",
  AGENCY: "Agency",
  CONTENT: "Content",
  HARDWARE: "Hardware",
  OTHER: "Other",
};

export function TechStackEditor({
  techStack,
  interests,
  buildingCategory,
  onTechStackChange,
  onInterestsChange,
  onCategoryChange,
  className,
}: TechStackEditorProps) {
  const [suggestedTech, setSuggestedTech] = useState<string[]>([]);
  const [suggestedInterests, setSuggestedInterests] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const response = await fetch("/api/users/similar/suggestions");
        if (response.ok) {
          const data = await response.json();
          setSuggestedTech(data.techStacks);
          setSuggestedInterests(data.interests);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    }

    fetchSuggestions();
  }, []);

  const addTech = (tech: string) => {
    const trimmed = tech.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      onTechStackChange([...techStack, trimmed]);
    }
    setTechInput("");
  };

  const removeTech = (tech: string) => {
    onTechStackChange(techStack.filter((t) => t !== tech));
  };

  const addInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      onInterestsChange([...interests, trimmed]);
    }
    setInterestInput("");
  };

  const removeInterest = (interest: string) => {
    onInterestsChange(interests.filter((i) => i !== interest));
  };

  const filteredTechSuggestions = suggestedTech.filter(
    (t) =>
      !techStack.includes(t) &&
      t.toLowerCase().includes(techInput.toLowerCase())
  );

  const filteredInterestSuggestions = suggestedInterests.filter(
    (i) =>
      !interests.includes(i) &&
      i.toLowerCase().includes(interestInput.toLowerCase())
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Building Category */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          What are you building?
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-left focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <span className={buildingCategory ? "text-white" : "text-zinc-500"}>
              {buildingCategory
                ? categoryLabels[buildingCategory]
                : "Select a category"}
            </span>
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          </button>

          {showCategoryDropdown && (
            <div className="absolute z-10 mt-1 w-full rounded-lg bg-zinc-800 border border-zinc-700 shadow-lg max-h-60 overflow-auto">
              {Object.entries(categoryLabels).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    onCategoryChange(value as BuildingCategory);
                    setShowCategoryDropdown(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 text-left text-sm hover:bg-zinc-700 transition-colors"
                >
                  <span className="text-white">{label}</span>
                  {buildingCategory === value && (
                    <Check className="h-4 w-4 text-cyan-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Tech Stack
        </label>
        <div className="space-y-2">
          {/* Selected tech */}
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTech(tech)}
                    className="hover:text-white transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="relative">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && techInput.trim()) {
                  e.preventDefault();
                  addTech(techInput);
                }
              }}
              placeholder="Add technology (e.g., React, Node.js)"
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />

            {/* Suggestions dropdown */}
            {techInput && filteredTechSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg bg-zinc-800 border border-zinc-700 shadow-lg max-h-40 overflow-auto">
                {filteredTechSuggestions.slice(0, 8).map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => addTech(tech)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-zinc-700 transition-colors"
                  >
                    <Plus className="h-3 w-3 text-zinc-500" />
                    <span className="text-white">{tech}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick suggestions */}
          {techStack.length < 5 && (
            <div className="flex flex-wrap gap-1">
              {suggestedTech
                .filter((t) => !techStack.includes(t))
                .slice(0, 6)
                .map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => addTech(tech)}
                    className="px-2 py-0.5 rounded text-xs text-zinc-500 hover:text-cyan-400 hover:bg-zinc-800 transition-colors"
                  >
                    + {tech}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Interests
        </label>
        <div className="space-y-2">
          {/* Selected interests */}
          {interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-sm"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="hover:text-white transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="relative">
            <input
              type="text"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && interestInput.trim()) {
                  e.preventDefault();
                  addInterest(interestInput);
                }
              }}
              placeholder="Add interest (e.g., AI, SaaS)"
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />

            {/* Suggestions dropdown */}
            {interestInput && filteredInterestSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg bg-zinc-800 border border-zinc-700 shadow-lg max-h-40 overflow-auto">
                {filteredInterestSuggestions.slice(0, 8).map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => addInterest(interest)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-zinc-700 transition-colors"
                  >
                    <Plus className="h-3 w-3 text-zinc-500" />
                    <span className="text-white">{interest}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick suggestions */}
          {interests.length < 5 && (
            <div className="flex flex-wrap gap-1">
              {suggestedInterests
                .filter((i) => !interests.includes(i))
                .slice(0, 6)
                .map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => addInterest(interest)}
                    className="px-2 py-0.5 rounded text-xs text-zinc-500 hover:text-purple-400 hover:bg-zinc-800 transition-colors"
                  >
                    + {interest}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
