import Link from 'next/link'
import { 
  MdCheckCircle, 
  MdSecurity, 
  MdVideoCall,
  MdAssignment,
  MdLogin,
  MdEmail,
  MdInsights,
  MdSpeed
} from 'react-icons/md'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900">
      {/* Hero Section with Login */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Branding & Info */}
            <div className="text-white space-y-8">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="bg-white rounded-2xl p-3 shadow-2xl">
                  <MdAssignment className="text-primary-600" size={48} />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-extrabold">
                    Aptitude Taker RD
                  </h1>
                  <p className="text-primary-200 text-lg">by Rudransh Development</p>
                </div>
              </div>

              {/* Tagline */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  Professional Proctored
                  <br />
                  <span className="text-primary-300">Testing Platform</span>
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Create, deploy, and monitor secure online aptitude tests with 
                  advanced AI-powered proctoring and real-time analytics.
                </p>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <MdSecurity className="text-green-400 flex-shrink-0" size={32} />
                  <div>
                    <p className="font-semibold">Secure</p>
                    <p className="text-sm text-gray-300">End-to-end encryption</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <MdVideoCall className="text-blue-400 flex-shrink-0" size={32} />
                  <div>
                    <p className="font-semibold">Proctored</p>
                    <p className="text-sm text-gray-300">AI monitoring</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <MdInsights className="text-purple-400 flex-shrink-0" size={32} />
                  <div>
                    <p className="font-semibold">Analytics</p>
                    <p className="text-sm text-gray-300">Detailed insights</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <MdSpeed className="text-yellow-400 flex-shrink-0" size={32} />
                  <div>
                    <p className="font-semibold">Fast</p>
                    <p className="text-sm text-gray-300">Lightning quick</p>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <MdCheckCircle className="text-green-400" size={20} />
                  <span>Enterprise Ready</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MdCheckCircle className="text-green-400" size={20} />
                  <span>Mobile Responsive</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MdCheckCircle className="text-green-400" size={20} />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Right Side - Login Card */}
            <div className="lg:ml-auto w-full max-w-md">
              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-200">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl mb-4 shadow-lg">
                    <MdLogin className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Admin Portal</h3>
                  <p className="text-gray-600">Sign in to manage your tests</p>
                </div>

                <Link
                  href="/admin/login"
                  className="block w-full"
                >
                  <button className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold text-lg rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                    <MdLogin className="mr-3" size={24} />
                    Access Admin Dashboard
                  </button>
                </Link>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Default credentials for demo:
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <MdEmail className="mr-2 text-gray-400" size={16} />
                        Email:
                      </span>
                      <code className="bg-white px-3 py-1 rounded-lg font-mono text-xs border border-gray-200">
                        admin@example.com
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <MdSecurity className="mr-2 text-gray-400" size={16} />
                        Password:
                      </span>
                      <code className="bg-white px-3 py-1 rounded-lg font-mono text-xs border border-gray-200">
                        Admin@123
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-2 text-white/80 text-sm">
                  <MdSecurity className="text-green-400" size={18} />
                  <span>Secured with NextAuth.js & PostgreSQL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Strip */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Professional Testing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive features designed for secure and effective online assessments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                <MdVideoCall className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Proctoring</h3>
              <p className="text-gray-700 leading-relaxed">
                Advanced camera monitoring, tab-switch detection, and behavior analysis 
                to maintain test integrity.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border-2 border-green-200 hover:border-green-400 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-br from-green-600 to-green-700 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                <MdEmail className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Email Verification</h3>
              <p className="text-gray-700 leading-relaxed">
                Secure identity verification with automated email invitations and 
                professional templates for candidates.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                <MdInsights className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Analytics</h3>
              <p className="text-gray-700 leading-relaxed">
                Comprehensive dashboards with live monitoring, detailed reports, 
                and automated flagging of suspicious activities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">100%</div>
              <div className="text-primary-200">Secure</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-primary-200">Available</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">∞</div>
              <div className="text-primary-200">Tests</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">Fast</div>
              <div className="text-primary-200">Performance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Built with Modern Technology</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">Next.js 14</div>
              <div className="text-sm text-gray-600">Framework</div>
            </div>
            <div className="text-4xl text-gray-300">•</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">PostgreSQL</div>
              <div className="text-sm text-gray-600">Database</div>
            </div>
            <div className="text-4xl text-gray-300">•</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">Prisma</div>
              <div className="text-sm text-gray-600">ORM</div>
            </div>
            <div className="text-4xl text-gray-300">•</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">Tailwind</div>
              <div className="text-sm text-gray-600">Styling</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-200 mb-10">
            Access the admin portal to create and manage your aptitude tests
          </p>
          <Link
            href="/admin/login"
            className="inline-flex items-center px-10 py-5 bg-white text-primary-700 text-xl font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-2xl transform hover:scale-105"
          >
            <MdLogin className="mr-3" size={28} />
            Launch Admin Portal
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <MdAssignment className="text-primary-400 mr-2" size={28} />
                <span className="text-xl font-bold text-white">Aptitude Taker RD</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Enterprise-grade aptitude testing platform with advanced proctoring, 
                email verification, and comprehensive analytics.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Platform Features</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <MdCheckCircle className="mr-2 text-green-400" size={16} />
                  Advanced Proctoring
                </li>
                <li className="flex items-center">
                  <MdCheckCircle className="mr-2 text-green-400" size={16} />
                  Email Verification
                </li>
                <li className="flex items-center">
                  <MdCheckCircle className="mr-2 text-green-400" size={16} />
                  Auto-grading System
                </li>
                <li className="flex items-center">
                  <MdCheckCircle className="mr-2 text-green-400" size={16} />
                  Mobile Responsive
                </li>
                <li className="flex items-center">
                  <MdCheckCircle className="mr-2 text-green-400" size={16} />
                  Professional UI/UX
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Quick Access</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/admin/login" className="hover:text-primary-400 transition-colors flex items-center">
                    <MdLogin className="mr-2" size={16} />
                    Admin Portal
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@aptitudetaker.com" className="hover:text-primary-400 transition-colors flex items-center">
                    <MdEmail className="mr-2" size={16} />
                    Contact Support
                  </a>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-800">
                <p className="text-xs text-gray-500">
                  Powered by Next.js 14, Prisma, PostgreSQL, and Tailwind CSS
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm">
              © 2025 Aptitude Taker RD by <span className="text-primary-400 font-semibold">Rudransh Development</span>. All rights reserved.
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Version 1.0.0 • Production Ready 🚀
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
