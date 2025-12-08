'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { 
  MdDashboard, 
  MdAssignment, 
  MdCheckCircle, 
  MdMenu, 
  MdClose, 
  MdLogout,
  MdPerson,
  MdDescription
} from 'react-icons/md'

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'admin') {
    return null
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: MdDashboard },
    { name: 'Tests', href: '/admin/tests', icon: MdDescription },
    { name: 'Assignments', href: '/admin/assignments', icon: MdAssignment },
    { name: 'Results', href: '/admin/results', icon: MdCheckCircle },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Desktop Nav */}
            <div className="flex">
              <Link href="/admin/dashboard" className="flex items-center px-2 text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent hover:from-primary-700 hover:to-primary-800 transition-all">
                <MdAssignment className="text-primary-600 mr-2" size={28} />
                Aptitude Taker RD
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-all group"
                    >
                      <Icon className="mr-2 text-gray-500 group-hover:text-primary-600 transition-colors" size={18} />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-lg">
                <MdPerson className="mr-2 text-gray-600" size={18} />
                <span className="font-medium">{session.user.email}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
              >
                <MdLogout className="mr-2" size={18} />
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-primary-50 focus:outline-none transition-all"
              >
                {mobileMenuOpen ? (
                  <MdClose size={24} />
                ) : (
                  <MdMenu size={24} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="mr-3 text-gray-500" size={20} />
                    {item.name}
                  </Link>
                )
              })}
            </div>
            <div className="border-t border-gray-200 px-2 pt-4 pb-3">
              <div className="flex items-center px-3 mb-3">
                <MdPerson className="mr-2 text-gray-600" size={20} />
                <span className="text-sm font-medium text-gray-700">{session.user.email}</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  signOut({ callbackUrl: '/admin/login' })
                }}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-all"
              >
                <MdLogout className="mr-3" size={20} />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2025 Aptitude Taker RD. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
