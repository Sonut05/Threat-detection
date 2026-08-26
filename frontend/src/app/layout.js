import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
import Background3D from "../components/Background3D";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Spam Shield | AI Threat Detection",
  description: "Detect spam or malicious threats in SMS and Email messages using AI/ML.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  if (savedTheme) {
                    document.documentElement.className = savedTheme;
                  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.className = 'dark';
                  } else {
                    document.documentElement.className = 'dark'; // Default theme
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Background3D />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
