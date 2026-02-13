import type { Metadata } from "next";
import "./globals.css";
import { SuiProvider } from "@/providers/SuiProvider";
import { Header } from "@/components/layout";

export const metadata: Metadata = {
  title: "Hot - Sui App",
  description: "Hot application on Sui blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SuiProvider>
          <Header />
          <main className="pt-14">{children}</main>
        </SuiProvider>
      </body>
    </html>
  );
}
