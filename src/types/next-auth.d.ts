import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstname?: string | null;
      lastname?: string | null;
      role?: string | null;
    } & DefaultSession["user"]
  }

  interface User {
    firstname?: string | null;
    lastname?: string | null;
    role?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstname?: string | null;
    lastname?: string | null;
    role?: string | null;
  }
}