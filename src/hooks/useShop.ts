// ============================================================================
// useShop - React hooks for Coin Shop functionality
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ShopItemWithOwnership, PurchaseResult, ShopItemType, ShopItemRarity } from '../types/shop';

interface UseShopItemsResult {
  items: ShopItemWithOwnership[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all shop items with ownership status for current user
 */
export function useShopItems(): UseShopItemsResult {
  const [items, setItems] = useState<ShopItemWithOwnership[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: rpcError } = await supabase.rpc('get_shop_items', {
        p_user_id: user.id
      });

      if (rpcError) {
        throw rpcError;
      }

      setItems(data as ShopItemWithOwnership[]);
    } catch (err: unknown) {
      console.error('Error fetching shop items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load shop items');
      setItems(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    refetch: fetchItems
  };
}

interface UsePurchaseItemResult {
  purchaseItem: (itemId: string) => Promise<PurchaseResult>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to purchase a shop item
 */
export function usePurchaseItem(onSuccess?: (result: PurchaseResult) => void): UsePurchaseItemResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchaseItem = useCallback(async (itemId: string): Promise<PurchaseResult> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: rpcError } = await supabase.rpc('purchase_shop_item', {
        p_user_id: user.id,
        p_item_id: itemId
      });

      if (rpcError) {
        throw rpcError;
      }

      const result = data as PurchaseResult;

      if (!result.success) {
        throw new Error(result.error || 'Purchase failed');
      }

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Purchase failed';
      console.error('Purchase error:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return {
    purchaseItem,
    loading,
    error
  };
}

interface UseFilteredShopItemsResult {
  items: ShopItemWithOwnership[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get filtered and sorted shop items
 */
export function useFilteredShopItems(
  type: 'all' | ShopItemType = 'all',
  sortBy: 'price-asc' | 'price-desc' | 'rarity' | 'name' = 'price-asc'
): UseFilteredShopItemsResult {
  const { items, loading, error, refetch } = useShopItems();

  const filteredItems = items
    ? (() => {
        // First filter by type
        const filtered = items.filter(item => type === 'all' || item.type === type);
        
        // Separate owned and unowned items
        const unownedItems = filtered.filter(item => !item.is_owned);
        const ownedItems = filtered.filter(item => item.is_owned);
        
        // Define sorting comparator
        const comparator = (a: ShopItemWithOwnership, b: ShopItemWithOwnership) => {
          if (sortBy === 'price-asc') {
            return a.price - b.price;
          } else if (sortBy === 'price-desc') {
            return b.price - a.price;
          } else if (sortBy === 'rarity') {
            const rarityOrder: Record<ShopItemRarity, number> = { common: 1, rare: 2, epic: 3, legendary: 4 };
            return rarityOrder[b.rarity] - rarityOrder[a.rarity];
          } else {
            return a.name.localeCompare(b.name);
          }
        };
        
        // Sort each group and concatenate (unowned first, owned last)
        return [...unownedItems.sort(comparator), ...ownedItems.sort(comparator)];
      })()
    : null;

  return {
    items: filteredItems,
    loading,
    error,
    refetch
  };
}
