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
          full_name: string;
          phone: string;
          email: string | null;
          line1: string;
          line2: string | null;
          city: string;
          region: string;
          postal_code: string | null;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          phone: string;
          email?: string | null;
          line1: string;
          line2?: string | null;
          city: string;
          region: string;
          postal_code?: string | null;
          country: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          phone?: string;
          email?: string | null;
          line1?: string;
          line2?: string | null;
          city?: string;
          region?: string;
          postal_code?: string | null;
          country?: string;
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
          payment_method: string;
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
          payment_method: string;
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
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: "customer" | "admin";
      order_status:
        | "pending"
        | "paid"
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
