export interface OrderItem {
  name: string
  quantity: number
  notes?: string | null
}

export interface ExtractedOrder {
  customer_name?: string | null
  phone_number?: string | null
  items: OrderItem[]
  delivery_address?: string | null
  delivery_time?: string | null
  special_instructions?: string | null
  order_date?: string | null
  confidence?: string | null
  raw_summary?: string | null
}

export interface ExtractionResponse {
  success: boolean
  order: ExtractedOrder
  message: string
  saved_order_id?: number | null
}

export interface OrderRecord extends ExtractedOrder {
  id: number
  source_type: string
  created_at: string
}

export interface ItemStatistic {
  item_name: string
  total_quantity: number
  order_count: number
}

export interface Statistics {
  total_orders: number
  total_items_sold: number
  unique_customers: number
  most_ordered_items: ItemStatistic[]
  recent_orders: OrderRecord[]
}

export interface HealthStatus {
  status: string
  ai_provider: string
  ai_configured: boolean
}

export type UploadMode = 'text' | 'image' | 'paste'
