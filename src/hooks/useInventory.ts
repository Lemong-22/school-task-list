// ============================================================================
// useInventory - React hooks for user inventory and equipping items
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { InventoryItem, EquipTitleResult, EquipBadgesResult } from '../types/shop';

interface UseInventoryResult {
  inventory: InventoryItem[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch user's inventory (all owned items)
 */
export function useInventory(userId?: string): UseInventoryResult {
  const [inventory, setInventory] = useState<InventoryItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        throw new Error('User ID not provided');
      }

      const { data, error: rpcError } = await supabase.rpc('get_user_inventory', {
        p_user_id: targetUserId
      });

      if (rpcError) {
        throw rpcError;
      }

      // Map database response to InventoryItem interface
      const mappedData: InventoryItem[] = (data || []).map((item: any) => ({
        id: item.item_id,
        name: item.item_name,
        description: item.item_description,
        type: item.item_type,
        rarity: item.item_rarity,
        icon_url: item.item_icon_url,
        price: item.item_price,
        purchased_at: item.purchased_at,
        is_equipped: item.is_equipped,
      }));

      setInventory(mappedData);
    } catch (err: unknown) {
      console.error('Error fetching inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
      setInventory(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory,
    loading,
    error,
    refetch: fetchInventory
  };
}

interface UseEquipTitleResult {
  equipTitle: (titleId: string | null) => Promise<EquipTitleResult>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to equip a title
 */
export function useEquipTitle(onSuccess?: () => void): UseEquipTitleResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const equipTitle = useCallback(async (titleId: string | null): Promise<EquipTitleResult> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: rpcError } = await supabase.rpc('equip_title', {
        p_user_id: user.id,
        p_title_id: titleId
      });

      if (rpcError) {
        throw rpcError;
      }

      const result = data as EquipTitleResult;

      if (!result.success) {
        throw new Error(result.error || 'Failed to equip title');
      }

      if (onSuccess) {
        onSuccess();
      }

      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to equip title';
      console.error('Equip title error:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return {
    equipTitle,
    loading,
    error
  };
}

interface UseEquipBadgesResult {
  equipBadges: (badgeIds: string[]) => Promise<EquipBadgesResult>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to equip badges
 */
export function useEquipBadges(onSuccess?: () => void): UseEquipBadgesResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const equipBadges = useCallback(async (badgeIds: string[]): Promise<EquipBadgesResult> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate max 6 badges on client side
      if (badgeIds.length > 6) {
        throw new Error('Maximum 6 badges can be equipped');
      }

      const { data, error: rpcError } = await supabase.rpc('equip_badges', {
        p_user_id: user.id,
        p_badge_ids: badgeIds
      });

      if (rpcError) {
        throw rpcError;
      }

      const result = data as EquipBadgesResult;

      if (!result.success) {
        throw new Error(result.error || 'Failed to equip badges');
      }

      if (onSuccess) {
        onSuccess();
      }

      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to equip badges';
      console.error('Equip badges error:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return {
    equipBadges,
    loading,
    error
  };
}

interface UseInventoryByTypeResult {
  titles: InventoryItem[];
  badges: InventoryItem[];
  equippedTitle: InventoryItem | null;
  equippedBadges: InventoryItem[];
  isEmpty: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get inventory items by type
 */
export function useInventoryByType(userId?: string): UseInventoryByTypeResult {
  const { inventory, loading, error, refetch } = useInventory(userId);

  const titles = inventory?.filter(item => item.type === 'title') || [];
  const badges = inventory?.filter(item => item.type === 'badge') || [];
  
  const equippedTitle = titles.find(item => item.is_equipped) || null;
  const equippedBadges = badges.filter(item => item.is_equipped);

  return {
    titles,
    badges,
    equippedTitle,
    equippedBadges,
    isEmpty: inventory?.length === 0,
    loading,
    error,
    refetch
  };
}
