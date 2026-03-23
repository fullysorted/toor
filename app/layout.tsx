import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toor — Event Companion",
  description: "White-label event companion platform for premium automotive events. Powered by Toor, a Fully Sorted company.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#1B2A4A" />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
