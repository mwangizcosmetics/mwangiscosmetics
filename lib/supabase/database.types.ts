export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: Database["public"]["Enums"]["user_role"];
          is_active: boolean;
          loyalty_tier: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          is_active?: boolean;
          loyalty_tier?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          is_active?: boolean;
          loyalty_tier?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          image_url: string;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          image_url: string;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string;
          image_url?: string;
          featured?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          short_description: string;
          description: string;
          brand: string;
          category_id: string;
          tags: string[];
          price: number;
          compare_at_price: number | null;
          currency: Database["public"]["Enums"]["currency_code"];
          stock: number;
          sku: string;
          rating: number;
          rating_count: number;
          is_new: boolean;
          is_best_seller: boolean;
          is_featured: boolean;
          highlights: string[];
          ingredients: string[];
          benefits: string[];
          how_to_use: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          short_description: string;
          description: string;
          brand: string;
          category_id: string;
          tags?: string[];
          price: number;
          compare_at_price?: number | null;
          currency?: Database["public"]["Enums"]["currency_code"];
          stock?: number;
          sku: string;
          rating?: number;
          rating_count?: number;
          is_new?: boolean;
          is_best_seller?: boolean;
          is_featured?: boolean;
          highlights?: string[];
          ingredients?: string[];
          benefits?: string[];
          how_to_use?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          name?: string;
          short_description?: string;
          description?: string;
          brand?: string;
          category_id?: string;
          tags?: string[];
          price?: number;
          compare_at_price?: number | null;
          currency?: Database["public"]["Enums"]["currency_code"];
          stock?: number;
          sku?: string;
          rating?: number;
          rating_count?: number;
          is_new?: boolean;
          is_best_seller?: boolean;
          is_featured?: boolean;
          highlights?: string[];
          ingredients?: string[];
          benefits?: string[];
          how_to_use?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt: string;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt: string;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          product_id?: string;
          url?: string;
          alt?: string;
          is_primary?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string | null;
          user_name: string;
          user_avatar: string | null;
          rating: number;
          title: string;
          comment: string;
          verified_purchase: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id?: string | null;
          user_name: string;
          user_avatar?: string | null;
          rating: number;
          title: string;
          comment: string;
          verified_purchase?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          rating?: number;
          title?: string;
          comment?: string;
          verified_purchase?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          selected_shade: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity?: number;
          selected_shade?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          quantity?: number;
          selected_shade?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string | null;
          full_name: string;
          phone: string;
          county_id: string | null;
          county_name: string;
          town_center_id: string | null;
          town_center_name: string;
          street_address: string;
          building_or_house: string | null;
          landmark: string | null;
          is_primary: boolean;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string | null;
          full_name: string;
          phone: string;
          county_id?: string | null;
          county_name: string;
          town_center_id?: string | null;
          town_center_name: string;
          street_address: string;
          building_or_house?: string | null;
          landmark?: string | null;
          is_primary?: boolean;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          label?: string | null;
          full_name?: string;
          phone?: string;
          county_id?: string | null;
          county_name?: string;
          town_center_id?: string | null;
          town_center_name?: string;
          street_address?: string;
          building_or_house?: string | null;
          landmark?: string | null;
          is_primary?: boolean;
          is_default?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          discount: number;
          shipping: number;
          tax: number;
          total: number;
          currency: Database["public"]["Enums"]["currency_code"];
          shipping_address: Json;
          delivery_snapshot: Json | null;
          payment_method: string;
          payment_status: "pending" | "success" | "failed" | "refunded";
          payment_reference: string | null;
          inventory_committed_at: string | null;
          follow_up_status: "new" | "contacted" | "archived" | "dismissed";
          follow_up_notes: string | null;
          contacted_at: string | null;
          recovery_archived: boolean;
          retry_count: number;
          last_payment_attempt_at: string | null;
          payment_init_error: string | null;
          delivery_agent_id: string | null;
          ready_for_dispatch_at: string | null;
          in_transit_at: string | null;
          delivered_at: string | null;
          delivery_failed_at: string | null;
          returned_at: string | null;
          dispatch_note: string | null;
          delivery_note: string | null;
          placed_at: string;
          estimated_delivery: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id: string;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          discount?: number;
          shipping?: number;
          tax?: number;
          total: number;
          currency?: Database["public"]["Enums"]["currency_code"];
          shipping_address: Json;
          delivery_snapshot?: Json | null;
          payment_method: string;
          payment_status?: "pending" | "success" | "failed" | "refunded";
          payment_reference?: string | null;
          inventory_committed_at?: string | null;
          follow_up_status?: "new" | "contacted" | "archived" | "dismissed";
          follow_up_notes?: string | null;
          contacted_at?: string | null;
          recovery_archived?: boolean;
          retry_count?: number;
          last_payment_attempt_at?: string | null;
          payment_init_error?: string | null;
          delivery_agent_id?: string | null;
          ready_for_dispatch_at?: string | null;
          in_transit_at?: string | null;
          delivered_at?: string | null;
          delivery_failed_at?: string | null;
          returned_at?: string | null;
          dispatch_note?: string | null;
          delivery_note?: string | null;
          placed_at?: string;
          estimated_delivery?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: Database["public"]["Enums"]["order_status"];
          discount?: number;
          shipping?: number;
          tax?: number;
          total?: number;
          delivery_snapshot?: Json | null;
          payment_status?: "pending" | "success" | "failed" | "refunded";
          payment_reference?: string | null;
          inventory_committed_at?: string | null;
          follow_up_status?: "new" | "contacted" | "archived" | "dismissed";
          follow_up_notes?: string | null;
          contacted_at?: string | null;
          recovery_archived?: boolean;
          retry_count?: number;
          last_payment_attempt_at?: string | null;
          payment_init_error?: string | null;
          delivery_agent_id?: string | null;
          ready_for_dispatch_at?: string | null;
          in_transit_at?: string | null;
          delivered_at?: string | null;
          delivery_failed_at?: string | null;
          returned_at?: string | null;
          dispatch_note?: string | null;
          delivery_note?: string | null;
          estimated_delivery?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          quantity: number;
          unit_price: number;
          product_snapshot: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          quantity: number;
          unit_price: number;
          product_snapshot: Json;
          created_at?: string;
        };
        Update: {
          quantity?: number;
          unit_price?: number;
          product_snapshot?: Json;
        };
        Relationships: [];
      };
      refunds: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          reason: string;
          note: string | null;
          status: "requested" | "under_review" | "approved" | "declined" | "refunded";
          admin_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          user_id: string;
          reason: string;
          note?: string | null;
          status: "requested" | "under_review" | "approved" | "declined" | "refunded";
          admin_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          reason?: string;
          note?: string | null;
          status?: "requested" | "under_review" | "approved" | "declined" | "refunded";
          admin_note?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_events: {
        Row: {
          id: string;
          order_id: string;
          event_type: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          event_type: string;
          message: string;
          created_at?: string;
        };
        Update: {
          event_type?: string;
          message?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          method: "mpesa" | "card" | "cash";
          provider: string;
          status:
            | "initiated"
            | "pending"
            | "success"
            | "failed"
            | "cancelled"
            | "timed_out"
            | "init_failed";
          amount: number;
          currency: Database["public"]["Enums"]["currency_code"];
          phone: string | null;
          checkout_request_id: string | null;
          merchant_request_id: string | null;
          provider_reference: string | null;
          raw_response: Json | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
          confirmed_at: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          user_id: string;
          method: "mpesa" | "card" | "cash";
          provider: string;
          status:
            | "initiated"
            | "pending"
            | "success"
            | "failed"
            | "cancelled"
            | "timed_out"
            | "init_failed";
          amount: number;
          currency?: Database["public"]["Enums"]["currency_code"];
          phone?: string | null;
          checkout_request_id?: string | null;
          merchant_request_id?: string | null;
          provider_reference?: string | null;
          raw_response?: Json | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string | null;
        };
        Update: {
          method?: "mpesa" | "card" | "cash";
          provider?: string;
          status?:
            | "initiated"
            | "pending"
            | "success"
            | "failed"
            | "cancelled"
            | "timed_out"
            | "init_failed";
          amount?: number;
          currency?: Database["public"]["Enums"]["currency_code"];
          phone?: string | null;
          checkout_request_id?: string | null;
          merchant_request_id?: string | null;
          provider_reference?: string | null;
          raw_response?: Json | null;
          error_message?: string | null;
          updated_at?: string;
          confirmed_at?: string | null;
        };
        Relationships: [];
      };
      payment_callback_logs: {
        Row: {
          id: string;
          provider: string;
          checkout_request_id: string | null;
          merchant_request_id: string | null;
          mpesa_receipt_number: string | null;
          result_code: number | null;
          result_description: string | null;
          idempotency_key: string;
          processing_status:
            | "received"
            | "duplicate"
            | "invalid_payload"
            | "rejected"
            | "payment_not_found"
            | "processed_success"
            | "processed_failed";
          security_valid: boolean;
          suspicious: boolean;
          rejection_reason: string | null;
          payload: Json;
          payment_id: string | null;
          order_id: string | null;
          created_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          provider?: string;
          checkout_request_id?: string | null;
          merchant_request_id?: string | null;
          mpesa_receipt_number?: string | null;
          result_code?: number | null;
          result_description?: string | null;
          idempotency_key: string;
          processing_status?:
            | "received"
            | "duplicate"
            | "invalid_payload"
            | "rejected"
            | "payment_not_found"
            | "processed_success"
            | "processed_failed";
          security_valid?: boolean;
          suspicious?: boolean;
          rejection_reason?: string | null;
          payload: Json;
          payment_id?: string | null;
          order_id?: string | null;
          created_at?: string;
          processed_at?: string | null;
        };
        Update: {
          provider?: string;
          checkout_request_id?: string | null;
          merchant_request_id?: string | null;
          mpesa_receipt_number?: string | null;
          result_code?: number | null;
          result_description?: string | null;
          idempotency_key?: string;
          processing_status?:
            | "received"
            | "duplicate"
            | "invalid_payload"
            | "rejected"
            | "payment_not_found"
            | "processed_success"
            | "processed_failed";
          security_valid?: boolean;
          suspicious?: boolean;
          rejection_reason?: string | null;
          payload?: Json;
          payment_id?: string | null;
          order_id?: string | null;
          processed_at?: string | null;
        };
        Relationships: [];
      };
      discount_rules: {
        Row: {
          id: string;
          scope: "global" | "category" | "product";
          percent: number;
          is_active: boolean;
          category_id: string | null;
          product_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scope: "global" | "category" | "product";
          percent: number;
          is_active?: boolean;
          category_id?: string | null;
          product_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          scope?: "global" | "category" | "product";
          percent?: number;
          is_active?: boolean;
          category_id?: string | null;
          product_id?: string | null;
          created_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      discount_audit_logs: {
        Row: {
          id: string;
          rule_id: string | null;
          scope: "global" | "category" | "product";
          action: "create" | "update" | "delete" | "activate" | "deactivate";
          summary: string;
          previous_percent: number | null;
          next_percent: number | null;
          affected_product_ids: string[];
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          rule_id?: string | null;
          scope: "global" | "category" | "product";
          action: "create" | "update" | "delete" | "activate" | "deactivate";
          summary: string;
          previous_percent?: number | null;
          next_percent?: number | null;
          affected_product_ids?: string[];
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          rule_id?: string | null;
          scope?: "global" | "category" | "product";
          action?: "create" | "update" | "delete" | "activate" | "deactivate";
          summary?: string;
          previous_percent?: number | null;
          next_percent?: number | null;
          affected_product_ids?: string[];
          created_by?: string | null;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          description: string;
          type: Database["public"]["Enums"]["coupon_type"];
          value: number;
          min_subtotal: number | null;
          active: boolean;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description: string;
          type: Database["public"]["Enums"]["coupon_type"];
          value: number;
          min_subtotal?: number | null;
          active?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          description?: string;
          type?: Database["public"]["Enums"]["coupon_type"];
          value?: number;
          min_subtotal?: number | null;
          active?: boolean;
          expires_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      banners: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          cta_label: string | null;
          href: string | null;
          badge: string | null;
          image_url: string;
          active: boolean;
          starts_at: string | null;
          ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          subtitle?: string | null;
          cta_label?: string | null;
          href?: string | null;
          badge?: string | null;
          image_url: string;
          active?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          subtitle?: string | null;
          cta_label?: string | null;
          href?: string | null;
          badge?: string | null;
          image_url?: string;
          active?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_announcements: {
        Row: {
          id: string;
          message: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          message: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          message?: string;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      service_counties: {
        Row: {
          id: string;
          name: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      service_towns: {
        Row: {
          id: string;
          county_id: string;
          name: string;
          is_active: boolean;
          eta_min_value: number | null;
          eta_max_value: number | null;
          eta_unit: "hours" | "days" | null;
          estimated_delivery_days: number | null;
          delivery_fee: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          county_id: string;
          name: string;
          is_active?: boolean;
          eta_min_value?: number | null;
          eta_max_value?: number | null;
          eta_unit?: "hours" | "days" | null;
          estimated_delivery_days?: number | null;
          delivery_fee?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          county_id?: string;
          name?: string;
          is_active?: boolean;
          eta_min_value?: number | null;
          eta_max_value?: number | null;
          eta_unit?: "hours" | "days" | null;
          estimated_delivery_days?: number | null;
          delivery_fee?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_admin_ops: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_beba: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      claim_delivery_order: {
        Args: {
          p_order_id: string;
          p_beba_user_id: string;
          p_note?: string | null;
        };
        Returns: Json;
      };
      process_mpesa_callback: {
        Args: {
          p_payload: Json;
          p_security_valid?: boolean | null;
          p_rejection_reason?: string | null;
        };
        Returns: Json;
      };
    };
    Enums: {
      user_role:
        | "customer"
        | "admin"
        | "super_admin"
        | "staff_admin"
        | "beba";
      order_status:
        | "pending"
        | "pending_payment"
        | "payment_init_failed"
        | "failed_payment"
        | "refund_requested"
        | "confirmed"
        | "paid"
        | "ready_for_dispatch"
        | "preparing"
        | "left_shop"
        | "in_transit"
        | "out_for_delivery"
        | "delivery_failed"
        | "returned"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded";
      coupon_type: "percentage" | "fixed";
      currency_code: "KES" | "USD";
    };
    CompositeTypes: Record<string, never>;
  };
}
