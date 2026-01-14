'use client';

import { Download, Check } from 'lucide-react';
import { useInstallPrompt } from './pwa-provider';

interface InstallButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function InstallButton({ className = '', variant = 'primary' }: InstallButtonProps) {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();

  if (isInstalled) {
    return (
      <div className={`flex items-center gap-2 text-green-500 ${className}`}>
        <Check className="h-4 w-4" />
        <span className="text-sm">App Installed</span>
      </div>
    );
  }

  if (!canInstall) {
    return null;
  }

  const baseStyles = 'flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors';
  const variantStyles = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600',
    secondary: 'bg-white/10 text-white hover:bg-white/20',
    ghost: 'text-orange-500 hover:bg-orange-500/10',
  };

  return (
    <button
      onClick={promptInstall}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      <Download className="h-4 w-4" />
      <span>Install App</span>
    </button>
  );
}
