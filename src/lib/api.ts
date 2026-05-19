import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

api.interceptors.request.use((config) => {
  const isAuthRoute = config.url?.includes('/api/auth/')
  if (!isAuthRoute) {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export default api