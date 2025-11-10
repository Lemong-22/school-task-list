/**
 * InventoryPage Component
 * Manage owned items and equip titles/badges
 * Phase 4.2: Coin Shop (Deluxe Edition)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-16 w-16 text-primary mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-text-secondary-dark text-lg">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="bg-component-dark rounded-lg shadow-md border border-border-dark p-8 max-w-md">
          <div className="text-center">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h2 className="text-2xl font-bold text-text-primary-dark mb-2">Error Loading Inventory</h2>
            <p className="text-text-secondary-dark mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-primary text-white font-bold px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark">
      <LoadingBar isLoading={loading || equippingTitle || equippingBadges} />
      
      {/* Header */}
      <header className="bg-component-dark border-b border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-300 hover:text-gray-100 transition-colors"
            >
              <span className="text-2xl">←</span>
              <span className="font-medium">Back</span>
            </button>
            <div className="text-center flex-1">
              <h1 className="text-3xl font-pixel text-gray-100">
                🎒 My Inventory
              </h1>
              <p className="text-gray-400 mt-1">Manage your cosmetic items</p>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <motion.main 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {isEmpty ? (
          <div className="bg-component-dark rounded-lg shadow-md border border-border-dark p-12 text-center">
            <span className="text-6xl mb-4 block">📦</span>
            <h3 className="text-xl font-bold text-text-primary-dark mb-2">Your Inventory is Empty</h3>
            <p className="text-text-secondary-dark mb-6">
              Visit the Coin Shop to purchase titles and badges!
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Shop
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Titles Section */}
            <div className="bg-component-dark rounded-lg shadow-md border border-border-dark overflow-hidden">
              <div className="bg-purple-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">📜 My Titles</h2>
                <p className="text-white text-sm font-medium mt-1">Select 1 title to display on your profile</p>
              </div>
              
              <div className="p-6 bg-background-dark">
                {titles.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">You don't have any titles yet.</p>
                ) : (
                  <div className="space-y-3">
                    {titles.map((title) => (
                      <div
                        key={title.id}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          title.is_equipped
                            ? 'border-primary bg-primary/10 ring-2 ring-primary shadow-md'
                            : 'border-border-dark hover:border-primary/50'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">📜</span>
                            <div>
                              <h3 className="font-bold text-gray-100">{title.name}</h3>
                              <p className="text-sm text-gray-400">{title.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs font-bold px-2 py-1 rounded-none ${RARITY_CONFIG[title.rarity].color}`}>
                                  {RARITY_CONFIG[title.rarity].label}
                                </span>
                                {title.is_equipped && (
                                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-primary text-white">
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
                              className="px-4 py-2 bg-transparent text-red-400 font-medium rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            >
                              Lepas
                            </button>
                          ) : (
                            <button
                              onClick={() => handleTitleEquip(title)}
                              disabled={equippingTitle}
                              className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
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
            <div className="bg-component-dark rounded-lg shadow-md border border-border-dark overflow-hidden">
              <div className="bg-pink-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">🎖️ My Badges</h2>
                <p className="text-white text-sm font-medium mt-1">
                  Pilih hingga {MAX_EQUIPPED_BADGES} lencana untuk ditampilkan ({selectedBadgeIds.length}/{MAX_EQUIPPED_BADGES} dipilih)
                </p>
              </div>
              
              <div className="p-6 bg-background-dark">
                {badges.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">You don't have any badges yet.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                      {badges.map((badge) => {
                        const isSelected = selectedBadgeIds.includes(badge.id);
                        return (
                          <button
                            key={badge.id}
                            onClick={() => handleBadgeToggle(badge.id)}
                            className={`p-4 rounded-lg border-2 transition-all duration-150 ${
                              isSelected
                                ? 'border-primary bg-primary/10 ring-2 ring-primary shadow-md'
                                : 'border-border-dark hover:border-primary/50'
                            }`}
                          >
                            <div className="text-4xl mb-2">{badge.icon_url || '🎖️'}</div>
                            <p className="text-xs font-bold text-gray-100 line-clamp-1">{badge.name}</p>
                            <div className="mt-1">
                              <span className={`text-xs px-1 py-0.5 rounded-none ${RARITY_CONFIG[badge.rarity].color}`}>
                                {RARITY_CONFIG[badge.rarity].label}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="mt-2">
                                <span className="text-xs font-bold text-green-400">✓ Selected</span>
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
                        className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
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
      </motion.main>

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
              <p className="text-gray-300 text-lg mb-2">
                Pasang gelar <strong className="text-gray-100">{selectedTitle.name}</strong>?
              </p>
              <p className="text-gray-400 text-sm">
                This title will be displayed on your profile and replace your previous title.
              </p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">❌</div>
              <p className="text-gray-300 text-lg mb-2">
                Lepas gelar yang sedang terpasang?
              </p>
              <p className="text-gray-400 text-sm">
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
          <p className="text-gray-300 text-lg mb-2">
            Simpan {selectedBadgeIds.length} lencana yang dipilih?
          </p>
          <p className="text-gray-400 text-sm">
            These badges will be displayed in your profile gallery.
          </p>
        </div>
      </AnimatedModal>
    </div>
  );
};
