import './globals.css'
import { Toaster } from 'react-hot-toast'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'Aptitude Taker RD - Proctored Test Platform',
  description: 'Secure aptitude testing platform with proctoring features',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}

