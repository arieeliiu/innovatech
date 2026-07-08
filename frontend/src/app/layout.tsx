import type { Metadata } from "next";
import { Geist_Mono, IBM_Plex_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";

const sourceSans = IBM_Plex_Sans({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  openGraph: {
    title: "Innovatech Solutions",
    description: "Plataforma de gestión de proyectos, usuarios y tareas",
    images: [
      {
        url: "/og-icon.png",
        width: 235,
        height: 235,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Innovatech Solutions",
    description: "Plataforma de gestión de proyectos, usuarios y tareas",
    images: ["/og-icon.png"],
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
