export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          checked_in_at: string | null
          checked_out_at: string | null
          id: string
          table_number: string | null
          user_id: string
          venue_id: string
          visibility: string | null
        }
        Insert: {
          checked_in_at?: string | null
          checked_out_at?: string | null
          id?: string
          table_number?: string | null
          user_id: string
          venue_id: string
          visibility?: string | null
        }
        Update: {
          checked_in_at?: string | null
          checked_out_at?: string | null
          id?: string
          table_number?: string | null
          user_id?: string
          venue_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          connection_count: number | null
          created_at: string | null
          display_name: string | null
          id: string
          location: string | null
          relationship_status: string | null
          selected_background: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          connection_count?: number | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          location?: string | null
          relationship_status?: string | null
          selected_background?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          connection_count?: number | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          location?: string | null
          relationship_status?: string | null
          selected_background?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      deposit_records: {
        Row: {
          amount_jvc: number
          amount_local: number
          amount_usd: number
          completed_at: string | null
          created_at: string
          crypto_from_address: string | null
          crypto_tx_hash: string | null
          deposit_method: string
          exchange_rate: number
          failure_reason: string | null
          id: string
          local_currency: string
          metadata: Json | null
          net_amount: number | null
          status: string
          stripe_charge_id: string | null
          stripe_fee: number | null
          stripe_payment_intent_id: string | null
          user_id: string | null
          venue_id: string | null
        }
        Insert: {
          amount_jvc: number
          amount_local: number
          amount_usd: number
          completed_at?: string | null
          created_at?: string
          crypto_from_address?: string | null
          crypto_tx_hash?: string | null
          deposit_method: string
          exchange_rate?: number
          failure_reason?: string | null
          id?: string
          local_currency?: string
          metadata?: Json | null
          net_amount?: number | null
          status?: string
          stripe_charge_id?: string | null
          stripe_fee?: number | null
          stripe_payment_intent_id?: string | null
          user_id?: string | null
          venue_id?: string | null
        }
        Update: {
          amount_jvc?: number
          amount_local?: number
          amount_usd?: number
          completed_at?: string | null
          created_at?: string
          crypto_from_address?: string | null
          crypto_tx_hash?: string | null
          deposit_method?: string
          exchange_rate?: number
          failure_reason?: string | null
          id?: string
          local_currency?: string
          metadata?: Json | null
          net_amount?: number | null
          status?: string
          stripe_charge_id?: string | null
          stripe_fee?: number | null
          stripe_payment_intent_id?: string | null
          user_id?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposit_records_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_profiles: {
        Row: {
          average_rating: number | null
          created_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          drivers_license_id: string | null
          id: string
          is_available: boolean | null
          last_location_update: string | null
          license_verified: boolean | null
          total_deliveries: number | null
          total_rides: number | null
          updated_at: string | null
          user_id: string
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_plate: string | null
          vehicle_type: string | null
        }
        Insert: {
          average_rating?: number | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          drivers_license_id?: string | null
          id?: string
          is_available?: boolean | null
          last_location_update?: string | null
          license_verified?: boolean | null
          total_deliveries?: number | null
          total_rides?: number | null
          updated_at?: string | null
          user_id: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
        }
        Update: {
          average_rating?: number | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          drivers_license_id?: string | null
          id?: string
          is_available?: boolean | null
          last_location_update?: string | null
          license_verified?: boolean | null
          total_deliveries?: number | null
          total_rides?: number | null
          updated_at?: string | null
          user_id?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      driver_shifts: {
        Row: {
          created_at: string | null
          deliveries_completed: number | null
          driver_id: string
          earnings: number | null
          ended_at: string | null
          id: string
          rides_completed: number | null
          shift_type: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          deliveries_completed?: number | null
          driver_id: string
          earnings?: number | null
          ended_at?: string | null
          id?: string
          rides_completed?: number | null
          shift_type: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          deliveries_completed?: number | null
          driver_id?: string
          earnings?: number | null
          ended_at?: string | null
          id?: string
          rides_completed?: number | null
          shift_type?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      employee_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          employee_email: string
          expires_at: string | null
          id: string
          invitation_token: string | null
          invited_by: string
          permissions: Json | null
          role: string
          status: string | null
          venue_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          employee_email: string
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          invited_by: string
          permissions?: Json | null
          role?: string
          status?: string | null
          venue_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          employee_email?: string
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          invited_by?: string
          permissions?: Json | null
          role?: string
          status?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_invitations_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_roster: {
        Row: {
          created_at: string | null
          day_of_week: string
          employee_id: string
          end_time: string
          id: string
          is_recurring: boolean | null
          specific_date: string | null
          start_time: string
          station: string | null
          updated_at: string | null
          venue_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: string
          employee_id: string
          end_time: string
          id?: string
          is_recurring?: boolean | null
          specific_date?: string | null
          start_time: string
          station?: string | null
          updated_at?: string | null
          venue_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: string
          employee_id?: string
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          specific_date?: string | null
          start_time?: string
          station?: string | null
          updated_at?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_roster_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_shifts: {
        Row: {
          clock_in_location: Json | null
          clock_in_time: string | null
          clock_out_location: Json | null
          clock_out_time: string | null
          created_at: string | null
          employee_id: string
          id: string
          notes: string | null
          orders_served: number | null
          status: string | null
          total_sales: number | null
          venue_id: string
        }
        Insert: {
          clock_in_location?: Json | null
          clock_in_time?: string | null
          clock_out_location?: Json | null
          clock_out_time?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          orders_served?: number | null
          status?: string | null
          total_sales?: number | null
          venue_id: string
        }
        Update: {
          clock_in_location?: Json | null
          clock_in_time?: string | null
          clock_out_location?: Json | null
          clock_out_time?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          orders_served?: number | null
          status?: string | null
          total_sales?: number | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_shifts_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_venue_links: {
        Row: {
          created_at: string | null
          hired_date: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          pin_hash: string | null
          role: string
          terminated_date: string | null
          updated_at: string | null
          user_id: string
          venue_id: string
        }
        Insert: {
          created_at?: string | null
          hired_date?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          pin_hash?: string | null
          role?: string
          terminated_date?: string | null
          updated_at?: string | null
          user_id: string
          venue_id: string
        }
        Update: {
          created_at?: string | null
          hired_date?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          pin_hash?: string | null
          role?: string
          terminated_date?: string | null
          updated_at?: string | null
          user_id?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_venue_links_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          base_currency: string
          expires_at: string
          fetched_at: string
          id: string
          rate: number
          source: string
          target_currency: string
        }
        Insert: {
          base_currency?: string
          expires_at?: string
          fetched_at?: string
          id?: string
          rate: number
          source?: string
          target_currency: string
        }
        Update: {
          base_currency?: string
          expires_at?: string
          fetched_at?: string
          id?: string
          rate?: number
          source?: string
          target_currency?: string
        }
        Relationships: []
      }
      floorplans: {
        Row: {
          canvas_height: number | null
          canvas_width: number | null
          created_at: string | null
          created_by: string | null
          id: string
          items: Json | null
          name: string
          updated_at: string | null
          venue_id: string
        }
        Insert: {
          canvas_height?: number | null
          canvas_width?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          items?: Json | null
          name: string
          updated_at?: string | null
          venue_id?: string
        }
        Update: {
          canvas_height?: number | null
          canvas_width?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          items?: Json | null
          name?: string
          updated_at?: string | null
          venue_id?: string
        }
        Relationships: []
      }
      food_delivery_orders: {
        Row: {
          actual_delivery_time: string | null
          actual_pickup_time: string | null
          created_at: string | null
          customer_id: string
          customer_rating: number | null
          delivery_address: string
          delivery_fee: number | null
          delivery_latitude: number | null
          delivery_longitude: number | null
          driver_id: string | null
          driver_rating: number | null
          estimated_delivery_time: string | null
          estimated_pickup_time: string | null
          id: string
          order_id: string | null
          pickup_address: string | null
          pickup_latitude: number | null
          pickup_longitude: number | null
          platform_fee: number | null
          special_instructions: string | null
          status: string | null
          updated_at: string | null
          venue_id: string
        }
        Insert: {
          actual_delivery_time?: string | null
          actual_pickup_time?: string | null
          created_at?: string | null
          customer_id: string
          customer_rating?: number | null
          delivery_address: string
          delivery_fee?: number | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          driver_id?: string | null
          driver_rating?: number | null
          estimated_delivery_time?: string | null
          estimated_pickup_time?: string | null
          id?: string
          order_id?: string | null
          pickup_address?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          platform_fee?: number | null
          special_instructions?: string | null
          status?: string | null
          updated_at?: string | null
          venue_id: string
        }
        Update: {
          actual_delivery_time?: string | null
          actual_pickup_time?: string | null
          created_at?: string | null
          customer_id?: string
          customer_rating?: number | null
          delivery_address?: string
          delivery_fee?: number | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          driver_id?: string | null
          driver_rating?: number | null
          estimated_delivery_time?: string | null
          estimated_pickup_time?: string | null
          id?: string
          order_id?: string | null
          pickup_address?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          platform_fee?: number | null
          special_instructions?: string | null
          status?: string | null
          updated_at?: string | null
          venue_id?: string
        }
        Relationships: []
      }
      ledger_entries: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          entry_type: string
          id: string
          transaction_id: string
          wallet_id: string | null
          wallet_type: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string
          entry_type: string
          id?: string
          transaction_id: string
          wallet_id?: string | null
          wallet_type: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          entry_type?: string
          id?: string
          transaction_id?: string
          wallet_id?: string | null
          wallet_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      mint_burn_audit: {
        Row: {
          admin_id: string | null
          admin_reason: string | null
          amount_jvc: number
          amount_usd: number
          balance_after: number
          balance_before: number
          created_at: string
          deposit_id: string | null
          id: string
          operation_type: string
          total_supply_after: number
          total_supply_before: number
          triggered_by: string
          wallet_id: string
          wallet_type: string
          withdrawal_id: string | null
        }
        Insert: {
          admin_id?: string | null
          admin_reason?: string | null
          amount_jvc: number
          amount_usd: number
          balance_after: number
          balance_before: number
          created_at?: string
          deposit_id?: string | null
          id?: string
          operation_type: string
          total_supply_after: number
          total_supply_before: number
          triggered_by: string
          wallet_id: string
          wallet_type: string
          withdrawal_id?: string | null
        }
        Update: {
          admin_id?: string | null
          admin_reason?: string | null
          amount_jvc?: number
          amount_usd?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          deposit_id?: string | null
          id?: string
          operation_type?: string
          total_supply_after?: number
          total_supply_before?: number
          triggered_by?: string
          wallet_id?: string
          wallet_type?: string
          withdrawal_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          menu_item_id: string
          modifiers: Json | null
          name: string
          notes: string | null
          order_id: string
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          menu_item_id: string
          modifiers?: Json | null
          name: string
          notes?: string | null
          order_id: string
          price: number
          quantity?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          menu_item_id?: string
          modifiers?: Json | null
          name?: string
          notes?: string | null
          order_id?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_name: string | null
          id: string
          notes: string | null
          order_number: number
          priority: string | null
          staff_id: string | null
          station: string | null
          status: string | null
          subtotal: number | null
          table_id: string | null
          table_number: string | null
          tax: number | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name?: string | null
          id?: string
          notes?: string | null
          order_number?: never
          priority?: string | null
          staff_id?: string | null
          station?: string | null
          status?: string | null
          subtotal?: number | null
          table_id?: string | null
          table_number?: string | null
          tax?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string | null
          id?: string
          notes?: string | null
          order_number?: never
          priority?: string | null
          staff_id?: string | null
          station?: string | null
          status?: string | null
          subtotal?: number | null
          table_id?: string | null
          table_number?: string | null
          tax?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "venue_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          order_id: string
          payment_method: string
          staff_id: string | null
          status: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          order_id: string
          payment_method: string
          staff_id?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          order_id?: string
          payment_method?: string
          staff_id?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_treasury: {
        Row: {
          collected_fees: number
          created_at: string
          id: string
          last_reconciled_at: string | null
          pending_deposits: number
          pending_withdrawals: number
          reconciliation_status: string | null
          stripe_balance: number
          total_jvc_supply: number
          total_usd_backing: number
          updated_at: string
        }
        Insert: {
          collected_fees?: number
          created_at?: string
          id?: string
          last_reconciled_at?: string | null
          pending_deposits?: number
          pending_withdrawals?: number
          reconciliation_status?: string | null
          stripe_balance?: number
          total_jvc_supply?: number
          total_usd_backing?: number
          updated_at?: string
        }
        Update: {
          collected_fees?: number
          created_at?: string
          id?: string
          last_reconciled_at?: string | null
          pending_deposits?: number
          pending_withdrawals?: number
          reconciliation_status?: string | null
          stripe_balance?: number
          total_jvc_supply?: number
          total_usd_backing?: number
          updated_at?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_pounds: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_pounds_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          post_type: string | null
          pounds_count: number | null
          user_id: string
          venue_id: string | null
          video_url: string | null
          visibility: string | null
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          post_type?: string | null
          pounds_count?: number | null
          user_id: string
          venue_id?: string | null
          video_url?: string | null
          visibility?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          post_type?: string | null
          pounds_count?: number | null
          user_id?: string
          venue_id?: string | null
          video_url?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ride_bookings: {
        Row: {
          actual_duration_minutes: number | null
          actual_fare: number | null
          created_at: string | null
          customer_id: string
          customer_rating: number | null
          destination_address: string
          destination_latitude: number | null
          destination_longitude: number | null
          distance_km: number | null
          driver_id: string | null
          driver_rating: number | null
          estimated_duration_minutes: number | null
          estimated_fare: number | null
          id: string
          payment_status: string | null
          pickup_address: string
          pickup_latitude: number | null
          pickup_longitude: number | null
          platform_fee: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_duration_minutes?: number | null
          actual_fare?: number | null
          created_at?: string | null
          customer_id: string
          customer_rating?: number | null
          destination_address: string
          destination_latitude?: number | null
          destination_longitude?: number | null
          distance_km?: number | null
          driver_id?: string | null
          driver_rating?: number | null
          estimated_duration_minutes?: number | null
          estimated_fare?: number | null
          id?: string
          payment_status?: string | null
          pickup_address: string
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          platform_fee?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_duration_minutes?: number | null
          actual_fare?: number | null
          created_at?: string | null
          customer_id?: string
          customer_rating?: number | null
          destination_address?: string
          destination_latitude?: number | null
          destination_longitude?: number | null
          distance_km?: number | null
          driver_id?: string | null
          driver_rating?: number | null
          estimated_duration_minutes?: number | null
          estimated_fare?: number | null
          id?: string
          payment_status?: string | null
          pickup_address?: string
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          platform_fee?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_jvc: number
          amount_local: number | null
          amount_usd: number
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          exchange_rate: number | null
          fee_amount: number
          fee_collected: boolean
          from_wallet_id: string | null
          from_wallet_type: string | null
          id: string
          local_currency: string | null
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          status: string
          to_wallet_id: string | null
          to_wallet_type: string | null
          transaction_type: string
        }
        Insert: {
          amount_jvc: number
          amount_local?: number | null
          amount_usd: number
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          exchange_rate?: number | null
          fee_amount?: number
          fee_collected?: boolean
          from_wallet_id?: string | null
          from_wallet_type?: string | null
          id?: string
          local_currency?: string | null
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          to_wallet_id?: string | null
          to_wallet_type?: string | null
          transaction_type: string
        }
        Update: {
          amount_jvc?: number
          amount_local?: number | null
          amount_usd?: number
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          exchange_rate?: number | null
          fee_amount?: number
          fee_collected?: boolean
          from_wallet_id?: string | null
          from_wallet_type?: string | null
          id?: string
          local_currency?: string | null
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          to_wallet_id?: string | null
          to_wallet_type?: string | null
          transaction_type?: string
        }
        Relationships: []
      }
      user_connections: {
        Row: {
          connected_user_id: string
          created_at: string | null
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          connected_user_id: string
          created_at?: string | null
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          connected_user_id?: string
          created_at?: string | null
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          balance_jv_token: number | null
          balance_usd: number | null
          created_at: string | null
          freeze_reason: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          is_frozen: boolean
          pending_balance: number
          reward_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance_jv_token?: number | null
          balance_usd?: number | null
          created_at?: string | null
          freeze_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          is_frozen?: boolean
          pending_balance?: number
          reward_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance_jv_token?: number | null
          balance_usd?: number | null
          created_at?: string | null
          freeze_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          is_frozen?: boolean
          pending_balance?: number
          reward_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      venue_tables: {
        Row: {
          capacity: number
          created_at: string | null
          floorplan_id: string | null
          id: string
          section: string | null
          status: string | null
          table_number: string
          updated_at: string | null
          x_position: number | null
          y_position: number | null
        }
        Insert: {
          capacity?: number
          created_at?: string | null
          floorplan_id?: string | null
          id?: string
          section?: string | null
          status?: string | null
          table_number: string
          updated_at?: string | null
          x_position?: number | null
          y_position?: number | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          floorplan_id?: string | null
          id?: string
          section?: string | null
          status?: string | null
          table_number?: string
          updated_at?: string | null
          x_position?: number | null
          y_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "venue_tables_floorplan_id_fkey"
            columns: ["floorplan_id"]
            isOneToOne: false
            referencedRelation: "floorplans"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_wallets: {
        Row: {
          balance_jvc: number
          balance_usd: number
          created_at: string
          freeze_reason: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          is_frozen: boolean
          pending_balance: number
          updated_at: string
          venue_id: string
        }
        Insert: {
          balance_jvc?: number
          balance_usd?: number
          created_at?: string
          freeze_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          is_frozen?: boolean
          pending_balance?: number
          updated_at?: string
          venue_id: string
        }
        Update: {
          balance_jvc?: number
          balance_usd?: number
          created_at?: string
          freeze_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          is_frozen?: boolean
          pending_balance?: number
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_wallets_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: true
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          business_email: string | null
          business_license: string | null
          capacity: number | null
          city: string | null
          created_at: string | null
          current_occupancy: number | null
          description: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          owner_user_id: string | null
          rejection_reason: string | null
          updated_at: string | null
          venue_type: string | null
          vibe_score: number | null
        }
        Insert: {
          address?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          business_email?: string | null
          business_license?: string | null
          capacity?: number | null
          city?: string | null
          created_at?: string | null
          current_occupancy?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_user_id?: string | null
          rejection_reason?: string | null
          updated_at?: string | null
          venue_type?: string | null
          vibe_score?: number | null
        }
        Update: {
          address?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          business_email?: string | null
          business_license?: string | null
          capacity?: number | null
          city?: string | null
          created_at?: string | null
          current_occupancy?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_user_id?: string | null
          rejection_reason?: string | null
          updated_at?: string | null
          venue_type?: string | null
          vibe_score?: number | null
        }
        Relationships: []
      }
      wallet_freezes: {
        Row: {
          created_at: string
          freeze_reason: string
          frozen_by: string
          id: string
          is_active: boolean
          unfreeze_reason: string | null
          unfrozen_at: string | null
          unfrozen_by: string | null
          wallet_id: string
          wallet_type: string
        }
        Insert: {
          created_at?: string
          freeze_reason: string
          frozen_by: string
          id?: string
          is_active?: boolean
          unfreeze_reason?: string | null
          unfrozen_at?: string | null
          unfrozen_by?: string | null
          wallet_id: string
          wallet_type: string
        }
        Update: {
          created_at?: string
          freeze_reason?: string
          frozen_by?: string
          id?: string
          is_active?: boolean
          unfreeze_reason?: string | null
          unfrozen_at?: string | null
          unfrozen_by?: string | null
          wallet_id?: string
          wallet_type?: string
        }
        Relationships: []
      }
      withdrawal_records: {
        Row: {
          amount_jvc: number
          amount_local: number
          amount_usd: number
          approved_at: string | null
          approved_by: string | null
          bank_account_last4: string | null
          bank_name: string | null
          completed_at: string | null
          created_at: string
          crypto_to_address: string | null
          crypto_tx_hash: string | null
          exchange_rate: number
          failure_reason: string | null
          fee_amount: number
          id: string
          local_currency: string
          metadata: Json | null
          net_payout: number
          rejection_reason: string | null
          status: string
          stripe_payout_id: string | null
          user_id: string | null
          venue_id: string | null
          withdrawal_method: string
        }
        Insert: {
          amount_jvc: number
          amount_local: number
          amount_usd: number
          approved_at?: string | null
          approved_by?: string | null
          bank_account_last4?: string | null
          bank_name?: string | null
          completed_at?: string | null
          created_at?: string
          crypto_to_address?: string | null
          crypto_tx_hash?: string | null
          exchange_rate?: number
          failure_reason?: string | null
          fee_amount?: number
          id?: string
          local_currency?: string
          metadata?: Json | null
          net_payout: number
          rejection_reason?: string | null
          status?: string
          stripe_payout_id?: string | null
          user_id?: string | null
          venue_id?: string | null
          withdrawal_method: string
        }
        Update: {
          amount_jvc?: number
          amount_local?: number
          amount_usd?: number
          approved_at?: string | null
          approved_by?: string | null
          bank_account_last4?: string | null
          bank_name?: string | null
          completed_at?: string | null
          created_at?: string
          crypto_to_address?: string | null
          crypto_tx_hash?: string | null
          exchange_rate?: number
          failure_reason?: string | null
          fee_amount?: number
          id?: string
          local_currency?: string
          metadata?: Json | null
          net_payout?: number
          rejection_reason?: string | null
          status?: string
          stripe_payout_id?: string | null
          user_id?: string | null
          venue_id?: string | null
          withdrawal_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_records_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "manager"
        | "staff"
        | "kitchen"
        | "owner_superadmin"
        | "admin_manager"
        | "admin_support"
        | "admin_finance"
        | "admin_compliance"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "manager",
        "staff",
        "kitchen",
        "owner_superadmin",
        "admin_manager",
        "admin_support",
        "admin_finance",
        "admin_compliance",
      ],
    },
  },
} as const
