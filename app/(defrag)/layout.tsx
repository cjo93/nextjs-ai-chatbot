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

  // Only redirect to login for protected routes
  // Landing and pricing pages should be public
  const publicPaths = ["/", "/pricing", "/legal"];
  
  return (
    <div className="min-h-dvh bg-background">
      {children}
    </div>
  );
}
