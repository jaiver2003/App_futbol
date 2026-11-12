import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Ajusta si tu API usa otra URL
})

// Antes de cada petición: adjunta el token de la sesión
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Si el servidor dice 401 (sin sesión o token vencido): limpia y manda al login
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const esLogin = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !esLogin) {
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login') window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api