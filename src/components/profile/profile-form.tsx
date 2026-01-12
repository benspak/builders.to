"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Link as LinkIcon,
  User,
  MapPin,
  FileText,
  Save,
  Briefcase,
  Users,
  Code,
  MessageCircle,
  X,
  Mail,
  Bell,
} from "lucide-react";
import Image from "next/image";

// Social icons as SVG
const XIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const TwitchIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
  </svg>
);

interface ProfileFormProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    slug: string | null;
    username: string | null;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    city: string | null;
    country: string | null;
    headline: string | null;
    bio: string | null;
    websiteUrl: string | null;
    twitterUrl: string | null;
    youtubeUrl: string | null;
    linkedinUrl: string | null;
    twitchUrl: string | null;
    featuredVideoUrl: string | null;
    image: string | null;
    // Status
    status: string | null;
    statusUpdatedAt: Date | null;
    // Intent flags
    openToWork: boolean;
    lookingForCofounder: boolean;
    availableForContract: boolean;
    // Email preferences
    emailPreferences?: {
      weeklyDigest: boolean;
      dailyDigest: boolean;
      milestoneNotifications: boolean;
    } | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: user.email || "",
    displayName: user.displayName || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    city: user.city || "",
    country: user.country || "",
    headline: user.headline || "",
    bio: user.bio || "",
    websiteUrl: user.websiteUrl || "",
    twitterUrl: user.twitterUrl || "",
    youtubeUrl: user.youtubeUrl || "",
    linkedinUrl: user.linkedinUrl || "",
    twitchUrl: user.twitchUrl || "",
    featuredVideoUrl: user.featuredVideoUrl || "",
    // Status
    status: user.status || "",
    // Intent flags
    openToWork: user.openToWork ?? false,
    lookingForCofounder: user.lookingForCofounder ?? false,
    availableForContract: user.availableForContract ?? false,
    // Email preferences (default to true if not set)
    weeklyDigest: user.emailPreferences?.weeklyDigest ?? true,
    dailyDigest: user.emailPreferences?.dailyDigest ?? true,
    milestoneNotifications: user.emailPreferences?.milestoneNotifications ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Something went wrong");
      }

      setSuccess(true);
      router.refresh();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
          Profile updated successfully!
        </div>
      )}

      {/* Profile Preview */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "Profile"}
            width={64}
            height={64}
            className="rounded-full ring-2 ring-orange-500/20"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500">
            <User className="h-8 w-8 text-white" />
          </div>
        )}
        <div>
          <p className="text-lg font-semibold text-white">{user.name}</p>
          {user.username && (
            <p className="text-sm text-orange-400">@{user.username}</p>
          )}
          <p className="text-sm text-zinc-400">
            Profile photo is synced from X
          </p>
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input pl-11"
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Your email is used for notifications and Stripe Connect payouts. It will not be displayed publicly.
        </p>
      </div>

      {/* Status */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/5 to-cyan-500/5 border border-orange-500/20">
        <label htmlFor="status" className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
          <MessageCircle className="h-4 w-4 text-orange-500" />
          What are you working on?
        </label>
        <div className="relative">
          <input
            id="status"
            type="text"
            maxLength={100}
            placeholder="Building a new feature 🚀"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="input pr-10"
          />
          {formData.status && (
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          {formData.status.length}/100 characters - This will be displayed prominently on your profile
        </p>
      </div>

      {/* Display Name */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-zinc-300 mb-2">
          Display Name
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="displayName"
            type="text"
            maxLength={50}
            placeholder="The name you want shown on your profile"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            className="input pl-11"
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          This is the name that will be displayed on your profile. Leave empty to use your X name.
        </p>
      </div>

      {/* Name Fields (Optional) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-zinc-300 mb-2">
            First Name <span className="text-zinc-500 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="firstName"
              type="text"
              maxLength={50}
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="input pl-11"
            />
          </div>
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-zinc-300 mb-2">
            Last Name <span className="text-zinc-500 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="lastName"
              type="text"
              maxLength={50}
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="input pl-11"
            />
          </div>
        </div>
      </div>

      {/* Location - City & Country */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Location
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="city"
              type="text"
              maxLength={100}
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="input pl-11"
            />
          </div>
          <div className="relative">
            <input
              id="country"
              type="text"
              maxLength={100}
              placeholder="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="input"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Your location will be displayed on your profile (e.g., &quot;San Francisco, USA&quot;)
        </p>
      </div>

      {/* Headline */}
      <div>
        <label htmlFor="headline" className="block text-sm font-medium text-zinc-300 mb-2">
          Headline
        </label>
        <div className="relative">
          <FileText className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="headline"
            type="text"
            maxLength={120}
            placeholder="Founder & Builder | Creating awesome products"
            value={formData.headline}
            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            className="input pl-11"
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          {formData.headline.length}/120 characters - A short tagline about yourself
        </p>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-zinc-300 mb-2">
          Bio
        </label>
        <textarea
          id="bio"
          rows={5}
          maxLength={2000}
          placeholder="Tell the community about yourself. What are you building? What are your interests?"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="textarea"
        />
        <p className="mt-2 text-xs text-zinc-500">
          {formData.bio.length}/2000 characters
        </p>
      </div>

      {/* Website */}
      <div>
        <label htmlFor="websiteUrl" className="block text-sm font-medium text-zinc-300 mb-2">
          Website
        </label>
        <div className="relative">
          <LinkIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="websiteUrl"
            type="url"
            placeholder="https://your-website.com"
            value={formData.websiteUrl}
            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
            className="input pl-11"
          />
        </div>
      </div>

      {/* Social Links Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Social Profiles</h3>
        <p className="text-sm text-zinc-400">Connect your social media profiles</p>

        {/* X (Twitter) */}
        <div>
          <label htmlFor="twitterUrl" className="block text-sm font-medium text-zinc-300 mb-2">
            X (Twitter)
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
              <XIcon />
            </div>
            <input
              id="twitterUrl"
              type="url"
              placeholder="https://x.com/username"
              value={formData.twitterUrl}
              onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
              className="input pl-11"
            />
          </div>
        </div>

        {/* YouTube */}
        <div>
          <label htmlFor="youtubeUrl" className="block text-sm font-medium text-zinc-300 mb-2">
            YouTube
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
              <YouTubeIcon />
            </div>
            <input
              id="youtubeUrl"
              type="url"
              placeholder="https://youtube.com/@channel"
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              className="input pl-11"
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div>
          <label htmlFor="linkedinUrl" className="block text-sm font-medium text-zinc-300 mb-2">
            LinkedIn
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
              <LinkedInIcon />
            </div>
            <input
              id="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              className="input pl-11"
            />
          </div>
        </div>

        {/* Twitch */}
        <div>
          <label htmlFor="twitchUrl" className="block text-sm font-medium text-zinc-300 mb-2">
            Twitch
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
              <TwitchIcon />
            </div>
            <input
              id="twitchUrl"
              type="url"
              placeholder="https://twitch.tv/username"
              value={formData.twitchUrl}
              onChange={(e) => setFormData({ ...formData, twitchUrl: e.target.value })}
              className="input pl-11"
            />
          </div>
        </div>
      </div>

      {/* Featured Content Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-purple-600">
            <YouTubeIcon />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Featured Content</h3>
            <p className="text-sm text-zinc-400">Showcase a video on your profile</p>
          </div>
        </div>

        <div>
          <label htmlFor="featuredVideoUrl" className="block text-sm font-medium text-zinc-300 mb-2">
            Featured Video URL
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="featuredVideoUrl"
              type="url"
              placeholder="https://youtube.com/watch?v=... or https://twitch.tv/videos/..."
              value={formData.featuredVideoUrl}
              onChange={(e) => setFormData({ ...formData, featuredVideoUrl: e.target.value })}
              className="input pl-11"
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Add a YouTube or Twitch video URL to feature on your profile sidebar
          </p>
        </div>
      </div>

      {/* Intent Flags Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white">What are you looking for?</h3>
          <p className="text-sm text-zinc-400">Let the community know what you&apos;re open to</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Open to Work */}
          <label
            className={`relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all ${
              formData.openToWork
                ? "border-emerald-500/50 bg-emerald-500/10"
                : "border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600/50"
            }`}
          >
            <input
              type="checkbox"
              checked={formData.openToWork}
              onChange={(e) => setFormData({ ...formData, openToWork: e.target.checked })}
              className="sr-only"
            />
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              formData.openToWork ? "bg-emerald-500/20" : "bg-zinc-700/30"
            }`}>
              <Briefcase className={`h-6 w-6 ${formData.openToWork ? "text-emerald-400" : "text-zinc-500"}`} />
            </div>
            <div className="text-center">
              <div className={`font-medium ${formData.openToWork ? "text-emerald-400" : "text-zinc-300"}`}>
                Open to Work
              </div>
              <div className="text-xs text-zinc-500 mt-1">Looking for job opportunities</div>
            </div>
            {formData.openToWork && (
              <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500" />
            )}
          </label>

          {/* Looking for Co-founder */}
          <label
            className={`relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all ${
              formData.lookingForCofounder
                ? "border-violet-500/50 bg-violet-500/10"
                : "border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600/50"
            }`}
          >
            <input
              type="checkbox"
              checked={formData.lookingForCofounder}
              onChange={(e) => setFormData({ ...formData, lookingForCofounder: e.target.checked })}
              className="sr-only"
            />
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              formData.lookingForCofounder ? "bg-violet-500/20" : "bg-zinc-700/30"
            }`}>
              <Users className={`h-6 w-6 ${formData.lookingForCofounder ? "text-violet-400" : "text-zinc-500"}`} />
            </div>
            <div className="text-center">
              <div className={`font-medium ${formData.lookingForCofounder ? "text-violet-400" : "text-zinc-300"}`}>
                Looking for Co-founder
              </div>
              <div className="text-xs text-zinc-500 mt-1">Seeking a partner to build with</div>
            </div>
            {formData.lookingForCofounder && (
              <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-violet-500" />
            )}
          </label>

          {/* Available for Contract */}
          <label
            className={`relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all ${
              formData.availableForContract
                ? "border-cyan-500/50 bg-cyan-500/10"
                : "border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600/50"
            }`}
          >
            <input
              type="checkbox"
              checked={formData.availableForContract}
              onChange={(e) => setFormData({ ...formData, availableForContract: e.target.checked })}
              className="sr-only"
            />
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              formData.availableForContract ? "bg-cyan-500/20" : "bg-zinc-700/30"
            }`}>
              <Code className={`h-6 w-6 ${formData.availableForContract ? "text-cyan-400" : "text-zinc-500"}`} />
            </div>
            <div className="text-center">
              <div className={`font-medium ${formData.availableForContract ? "text-cyan-400" : "text-zinc-300"}`}>
                Available for Contract
              </div>
              <div className="text-xs text-zinc-500 mt-1">Open to freelance/contract work</div>
            </div>
            {formData.availableForContract && (
              <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan-500" />
            )}
          </label>
        </div>
      </div>

      {/* Email Preferences Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <Mail className="h-5 w-5 text-orange-500" />
          <div>
            <h3 className="text-lg font-semibold text-white">Email Notifications</h3>
            <p className="text-sm text-zinc-400">Choose what updates you&apos;d like to receive by email</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Daily Digest */}
          <label
            className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 p-4 transition-all ${
              formData.dailyDigest
                ? "border-orange-500/50 bg-orange-500/10"
                : "border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                formData.dailyDigest ? "bg-orange-500/20" : "bg-zinc-700/30"
              }`}>
                <Bell className={`h-5 w-5 ${formData.dailyDigest ? "text-orange-400" : "text-zinc-500"}`} />
              </div>
              <div>
                <div className={`font-medium ${formData.dailyDigest ? "text-orange-400" : "text-zinc-300"}`}>
                  Daily Activity Summary
                </div>
                <div className="text-xs text-zinc-500">
                  Receive a daily email with your likes, upvotes, and celebrations
                </div>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.dailyDigest}
                onChange={(e) => setFormData({ ...formData, dailyDigest: e.target.checked })}
                className="sr-only peer"
              />
              <div className={`h-6 w-11 rounded-full transition-colors ${
                formData.dailyDigest ? "bg-orange-500" : "bg-zinc-600"
              }`}>
                <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                  formData.dailyDigest ? "translate-x-5.5 ml-0.5" : "translate-x-0.5"
                }`} style={{ transform: formData.dailyDigest ? 'translateX(22px)' : 'translateX(2px)' }} />
              </div>
            </div>
          </label>

          {/* Weekly Digest */}
          <label
            className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 p-4 transition-all ${
              formData.weeklyDigest
                ? "border-violet-500/50 bg-violet-500/10"
                : "border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                formData.weeklyDigest ? "bg-violet-500/20" : "bg-zinc-700/30"
              }`}>
                <Mail className={`h-5 w-5 ${formData.weeklyDigest ? "text-violet-400" : "text-zinc-500"}`} />
              </div>
              <div>
                <div className={`font-medium ${formData.weeklyDigest ? "text-violet-400" : "text-zinc-300"}`}>
                  Weekly Milestone Digest
                </div>
                <div className="text-xs text-zinc-500">
                  Get a weekly summary of your project milestones and celebrations
                </div>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.weeklyDigest}
                onChange={(e) => setFormData({ ...formData, weeklyDigest: e.target.checked })}
                className="sr-only peer"
              />
              <div className={`h-6 w-11 rounded-full transition-colors ${
                formData.weeklyDigest ? "bg-violet-500" : "bg-zinc-600"
              }`}>
                <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform mt-0.5`}
                  style={{ transform: formData.weeklyDigest ? 'translateX(22px)' : 'translateX(2px)' }} />
              </div>
            </div>
          </label>

          {/* Milestone Notifications */}
          <label
            className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 p-4 transition-all ${
              formData.milestoneNotifications
                ? "border-cyan-500/50 bg-cyan-500/10"
                : "border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                formData.milestoneNotifications ? "bg-cyan-500/20" : "bg-zinc-700/30"
              }`}>
                <Bell className={`h-5 w-5 ${formData.milestoneNotifications ? "text-cyan-400" : "text-zinc-500"}`} />
              </div>
              <div>
                <div className={`font-medium ${formData.milestoneNotifications ? "text-cyan-400" : "text-zinc-300"}`}>
                  Milestone Notifications
                </div>
                <div className="text-xs text-zinc-500">
                  Get notified when someone celebrates your milestones
                </div>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.milestoneNotifications}
                onChange={(e) => setFormData({ ...formData, milestoneNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className={`h-6 w-11 rounded-full transition-colors ${
                formData.milestoneNotifications ? "bg-cyan-500" : "bg-zinc-600"
              }`}>
                <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform mt-0.5`}
                  style={{ transform: formData.milestoneNotifications ? 'translateX(22px)' : 'translateX(2px)' }} />
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/5">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
