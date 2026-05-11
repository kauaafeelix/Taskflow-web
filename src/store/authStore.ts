import { create } from 'zustand'
import { User } from '@/types'
import { set } from 'zod'


interface AuthState {
    user: User | null
    token: string | null
    setAuth: (user: User, token: string) => void
    clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    setAuth: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token })
    },
    clearAuth: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null })
    }
}))