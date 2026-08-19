import type { Metadata } from 'next'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import './globals.css';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'MuslimsInCanada.com',
  description: 'The digital home for Canada\'s Muslim community',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  )
}
