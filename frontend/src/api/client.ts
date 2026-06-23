import type {
  ExtractionResponse,
  HealthStatus,
  OrderRecord,
  Statistics,
} from '../types'

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: response.statusText,
    }))

    const message =
      typeof error.detail === 'string'
        ? error.detail
        : Array.isArray(error.detail)
        ? error.detail.map((e: { msg: string }) => e.msg).join(', ')
        : 'Request failed'

    throw new Error(message)
  }

  return response.json()
}

export async function checkHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE}/health`)
  return handleResponse<HealthStatus>(res)
}

export async function extractFromText(
  file: File,
  save = true,
): Promise<ExtractionResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(
    `${API_BASE}/api/orders/extract/text?save=${save}`,
    {
      method: 'POST',
      body: formData,
    },
  )

  return handleResponse<ExtractionResponse>(res)
}

export async function extractFromImages(
  files: File[],
  save = true,
): Promise<ExtractionResponse> {
  const formData = new FormData()

  files.forEach((file) => {
    formData.append('files', file)
  })

  const res = await fetch(
    `${API_BASE}/api/orders/extract/images?save=${save}`,
    {
      method: 'POST',
      body: formData,
    },
  )

  return handleResponse<ExtractionResponse>(res)
}

export async function extractFromPaste(
  conversation: string,
  save = true,
): Promise<ExtractionResponse> {
  const res = await fetch(
    `${API_BASE}/api/orders/extract/raw?save=${save}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation,
      }),
    },
  )

  return handleResponse<ExtractionResponse>(res)
}

export async function fetchStatistics(): Promise<Statistics> {
  const res = await fetch(`${API_BASE}/api/orders/statistics`)
  return handleResponse<Statistics>(res)
}

export async function fetchOrders(
  limit = 50,
): Promise<OrderRecord[]> {
  const res = await fetch(
    `${API_BASE}/api/orders?limit=${limit}`,
  )
  return handleResponse<OrderRecord[]>(res)
}

export async function deleteOrder(id: number) {
  const response = await fetch(`${API_BASE}/api/orders/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete order')
  }
}

export async function updateOrder(id: number, order: any) {
  const response = await fetch(`${API_BASE}/api/orders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  })

  if (!response.ok) {
    throw new Error('Failed to update order')
  }

  return response.json()
}