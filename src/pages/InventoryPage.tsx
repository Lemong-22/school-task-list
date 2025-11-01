/**
 * InventoryPage Component
 * Manage owned items and equip titles/badges
 * Phase 4.2: Coin Shop (Deluxe Edition)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useInventoryByType, useEquipTitle, useEquipBadges } from '../hooks/useInventory';
import { AnimatedModal } from '../components/AnimatedModal';
import { LoadingBar } from '../components/LoadingBar';
import { RARITY_CONFIG, ITEM_TYPE_CONFIG, MAX_EQUIPPED_BADGES } from '../types/shop';
import type { InventoryItem } from '../types/shop';

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { titles, badges, equippedTitle, equippedBadges, isEmpty, loading, error, refetch } = useInventoryByType(user?.id);
  const { equipTitle, loading: equippingTitle } = useEquipTitle(() => refetch());
  const { equipBadges, loading: equippingBadges } = useEquipBadges(() => refetch());

  const [selectedBadgeIds, setSelectedBadgeIds] = useState<string[]>([]);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<InventoryItem | null>(null);
  const [showBadgeSaveModal, setShowBadgeSaveModal] = useState(false);

  // Initialize selected badges from equipped badges
  const equippedBadgeIds = useMemo(() => equippedBadges.map(b => b.id), [equippedBadges.length]);
  
  useEffect(() => {
    if (equippedBadgeIds.length > 0 && selectedBadgeIds.length === 0) {
      setSelectedBadgeIds(equippedBadgeIds);
    }
  }, [equippedBadgeIds, selectedBadgeIds.length]);

  const handleTitleEquip = (title: InventoryItem) => {
    setSelectedTitle(title);
    setShowTitleModal(true);
  };

  const handleConfirmTitleEquip = async () => {
    if (!selectedTitle) return;

    try {
      await equipTitle(selectedTitle.id);
      setShowTitleModal(false);
      setSelectedTitle(null);
    } catch (err) {
      console.error('Failed to equip title:', err);
    }
  };

  const handleTitleUnequip = () => {
    setSelectedTitle(null);
    setShowTitleModal(true);
  };

  const handleConfirmTitleUnequip = async () => {
    try {
      await equipTitle(null);
      setShowTitleModal(false);
      setSelectedTitle(null);
    } catch (err) {
      console.error('Failed to unequip title:', err);
    }
  };

  const handleBadgeToggle = (badgeId: string) => {
    setSelectedBadgeIds(prev => {
      if (prev.includes(badgeId)) {
        return prev.filter(id => id !== badgeId);
      } else if (prev.length < MAX_EQUIPPED_BADGES) {
        return [...prev, badgeId];
      }
      return prev;
    });
  };

  const handleSaveBadges = () => {
    setShowBadgeSaveModal(true);
  };

  const handleConfirmSaveBadges = async () => {
    try {
      await equipBadges(selectedBadgeIds);
      setShowBadgeSaveModal(false);
    } catch (err) {
      console.error('Failed to save badges:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-center">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Inventory</h2>
            <p className="text-gray-600 mb-6">{error}</p>
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
      <LoadingBar isLoading={loading} />
      
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                🎒 My Inventory
              </h1>
              <p className="text-gray-600 mt-1">Manage your cosmetic items</p>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEmpty ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <span className="text-6xl mb-4 block">📦</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Empty Inventory</h3>
            <p className="text-gray-600 mb-6">You don't have any items yet. Visit the Shop to purchase items!</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              🛒 Go to Shop
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Titles Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">📜 My Titles</h2>
                <p className="text-white text-sm opacity-90 mt-1">Select 1 title to display on your profile</p>
              </div>
              
              <div className="p-6">
                {titles.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">You don't have any titles yet.</p>
                ) : (
                  <div className="space-y-3">
                    {titles.map((title) => (
                      <div
                        key={title.id}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          title.is_equipped
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">📜</span>
                            <div>
                              <h3 className="font-bold text-gray-800">{title.name}</h3>
                              <p className="text-sm text-gray-600">{title.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs font-semibold px-2 py-1 rounded ${RARITY_CONFIG[title.rarity].color}`}>
                                  {RARITY_CONFIG[title.rarity].label}
                                </span>
                                {title.is_equipped && (
                                  <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-100 text-indigo-700">
                                    ✓ Terpasang
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          {title.is_equipped ? (
                            <button
                              onClick={handleTitleUnequip}
                              disabled={equippingTitle}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                            >
                              Lepas
                            </button>
                          ) : (
                            <button
                              onClick={() => handleTitleEquip(title)}
                              disabled={equippingTitle}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                              Pasang
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Badges Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">🎖️ My Badges</h2>
                <p className="text-white text-sm opacity-90 mt-1">
                  Pilih hingga {MAX_EQUIPPED_BADGES} lencana untuk ditampilkan ({selectedBadgeIds.length}/{MAX_EQUIPPED_BADGES} dipilih)
                </p>
              </div>
              
              <div className="p-6">
                {badges.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">You don't have any badges yet.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                      {badges.map((badge) => {
                        const isSelected = selectedBadgeIds.includes(badge.id);
                        return (
                          <button
                            key={badge.id}
                            onClick={() => handleBadgeToggle(badge.id)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-4xl mb-2">{badge.icon_url || '🎖️'}</div>
                            <p className="text-xs font-semibold text-gray-800 line-clamp-1">{badge.name}</p>
                            <div className="mt-1">
                              <span className={`text-xs px-1 py-0.5 rounded ${RARITY_CONFIG[badge.rarity].color}`}>
                                {RARITY_CONFIG[badge.rarity].label}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="mt-2">
                                <span className="text-xs font-bold text-purple-600">✓ Dipilih</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={handleSaveBadges}
                        disabled={equippingBadges}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-semibold"
                      >
                        {equippingBadges ? 'Menyimpan...' : 'Simpan Pilihan Lencana'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Title Equip/Unequip Modal */}
      <AnimatedModal
        isOpen={showTitleModal}
        onClose={() => setShowTitleModal(false)}
        title={selectedTitle ? 'Pasang Gelar' : 'Lepas Gelar'}
        primaryActionText={selectedTitle ? 'Pasang' : 'Lepas'}
        onPrimaryAction={selectedTitle ? handleConfirmTitleEquip : handleConfirmTitleUnequip}
        primaryActionLoading={equippingTitle}
        variant="default"
      >
        <div className="text-center py-4">
          {selectedTitle ? (
            <>
              <div className="text-5xl mb-4">📜</div>
              <p className="text-gray-700 text-lg mb-2">
                Pasang gelar <strong>{selectedTitle.name}</strong>?
              </p>
              <p className="text-gray-600 text-sm">
                This title will be displayed on your profile and replace your previous title.
              </p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">❌</div>
              <p className="text-gray-700 text-lg mb-2">
                Lepas gelar yang sedang terpasang?
              </p>
              <p className="text-gray-600 text-sm">
                Your profile will not display any title.
              </p>
            </>
          )}
        </div>
      </AnimatedModal>

      {/* Badge Save Confirmation Modal */}
      <AnimatedModal
        isOpen={showBadgeSaveModal}
        onClose={() => setShowBadgeSaveModal(false)}
        title="Simpan Pilihan Lencana"
        primaryActionText="Simpan"
        onPrimaryAction={handleConfirmSaveBadges}
        primaryActionLoading={equippingBadges}
        variant="success"
      >
        <div className="text-center py-4">
          <div className="text-5xl mb-4">🎖️</div>
          <p className="text-gray-700 text-lg mb-2">
            Simpan {selectedBadgeIds.length} lencana yang dipilih?
          </p>
          <p className="text-gray-600 text-sm">
            These badges will be displayed in your profile gallery.
          </p>
        </div>
      </AnimatedModal>
    </div>
  );
};
