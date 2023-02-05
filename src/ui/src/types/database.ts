export type Json = any;

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          contract_address: string;
          created_at: string | null;
          description: string | null;
          id: number;
          is_default: boolean;
          name: string;
          user_id: string;
        };
        Insert: {
          contract_address: string;
          created_at?: string | null;
          description?: string | null;
          id?: number;
          is_default?: boolean;
          name: string;
          user_id: string;
        };
        Update: {
          contract_address?: string;
          created_at?: string | null;
          description?: string | null;
          id?: number;
          is_default?: boolean;
          name?: string;
          user_id?: string;
        };
      };
      activities: {
        Row: {
          chain_id: number;
          created_at: string | null;
          hash: string | null;
          id: number;
          metadata: Json | null;
          status: string;
          timestamp: number | null;
          type: string;
          user_id: string;
        };
        Insert: {
          chain_id: number;
          created_at?: string | null;
          hash?: string | null;
          id?: number;
          metadata?: Json | null;
          status: string;
          timestamp?: number | null;
          type: string;
          user_id?: string;
        };
        Update: {
          chain_id?: number;
          created_at?: string | null;
          hash?: string | null;
          id?: number;
          metadata?: Json | null;
          status?: string;
          timestamp?: number | null;
          type?: string;
          user_id?: string;
        };
      };
      categories: {
        Row: {
          active: boolean;
          created_at: string | null;
          deposit: boolean;
          description: string | null;
          id: number;
          name: string | null;
          pool_id: string;
          user_id: string | null;
          withdrawal: boolean;
        };
        Insert: {
          active?: boolean;
          created_at?: string | null;
          deposit?: boolean;
          description?: string | null;
          id?: number;
          name?: string | null;
          pool_id: string;
          user_id?: string | null;
          withdrawal?: boolean;
        };
        Update: {
          active?: boolean;
          created_at?: string | null;
          deposit?: boolean;
          description?: string | null;
          id?: number;
          name?: string | null;
          pool_id?: string;
          user_id?: string | null;
          withdrawal?: boolean;
        };
      };
      invitations: {
        Row: {
          active: boolean;
          created_at: string | null;
          email: string;
          id: string;
          invited_by: string;
          name: string;
          pool_id: string;
          pool_name: string;
          role: string;
          status: string;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string | null;
          email: string;
          id?: string;
          invited_by: string;
          name: string;
          pool_id: string;
          pool_name: string;
          role?: string;
          status?: string;
          user_id?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string | null;
          email?: string;
          id?: string;
          invited_by?: string;
          name?: string;
          pool_id?: string;
          pool_name?: string;
          role?: string;
          status?: string;
          user_id?: string;
        };
      };
      members: {
        Row: {
          active: boolean;
          created_at: string | null;
          inactive_reason: string | null;
          is_owner: boolean;
          last_viewed_at: string | null;
          pool_id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string | null;
          inactive_reason?: string | null;
          is_owner?: boolean;
          last_viewed_at?: string | null;
          pool_id: string;
          role: string;
          user_id: string;
        };
        Update: {
          active?: boolean;
          created_at?: string | null;
          inactive_reason?: string | null;
          is_owner?: boolean;
          last_viewed_at?: string | null;
          pool_id?: string;
          role?: string;
          user_id?: string;
        };
      };
      pools: {
        Row: {
          active: boolean;
          chain_id: number;
          created_at: string | null;
          description: string | null;
          gnosis_safe_address: string | null;
          id: string;
          name: string;
          token_id: number;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          chain_id: number;
          created_at?: string | null;
          description?: string | null;
          gnosis_safe_address?: string | null;
          id?: string;
          name: string;
          token_id: number;
          user_id?: string;
        };
        Update: {
          active?: boolean;
          chain_id?: number;
          created_at?: string | null;
          description?: string | null;
          gnosis_safe_address?: string | null;
          id?: string;
          name?: string;
          token_id?: number;
          user_id?: string;
        };
      };
      tokens: {
        Row: {
          active: boolean;
          address: string;
          chain_id: number;
          decimals: number;
          id: number;
          image: string;
          name: string;
          symbol: string;
        };
        Insert: {
          active: boolean;
          address: string;
          chain_id: number;
          decimals: number;
          id?: number;
          image: string;
          name: string;
          symbol: string;
        };
        Update: {
          active?: boolean;
          address?: string;
          chain_id?: number;
          decimals?: number;
          id?: number;
          image?: string;
          name?: string;
          symbol?: string;
        };
      };
      transactions: {
        Row: {
          category_id: number | null;
          created_at: string | null;
          hash: string | null;
          id: number;
          memo: string | null;
          metadata: Json | null;
          pool_id: string;
          reject_safe_tx_hash: string | null;
          safe_nonce: number | null;
          safe_transaction: Json | null;
          safe_tx_hash: string | null;
          status: string;
          timestamp: number | null;
          type: string;
          user_id: string;
        };
        Insert: {
          category_id?: number | null;
          created_at?: string | null;
          hash?: string | null;
          id?: number;
          memo?: string | null;
          metadata?: Json | null;
          pool_id: string;
          reject_safe_tx_hash?: string | null;
          safe_nonce?: number | null;
          safe_transaction?: Json | null;
          safe_tx_hash?: string | null;
          status: string;
          timestamp?: number | null;
          type: string;
          user_id?: string;
        };
        Update: {
          category_id?: number | null;
          created_at?: string | null;
          hash?: string | null;
          id?: number;
          memo?: string | null;
          metadata?: Json | null;
          pool_id?: string;
          reject_safe_tx_hash?: string | null;
          safe_nonce?: number | null;
          safe_transaction?: Json | null;
          safe_tx_hash?: string | null;
          status?: string;
          timestamp?: number | null;
          type?: string;
          user_id?: string;
        };
      };
      users: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          last_pool_id: string | null;
          name: string | null;
          username: string | null;
          wallet: string;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id: string;
          last_pool_id?: string | null;
          name?: string | null;
          username?: string | null;
          wallet: string;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          last_pool_id?: string | null;
          name?: string | null;
          username?: string | null;
          wallet?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_invitation: {
        Args: { invitation_id: string };
        Returns: undefined;
      };
      check_username: {
        Args: { username: string };
        Returns: boolean;
      };
      create_pool: {
        Args: {
          chain_id: number;
          name: string;
          description: string;
          token_id: number;
        };
        Returns: string;
      };
      get_co_members_for_authenticated_user: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_invitation: {
        Args: { invitation_id: string };
        Returns: unknown;
      };
      get_my_pools: {
        Args: Record<PropertyKey, never>;
        Returns: Record<string, unknown>[];
      };
      get_pools_for_authenticated_user: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_pools_where_authenticated_user_is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_total_per_category: {
        Args: { pool_id: string };
        Returns: { name: string; deposit: number; withdrawal: number }[];
      };
      get_transactions_per_month: {
        Args: { pool_id: string };
        Returns: { month: string; deposit: number; withdrawal: number }[];
      };
      get_transactions_stats: {
        Args: { pool_id: string };
        Returns: { count: number; deposit: number; withdrawal: number }[];
      };
      get_user_activities:
        | {
            Args: Record<PropertyKey, never>;
            Returns: Record<string, unknown>[];
          }
        | {
            Args: { chain_id: number };
            Returns: {
              id: number;
              type: string;
              hash: string;
              status: string;
              metadata: Json;
              pool_id: string;
              pool_name: string;
              timestamp: number;
              created_at: string;
            }[];
          };
      join_pool: {
        Args: { invitation_id: string };
        Returns: number;
      };
      user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
