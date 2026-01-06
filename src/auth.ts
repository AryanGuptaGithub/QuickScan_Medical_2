// /src/auth.ts (Updated and working version)
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "@/lib/database";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🚀 Auth attempt for:", credentials?.email);
        
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("❌ Missing credentials");
            return null;
          }

          await connectDB();
          console.log("✅ DB connected");
          
          const user = await User.findOne({ email: credentials.email });
          console.log("👤 User found:", !!user);
          
          if (!user) {
            console.log("❌ User not found");
            return null;
          }
          
          if (!user.password) {
            console.log("❌ User has no password set");
            return null;
          }
          
          console.log("🔐 Comparing password...");
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          console.log("✅ Password valid:", isPasswordValid);
          
          if (!isPasswordValid) {
            console.log("❌ Invalid password");
            return null;
          }
          
          console.log("🎉 Authentication SUCCESS for:", user.email);
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || "admin", // Default to admin for testing
            phone: user.phone || "",
          };
        } catch (error) {
          console.error("🔥 Auth error:", error);
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
    error: "/auth/error", // MUST EXIST
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true, // CRITICAL for Vercel
  debug: true, // Enable debug mode
});
