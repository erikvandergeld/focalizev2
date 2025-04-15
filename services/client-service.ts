import { api } from "./api-service"

export interface Client {
  id: number | string
  name: string
  email: string
  phone?: string
  company?: string
  notes?: string
  created_at: string
  updated_at: string
}

export async function getClients(): Promise<Client[]> {
  try {
    return await api.get("/clients")
  } catch (error) {
    console.error("Erro ao buscar clientes:", error)
    return []
  }
}

export async function getClient(id: number | string): Promise<Client> {
  return await api.get(`/clients/${id}`)
}

export async function createClient(data: Partial<Client>): Promise<{ message: string; clientId: number }> {
  return await api.post("/clients", data)
}

export async function updateClient(id: number | string, data: Partial<Client>): Promise<{ message: string }> {
  return await api.put(`/clients/${id}`, data)
}

export async function deleteClient(id: number | string): Promise<{ message: string }> {
  return await api.delete(`/clients/${id}`)
}

export async function getClientTasks(clientId: number | string): Promise<any[]> {
  try {
    return await api.get(`/clients/${clientId}/tasks`)
  } catch (error) {
    console.error(`Erro ao buscar tarefas do cliente ${clientId}:`, error)
    return []
  }
}
