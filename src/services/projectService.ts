import api from '@/lib/api'
import { Project, ProjectDetail, PageResponse } from '@/types'

export const projectService = {
    list: async (page= 0, size= 10 ) => {
        const response = await api.get<PageResponse<Project>>('/api/projects', {
            params: { page, size }
        })
        return response.data
    },
    getById: async (id: string) => {
        const response = await api.get<ProjectDetail>(`/api/projects/${id}`)
        return response.data
    },
    create: async (name: string, description: string) => {
        const response = await api.post<Project>('/api/projects', { name, description })
        return response.data
    },
    update: async (id: string, name: string, description: string) => {
        const response = await api.put<Project>(`/api/projects/${id}`, { name, description })
        return response.data
    },

    archive: async (id: string) => {
        const response = await api.patch<Project>(`/api/projects/${id}/archive`)
        return response.data
    },

    addMember: async (id: string, email: string, role: 'MEMBER' | 'OWNER' ) => {
        const response = await api.post<Project>(`/api/projects/${id}/members`, { email, role })
        return response.data
    },

    removeMember: async (id: string, email: string) => {
        await api.delete(`/api/projects/${id}/members`,{ data: {email}})
    },
    unarchive: async (id: string) => {
        const response = await api.patch<Project>(`/api/projects/${id}/unarchive`)
        return response.data
    },
}