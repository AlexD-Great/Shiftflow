import { useAccount, useSignMessage } from "wagmi";
import { signIn, signOut, useSession } from "next-auth/react";
import { SiweMessage } from "siwe";
import { useState } from "react";

/**
 * Hook for wallet-based authentication using SIWE (Sign-In with Ethereum)
 * Implements non-custodial authentication - users sign with their wallet
 */
export function useWalletAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Authenticate user with wallet signature
   * Creates a SIWE message and signs it with the user's wallet
   */
  const authenticate = async () => {
    if (!address || !isConnected) {
      setError("Wallet not connected");
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to ShiftFlow",
        uri: window.location.origin,
        version: "1",
        chainId: 1,
        nonce: Math.random().toString(36).substring(7),
      });

      const preparedMessage = message.prepareMessage();

      // Sign message with wallet
      const signature = await signMessageAsync({
        message: preparedMessage,
      });

      // Authenticate with backend
      const result = await signIn("wallet", {
        message: preparedMessage,
        signature,
        address,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        throw new Error(result.error);
      }

      console.log("✅ Authentication successful");
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Authentication failed";
      setError(errorMessage);
      console.error("❌ Authentication error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out user
   */
  const logout = async () => {
    setError(null);
    await signOut({ redirect: false });
    console.log("✅ Logged out");
  };

  return {
    // Wallet state
    address,
    isConnected,
    
    // Session state
    session,
    user: session?.user,
    isAuthenticated: status === "authenticated",
    
    // Loading state
    isLoading: isLoading || status === "loading",
    
    // Error state
    error,
    
    // Actions
    authenticate,
    logout,
  };
}
