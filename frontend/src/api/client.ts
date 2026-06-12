import type {
  ExtractionResponse,
  HealthStatus,
  OrderRecord,
  Statistics,
} from '../types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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
  const res = await fetch(`${API_BASE}/api/health`)
  return handleResponse<HealthStatus>(res)
}

export async function extractFromText(
  file: File,
  save = true,
): Promise<ExtractionResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(
    `${API_BASE}/api/extract/chat?save=${save}`,
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
  const file = files[0]

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(
    `${API_BASE}/api/extract/screenshot?save=${save}`,
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
    `${API_BASE}/api/extract/text?text=${encodeURIComponent(
      conversation,
    )}&save=${save}`,
    {
      method: 'POST',
    },
  )

  return handleResponse<ExtractionResponse>(res)
}

export async function fetchStatistics(): Promise<Statistics> {
  const res = await fetch(`${API_BASE}/api/orders`)
  return handleResponse<Statistics>(res)
}

export async function fetchOrders(limit = 50): Promise<OrderRecord[]> {
  const res = await fetch(`${API_BASE}/api/orders?limit=${limit}`)
  return handleResponse<OrderRecord[]>(res)
}