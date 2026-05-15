import api from '@/lib/api'
import { Task, PageResponse } from '@/types'

export const taskService = {
  listByProject: async (projectId: string, page = 0, size = 100, status?: string) => {
    const response = await api.get<PageResponse<Task>>(`/api/projects/${projectId}/tasks`, {
      params: { page, size, status },
    })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get<Task>(`/api/tasks/${id}`)
    return response.data
  },

  create: async (projectId: string, data: {
    title: string
    description?: string
    priority: string
    deadline?: string
  }) => {
    const response = await api.post<Task>(`/api/projects/${projectId}/tasks`, data)
    return response.data
  },

  update: async (id: string, data: {
    title: string
    description?: string
    priority: string
    deadline?: string
  }) => {
    const response = await api.put<Task>(`/api/tasks/${id}`, data)
    return response.data
  },

  changeStatus: async (id: string, status: string) => {
    const response = await api.patch<Task>(`/api/tasks/${id}/status`, { status })
    return response.data
  },

  assign: async (id: string, email: string) => {
    const response = await api.patch<Task>(`/api/tasks/${id}/assign`, { email })
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`/api/tasks/${id}`)
  },

  addComment: async (id: string, content: string) => {
    const response = await api.post<Task>(`/api/tasks/${id}/comments`, { content })
    return response.data
  },

  removeComment: async (taskId: string, commentId: string) => {
    await api.delete(`/api/tasks/${taskId}/comments/${commentId}`)
  },
}