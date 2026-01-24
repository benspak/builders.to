"use client";

import { useState } from "react";
import { Sparkles, Lightbulb, RefreshCw, TrendingUp, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TONE_OPTIONS = [
  { value: "professional", label: "Professional", description: "Authoritative business tone" },
  { value: "casual", label: "Casual", description: "Friendly and conversational" },
  { value: "witty", label: "Witty", description: "Humor and clever observations" },
  { value: "inspirational", label: "Inspirational", description: "Motivational and encouraging" },
  { value: "educational", label: "Educational", description: "Informative and teaching" },
  { value: "provocative", label: "Provocative", description: "Thought-provoking and challenging" },
] as const;

type Tone = typeof TONE_OPTIONS[number]["value"];

interface AIAssistantProps {
  content: string;
  onContentChange: (content: string) => void;
  platform?: string;
  disabled?: boolean;
}

export function AIAssistant({
  content,
  onContentChange,
  platform,
  disabled = false,
}: AIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTone, setSelectedTone] = useState<Tone>("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<{
    score: number;
    suggestions: string[];
    improvedVersion?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async (topic?: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/agent/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic || undefined,
          tone: selectedTone,
          platform,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const data = await response.json();
      onContentChange(data.result.content);
    } catch (error) {
      console.error("Generation error:", error);
      setError("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const remixContent = async (action: "remix" | "expand" | "shorten" | "improve") => {
    if (!content.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/agent/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          tone: selectedTone,
          platform,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remix content");
      }

      const data = await response.json();
      onContentChange(data.result.content);
    } catch (error) {
      console.error("Remix error:", error);
      setError("Failed to remix content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateIdeas = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/agent/ideas?count=5");

      if (!response.ok) {
        throw new Error("Failed to generate ideas");
      }

      const data = await response.json();
      setIdeas(data.ideas);
    } catch (error) {
      console.error("Ideas error:", error);
      setError("Failed to generate ideas. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeContent = async () => {
    if (!content.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/agent/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          platform,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze content");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Analysis error:", error);
      setError("Failed to analyze content. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="border rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <span className="font-medium">AI Assistant</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Tone
            </label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone.value}
                  type="button"
                  onClick={() => setSelectedTone(tone.value)}
                  disabled={disabled || isGenerating}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-full border transition-colors",
                    selectedTone === tone.value
                      ? "bg-purple-500 text-white border-purple-500"
                      : "bg-background hover:bg-muted border-border"
                  )}
                >
                  {tone.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => generateContent()}
              disabled={disabled || isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Generate
            </button>
            <button
              type="button"
              onClick={generateIdeas}
              disabled={disabled || isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-background border rounded-lg hover:bg-muted disabled:opacity-50"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Ideas
            </button>
            {content.trim() && (
              <>
                <button
                  type="button"
                  onClick={() => remixContent("improve")}
                  disabled={disabled || isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-background border rounded-lg hover:bg-muted disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Improve
                </button>
                <button
                  type="button"
                  onClick={() => remixContent("shorten")}
                  disabled={disabled || isGenerating}
                  className="px-3 py-1.5 text-xs bg-background border rounded-lg hover:bg-muted disabled:opacity-50"
                >
                  Shorten
                </button>
                <button
                  type="button"
                  onClick={() => remixContent("expand")}
                  disabled={disabled || isGenerating}
                  className="px-3 py-1.5 text-xs bg-background border rounded-lg hover:bg-muted disabled:opacity-50"
                >
                  Expand
                </button>
                <button
                  type="button"
                  onClick={analyzeContent}
                  disabled={disabled || isAnalyzing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-background border rounded-lg hover:bg-muted disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5" />
                  )}
                  Analyze
                </button>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          {/* Ideas List */}
          {ideas.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Content Ideas</h4>
              <div className="space-y-1">
                {ideas.map((idea, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => generateContent(idea)}
                    disabled={disabled || isGenerating}
                    className="w-full text-left p-2 text-sm bg-background rounded border hover:bg-muted transition-colors"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-3 p-3 bg-background rounded-lg border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Engagement Score:</span>
                <span className={cn(
                  "text-sm font-bold",
                  analysis.score >= 8 ? "text-green-500" :
                  analysis.score >= 5 ? "text-yellow-500" : "text-red-500"
                )}>
                  {analysis.score}/10
                </span>
              </div>
              
              {analysis.suggestions.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-1">Suggestions:</h5>
                  <ul className="text-xs space-y-1">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-muted-foreground">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.improvedVersion && (
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-1">Improved Version:</h5>
                  <div className="text-xs p-2 bg-muted rounded">
                    {analysis.improvedVersion}
                  </div>
                  <button
                    type="button"
                    onClick={() => onContentChange(analysis.improvedVersion!)}
                    className="mt-1 text-xs text-purple-500 hover:underline"
                  >
                    Use this version
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
