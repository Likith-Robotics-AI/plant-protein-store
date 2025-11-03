import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Plant Protein Store',
  description: 'Premium plant-based protein with fruit powder',
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
