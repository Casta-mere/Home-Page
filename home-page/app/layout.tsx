import type { Metadata } from "next";
import "@radix-ui/themes/styles.css";
import { Inter } from "next/font/google";
import { Container, Theme } from "@radix-ui/themes";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "内网资源",
  description: "Castamere's Home-Page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: next-themes stamps the theme class on <html>
    // before hydration.
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" disableTransitionOnChange>
          <Theme appearance="inherit" className="min-h-screen">
            <div className="hl-wash" />
            <Container px="4" pb="8" className="relative z-[1]">
              {children}
            </Container>
          </Theme>
        </ThemeProvider>
      </body>
    </html>
  );
}
