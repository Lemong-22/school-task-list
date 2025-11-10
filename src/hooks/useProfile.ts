/**
 * useProfile Hook
 * Fetches profile data for a specific user
 * Phase 4.1: User Profile Page
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface Profile {
  id: string;
  full_name: string;
  role: string;
  total_coins: number;
  created_at: string;
  active_title_id: string | null;
  active_namecard_id: string | null;
  equipped_badges: string[];
  // Populated fields (when joining with shop_items)
  active_title?: {
    id: string;
    name: string;
    rarity: string;
  } | null;
  badge_items?: Array<{
    id: string;
    name: string;
    icon_url: string | null;
    rarity: string;
  }>;
}

interface UseProfileResult {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateFullName: (newName: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Hook to fetch and manage profile data
 * @param userId - User ID to fetch profile for, or "me" for current user
 */
export const useProfile = (userId: string | undefined): UseProfileResult => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine the actual user ID to fetch
  const getActualUserId = (): string | null => {
    if (!userId) return null;
    if (userId === 'me') return user?.id || null;
    return userId;
  };

  const fetchProfile = async () => {
    const actualUserId = getActualUserId();
    
    if (!actualUserId) {
      setError('No user ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, full_name, role, total_coins, created_at, active_title_id, active_namecard_id, equipped_badges')
        .eq('id', actualUserId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        throw new Error('Profile not found');
      }

      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateFullName = async (newName: string): Promise<{ success: boolean; error?: string }> => {
    const actualUserId = getActualUserId();
    
    if (!actualUserId) {
      return { success: false, error: 'No user ID provided' };
    }

    // Validation
    if (!newName || newName.trim().length < 2) {
      return { success: false, error: 'Name must be at least 2 characters' };
    }

    if (newName.length > 100) {
      return { success: false, error: 'Name must be less than 100 characters' };
    }

    // Check if user is updating their own profile
    if (actualUserId !== user?.id) {
      return { success: false, error: 'You can only update your own profile' };
    }

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: newName.trim() })
        .eq('id', actualUserId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      if (profile) {
        setProfile({ ...profile, full_name: newName.trim() });
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      return { success: false, error: err.message || 'Failed to update profile' };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId, user?.id]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateFullName,
  };
};
