'use client';

import { useState, useEffect } from 'react';

interface ExitIntentPopupProps {
  onClose: () => void;
  resourceTitle?: string;
}

export default function ExitIntentPopup({ onClose, resourceTitle = "this resource" }: ExitIntentPopupProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handle ESC key to close popup
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Handle click outside to close popup
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      // Send to contact API (now enhanced with Firebase)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Resource Reader',
          email: email,
          message: `Exit-intent email capture from ${resourceTitle}`,
          source: 'exit-intent-popup'
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        // Store in localStorage to prevent showing again
        localStorage.setItem('exitIntentCaptured', 'true');
        localStorage.setItem('exitIntentDate', new Date().toISOString());

        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        throw new Error('Failed to capture email');
      }
    } catch (error) {
      console.error('Email capture error:', error);
      // Still close the popup even if there's an error
      setTimeout(() => {
        onClose();
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-dark-card border border-gray-700 rounded-lg p-8 max-w-md w-full text-center animate-in fade-in duration-300 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Close popup"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">🎉 You're In!</h3>
          <p className="text-gray-300 mb-4">
            Thanks for joining! You'll get exclusive founder insights and early access to new resources.
          </p>
          <p className="text-sm text-gray-400">
            This popup won't show again. Happy building! 🚀
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-dark-card border border-gray-700 rounded-lg p-8 max-w-md w-full animate-in fade-in duration-300 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close popup"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📧</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Wait! Don't Miss Out</h3>
          <p className="text-gray-300">
            Get exclusive founder insights, new resources, and early access to LaunchKit updates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full bg-spotify-green hover:bg-green-600 disabled:bg-gray-600 text-black font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isSubmitting ? 'Joining...' : 'Get Exclusive Access'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            No thanks, I'll pass
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Join founders getting exclusive insights. No spam, just value.
          </p>
        </div>
      </div>
    </div>
  );
}
