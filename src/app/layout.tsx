import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Personal Daily OS", description: "把今天过得清楚一点" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html>; }
