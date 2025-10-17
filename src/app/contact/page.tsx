"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [_uploadProgress, _setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [_error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Submitting form with data:", formData);

      // Create FormData to send both form fields and file
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('message', formData.message);
      if (file) {
        formDataToSend.append('file', file);
      }

      // Send to our API route (which handles Firebase Storage + Google Sheets)
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formDataToSend, // Don't set Content-Type header for FormData
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Form submitted successfully:", result);
        setSuccess(true);
        setFormData({ name: "", email: "", message: "" });
        setFile(null); // Clear the file
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const _handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <main className="bg-dark-bg py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 gradient-text">
            Ready to Launch Your Idea?
          </h1>
          <p className="text-lg md:text-xl text-gray-300 px-2">
            Tell us about your startup idea and we'll get you from concept to investor-ready MVP in just 3 weeks.
          </p>
        </div>

        {/* Meet Our Team Section */}
        <div className="mb-8 md:mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {/* Team Member 1 */}
            <div className="bg-dark-card p-6 md:p-8 rounded-lg shadow-sm border border-gray-700 text-center">
              <div className="w-24 h-24 bg-spotify-green rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src="/ben.jpg"
                  alt="Ben Spak - Co-Founder & CEO"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Ben Spak</h3>
              <p className="text-spotify-green font-medium mb-3">Co-Founder & CEO</p>
              <p className="text-gray-300 text-sm mb-4">
                Former founder who built 3 SaaS companies. Expert in rapid MVP development and startup strategy.
              </p>
              <div className="flex justify-center space-x-2 mb-3">
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">MVP Development</span>
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">Fundraising</span>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="bg-dark-card p-6 md:p-8 rounded-lg shadow-sm border border-gray-700 text-center">
              <div className="w-24 h-24 bg-spotify-green rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src="/dom-thomas.jpg"
                  alt="Dominique Thomas - Co-Founder & CTO"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Dominique Thomas</h3>
              <p className="text-spotify-green font-medium mb-3">Co-Founder & CTO</p>
              <p className="text-gray-300 text-sm mb-4">
                Full-stack engineer with 4+ years building scalable products. Expert with Web3 and decentralized applications.
              </p>
              <div className="flex justify-center space-x-2 mb-3">
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">Full-Stack</span>
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">Web3</span>
              </div>
            </div>

          </div>
        </div>

        {/* Form */}
        <div className="bg-black p-6 md:p-8 rounded-lg border border-gray-700">
          {success ? (
            <div className="text-center">
              <div className="w-12 md:w-16 h-12 md:h-16 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl md:text-2xl">✓</span>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 text-white">Perfect! We're on it.</h3>
              <p className="text-gray-300 text-sm md:text-base">
                We've received your startup details and will get back to you to schedule a free 60-minute strategy call.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-4 text-spotify-green hover:underline text-sm md:text-base"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent placeholder-gray-400 text-sm md:text-base"
                  placeholder="Founder Name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent placeholder-gray-400 text-sm md:text-base"
                  placeholder="you@startup.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-200 mb-2">
                  Tell us about your startup *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent resize-none placeholder-gray-400 text-sm md:text-base"
                  placeholder="What's your startup idea? What stage are you at? What's your timeline? What's your biggest challenge right now?"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Contact Us"}
              </button>
            </form>
          )}
        </div>

        {/* What Happens Next */}
        <div className="bg-dark-card p-6 md:p-8 rounded-lg border border-gray-700 mt-8 md:mt-12">
          <h3 className="text-xl md:text-2xl font-semibold text-white mb-4 text-center">What Happens Next?</h3>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 text-center">
            <div>
              <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <p className="text-gray-300 text-sm">Free 60-minute strategy call to align on your vision and timeline.</p>
            </div>
            <div>
              <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <p className="text-gray-300 text-sm">We enroll you in our courses and get you started on your journey.</p>
            </div>
            <div>
              <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <p className="text-gray-300 text-sm">We start building your MVP immediately. 21 days to launch.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
