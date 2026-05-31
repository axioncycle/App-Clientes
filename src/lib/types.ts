export type CustomerStatus = 'interested' | 'purchased'
export type SKUType = 'interest' | 'purchased'
export type PipelineStage = 'primeiro_contato' | 'negociando' | 'proposta_enviada' | 'fechado' | 'perdido'

export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
}

export interface CustomerTag {
  customer_id: string
  tag_id: string
}

export interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  status: CustomerStatus
  pipeline_stage?: PipelineStage
  service_date: string | null
  purchase_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // joined
  customer_skus?: CustomerSKU[]
  follow_ups?: FollowUp[]
  tags?: Tag[]
}

export interface CustomerSKU {
  id: string
  customer_id: string
  sku: string
  description: string | null
  quantity: number
  type: SKUType
  unit_price: number | null
  created_at: string
}

export interface FollowUp {
  id: string
  customer_id: string
  contact_date: string
  notes: string | null
  created_at: string
}

export interface CustomerWithStats extends Customer {
  skus_interest_count: number
  skus_purchased_count: number
  last_follow_up: string | null
  days_since_contact: number | null
}

// Form types (for create/edit)
export interface CustomerFormData {
  name: string
  phone: string
  email: string
  status: CustomerStatus
  service_date: string
  purchase_date: string
  notes: string
  skus: SKUFormItem[]
  tagIds: string[]
}

export interface SKUFormItem {
  id?: string
  sku: string
  description: string
  quantity: number
  type: SKUType
  unit_price: string
}

export interface DashboardStats {
  totalCustomers: number
  interested: number
  purchased: number
  servicesToday: number
}
