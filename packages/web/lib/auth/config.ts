import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyMessage } from "viem";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      id: "wallet",
      name: "Wallet",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
        address: { label: "Address", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials?.signature || !credentials?.address) {
          throw new Error("Missing credentials");
        }

        try {
          // Verify the signature
          let isValid = false;
          try {
            isValid = await verifyMessage({
              address: credentials.address as `0x${string}`,
              message: credentials.message,
              signature: credentials.signature as `0x${string}`,
            });
          } catch (verifyError) {
            console.error("Signature verification error:", verifyError);
            throw new Error("Invalid signature format");
          }

          if (!isValid) {
            throw new Error("Invalid signature");
          }

          // Find or create user
          let user = await prisma.user.findUnique({
            where: { walletAddress: credentials.address.toLowerCase() },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                walletAddress: credentials.address.toLowerCase(),
                name: `User ${credentials.address.slice(0, 6)}`,
              },
            });
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            walletAddress: user.walletAddress,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.walletAddress = (user as any).walletAddress;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).walletAddress = token.walletAddress;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
