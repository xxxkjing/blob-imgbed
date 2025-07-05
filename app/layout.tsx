import './globals.css'
import { Inter } from 'next/font/google'

export const metadata = {
  title: 'Blob ImgBed',
  description: '用Vercel Blob做的一个图床',
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>{children}</body>
    </html>
  )
}
