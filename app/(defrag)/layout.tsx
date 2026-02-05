import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";

export default async function DefragLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="flex h-dvh items-center justify-center">Loading...</div>}>
      <DefragLayoutContent>{children}</DefragLayoutContent>
    </Suspense>
  );
}

async function DefragLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Public routes that don't require authentication
  const publicPaths = ["/defrag", "/defrag/pricing", "/defrag/legal"];
  
  // Check if current path is protected (not in public paths)
  // Note: This check happens on the server, path detection would need middleware
  // For now, we'll handle auth checks in individual pages that need protection
  
  return (
    <div className="min-h-dvh bg-background">
      {children}
    </div>
  );
}
