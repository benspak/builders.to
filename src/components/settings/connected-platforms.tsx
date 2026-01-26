"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SocialPlatform } from "@prisma/client";
import { Link2, Unlink, Loader2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { PLATFORMS } from "@/components/composer/platform-selector";
import { cn } from "@/lib/utils";

interface ConnectedPlatform {
  platform: SocialPlatform;
  username: string | null;
  displayName: string | null;
  avatar: string | null;
  connectedAt: Date;
  scopes: string[];
}

export function ConnectedPlatforms() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [platforms, setPlatforms] = useState<ConnectedPlatform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<SocialPlatform | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle URL params for success/error messages
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success) {
      setSuccessMessage(`Successfully connected ${success}`);
      // Clear params after showing message
      setTimeout(() => {
        router.replace("/settings/platforms");
      }, 3000);
    }

    if (error) {
      const errorMessages: Record<string, string> = {
        invalid_platform: "Invalid platform specified",
        no_code: "Authorization code missing",
        invalid_state: "Invalid state - please try again",
        no_verifier: "Missing verification code",
        connection_failed: "Failed to connect platform. Please try again.",
        callback_error: "An error occurred during connection",
        access_denied: "You denied access to the app. Please try again and approve the connection.",
        callback_not_configured: "The callback URL is not configured in the app settings. Please contact support.",
      };
      setErrorMessage(errorMessages[error] || `Connection error: ${error}`);
    }
  }, [searchParams, router]);

  // Fetch connected platforms
  useEffect(() => {
    async function fetchPlatforms() {
      try {
        const response = await fetch("/api/platforms");
        if (response.ok) {
          const data = await response.json();
          setPlatforms(data.platforms || []);
        }
      } catch (error) {
        console.error("Error fetching platforms:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlatforms();
  }, []);

  const handleConnect = (platform: SocialPlatform) => {
    // Redirect to OAuth flow
    window.location.href = `/api/platforms/connect/${platform.toLowerCase()}`;
  };

  const handleDisconnect = async (platform: SocialPlatform) => {
    setDisconnecting(platform);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/platforms/${platform.toLowerCase()}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect");
      }

      setPlatforms(platforms.filter((p) => p.platform !== platform));
      setSuccessMessage(`Disconnected ${PLATFORMS[platform].name}`);
    } catch (error) {
      console.error("Error disconnecting:", error);
      setErrorMessage("Failed to disconnect platform");
    } finally {
      setDisconnecting(null);
    }
  };

  const connectedSet = new Set(platforms.map((p) => p.platform));

  // Available external platforms (excluding BUILDERS which is always available)
  const externalPlatforms: SocialPlatform[] = [
    SocialPlatform.TWITTER,
    SocialPlatform.LINKEDIN,
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}

      {/* Builders.to (always connected) */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold", PLATFORMS.BUILDERS.color)}>
              {PLATFORMS.BUILDERS.icon}
            </span>
            <div>
              <p className="font-medium">{PLATFORMS.BUILDERS.name}</p>
              <p className="text-sm text-muted-foreground">Always connected</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Connected
          </span>
        </div>
      </div>

      {/* External Platforms */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">External Platforms</h3>
        {externalPlatforms.map((platform) => {
          const config = PLATFORMS[platform];
          const connection = platforms.find((p) => p.platform === platform);
          const isConnected = connectedSet.has(platform);
          const isDisconnecting = disconnecting === platform;

          return (
            <div key={platform} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold", config.color)}>
                    {config.icon}
                  </span>
                  <div>
                    <p className="font-medium">{config.name}</p>
                    {connection?.username ? (
                      <p className="text-sm text-muted-foreground">@{connection.username}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    )}
                  </div>
                </div>

                {isConnected ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Connected
                    </span>
                    <button
                      onClick={() => handleDisconnect(platform)}
                      disabled={isDisconnecting}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/10 disabled:opacity-50"
                    >
                      {isDisconnecting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Unlink className="w-3 h-3" />
                      )}
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(platform)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    <Link2 className="w-4 h-4" />
                    Connect
                  </button>
                )}
              </div>

              {connection && (
                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                  Connected on {new Date(connection.connectedAt).toLocaleDateString()}
                  {connection.scopes.length > 0 && (
                    <span className="ml-2">• Scopes: {connection.scopes.join(", ")}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="text-sm font-medium mb-2">About Platform Connections</h4>
        <p className="text-xs text-muted-foreground">
          Connect your social media accounts to post content across multiple platforms simultaneously. 
          Your credentials are securely encrypted and stored. You can disconnect at any time.
        </p>
        <a
          href="https://docs.builders.to/cross-posting"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
        >
          Learn more <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
