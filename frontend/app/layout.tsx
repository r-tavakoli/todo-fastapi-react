import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Analytics } from "@vercel/analytics/next";
import { theme } from "@/lib/mantine-theme";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskFlow - Todo & Productivity",
  description: "A clean, modern todo list and productivity app built with Mantine UI",
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <MantineProvider theme={theme} forceColorScheme="light">
          <Notifications position="top-right" />
          {children}
        </MantineProvider>
        <Analytics />
      </body>
    </html>
  );
}
