"use client";

import SessionGuard from "@/components/auth/SessionGuard";
import { NextAuthProvider } from "./NextAuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider>
      <SessionGuard>
        {children}
      </SessionGuard>
    </NextAuthProvider>
  );
}