// ============================================================================
// Shop Types - TypeScript interfaces for Coin Shop feature
// ============================================================================

/**
 * Shop item rarity levels
 */
export type ShopItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * Shop item types
 */
export type ShopItemType = 'title' | 'badge' | 'namecard';

/**
 * Base shop item from database
 */
export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  type: ShopItemType;
  rarity: ShopItemRarity;
  price: number;
  icon_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Shop item with ownership status (from get_shop_items function)
 */
export interface ShopItemWithOwnership extends Omit<ShopItem, 'is_active' | 'created_at' | 'updated_at'> {
  is_owned: boolean;
}

/**
 * Inventory item with equipped status (from get_user_inventory function)
 */
export interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  type: ShopItemType;
  rarity: ShopItemRarity;
  icon_url: string | null;
  price: number;
  purchased_at: string;
  is_equipped: boolean;
}

/**
 * Purchase result from purchase_shop_item function
 */
export interface PurchaseResult {
  success: boolean;
  error?: string;
  item_id?: string;
  item_name?: string;
  price_paid?: number;
  new_balance?: number;
  required?: number;
  current?: number;
  missing?: number;
}

/**
 * Equip title result from equip_title function
 */
export interface EquipTitleResult {
  success: boolean;
  error?: string;
  equipped_title: string | null;
  title_name?: string;
  message?: string;
}

/**
 * Equip badges result from equip_badges function
 */
export interface EquipBadgesResult {
  success: boolean;
  error?: string;
  equipped_badges?: string[];
  count?: number;
  message?: string;
  invalid_badges?: string[];
}

/**
 * Equipped items on a user's profile
 */
export interface EquippedItems {
  activeTitle: ShopItem | null;
  equippedBadges: ShopItem[];
}

/**
 * Filter options for shop items
 */
export interface ShopFilters {
  type: 'all' | ShopItemType;
  sortBy: 'price-asc' | 'price-desc' | 'rarity' | 'name';
}

/**
 * Rarity configuration for pricing and display
 */
export const RARITY_CONFIG: Record<ShopItemRarity, { price: number; label: string; color: string }> = {
  common: {
    price: 50,
    label: 'Common',
    color: 'text-gray-600 dark:text-gray-400'
  },
  rare: {
    price: 150,
    label: 'Rare',
    color: 'text-blue-600 dark:text-blue-400'
  },
  epic: {
    price: 500,
    label: 'Epic',
    color: 'text-purple-600 dark:text-purple-400'
  },
  legendary: {
    price: 1500,
    label: 'Legendary',
    color: 'text-yellow-600 dark:text-yellow-400'
  }
};

/**
 * Item type configuration
 */
export const ITEM_TYPE_CONFIG: Record<ShopItemType, { label: string; labelPlural: string }> = {
  title: {
    label: 'Gelar',
    labelPlural: 'Gelar'
  },
  badge: {
    label: 'Badge',
    labelPlural: 'Badges'
  },
  namecard: {
    label: 'Namecard',
    labelPlural: 'Namecards'
  }
};

/**
 * Maximum number of badges that can be equipped
 */
export const MAX_EQUIPPED_BADGES = 6;
