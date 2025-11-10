/**
 * ProfilePage Component
 * Displays user profile with stats and cosmetic item slots
 * Phase 4.1: User Profile Page
 */

import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../contexts/AuthContext';
import { useInventory } from '../hooks/useInventory';
import { Layout } from '../components/Layout';
import { MAX_EQUIPPED_BADGES } from '../types/shop';
import { BanknotesIcon } from '@heroicons/react/24/solid';
import { getNamecardStyle } from '../config/namecardStyles';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const { user } = useAuth();
  
  // Determine the actual userId to fetch:
  // - If route is /profile/me, use 'me'
  // - Otherwise use the userId from params
  const actualUserId = location.pathname === '/profile/me' ? 'me' : userId;
  
  const { profile, loading, error, updateFullName } = useProfile(actualUserId);
  const { inventory } = useInventory(profile?.id);
  
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

  const getRoleDisplayName = (role: string) => {
    return role === 'student' ? 'Student' : 'Teacher';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-primary mx-auto mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-slate-400">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="bg-component-dark rounded-lg shadow-md border border-border-dark p-8 max-w-md">
            <div className="text-center">
              <span className="text-6xl mb-4 block">⚠️</span>
              <h2 className="text-2xl font-bold text-text-primary-dark mb-2">Profile Not Found</h2>
              <p className="text-text-secondary-dark mb-6">{error || 'This profile does not exist'}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Get active title from inventory
  const activeTitle = inventory?.find(
    item => item.type === 'title' && item.id === profile.active_title_id
  ) || null;

  // Get active namecard from inventory
  const activeNamecard = inventory?.find(
    item => item.type === 'namecard' && item.id === profile.active_namecard_id
  ) || null;
  const namecardStyle = getNamecardStyle(activeNamecard?.name);

  // Get equipped badges from inventory
  const equippedBadges = inventory
    ?.filter(item => item.type === 'badge' && item.is_equipped)
    .slice(0, MAX_EQUIPPED_BADGES) || [];

  return (
    <Layout>
      {/* Profile Header with Namecard Background */}
      <div className={`relative flex p-6 pb-8 rounded-lg mx-4 my-4 ${
        namecardStyle.background
      } ${
        namecardStyle.border
      } ${
        namecardStyle.effects
      }`}>
        {/* Pattern overlay for legendary/epic cards */}
        {namecardStyle.pattern && (
          <div className={`absolute inset-0 rounded-lg pointer-events-none ${namecardStyle.pattern}`}></div>
        )}
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-between sm:items-center relative z-10">
          <div className="flex gap-4">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0"
              style={{
                backgroundImage: `url(https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=607AFB&color=fff&size=128)`
              }}
            ></div>
            <div className="flex flex-col justify-center">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="bg-[#223149] text-white px-3 py-2 rounded-lg border border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter name"
                  />
                  {updateError && (
                    <p className="text-red-400 text-sm">{updateError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={isUpdating}
                      className="bg-primary hover:bg-primary/90 text-white px-4 py-1 rounded-lg text-sm font-medium transition-colors"
                    >
                      {isUpdating ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className={`text-[28px] font-black leading-tight tracking-[-0.015em] ${namecardStyle.textColor}`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    {profile.full_name}
                  </p>
                  <div className={`flex items-center gap-2 text-base font-semibold leading-normal ${namecardStyle.textColor}`} style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                    <span>{getRoleDisplayName(profile.role)} •</span>
                    <BanknotesIcon className="w-5 h-5 text-yellow-400" />
                    <span>{profile.total_coins.toLocaleString()} Coins</span>
                  </div>
                </>
              )}
            </div>
          </div>
          {isOwnProfile && !isEditing && (
            <button 
              onClick={handleEditClick}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium leading-normal w-full max-w-[480px] sm:w-auto"
            >
              <span className="truncate">Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* My Title Section */}
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        My Title
      </h2>
      <div className="px-4">
        {activeTitle ? (
          <div className={`rounded-lg p-8 shadow-lg ${
            activeTitle.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-900/50 via-orange-900/50 to-yellow-900/50 border-2 border-yellow-500/80 animate-shimmer' :
            activeTitle.rarity === 'epic' ? 'bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-purple-900/50 border-2 border-purple-500/80 animate-shimmer' :
            activeTitle.rarity === 'rare' ? 'bg-gradient-to-r from-blue-900/50 via-cyan-900/50 to-blue-900/50 border border-blue-500/60' :
            'bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-gray-800/50 border border-gray-500/40'
          }`}>
            <div className="text-center">
              <div className="inline-block">
                <h3 className={`font-black text-transparent bg-clip-text drop-shadow-lg ${
                  activeTitle.rarity === 'legendary' ? 'text-5xl bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 animate-pulse' :
                  activeTitle.rarity === 'epic' ? 'text-4xl bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-pulse' :
                  activeTitle.rarity === 'rare' ? 'text-3xl bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400' :
                  'text-2xl bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300'
                }`}>
                  {activeTitle.name}
                </h3>
                <div className={`h-1 bg-gradient-to-r from-transparent mt-2 ${
                  activeTitle.rarity === 'legendary' ? 'via-yellow-400 animate-pulse' :
                  activeTitle.rarity === 'epic' ? 'via-purple-400 animate-pulse' :
                  activeTitle.rarity === 'rare' ? 'via-blue-400' :
                  'via-gray-400'
                } to-transparent`}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-lg bg-component-dark p-8 border border-border-dark">
            <div className="text-center py-4">
              <p className="text-text-secondary-dark text-sm">No title equipped</p>
            </div>
          </div>
        )}
      </div>

      {/* My Badges Section */}
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-8">
        My Badges
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 p-4">
        {Array.from({ length: MAX_EQUIPPED_BADGES }).map((_, index) => {
          const badge = equippedBadges[index];
          return (
            <div key={index} className={`flex flex-col gap-3 rounded-lg p-4 ${
              badge ? (
                badge.rarity === 'legendary' ? 'bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/60 shadow-lg shadow-yellow-500/20 animate-shimmer' :
                badge.rarity === 'epic' ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/60 shadow-lg shadow-purple-500/20 animate-shimmer' :
                badge.rarity === 'rare' ? 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-500/50 shadow-md shadow-blue-500/10' :
                'bg-gradient-to-br from-gray-800/40 to-gray-700/40 border border-gray-500/30'
              ) : 'bg-component-dark border border-border-dark'
            }`}>
              {badge ? (
                <div className="text-center">
                  <div className={`mb-2 ${
                    badge.rarity === 'legendary' ? 'text-6xl animate-pulse' :
                    badge.rarity === 'epic' ? 'text-5xl animate-pulse' :
                    badge.rarity === 'rare' ? 'text-4xl' :
                    'text-4xl'
                  }`}>{badge.icon_url || '🎖️'}</div>
                  <p className={`text-sm font-medium ${
                    badge.rarity === 'legendary' ? 'text-yellow-300 font-bold' :
                    badge.rarity === 'epic' ? 'text-purple-300 font-bold' :
                    badge.rarity === 'rare' ? 'text-blue-300 font-semibold' :
                    'text-gray-300'
                  }`}>{badge.name}</p>
                  <p className={`text-xs mt-1 uppercase tracking-wider ${
                    badge.rarity === 'legendary' ? 'text-yellow-400/80' :
                    badge.rarity === 'epic' ? 'text-purple-400/80' :
                    badge.rarity === 'rare' ? 'text-blue-400/80' :
                    'text-gray-400/60'
                  }`}>{badge.rarity}</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-4xl text-gray-600">🔒</span>
                  <p className="text-text-secondary-dark text-xs mt-2">Empty Slot</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Layout>
  );
};
