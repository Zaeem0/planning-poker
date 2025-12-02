import type { Metadata } from 'next';
import GitInfo from '@/components/GitInfo';
import '@/styles/globals.scss';

export const metadata: Metadata = {
  title: 'Planning Poker',
  description: 'Estimate together, decide faster',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <GitInfo />
      </body>
    </html>
  );
}
