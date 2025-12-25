// app/layout.tsx
import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

// Fontes
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Para Rafaela ❤️',
  description: 'Nossa história.',
}

// Este arquivo PRECISA ter <html> e <body>
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body className={`${playfair.variable} ${inter.variable} bg-[#0a0a0a] antialiased`}>
        {children}
      </body>
    </html>
  )
}