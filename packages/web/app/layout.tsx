import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShiftFlow - Conditional Execution for Cross-Chain DeFi",
  description: "Automate cross-chain swaps with conditional workflows",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
