"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "UserNotFound") {
      signOut({ callbackUrl: "/signin" });
    }
  }, [session]);

  if (session?.error === "UserNotFound") {
    return null; // ou <LoadingSpinner />
  }

  return <>{children}</>;
}