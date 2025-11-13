import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

interface UserProfile {
  id: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  total_coins: number;
  created_at: string;
  active_title_id?: string | null;
  equipped_badges?: string[];
}

interface UserWithEmail extends UserProfile {
  email: string;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use RPC function to fetch all users with emails (bypasses RLS circular dependency)
      const { data, error: rpcError } = await supabase
        .rpc('admin_get_all_users');

      if (rpcError) throw rpcError;

      // RPC now returns users with emails included
      setUsers(data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetchUsers = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const changeUserRole = async (userId: string, newRole: 'student' | 'teacher' | 'admin') => {
    try {
      const { error } = await supabase.rpc('admin_change_user_role', {
        p_user_id: userId,
        p_new_role: newRole,
      });

      if (error) throw error;
      
      // Refetch to get updated data
      await refetchUsers();
      return { success: true };
    } catch (err: any) {
      console.error('Error changing user role:', err);
      return { success: false, error: err.message };
    }
  };

  const adjustUserCoins = async (userId: string, amount: number, reason: string) => {
    try {
      const { error } = await supabase.rpc('admin_adjust_user_coins', {
        p_user_id: userId,
        p_amount: amount,
        p_reason: reason,
      });

      if (error) throw error;
      
      // Refetch to get updated data
      await refetchUsers();
      return { success: true };
    } catch (err: any) {
      console.error('Error adjusting user coins:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    users,
    loading,
    error,
    refetchUsers,
    changeUserRole,
    adjustUserCoins,
  };
};
