// src/app/layout.tsx
import './globals.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
  title: 'Glint',
  description: 'Gallery App',
  icons: {
    icon: '/glint-logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/glint-logo.png" type="image/png" />
      </head>
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
