import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: 'avatar' | 'background' | 'badge' | 'powerup';
  price: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type FormMode = 'create' | 'edit' | null;

interface ShopItemFormData {
  name: string;
  description: string;
  category: 'avatar' | 'background' | 'badge' | 'powerup';
  price: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

const INITIAL_FORM_DATA: ShopItemFormData = {
  name: '',
  description: '',
  category: 'badge',
  price: 100,
  rarity: 'common',
};

export const AdminPage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [formData, setFormData] = useState<ShopItemFormData>(INITIAL_FORM_DATA);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check admin access
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (role !== 'admin') {
      setError('Access denied. Admin privileges required.');
      setTimeout(() => navigate('/'), 2000);
    }
  }, [user, role, navigate]);

  // Fetch all shop items
  useEffect(() => {
    if (role === 'admin') {
      fetchShopItems();
    }
  }, [role]);

  const fetchShopItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .order('category')
        .order('price');

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching shop items:', err);
      setError('Failed to load shop items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setError(null);
      
      // Validation
      if (!formData.name.trim()) {
        setError('Name is required');
        return;
      }
      if (!formData.description.trim()) {
        setError('Description is required');
        return;
      }
      if (formData.price < 1 || formData.price > 10000) {
        setError('Price must be between 1 and 10000');
        return;
      }

      const { error } = await supabase
        .from('shop_items')
        .insert([{
          name: formData.name.trim(),
          description: formData.description.trim(),
          category: formData.category,
          price: formData.price,
          rarity: formData.rarity,
          type: 'badge', // Keep for backward compatibility
          is_active: true,
        }]);

      if (error) throw error;

      setSuccess('Item created successfully!');
      setFormMode(null);
      setFormData(INITIAL_FORM_DATA);
      fetchShopItems();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error creating item:', err);
      if (err.message.includes('duplicate')) {
        setError('An item with this name already exists');
      } else {
        setError('Failed to create item');
      }
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      setError(null);
      
      // Validation
      if (!formData.name.trim()) {
        setError('Name is required');
        return;
      }
      if (!formData.description.trim()) {
        setError('Description is required');
        return;
      }
      if (formData.price < 1 || formData.price > 10000) {
        setError('Price must be between 1 and 10000');
        return;
      }

      const { error } = await supabase
        .from('shop_items')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim(),
          category: formData.category,
          price: formData.price,
          rarity: formData.rarity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      setSuccess('Item updated successfully!');
      setFormMode(null);
      setEditingItem(null);
      setFormData(INITIAL_FORM_DATA);
      fetchShopItems();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating item:', err);
      setError('Failed to update item');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('shop_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuccess('Item deleted successfully!');
      setDeleteConfirm(null);
      fetchShopItems();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
    }
  };

  const openCreateForm = () => {
    setFormMode('create');
    setFormData(INITIAL_FORM_DATA);
    setEditingItem(null);
  };

  const openEditForm = (item: ShopItem) => {
    setFormMode('edit');
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      rarity: item.rarity,
    });
  };

  const closeForm = () => {
    setFormMode(null);
    setEditingItem(null);
    setFormData(INITIAL_FORM_DATA);
    setError(null);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'avatar': return '👤';
      case 'background': return '🎨';
      case 'badge': return '🏅';
      case 'powerup': return '⚡';
      default: return '📦';
    }
  };

  if (role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary-dark mb-2">
              🛠️ Admin Shop Management
            </h1>
            <p className="text-text-secondary-dark">
              Manage shop items - Create, edit, and delete items from the inventory
            </p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4">
              <p className="text-green-300">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Add New Item Button */}
          {!formMode && (
            <div className="mb-6">
              <button
                onClick={openCreateForm}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Add New Item
              </button>
            </div>
          )}

          {/* Create/Edit Form */}
          {formMode && (
            <div className="bg-component-dark border border-border-dark rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-primary-dark">
                  {formMode === 'create' ? 'Create New Item' : `Edit: ${editingItem?.name}`}
                </h2>
                <button
                  onClick={closeForm}
                  className="text-text-secondary-dark hover:text-text-primary-dark"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary-dark mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    maxLength={100}
                    className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-text-primary-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Golden Trophy Badge"
                  />
                  <p className="text-xs text-text-secondary-dark mt-1">
                    {formData.name.length}/100 characters
                  </p>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary-dark mb-2">
                    Price (Coins) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    min={1}
                    max={10000}
                    className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-text-primary-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary-dark mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-text-primary-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="avatar">👤 Avatar</option>
                    <option value="background">🎨 Background</option>
                    <option value="badge">🏅 Badge</option>
                    <option value="powerup">⚡ Powerup</option>
                  </select>
                </div>

                {/* Rarity */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary-dark mb-2">
                    Rarity *
                  </label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData({ ...formData, rarity: e.target.value as any })}
                    className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-text-primary-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>

                {/* Description - Full width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary-dark mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-text-primary-dark focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Describe the item..."
                  />
                  <p className="text-xs text-text-secondary-dark mt-1">
                    {formData.description.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={formMode === 'create' ? handleCreate : handleUpdate}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {formMode === 'create' ? 'Create Item' : 'Save Changes'}
                </button>
                <button
                  onClick={closeForm}
                  className="bg-background-dark text-text-secondary-dark px-6 py-2 rounded-lg border border-border-dark hover:bg-component-dark transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="bg-component-dark border border-border-dark rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-text-secondary-dark">Loading shop items...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-text-primary-dark mb-2">
                    No Shop Items Yet
                  </h3>
                  <p className="text-text-secondary-dark mb-4">
                    Get started by creating your first shop item!
                  </p>
                  <button
                    onClick={openCreateForm}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Item
                  </button>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-border-dark">
                  <thead className="bg-background-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-dark uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-dark uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-dark uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-dark uppercase tracking-wider">
                        Rarity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-dark uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary-dark uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-background-dark/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-text-primary-dark">
                              {item.name}
                            </div>
                            <div className="text-sm text-text-secondary-dark line-clamp-1">
                              {item.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-text-secondary-dark">
                            {getCategoryIcon(item.category)} {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-yellow-500">
                            🪙 {item.price}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium capitalize ${getRarityColor(item.rarity)}`}>
                            {item.rarity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.is_active ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-300">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {deleteConfirm === item.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-text-secondary-dark text-xs">
                                Delete "{item.name}"?
                              </span>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditForm(item)}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(item.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Item Count */}
          {!loading && items.length > 0 && (
            <div className="mt-4 text-sm text-text-secondary-dark">
              Total Items: {items.length}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
