import type { Metadata } from "next";
import { Geist_Mono, Noto_Serif, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Noto_Serif({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Innovatech Solutions",
  description: "Plataforma de gestión de proyectos, usuarios y tareas",
  icons: {
    icon: [
      {
        url: "/fav-light.ico",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/fav-dark.ico",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    shortcut: "/fav-light.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${sourceSerif.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
