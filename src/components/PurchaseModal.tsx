/**
 * PurchaseModal Component
 * Confirms and processes shop item purchases
 * Phase 4.2: Coin Shop
 */

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { usePurchaseItem } from '../hooks/useShop';
import { RARITY_CONFIG, ITEM_TYPE_CONFIG } from '../types/shop';
import type { ShopItemWithOwnership } from '../types/shop';

interface PurchaseModalProps {
  item: ShopItemWithOwnership;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentCoins: number;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  item,
  isOpen,
  onClose,
  onSuccess,
  currentCoins,
}) => {
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { purchaseItem, loading } = usePurchaseItem();

  const handleConfirmPurchase = async () => {
    try {
      setPurchaseStatus('idle');
      setErrorMessage('');

      const result = await purchaseItem(item.id);

      if (result.success) {
        // Close the purchase modal first
        onClose();
        
        // Show SweetAlert2 success animation
        await Swal.fire({
          title: 'Sukses!',
          text: `${item.name} berhasil ditambahkan ke inventori Anda 🎉`,
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
        
        // Call onSuccess to refresh data
        onSuccess();
        setPurchaseStatus('idle');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Purchase failed');
    }
  };

  const handleClose = () => {
    if (!loading && purchaseStatus !== 'success') {
      setPurchaseStatus('idle');
      setErrorMessage('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const rarityConfig = RARITY_CONFIG[item.rarity];
  const canAfford = currentCoins >= item.price;
  const newBalance = currentCoins - item.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-component-dark border border-border-dark rounded-lg shadow-md max-w-md w-full overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className={`p-6 ${
          item.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
          item.rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
          'bg-gradient-to-r from-gray-400 to-gray-500'
        }`}>
          <div className="text-center text-white">
            <div className="text-5xl mb-2">
              {item.type === 'badge' && item.icon_url ? item.icon_url : item.type === 'title' ? '📜' : '🎖️'}
            </div>
            <h3 className="text-xl font-bold">{item.name}</h3>
            <p className="text-sm opacity-90 mt-1">
              {rarityConfig.label} {ITEM_TYPE_CONFIG[item.type].label}
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {purchaseStatus === 'idle' && (
            <>
              {/* Item Description */}
              {item.description && (
                <p className="text-text-secondary-dark text-center mb-4">
                  {item.description}
                </p>
              )}

              {/* Price Information */}
              <div className="bg-background-dark rounded-lg p-4 mb-4 border border-border-dark">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-secondary-dark">Harga:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">🪙</span>
                    <span className="font-bold text-text-primary-dark">{item.price}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-secondary-dark">Saldo Saat Ini:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">🪙</span>
                    <span className="font-bold text-text-primary-dark">{currentCoins}</span>
                  </div>
                </div>
                <div className="border-t border-border-dark pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-text-primary-dark font-medium">Saldo Setelah Pembelian:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg">🪙</span>
                      <span className={`font-bold ${newBalance < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {newBalance}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning if not enough coins */}
              {!canAfford && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <span className="text-xl">⚠️</span>
                    <span className="text-sm font-medium">
                      Koin Anda tidak cukup untuk membeli item ini!
                    </span>
                  </div>
                </div>
              )}

              {/* Confirmation Text */}
              <p className="text-center text-text-primary-dark mb-6">
                Apakah Anda yakin ingin membeli <strong>{item.name}</strong>?
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-background-dark border border-border-dark text-text-primary-dark rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  disabled={loading || !canAfford}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-none h-4 w-4 border-b-2 border-white"></div>
                      Memproses...
                    </span>
                  ) : (
                    'Konfirmasi Pembelian'
                  )}
                </button>
              </div>
            </>
          )}

          {/* Error State */}
          {purchaseStatus === 'error' && (
            <div className="text-center py-6">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-2xl font-bold text-red-400 mb-2">Pembelian Gagal</h3>
              <p className="text-text-secondary-dark mb-6">{errorMessage}</p>
              <button
                onClick={() => setPurchaseStatus('idle')}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
