import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "OsteoGenesis AI | Research workspace", description: "Exploratory, uncalibrated growth plate simulations." };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
