// /api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "@/lib/database";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Auth attempt for:", credentials?.email);
        
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }

          await connectDB();
          console.log("DB connected");
          
          const user = await User.findOne({ email: credentials.email });
          console.log("User found:", !!user);
          
          if (!user || !user.password) {
            console.log("User not found or no password");
            return null;
          }
          
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          console.log("Password valid:", isPasswordValid);
          
          if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
          }
          
          console.log("Authentication successful for:", user.email);
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || "user",
            phone: user.phone || "",
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error", // This page MUST exist
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  trustHost: true, // CRITICAL for Vercel
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
