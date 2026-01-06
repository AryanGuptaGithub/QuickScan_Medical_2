// auth.js - UPDATED WITH DEBUGGING
import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/database";
import User from "@/lib/models/User";

console.log("Auth config loading...");
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
console.log("AUTH_SECRET exists:", !!process.env.AUTH_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error", // Make sure this page exists
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        console.log("Authorize function called with credentials:", {
          email: credentials?.email,
          hasPassword: !!credentials?.password
        });

        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }

          console.log("Connecting to DB...");
          await connectDB();
          console.log("DB connected, searching for user:", credentials.email);

          const user = await User.findOne({ email: credentials.email });
          console.log("User found:", !!user);

          if (!user) {
            console.log("User not found in database");
            return null;
          }

          console.log("Comparing passwords...");
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          console.log("Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
          }

          console.log("Authentication successful for user:", user.email);
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || "user",
            phone: user.phone || "",
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback - user:", user ? "exists" : "none");
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - token exists:", !!token);
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
  // CRITICAL FOR VERCEL
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  debug: true, // Enable debug mode
  logger: {
    error(code, metadata) {
      console.error("NextAuth Error:", { code, metadata });
    },
    warn(code) {
      console.warn("NextAuth Warning:", code);
    },
    debug(code, metadata) {
      console.log("NextAuth Debug:", { code, metadata });
    },
  },
});
