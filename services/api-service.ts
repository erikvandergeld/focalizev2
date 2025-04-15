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

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return Promise.reject(new Error(errorData.message || "Erro na requisição"))
    }

    return await response.json()
  } catch (error) {
    return Promise.reject(error)
  }
}

// Helper methods for common HTTP methods
export const api = {
  get: <T = any>(endpoint: string, config: RequestOptions = {}) =>
    apiRequest<T>(endpoint, { ...config, method: "GET" }),

  post: <T = any>(endpoint: string, data: any, config: RequestOptions = {}) =>
    apiRequest<T>(endpoint, { ...config, method: "POST", data }),

  put: <T = any>(endpoint: string, data: any, config: RequestOptions = {}) =>
    apiRequest<T>(endpoint, { ...config, method: "PUT", data }),

  delete: <T = any>(endpoint: string, config: RequestOptions = {}) =>
    apiRequest<T>(endpoint, { ...config, method: "DELETE" }),
}
