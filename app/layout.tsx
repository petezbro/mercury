import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mercury — For Your Insight',
  description: 'Say what you mean—clearly.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
