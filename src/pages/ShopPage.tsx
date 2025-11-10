/**
 * ShopPage Component
 * Browse and purchase cosmetic items (titles and badges)
 * Phase 4.2: Coin Shop
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';
import { useFilteredShopItems } from '../hooks/useShop';
import { usePurchaseItem } from '../hooks/useShop';
import { AnimatedModal } from '../components/AnimatedModal';
import { LoadingBar } from '../components/LoadingBar';
import { RARITY_CONFIG, ITEM_TYPE_CONFIG } from '../types/shop';
import type { ShopItemWithOwnership, ShopItemType, PurchaseResult } from '../types/shop';

export const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [filterType, setFilterType] = useState<'all' | ShopItemType>('all');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rarity' | 'name'>('price-asc');
  const [selectedItem, setSelectedItem] = useState<ShopItemWithOwnership | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [purchaseMessage, setPurchaseMessage] = useState<string>('');

  const { items, loading, error, refetch } = useFilteredShopItems(filterType, sortBy);
  const { purchaseItem, loading: purchasing } = usePurchaseItem();
  const currentCoins = profile?.total_coins || 0;

  const handleBuyClick = (item: ShopItemWithOwnership) => {
    setSelectedItem(item);
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedItem) return;

    try {
      setPurchaseStatus('idle');
      const result: PurchaseResult = await purchaseItem(selectedItem.id);

      if (result.success) {
        // Close purchase modal first
        setShowPurchaseModal(false);
        
        // Show SweetAlert2 success animation
        await Swal.fire({
          title: 'Sukses!',
          text: `${selectedItem.name} berhasil dibeli! 🎉`,
          icon: 'success',
          confirmButtonText: 'Oke',
          confirmButtonColor: '#607AFB',
          background: '#1a1f2e',
          color: '#e5e7eb',
          showClass: {
            popup: 'animate__animated animate__fadeInDown animate__faster'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp animate__faster'
          }
        });
        
        // Refresh shop items after alert closes
        await refetch();
        setSelectedItem(null);
        setPurchaseStatus('idle');
      }
    } catch (err) {
      setPurchaseStatus('error');
      setPurchaseMessage(err instanceof Error ? err.message : 'Pembelian gagal');
    }
  };

  const handleCloseModal = () => {
    if (purchaseStatus !== 'success' && !purchasing) {
      setShowPurchaseModal(false);
      setSelectedItem(null);
      setPurchaseStatus('idle');
      setPurchaseMessage('');
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
          <p className="text-text-secondary-dark text-lg">Loading shop...</p>
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
            <h2 className="text-2xl font-bold text-text-primary-dark mb-2">Error Loading Shop</h2>
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

  const itemsByType = {
    all: items?.length || 0,
    title: items?.filter(item => item.type === 'title').length || 0,
    badge: items?.filter(item => item.type === 'badge').length || 0,
  };

  return (
    <div className="min-h-screen bg-background-dark">
      <LoadingBar isLoading={loading} />
      {/* Header */}
      <div className="bg-component-dark border-b border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-text-secondary-dark hover:text-primary transition-colors"
            >
              <span className="text-2xl">←</span>
              <span className="font-medium">Back</span>
            </button>
            <div className="text-center flex-1">
              <h1 className="text-text-primary-dark text-4xl font-black leading-tight tracking-[-0.033em]">
                Coin Shop
              </h1>
              <p className="text-text-secondary-dark mt-1">Purchase cosmetic items for your profile</p>
            </div>
            <div className="w-20"></div>
          </div>

          {/* Coin Balance */}
          <div className="flex justify-center">
            <div className="bg-primary/20 text-primary border border-primary/30 px-6 py-3 rounded-lg flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <span className="font-bold text-xl">{currentCoins} Coins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-component-dark rounded-lg shadow-md border border-border-dark p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filter by Type */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-secondary-dark">Type:</span>
              <div className="flex h-10 items-center justify-center rounded-xl bg-[#223149] p-1">
                <button
                  onClick={() => setFilterType('all')}
                  className={`flex-1 cursor-pointer items-center justify-center rounded-lg h-8 px-4 text-sm font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-primary text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({itemsByType.all})
                </button>
                <button
                  onClick={() => setFilterType('title')}
                  className={`flex-1 cursor-pointer items-center justify-center rounded-lg h-8 px-4 text-sm font-medium transition-colors ${
                    filterType === 'title'
                      ? 'bg-primary text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Titles ({itemsByType.title})
                </button>
                <button
                  onClick={() => setFilterType('badge')}
                  className={`flex-1 cursor-pointer items-center justify-center rounded-lg h-8 px-4 text-sm font-medium transition-colors ${
                    filterType === 'badge'
                      ? 'bg-primary text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Badges ({itemsByType.badge})
                </button>
              </div>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-secondary-dark">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-background-dark text-text-primary-dark border border-border-dark rounded-lg px-4 py-2 focus:border-primary focus:ring-0 focus:outline-none transition-colors"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rarity">Rarity</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {items && items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const rarityConfig = RARITY_CONFIG[item.rarity];
              const canAfford = currentCoins >= item.price;
              const isOwned = item.is_owned;

              return (
                <div
                  key={item.id}
                  className={`rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden ${
                    item.rarity === 'legendary' 
                      ? 'bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/60 shadow-yellow-500/20 animate-shimmer' 
                      : 'bg-component-dark border border-border-dark'
                  }`}
                >
                  {/* Item Header with Rarity */}
                  <div className={`p-4 ${
                    item.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-600 to-orange-600' :
                    item.rarity === 'epic' ? 'bg-purple-600' :
                    item.rarity === 'rare' ? 'bg-blue-600' :
                    'bg-gray-600'
                  }`}>
                    <div className="flex items-center justify-between text-white">
                      <span className="text-xs font-bold uppercase tracking-wide">
                        {rarityConfig.label}
                      </span>
                      <span className="text-xs font-bold">
                        {ITEM_TYPE_CONFIG[item.type].label}
                      </span>
                    </div>
                  </div>

                  {/* Item Content */}
                  <div className="p-4">
                    {/* Icon/Preview */}
                    <div className="flex items-center justify-center h-20 mb-3">
                      {item.type === 'badge' && item.icon_url ? (
                        <span className="text-6xl">{item.icon_url}</span>
                      ) : (
                        <div className="text-4xl font-bold text-gray-300">
                          {item.type === 'title' ? '📜' : '🎖️'}
                        </div>
                      )}
                    </div>

                    {/* Item Name */}
                    <h3 className="text-lg font-bold text-text-primary-dark text-center mb-2 line-clamp-2">
                      {item.name}
                    </h3>

                    {/* Item Description */}
                    {item.description && (
                      <p className="text-sm text-text-secondary-dark text-center mb-4 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="text-2xl">🪙</span>
                      <span className="text-xl font-bold text-text-primary-dark">{item.price}</span>
                      <span className="text-sm text-text-secondary-dark">coins</span>
                    </div>

                    {/* Buy Button */}
                    <button
                      onClick={() => handleBuyClick(item)}
                      disabled={isOwned || !canAfford}
                      className={`w-full py-2 px-4 rounded-lg font-bold transition-colors ${
                        isOwned
                          ? 'bg-green-500/20 text-green-300 cursor-not-allowed'
                          : !canAfford
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-primary text-white hover:bg-primary/90'
                      }`}
                    >
                      {isOwned ? '✓ Owned' : !canAfford ? 'Not Enough Coins' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-component-dark rounded-lg shadow-md border border-border-dark p-12 text-center">
            <span className="text-6xl mb-4 block">🛍️</span>
            <h3 className="text-xl font-semibold text-text-primary-dark mb-2">No Items Found</h3>
            <p className="text-text-secondary-dark">
              No items match your current filters.
            </p>
          </div>
        )}
      </motion.div>

      {/* Purchase Confirmation Modal */}
      {selectedItem && (
        <AnimatedModal
          isOpen={showPurchaseModal}
          onClose={handleCloseModal}
          title={purchaseStatus === 'success' ? 'Purchase Successful!' : purchaseStatus === 'error' ? 'Purchase Failed' : 'Confirm Purchase'}
          primaryActionText={purchaseStatus === 'idle' ? 'Buy Now' : undefined}
          onPrimaryAction={purchaseStatus === 'idle' ? handleConfirmPurchase : undefined}
          primaryActionDisabled={currentCoins < selectedItem.price}
          primaryActionLoading={purchasing}
          variant={purchaseStatus === 'success' ? 'success' : purchaseStatus === 'error' ? 'danger' : 'default'}
        >
          {purchaseStatus === 'idle' && (
            <div className="space-y-4">
              {/* Item Preview */}
              <div className="flex items-center gap-4 p-4 bg-codedex-navy rounded-none-none border-2 border-gray-600">
                <div className="text-4xl">
                  {selectedItem.type === 'badge' && selectedItem.icon_url ? selectedItem.icon_url : selectedItem.type === 'title' ? '📜' : '🎖️'}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-100">{selectedItem.name}</h4>
                  <p className="text-sm text-gray-400">{selectedItem.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-bold px-2 py-1 rounded-none ${RARITY_CONFIG[selectedItem.rarity].color}`}>
                      {RARITY_CONFIG[selectedItem.rarity].label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Info */}
              <div className="bg-codedex-navy rounded-none-none border-2 border-gray-600 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Harga:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">🪙</span>
                    <span className="font-bold text-gray-100">{selectedItem.price}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Saldo Saat Ini:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">🪙</span>
                    <span className="font-bold text-gray-100">{currentCoins}</span>
                  </div>
                </div>
                <div className="border-t border-gray-600 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-100 font-medium">Saldo Setelah:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg">🪙</span>
                      <span className={`font-bold ${currentCoins - selectedItem.price < 0 ? 'text-red-400' : 'text-codedex-green'}`}>
                        {currentCoins - selectedItem.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning */}
              {currentCoins < selectedItem.price && (
                <div className="bg-red-900/20 border-2 border-red-500 rounded-none-none p-3">
                  <div className="flex items-center gap-2 text-red-400">
                    <span className="text-xl">⚠️</span>
                    <span className="text-sm font-medium">You don't have enough coins!</span>
                  </div>
                </div>
              )}

              <p className="text-center text-gray-300">
                Are you sure you want to buy <strong className="text-gray-100">{selectedItem.name}</strong>?
              </p>
            </div>
          )}

          {purchaseStatus === 'success' && (
            <div className="text-center py-6">
              <div className="text-6xl mb-4 animate-bounce">✅</div>
              <p className="text-gray-300 text-lg">{purchaseMessage}</p>
            </div>
          )}

          {purchaseStatus === 'error' && (
            <div className="text-center py-6">
              <div className="text-6xl mb-4">❌</div>
              <p className="text-gray-300 text-lg">{purchaseMessage}</p>
              <button
                onClick={() => setPurchaseStatus('idle')}
                className="mt-4 px-6 py-2 bg-codedex-yellow text-black font-bold rounded-none-none shadow-brutal hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </AnimatedModal>
      )}
    </div>
  );
};
