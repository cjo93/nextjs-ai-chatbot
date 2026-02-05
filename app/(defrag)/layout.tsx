/**
 * DEFRAG Layout
 *
 * Layout for the DEFRAG route group with minimal navigation.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";

export default async function DefragLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Simple header navigation */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link className="text-xl font-bold" href="/defrag/defrag">
              DEFRAG
            </Link>
            <nav className="flex gap-4">
              <Link
                className="text-sm hover:text-primary"
                href="/defrag/dashboard"
              >
                Dashboard
              </Link>
              <Link
                className="text-sm hover:text-primary"
                href="/defrag/events"
              >
                Events
              </Link>
              <Link
                className="text-sm hover:text-primary"
                href="/defrag/experiments"
              >
                Experiments
              </Link>
              <Link
                className="text-sm hover:text-primary"
                href="/defrag/settings"
              >
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user.email}
            </span>
            <Link className="text-sm hover:text-primary" href="/">
              Back to Chat
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Simple footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 DEFRAG. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
