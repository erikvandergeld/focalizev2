import { getToken } from "./auth-service"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

interface RequestOptions extends RequestInit {
  token?: boolean
  data?: any
}

export async function apiRequest<T = any>(
  endpoint: string,
  { token = true, data, ...customConfig }: RequestOptions = {},
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (token) {
    const authToken = getToken()
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }
  }

  const config: RequestInit = {
    method: data ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  }

  if (data) {
    config.body = JSON.stringify(data)
  }

  const url = `${API_URL}${endpoint}`
  console.log(`Requisição API: ${config.method} ${url}`, data ? { data } : "")

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`Erro API (${response.status}):`, errorData)
      return Promise.reject(new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`))
    }

    // Para requisições DELETE que podem não retornar conteúdo
    if (response.status === 204) {
      return { success: true } as T
    }

    const responseData = await response.json()
    return responseData
  } catch (error: any) {
    console.error(`Erro na requisição para ${url}:`, error)
    return Promise.reject(error)
  }
}

export const api = {
  get: <T = any>(endpoint: string, config: RequestOptions = {}) =>
    apiRequest<T>(endpoint, { ...config, method: "GET" }),

  post: <T = any>(endpoint: string, data: any, config: RequestOptions = {}) =>
    apiRequest<T>(endpoint, { ...config, method: "POST", data }),

  put: <T = any>(endpoint: string, data: any, config: RequestOptions = {}) =>
    apiRequest<T>(endpoint, { ...config, method: "PUT", data }),

  patch: <T = any>(endpoint: string, data: any, config: RequestOptions = {}) =>
    apiRequest<T>(endpoint, { ...config, method: "PATCH", data }),

  delete: <T = any>(endpoint: string, config: RequestOptions = {}) =>
    apiRequest<T>(endpoint, { ...config, method: "DELETE" }),
}
