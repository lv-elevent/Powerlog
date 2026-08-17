import { AppShell } from "@/components/app-shell";
import { AppStateProvider } from "@/components/app-state";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <AppStateProvider><AppShell>{children}</AppShell></AppStateProvider>; }
