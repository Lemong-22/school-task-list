/**
 * Namecard Styles Configuration
 * Phase 10: Luxurious namecard backgrounds for Profile & Leaderboard
 * Insanely cool and premium designs
 */

export interface NamecardStyle {
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  // Background gradient
  background: string;
  // Border style
  border: string;
  // Text color
  textColor: string;
  // Additional effects (shadow, glow, etc.)
  effects: string;
  // Pattern overlay (optional)
  pattern?: string;
}

export const NAMECARD_STYLES: Record<string, NamecardStyle> = {
  // ============================================================================
  // LEGENDARY NAMECARDS - ULTRA LUXURY (1500 Coins)
  // ============================================================================
  
  'Royal Crimson': {
    name: 'Royal Crimson',
    rarity: 'legendary',
    background: 'bg-gradient-to-br from-red-900 via-red-700 to-rose-900',
    border: 'border-2 border-yellow-500/80 shadow-lg shadow-red-500/50',
    textColor: 'text-yellow-100',
    effects: 'animate-shimmer',
    pattern: 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent'
  },
  
  'Galaxy Emperor': {
    name: 'Galaxy Emperor',
    rarity: 'legendary',
    background: 'bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950',
    border: 'border-2 border-cyan-400/80 shadow-lg shadow-purple-500/50',
    textColor: 'text-cyan-100',
    effects: 'animate-shimmer',
    pattern: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent'
  },
  
  'Golden Dynasty': {
    name: 'Golden Dynasty',
    rarity: 'legendary',
    background: 'bg-gradient-to-br from-amber-600 via-yellow-600 to-orange-600',
    border: 'border-2 border-yellow-300/90 shadow-lg shadow-yellow-500/60',
    textColor: 'text-amber-50',
    effects: 'animate-shimmer',
    pattern: 'bg-[linear-gradient(45deg,_transparent_25%,_rgba(255,255,255,0.1)_25%,_rgba(255,255,255,0.1)_50%,_transparent_50%)] bg-[length:20px_20px]'
  },
  
  'Obsidian King': {
    name: 'Obsidian King',
    rarity: 'legendary',
    background: 'bg-gradient-to-br from-gray-950 via-black to-red-950/40',
    border: 'border-2 border-red-600/80 shadow-lg shadow-red-900/60',
    textColor: 'text-red-100',
    effects: 'animate-shimmer',
    pattern: 'bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent'
  },
  
  'Crystal Diamond': {
    name: 'Crystal Diamond',
    rarity: 'legendary',
    background: 'bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50',
    border: 'border-2 border-blue-300/90 shadow-lg shadow-blue-400/40',
    textColor: 'text-gray-900',
    effects: 'animate-shimmer',
    pattern: 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-blue-200/30 via-purple-200/30 to-pink-200/30'
  },

  // ============================================================================
  // GODLIKE LEGENDARY NAMECARDS - ULTRA PREMIUM (2000-2500 Coins)
  // ============================================================================
  
  'Divine Radiance': {
    name: 'Divine Radiance',
    rarity: 'legendary',
    background: 'bg-gradient-to-br from-yellow-100 via-white to-blue-100',
    border: 'border-2 border-yellow-300/90 shadow-lg shadow-yellow-400/60',
    textColor: 'text-gray-900',
    effects: 'animate-shimmer',
    pattern: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-200/40 via-white/30 to-blue-200/40'
  },
  
  'Eternal Flame': {
    name: 'Eternal Flame',
    rarity: 'legendary',
    background: 'bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500',
    border: 'border-2 border-orange-400/90 shadow-lg shadow-orange-500/70',
    textColor: 'text-white',
    effects: 'animate-shimmer',
    pattern: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-400/30 via-orange-600/20 to-red-700/30'
  },
  
  'Mystic Aurora': {
    name: 'Mystic Aurora',
    rarity: 'legendary',
    background: 'bg-gradient-to-br from-green-400 via-blue-500 to-purple-600',
    border: 'border-2 border-cyan-400/90 shadow-lg shadow-purple-500/60',
    textColor: 'text-white',
    effects: 'animate-shimmer',
    pattern: 'bg-[conic-gradient(from_180deg_at_50%_50%,_var(--tw-gradient-stops))] from-green-400/20 via-blue-500/30 to-purple-600/20'
  },
  
  'Celestial Storm': {
    name: 'Celestial Storm',
    rarity: 'legendary',
    background: 'bg-gradient-to-br from-blue-900 via-purple-700 to-indigo-900',
    border: 'border-2 border-blue-400/90 shadow-lg shadow-blue-500/70',
    textColor: 'text-cyan-100',
    effects: 'animate-shimmer',
    pattern: 'bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-400/30 via-blue-600/20 to-purple-800/30'
  },
  
  'Prismatic Dream': {
    name: 'Prismatic Dream',
    rarity: 'legendary',
    background: 'bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400',
    border: 'border-2 border-pink-300/90 shadow-lg shadow-purple-500/60',
    textColor: 'text-white',
    effects: 'animate-shimmer',
    pattern: 'bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-pink-300/40 via-purple-300/40 via-blue-300/40 to-pink-300/40'
  },
  
  'Shadow Emperor': {
    name: 'Shadow Emperor',
    rarity: 'legendary',
    background: 'bg-gradient-to-br from-gray-950 via-purple-950 to-black',
    border: 'border-2 border-purple-600/80 shadow-lg shadow-purple-900/70',
    textColor: 'text-purple-100',
    effects: 'animate-shimmer',
    pattern: 'bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-red-900/20'
  },
  
  'Emerald Throne': {
    name: 'Emerald Throne',
    rarity: 'legendary',
    background: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700',
    border: 'border-2 border-emerald-400/90 shadow-lg shadow-emerald-500/60',
    textColor: 'text-emerald-50',
    effects: 'animate-shimmer',
    pattern: 'bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-yellow-500/20 via-emerald-600/30 to-cyan-700/20'
  },

  // ============================================================================
  // EPIC NAMECARDS - PREMIUM (500 Coins)
  // ============================================================================
  
  'Sunset Paradise': {
    name: 'Sunset Paradise',
    rarity: 'epic',
    background: 'bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600',
    border: 'border border-orange-400/70 shadow-md shadow-orange-500/30',
    textColor: 'text-orange-50',
    effects: '',
    pattern: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-300/10 via-transparent to-transparent'
  },
  
  'Ocean Depths': {
    name: 'Ocean Depths',
    rarity: 'epic',
    background: 'bg-gradient-to-br from-blue-900 via-cyan-800 to-teal-900',
    border: 'border border-cyan-400/70 shadow-md shadow-cyan-500/30',
    textColor: 'text-cyan-50',
    effects: '',
    pattern: 'bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent'
  },
  
  'Forest Royale': {
    name: 'Forest Royale',
    rarity: 'epic',
    background: 'bg-gradient-to-br from-emerald-800 via-green-700 to-teal-800',
    border: 'border border-emerald-400/70 shadow-md shadow-emerald-500/30',
    textColor: 'text-emerald-50',
    effects: '',
    pattern: 'bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent'
  },
  
  'Purple Majesty': {
    name: 'Purple Majesty',
    rarity: 'epic',
    background: 'bg-gradient-to-br from-purple-800 via-fuchsia-700 to-pink-800',
    border: 'border border-purple-400/70 shadow-md shadow-purple-500/30',
    textColor: 'text-purple-50',
    effects: '',
    pattern: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent'
  },
  
  'Cyber Neon': {
    name: 'Cyber Neon',
    rarity: 'epic',
    background: 'bg-gradient-to-br from-pink-600 via-purple-700 to-cyan-600',
    border: 'border border-pink-400/70 shadow-md shadow-pink-500/30',
    textColor: 'text-cyan-50',
    effects: '',
    pattern: 'bg-[linear-gradient(90deg,_transparent_0%,_rgba(255,255,255,0.05)_50%,_transparent_100%)]'
  },

  // ============================================================================
  // RARE NAMECARDS - STYLISH (300 Coins)
  // ============================================================================
  
  'Sky Blue': {
    name: 'Sky Blue',
    rarity: 'rare',
    background: 'bg-gradient-to-br from-sky-400 via-blue-400 to-cyan-500',
    border: 'border border-sky-300/60 shadow-sm shadow-sky-400/20',
    textColor: 'text-sky-50',
    effects: '',
  },
  
  'Rose Garden': {
    name: 'Rose Garden',
    rarity: 'rare',
    background: 'bg-gradient-to-br from-pink-400 via-rose-400 to-pink-500',
    border: 'border border-pink-300/60 shadow-sm shadow-pink-400/20',
    textColor: 'text-pink-50',
    effects: '',
  },
  
  'Mint Fresh': {
    name: 'Mint Fresh',
    rarity: 'rare',
    background: 'bg-gradient-to-br from-teal-400 via-cyan-400 to-teal-500',
    border: 'border border-teal-300/60 shadow-sm shadow-teal-400/20',
    textColor: 'text-teal-50',
    effects: '',
  },
  
  'Lavender Dream': {
    name: 'Lavender Dream',
    rarity: 'rare',
    background: 'bg-gradient-to-br from-purple-300 via-violet-300 to-pink-300',
    border: 'border border-purple-200/60 shadow-sm shadow-purple-300/20',
    textColor: 'text-purple-900',
    effects: '',
  },

  // ============================================================================
  // COMMON NAMECARDS - BASIC (100 Coins)
  // ============================================================================
  
  'Classic Gray': {
    name: 'Classic Gray',
    rarity: 'common',
    background: 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700',
    border: 'border border-gray-500/50',
    textColor: 'text-gray-100',
    effects: '',
  },
  
  'Warm Beige': {
    name: 'Warm Beige',
    rarity: 'common',
    background: 'bg-gradient-to-br from-amber-200 via-orange-100 to-amber-200',
    border: 'border border-amber-300/50',
    textColor: 'text-amber-900',
    effects: '',
  },
  
  'Cool Slate': {
    name: 'Cool Slate',
    rarity: 'common',
    background: 'bg-gradient-to-br from-slate-600 via-blue-600 to-slate-600',
    border: 'border border-slate-400/50',
    textColor: 'text-slate-100',
    effects: '',
  },
};

// Default namecard (no namecard equipped)
export const DEFAULT_NAMECARD: NamecardStyle = {
  name: 'Default',
  rarity: 'common',
  background: 'bg-component-dark',
  border: 'border border-border-dark',
  textColor: 'text-text-primary-dark',
  effects: '',
};

/**
 * Get namecard style by name
 */
export function getNamecardStyle(namecardName: string | null | undefined): NamecardStyle {
  if (!namecardName) return DEFAULT_NAMECARD;
  return NAMECARD_STYLES[namecardName] || DEFAULT_NAMECARD;
}
