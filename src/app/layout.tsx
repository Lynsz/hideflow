import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hireflow.vercel.app"),
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
