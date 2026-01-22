import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"

import CredentialsProvider from "next-auth/providers/credentials"; 
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Obligatoire pour utiliser Credentials avec un Adapter
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Utilisateur introuvable ou mot de passe incorrect");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Mot de passe incorrect");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Si c'est la première connexion, on ajoute les infos de l'user au token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstname = user.firstname;
        token.lastname = user.lastname;
      }
      if (trigger === "update" && session?.user) {
        // On met à jour le token avec les données envoyées par update()
        if (session.user.firstname) token.firstname = session.user.firstname;
        if (session.user.lastname) token.lastname = session.user.lastname;
        if (session.user.role) token.role = session.user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (!token || !token.id) {
        return session;
      }

      const freshUser = await prisma.user.findUnique({
        where: { id: token.id as string },
      });

      if (!freshUser) {
        session.error = "UserNotFound";
        session.user = {} as any;
        return session;
      }

        // 👇 ICI ON LIT DEPUIS LE 'TOKEN', PAS DEPUIS 'USER'
        session.user.id = freshUser.id as string;
        session.user.role = freshUser.role;
        
        session.user.firstname = freshUser.firstname;
        session.user.lastname = freshUser.lastname;
        
        // On reconstruit le nom complet proprement
        const fname = freshUser.firstname || "";
        const lname = freshUser.lastname || "";
        session.user.name = `${fname} ${lname}`.trim();
      
      return session;
    },
  },
  // On remet la page de login custom
  pages: {
    signIn: '/signin', 
  }
}