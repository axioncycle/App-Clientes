import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function createSupabaseBrowser() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          status: string
          service_date: string | null
          purchase_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      customer_skus: {
        Row: {
          id: string
          customer_id: string
          sku: string
          description: string | null
          quantity: number
          type: string
          unit_price: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['customer_skus']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['customer_skus']['Insert']>
      }
      follow_ups: {
        Row: {
          id: string
          customer_id: string
          contact_date: string
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['follow_ups']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['follow_ups']['Insert']>
      }
    }
  }
}
