/**
 * DEFRAG Layout
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DEFRAG - Transform Your Stress with Human Design",
  description: "Discover your Human Design blueprint and transform stress into growth with personalized wisdom.",
};

export default function DefragLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
