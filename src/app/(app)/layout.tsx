import { AppShell } from "@/components/app-shell";
import { AppStateProvider } from "@/components/app-state";
import { hasUnlockedSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!(await hasUnlockedSession())) redirect("/unlock");
  return <AppStateProvider><AppShell>{children}</AppShell></AppStateProvider>;
}
