import type { Metadata } from 'next'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
