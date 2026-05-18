'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { WalletAuth } from './wallet-auth'

interface AppNotification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

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
  {
    name: 'API Test',
    href: '/api-test',
    icon: '🧪',
    description: 'Live API integrations'
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
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const pathname = usePathname()
  const { data: session } = useSession()

  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return
    try {
      const res = await fetch('/api/notifications?limit=20')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch {
      // non-critical
    }
  }, [session])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAll: true }) })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch {}
  }

  const getNotifIcon = (type: string) => {
    if (type === 'WORKFLOW_EXECUTED') return '✅'
    if (type === 'WORKFLOW_FAILED') return '❌'
    if (type === 'CONDITION_MET') return '🎯'
    return '🔔'
  }

  return (
    <>
      {/* Top bar: menu toggle + notification bell */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
      {/* Menu toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg shadow-lg transition-all border border-slate-700"
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

      {/* Notification bell (only when signed in) */}
      {session?.user && (
        <button
          onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications() }}
          className="relative p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg shadow-lg transition-all border border-slate-700"
          aria-label="Notifications"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}
      </div>

      {/* Notification panel */}
      {notifOpen && (
        <div className="fixed top-16 left-4 z-50 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h3 className="text-white font-semibold">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300">
                  Mark all read
                </button>
              )}
              <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`p-4 border-b border-slate-800 ${n.read ? '' : 'bg-slate-800/50'}`}>
                  <div className="flex gap-2">
                    <span className="text-lg shrink-0">{getNotifIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${n.read ? 'text-slate-300' : 'text-white'}`}>{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-slate-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay */}
      {(isOpen || notifOpen) && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => { setIsOpen(false); setNotifOpen(false) }}
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
          <div className="p-4 border-t border-slate-700 space-y-3">
            <WalletAuth />
            <div className="text-xs text-slate-500 text-center">
              © 2025 ShiftFlow
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
