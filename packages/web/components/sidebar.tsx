'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  name: string
  href: string
  icon: string
  description: string
}

const navItems: NavItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: '🏠',
    description: 'Back to homepage'
  },
  {
    name: 'Workflow Builder',
    href: '/builder',
    icon: '⚙️',
    description: 'Create automated workflows'
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    description: 'Monitor active workflows'
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: '📚',
    description: 'Pre-built workflow templates'
  },
  {
    name: 'Smart Account Demo',
    href: '/demo/safe',
    icon: '🔐',
    description: 'Safe multi-sig demo'
  },
  {
    name: 'Real Demo',
    href: '/demo/safe-real',
    icon: '🔌',
    description: 'Connect your wallet'
  },
]

const externalLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/AlexD-Great/Shiftflow',
    icon: '💻',
    description: 'View source code'
  },
  {
    name: 'Documentation',
    href: 'https://github.com/AlexD-Great/Shiftflow/blob/main/README.md',
    icon: '📖',
    description: 'Read the docs'
  },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg shadow-lg transition-all border border-slate-700"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-slate-900 border-r border-slate-700 z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">⚡</div>
              <h2 className="text-2xl font-bold text-white">ShiftFlow</h2>
            </div>
            <p className="text-sm text-slate-400">Cross-Chain DeFi Automation</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </div>
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* External Links */}
            <div className="mt-6 space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Resources
              </div>
              {externalLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-3 px-3 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.description}</div>
                  </div>
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700">
            <div className="text-xs text-slate-500 text-center">
              © 2025 ShiftFlow
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
