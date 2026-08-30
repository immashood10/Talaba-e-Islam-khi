import type { Metadata } from "next";
import { Inter } from "next/font/google";
import WhatsAppButton from "@/components/WhatsAppButton";
import AdSidebar from "@/components/AdSidebar";
import { LanguageProvider } from "@/lib/language-context";
import { MemberProvider } from "@/lib/member-context";
import { CartProvider } from "@/lib/cart-context";
import { ThemeProvider } from "@/lib/theme-context";
import "./globals.css";

const themeInitScript = `
  try {
    var stored = localStorage.getItem('talba-theme');
    var isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', isDark);
  } catch (e) {}
`;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Talaba e Islam Karachi (TIK)",
  description: "Talaba e Islam Karachi (TIK) - serving our community through education, welfare, relief, and youth development initiatives.",
  keywords: "Talaba e Islam Karachi, TIK, political party, Islamic movement, Karachi, community welfare, education, youth",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-background text-text-dark font-sans antialiased min-h-screen flex flex-col dark:bg-slate-950 dark:text-slate-100" suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <MemberProvider>
              <CartProvider>
                {children}
                <AdSidebar />
                <WhatsAppButton />
              </CartProvider>
            </MemberProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
