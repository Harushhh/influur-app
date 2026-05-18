import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // 1. BRAND LOGIN: Handles Email/Password
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // NOTE: In production, use bcrypt.compare() to check hashed passwords!
        if (user && credentials.password === "password123") { 
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        }
        return null;
      }
    }),

    // 2. CREATOR LOGIN: Catches the temporary ticket from Meta callback
    CredentialsProvider({
      id: "instagram-oauth",
      name: "Auto Login",
      credentials: {},
      async authorize() {
        const cookieStore = cookies();
        const tempAuthId = cookieStore.get('influur_temp_auth')?.value;

        if (!tempAuthId) return null;

        const user = await prisma.user.findUnique({
          where: { id: tempAuthId }
        });

        if (user) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            username: user.username,
          };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
      }
      return session;
    }
  },
  pages: {
    signIn: '/influencer/login', // Default fallback
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }