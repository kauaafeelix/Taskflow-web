'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
    }
  }, [router])

  const handleLogout = () => {
    clearAuth()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">
      <aside className="w-60 bg-[#111] border-r border-[#1e1e1e] flex flex-col fixed h-full">
        <div className="px-5 py-5 border-b border-[#1e1e1e]">
          <span className="text-white font-bold text-lg">TaskFlow</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#888] hover:text-white hover:bg-[#1a1a1a] transition text-sm"
          >
            Dashboard
          </Link>
        </nav>

        <div className="px-3 py-4 border-t border-[#1e1e1e]">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs text-white font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-[#555] text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-[#888] hover:text-white text-sm rounded-lg hover:bg-[#1a1a1a] transition mt-1"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="ml-60 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}