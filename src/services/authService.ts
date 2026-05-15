import api from '@/lib/api'
import { User } from '@/types'
import { string } from 'zod'

export const authService = {
    login: async (email: string, password: string) => {
        const response = await api.post<{ token: string }>('/api/auth/login', { email, password })
        return response.data
    },

    register: async (name: string, email: string, password: string) => {
        const response = await api.post<{ token: string}>('/api/auth/register', {name, email, password})
        return response.data
    },

    getMe: async() => {
        const response = await api.get<User>('/api/users/me')
        return response.data
    },
    updateProfile: async (name: string, avatarUrl: string) => {
        const response = await api.put<User>('/api/users/me', { name, avatarUrl })
        return response.data
    },

    changePassword: async (oldPassword: string, newPassword: string) => {
        await api.put('/api/users/me/password', { oldPassword, newPassword })
    },  
}