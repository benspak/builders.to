"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientIntakePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    // Founder & Business Context
    name: "",
    email: "",
    role: "",
    projectDuration: "",
    targetMarket: "",
    hasCustomers: "",
    timeline: "",

    // Technical Situation
    whoBuilt: "",
    techStack: "",
    biggestProblem: "",
    isLive: "",
    crashFrequency: "",

    // Technical Debt Red Flags
    constantBugs: "",
    afraidToChange: "",
    worksLocallyOnly: "",

    // Business Impact
    lostCustomers: "",
    missedMeetings: "",
    alreadySpent: "",

    // Current Developer Situation
    currentPay: "",
    triedOthers: "",

    // Success Metrics
    whatFixedLooksLike: "",

    // Budget & Decision Making
    budgetRange: "",
    decisionMakers: "",

  });

  const totalSteps = 5;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/client-intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'client-intake-form',
          timestamp: new Date().toISOString()
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(result.error || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Network error. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (success) {
    return (
      <main className="bg-dark-bg min-h-screen py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-dark-card p-8 md:p-12 rounded-lg border border-gray-700">
            <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Application Received!
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              Thank you for your detailed application. Our team will review your information and get back to you within 24 hours with next steps.
            </p>
            <p className="text-sm text-gray-400 mb-8">
              We'll assess your technical situation and provide a customized solution for your technical debt issues.
            </p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Return to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-dark-bg min-h-screen py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 gradient-text">
            Fix Your Technical Debt
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-3xl mx-auto">
            Tired of dealing with buggy, unreliable code? Let's assess your situation and get you a proper solution.
          </p>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-400">
            <span>Step {currentStep} of {totalSteps}</span>
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div
                className="bg-spotify-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-card p-6 md:p-8 rounded-lg border border-gray-700">
          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Founder & Business Context */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Founder & Business Context</h2>

              <div>
                <label className="block text-white font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Your Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                >
                  <option value="">Select your role</option>
                  <option value="founder">Founder</option>
                  <option value="co-founder">Co-founder</option>
                  <option value="technical-lead">Technical Lead</option>
                  <option value="product-manager">Product Manager</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">How long have you been working on this project? *</label>
                <select
                  name="projectDuration"
                  value={formData.projectDuration}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                >
                  <option value="">Select duration</option>
                  <option value="less-than-1-month">Less than 1 month</option>
                  <option value="1-3-months">1-3 months</option>
                  <option value="3-6-months">3-6 months</option>
                  <option value="6-12-months">6-12 months</option>
                  <option value="more-than-1-year">More than 1 year</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">What's your target market/user base? *</label>
                <textarea
                  name="targetMarket"
                  value={formData.targetMarket}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                  placeholder="Describe who your app is for..."
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Do you have paying customers or users already? *</label>
                <select
                  name="hasCustomers"
                  value={formData.hasCustomers}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                >
                  <option value="">Select option</option>
                  <option value="yes-paying">Yes, paying customers</option>
                  <option value="yes-free-users">Yes, free users only</option>
                  <option value="no-but-ready">No, but ready to launch</option>
                  <option value="no-still-building">No, still building</option>
                </select>
              </div>


              <div>
                <label className="block text-white font-medium mb-2">What's your timeline for getting this fixed? *</label>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                >
                  <option value="">Select timeline</option>
                  <option value="asap">ASAP (within 1 week)</option>
                  <option value="within-2-weeks">Within 2 weeks</option>
                  <option value="within-1-month">Within 1 month</option>
                  <option value="within-2-months">Within 2 months</option>
                  <option value="flexible">Flexible timeline</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Technical Situation */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Technical Situation</h2>

              <div>
                <label className="block text-white font-medium mb-2">Who built your current app? *</label>
                <select
                  name="whoBuilt"
                  value={formData.whoBuilt}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                >
                  <option value="">Select option</option>
                  <option value="freelancer">Freelancer/Contractor</option>
                  <option value="agency">Development Agency</option>
                  <option value="co-founder">Co-founder</option>
                  <option value="myself">Myself (I'm technical)</option>
                  <option value="friend">Friend/Colleague</option>
                  <option value="upwork">Upwork/Fiverr</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">What technology stack is your app built on? *</label>
                <textarea
                  name="techStack"
                  value={formData.techStack}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                  placeholder="e.g., React, Node.js, MongoDB, AWS..."
                />
              </div>


              <div>
                <label className="block text-white font-medium mb-2">What's the biggest technical problem you're facing right now? *</label>
                <textarea
                  name="biggestProblem"
                  value={formData.biggestProblem}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                  placeholder="Describe the main technical issues you're dealing with..."
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Is your app currently live and working? *</label>
                <select
                  name="isLive"
                  value={formData.isLive}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                >
                  <option value="">Select option</option>
                  <option value="yes-working">Yes, working well</option>
                  <option value="yes-buggy">Yes, but has bugs</option>
                  <option value="yes-broken">Yes, but mostly broken</option>
                  <option value="no-not-deployed">No, not deployed yet</option>
                  <option value="no-crashed">No, it crashed and won't start</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">How often does your app crash or have bugs? *</label>
                <select
                  name="crashFrequency"
                  value={formData.crashFrequency}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                >
                  <option value="">Select frequency</option>
                  <option value="never">Never</option>
                  <option value="rarely">Rarely (once a month)</option>
                  <option value="sometimes">Sometimes (once a week)</option>
                  <option value="often">Often (daily)</option>
                  <option value="constantly">Constantly (multiple times per day)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Technical Debt Red Flags */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Technical Debt Red Flags</h2>
              <p className="text-gray-300 mb-6">Help us identify if you're dealing with technical debt issues:</p>


              <div>
                <label className="block text-white font-medium mb-2">Are you constantly dealing with bugs that "should be simple fixes"? *</label>
                <select
                  name="constantBugs"
                  value={formData.constantBugs}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                >
                  <option value="">Select option</option>
                  <option value="yes">Yes, constantly</option>
                  <option value="sometimes">Sometimes</option>
                  <option value="rarely">Rarely</option>
                  <option value="never">Never</option>
                </select>
              </div>


              <div>
                <label className="block text-white font-medium mb-2">Are you afraid to make changes because you don't know what will break? *</label>
                <select
                  name="afraidToChange"
                  value={formData.afraidToChange}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                >
                  <option value="">Select option</option>
                  <option value="yes">Yes, very afraid</option>
                  <option value="somewhat">Somewhat</option>
                  <option value="not-really">Not really</option>
                  <option value="no">No, confident</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Does your app work on your computer but not for your users? *</label>
                <select
                  name="worksLocallyOnly"
                  value={formData.worksLocallyOnly}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                >
                  <option value="">Select option</option>
                  <option value="yes">Yes, exactly this problem</option>
                  <option value="sometimes">Sometimes</option>
                  <option value="no">No, works for users</option>
                  <option value="not-sure">Not sure</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Business Impact */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Business Impact</h2>


              <div>
                <label className="block text-white font-medium mb-2">Have you lost potential customers because of app problems? *</label>
                <select
                  name="lostCustomers"
                  value={formData.lostCustomers}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                >
                  <option value="">Select option</option>
                  <option value="yes-many">Yes, many customers</option>
                  <option value="yes-some">Yes, some customers</option>
                  <option value="yes-few">Yes, a few customers</option>
                  <option value="no">No, not that I know of</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Are you missing investor meetings because your demo doesn't work? *</label>
                <select
                  name="missedMeetings"
                  value={formData.missedMeetings}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                >
                  <option value="">Select option</option>
                  <option value="yes">Yes, multiple times</option>
                  <option value="once">Yes, once</option>
                  <option value="almost">Almost missed some</option>
                  <option value="no">No, demos work fine</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">How much have you already spent trying to fix these issues? *</label>
                <select
                  name="alreadySpent"
                  value={formData.alreadySpent}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                >
                  <option value="">Select range</option>
                  <option value="0">$0</option>
                  <option value="1-1000">$1 - $1,000</option>
                  <option value="1000-5000">$1,000 - $5,000</option>
                  <option value="5000-10000">$5,000 - $10,000</option>
                  <option value="10000-plus">$10,000+</option>
                </select>
              </div>

            </div>
          )}

          {/* Step 5: Budget & Decision Making */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Budget & Decision Making</h2>

              <div>
                <label className="block text-white font-medium mb-2">What's your budget range for fixing this? *</label>
                <select
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                >
                  <option value="">Select range</option>
                  <option value="under-1000">Under $1,000</option>
                  <option value="1000-2500">$1,000 - $2,500</option>
                  <option value="2500-5000">$2,500 - $5,000</option>
                  <option value="5000-10000">$5,000 - $10,000</option>
                  <option value="10000-plus">$10,000+</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Who else is involved in this decision? *</label>
                <select
                  name="decisionMakers"
                  value={formData.decisionMakers}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                >
                  <option value="">Select option</option>
                  <option value="just-me">Just me</option>
                  <option value="co-founder">Co-founder</option>
                  <option value="team">Team members</option>
                  <option value="investors">Investors/Advisors</option>
                  <option value="board">Board of directors</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">What would "fixed" look like to you? *</label>
                <textarea
                  name="whatFixedLooksLike"
                  value={formData.whatFixedLooksLike}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-spotify-green focus:outline-none"
                  placeholder="Describe your ideal outcome..."
                />
              </div>
            </div>
          )}


          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium ${
                currentStep === 1
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-500'
              }`}
            >
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-spotify-green text-black rounded-lg font-medium hover:bg-spotify-green/90"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-spotify-green text-black rounded-lg font-medium hover:bg-spotify-green/90 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
