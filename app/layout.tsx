import type { Metadata } from 'next';
import { GitInfo } from '@/components/GitInfo';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Snowfall } from '@/components/Snowfall';
import { ChristmasTreeBackground } from '@/components/ChristmasTreeBackground';
import { ChristmasLights } from '@/components/ChristmasLights';
import { ChristmasDecorations } from '@/components/ChristmasDecorations';
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
        <ThemeProvider>
          <ChristmasLights />
          <ChristmasDecorations />
          <ChristmasTreeBackground />
          {children}
          <GitInfo />
          <Snowfall />
        </ThemeProvider>
      </body>
    </html>
  );
}
