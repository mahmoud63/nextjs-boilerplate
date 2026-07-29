import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Anton, Archivo_Narrow, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import HeaderWrapper from "@/components/HeaderWrapper";
import BottomNav from "@/components/BottomNav";
import SplashScreen from "@/components/SplashScreen";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

// "Kinetic Intensity": Anton for headlines, Archivo Narrow for body and data.
const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const archivoNarrow = Archivo_Narrow({
  variable: "--font-archivo-narrow",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "Beast Tracker",
  description: "Track your daily exercise routine and unleash your inner beast.",
  openGraph: {
    title: "Beast Tracker",
    description: "Track your daily exercise routine and unleash your inner beast.",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Beast Tracker",
  },
};

export const viewport: Viewport = {
  // Was a single hardcoded near-black, which left a dark status bar sitting above a
  // bone-white page in light mode.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Logged-out visitors only ever reach the landing page or login, and neither
  // wants the app chrome or the narrow phone-width column.
  const isSignedIn = (await cookies()).has("session_token");

  return (
    <html
      lang="en"
      className={`${anton.variable} ${archivoNarrow.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className={`min-h-full flex flex-col bg-background text-fg overscroll-none ${
          isSignedIn ? "pb-20" : ""
        }`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {isSignedIn ? (
            <>
              <SplashScreen />
              <HeaderWrapper>
                <Header />
              </HeaderWrapper>
              <main className="flex-1 w-full max-w-md mx-auto relative px-4 pt-6 pb-6">
                {children}
              </main>
              <BottomNav />
            </>
          ) : (
            <main className="flex-1 w-full">{children}</main>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
