import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "../../../../lib/prisma"
import bcrypt from "bcrypt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // We only enable email-based account linking when explicitly allowed.
      // Even then, we still enforce `email_verified` in the `signIn` callback
      // for the Google provider.
      allowDangerousEmailAccountLinking:
        process.env.NEXTAUTH_ALLOW_DANGEROUS_EMAIL_ACCOUNT_LINKING === "true",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user || !user.password) {
            throw new Error("No user found with this email");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Error in authorize function:", error);
          throw error;
        }
      },
    }),
  ],
   adapter: PrismaAdapter(prisma),
   session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        const emailVerified = (profile as { email_verified?: boolean } | null | undefined)
          ?.email_verified;
        if (emailVerified === false) return false;

        try {
          // Sync name/image from Google profile on every login so they
          // stay up-to-date.  User creation for new OAuth users is handled
          // by the PrismaAdapter automatically.
          await prisma.user.updateMany({
            where: { email: user.email },
            data: {
              name: profile?.name ?? user.name,
              image: (profile as { picture?: string } | undefined)?.picture ?? user.image,
            },
          });
          return true;
        } catch (error) {
          console.error("Error during Google sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.name = user.name ?? undefined;
        token.email = user.email ?? undefined;
        token.image = (user as { image?: string | null }).image ?? undefined;
      }

      if (account?.provider === "google") {
        const gp = profile as
          | { email?: string; name?: string; picture?: string }
          | null
          | undefined;

        token.email ??= gp?.email;
        token.name ??= gp?.name;
        token.image ??= gp?.picture;
      }

      if ((!token.email || !token.image) && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { email: true, image: true, name: true },
        });
        if (dbUser) {
          token.email ??= dbUser.email ?? undefined;
          token.image ??= dbUser.image ?? undefined;
          token.name ??= dbUser.name ?? undefined;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name ?? undefined;
        session.user.email = token.email ?? undefined;
        session.user.image = token.image ?? undefined;
      }
      return session;
    },
  },
   secret: process.env.NEXTAUTH_SECRET,
};
