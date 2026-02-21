import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

import { Toaster } from "react-hot-toast";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata = {
  title: "Kodfi - Automatisez votre WiFi Zone au Bénin | Vente de forfaits 24h/24",
  description: "Transformez votre routeur MikroTik en automate de vente. Encaissez via MoMo & Flooz sans intervention. 450+ gérants nous font confiance.",
  openGraph: {
    images: ['/og-image.png'], // TODO: Créer une image 1200x630
  }
}

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <Toaster position="top-right" />
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
