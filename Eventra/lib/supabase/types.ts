export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'organizer' | 'attendee'
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'organizer' | 'attendee'
          avatar_url?: string | null
        }
        Update: {
          full_name?: string | null
          role?: 'organizer' | 'attendee'
          avatar_url?: string | null
        }
      }
      events: {
        Row: {
          id: string
          organizer_id: string
          name: string
          slug: string
          description: string | null
          date: string | null
          time: string | null
          venue: string | null
          category: string | null
          cover_image_url: string | null
          ticket_name: string | null
          ticket_desc: string | null
          price: number
          capacity: number | null
          tickets_sold: number
          paystack_payment_link: string | null
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at' | 'updated_at' | 'tickets_sold'>
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      registrations: {
        Row: {
          id: string
          event_id: string
          attendee_id: string | null
          attendee_email: string
          attendee_name: string | null
          paystack_session_id: string | null
          status: 'pending' | 'confirmed' | 'cancelled'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['registrations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['registrations']['Insert']>
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type Registration = Database['public']['Tables']['registrations']['Row']
