import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Prompt Writer',
  description: 'Generate and refine prompt instructions for AI models.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
