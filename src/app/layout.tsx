import type { Metadata } from "next";

import { resolveSiteUrl } from "@/lib/site-url";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl({
    SITE_URL: process.env.SITE_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  }),
  title: {
    default: "HireFlow — Sua busca por emprego, organizada",
    template: "%s | HireFlow",
  },
  description:
    "Organize candidaturas, entrevistas e cada etapa da sua busca por emprego em um só lugar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
