/**
 * ProfilePage Component
 * Displays user profile with stats and cosmetic item slots
 * Phase 4.1: User Profile Page
 */

import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../contexts/AuthContext';
import { useInventory } from '../hooks/useInventory';
import { RARITY_CONFIG, MAX_EQUIPPED_BADGES } from '../types/shop';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Determine the actual userId to fetch:
  // - If route is /profile/me, use 'me'
  // - Otherwise use the userId from params
  const actualUserId = location.pathname === '/profile/me' ? 'me' : userId;
  
  const { profile, loading, error, updateFullName } = useProfile(actualUserId);
  const { inventory, loading: inventoryLoading } = useInventory(profile?.id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if this is the current user's profile
  const isOwnProfile = user?.id === profile?.id;

  const handleEditClick = () => {
    setEditedName(profile?.full_name || '');
    setIsEditing(true);
    setUpdateError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName('');
    setUpdateError(null);
  };

  const handleSaveEdit = async () => {
    if (!editedName.trim()) {
      setUpdateError('Name cannot be empty');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    const result = await updateFullName(editedName);

    if (result.success) {
      setIsEditing(false);
      setEditedName('');
    } else {
      setUpdateError(result.error || 'Failed to update name');
    }

    setIsUpdating(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getRoleDisplayName = (role: string) => {
    return role === 'student' ? 'Siswa' : 'Guru';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-center">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'This profile does not exist'}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span className="text-2xl">←</span>
              <span className="font-medium">Back</span>
            </button>
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                👤 User Profile
              </h1>
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden backdrop-blur-lg bg-opacity-95 border border-white/20">
          {/* Header Section with Glassmorphism */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Name with Edit Functionality */}
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-4 py-2 text-2xl font-bold rounded-lg text-gray-800 border-2 border-white focus:outline-none focus:ring-2 focus:ring-white"
                      placeholder="Enter your name"
                      disabled={isUpdating}
                    />
                    {updateError && (
                      <p className="text-red-200 text-sm">{updateError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
                      >
                        {isUpdating ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold">{profile.full_name}</h2>
                    {isOwnProfile && (
                      <button
                        onClick={handleEditClick}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        title="Edit name"
                      >
                        <span className="text-xl">✏️</span>
                      </button>
                    )}
                  </div>
                )}
                
                <div className="mt-2 flex items-center gap-4">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    {getRoleDisplayName(profile.role)}
                  </span>
                  {isOwnProfile && (
                    <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold">
                      Your Profile
                    </span>
                  )}
                </div>
              </div>

              {/* Coin Display */}
              <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 text-center border border-white/30">
                <div className="text-4xl mb-2">🪙</div>
                <div className="text-3xl font-bold">{profile.total_coins}</div>
                <div className="text-sm opacity-90">Total Coins</div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-8 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email - Only visible on own profile */}
              {isOwnProfile && user?.email && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📧</span>
                    <h3 className="font-semibold text-gray-700">Email</h3>
                  </div>
                  <p className="text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Only visible to you</p>
                </div>
              )}

              {/* Join Date */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📅</span>
                  <h3 className="font-semibold text-gray-700">Bergabung Sejak</h3>
                </div>
                <p className="text-gray-900">{formatDate(profile.created_at)}</p>
              </div>
            </div>

            {/* Only show cosmetic items for students */}
            {profile.role === 'student' && (
              <>
                {/* Title Slot */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-2xl">📜</span>
                  <h3 className="text-lg font-bold text-gray-700">Gelar (Title)</h3>
                </div>
                {(() => {
                  const equippedTitle = inventory?.find(item => item.type === 'title' && item.is_equipped);
                  return equippedTitle ? (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-lg py-6 px-6">
                      <div className="text-3xl mb-2">📜</div>
                      <h4 className="text-xl font-bold text-gray-800 mb-1">{equippedTitle.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{equippedTitle.description}</p>
                      <span className={`inline-block text-xs font-semibold px-3 py-1 rounded ${RARITY_CONFIG[equippedTitle.rarity].color}`}>
                        {RARITY_CONFIG[equippedTitle.rarity].label}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-white border-2 border-gray-200 rounded-lg py-8 px-6">
                      <p className="text-gray-400 text-sm">No title selected</p>
                      {isOwnProfile && (
                        <button
                          onClick={() => navigate('/shop')}
                          className="mt-3 text-indigo-600 hover:text-indigo-700 text-xs font-medium"
                        >
                          Buy Title at Shop →
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Badge Gallery */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl">🎖️</span>
                <h3 className="text-lg font-bold text-gray-700">Koleksi Lencana (Badges)</h3>
              </div>
              
              {(() => {
                const equippedBadges = inventory?.filter(item => item.type === 'badge' && item.is_equipped) || [];
                const hasEquippedBadges = equippedBadges.length > 0;
                
                return (
                  <>
                    {/* Badge Grid - 6 slots */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                      {Array.from({ length: MAX_EQUIPPED_BADGES }).map((_, index) => {
                        const badge = equippedBadges[index];
                        return (
                          <div
                            key={index}
                            className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                              badge
                                ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300'
                                : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {badge ? (
                              <>
                                <div className="text-4xl mb-1">{badge.icon_url || '🎖️'}</div>
                                <span className="text-xs font-semibold text-gray-700 text-center px-1 break-words">
                                  {badge.name}
                                </span>
                              </>
                            ) : (
                              <span className="text-3xl text-gray-300">🔒</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {!hasEquippedBadges && (
                      <div className="text-center mt-4">
                        <p className="text-gray-400 text-sm">No badges selected</p>
                        {isOwnProfile && (
                          <button
                            onClick={() => navigate('/shop')}
                            className="mt-2 text-indigo-600 hover:text-indigo-700 text-xs font-medium"
                          >
                            Buy Badges at Shop →
                          </button>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            
                {/* Manage Items Button (Own Profile Only) */}
                {isOwnProfile && (
                  <div className="text-center">
                    <button
                      onClick={() => navigate('/inventory')}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors font-semibold shadow-md"
                    >
                      🎒 Manage My Items
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Info Box - Only for students */}
        {profile.role === 'student' && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Tentang Profil</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Profil bersifat publik dan dapat dilihat oleh siswa lain</li>
                <li>• Collect more coins by completing tasks</li>
                <li>• Buy titles and badges at Coin Shop to personalize your profile</li>
                {isOwnProfile && <li>• You can change your name by clicking the edit icon</li>}
              </ul>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
