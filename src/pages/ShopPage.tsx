/**
 * ShopPage Component
 * Browse and purchase cosmetic items (titles and badges)
 * Phase 4.2: Coin Shop
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        setPurchaseStatus('success');
        setPurchaseMessage(`Berhasil membeli ${selectedItem.name}!`);
        
        // Refresh shop items and trigger auth context profile refresh
        await refetch();
        
        // Force page reload to refresh coin balance from AuthContext
        // This ensures coins update in real-time across all components
        window.location.reload();
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading shop...</p>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Shop</h2>
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

  const itemsByType = {
    all: items?.length || 0,
    title: items?.filter(item => item.type === 'title').length || 0,
    badge: items?.filter(item => item.type === 'badge').length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <LoadingBar isLoading={loading} />
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span className="text-2xl">←</span>
              <span className="font-medium">Back</span>
            </button>
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                🛒 Coin Shop
              </h1>
              <p className="text-gray-600 mt-1">Purchase cosmetic items for your profile</p>
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>

          {/* Coin Balance */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <span className="font-bold text-xl">{currentCoins} Koin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Filters and Sort */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filter by Type */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({itemsByType.all})
                </button>
                <button
                  onClick={() => setFilterType('title')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterType === 'title'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Titles ({itemsByType.title})
                </button>
                <button
                  onClick={() => setFilterType('badge')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterType === 'badge'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Badges ({itemsByType.badge})
                </button>
              </div>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                >
                  {/* Item Header with Rarity */}
                  <div className={`p-4 ${
                    item.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                    item.rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                    'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}>
                    <div className="flex items-center justify-between text-white">
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {rarityConfig.label}
                      </span>
                      <span className="text-xs font-semibold">
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
                    <h3 className="text-lg font-bold text-gray-800 text-center mb-2 line-clamp-2">
                      {item.name}
                    </h3>

                    {/* Item Description */}
                    {item.description && (
                      <p className="text-sm text-gray-600 text-center mb-4 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="text-2xl">🪙</span>
                      <span className="text-xl font-bold text-gray-800">{item.price}</span>
                      <span className="text-sm text-gray-600">coins</span>
                    </div>

                    {/* Buy Button */}
                    <button
                      onClick={() => handleBuyClick(item)}
                      disabled={isOwned || !canAfford}
                      className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${
                        isOwned
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : !canAfford
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
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
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <span className="text-6xl mb-4 block">🛍️</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Tidak Ada Item</h3>
            <p className="text-gray-600">No items available in this category.</p>
          </div>
        )}
      </div>

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
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-4xl">
                  {selectedItem.type === 'badge' && selectedItem.icon_url ? selectedItem.icon_url : selectedItem.type === 'title' ? '📜' : '🎖️'}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{selectedItem.name}</h4>
                  <p className="text-sm text-gray-600">{selectedItem.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${RARITY_CONFIG[selectedItem.rarity].color}`}>
                      {RARITY_CONFIG[selectedItem.rarity].label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Harga:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">🪙</span>
                    <span className="font-bold text-gray-800">{selectedItem.price}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Saldo Saat Ini:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">🪙</span>
                    <span className="font-bold text-gray-800">{currentCoins}</span>
                  </div>
                </div>
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-medium">Saldo Setelah:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg">🪙</span>
                      <span className={`font-bold ${currentCoins - selectedItem.price < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {currentCoins - selectedItem.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning */}
              {currentCoins < selectedItem.price && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-700">
                    <span className="text-xl">⚠️</span>
                    <span className="text-sm font-medium">You don't have enough coins!</span>
                  </div>
                </div>
              )}

              <p className="text-center text-gray-700">
                Are you sure you want to buy <strong>{selectedItem.name}</strong>?
              </p>
            </div>
          )}

          {purchaseStatus === 'success' && (
            <div className="text-center py-6">
              <div className="text-6xl mb-4 animate-bounce">✅</div>
              <p className="text-gray-600 text-lg">{purchaseMessage}</p>
            </div>
          )}

          {purchaseStatus === 'error' && (
            <div className="text-center py-6">
              <div className="text-6xl mb-4">❌</div>
              <p className="text-gray-600 text-lg">{purchaseMessage}</p>
              <button
                onClick={() => setPurchaseStatus('idle')}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
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
