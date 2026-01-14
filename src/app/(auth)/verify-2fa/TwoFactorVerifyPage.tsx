"use client";

import { useRouter } from "next/navigation";
import { TwoFactorVerify } from "@/components/auth/two-factor";

interface TwoFactorVerifyPageProps {
  userId: string;
  signOutAction: () => Promise<void>;
}

export function TwoFactorVerifyPage({ userId, signOutAction }: TwoFactorVerifyPageProps) {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/projects");
    router.refresh();
  };

  const handleCancel = async () => {
    await signOutAction();
  };

  return (
    <TwoFactorVerify
      userId={userId}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
