/**
 * PurchaseModal Component
 * Confirms and processes shop item purchases
 * Phase 4.2: Coin Shop
 */

import React, { useState } from 'react';
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
        setPurchaseStatus('success');
        // Wait a bit to show success message, then call onSuccess
        setTimeout(() => {
          onSuccess();
          setPurchaseStatus('idle');
        }, 1500);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
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
                <p className="text-gray-600 text-center mb-4">
                  {item.description}
                </p>
              )}

              {/* Price Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Harga:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">🪙</span>
                    <span className="font-bold text-gray-800">{item.price}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Saldo Saat Ini:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">🪙</span>
                    <span className="font-bold text-gray-800">{currentCoins}</span>
                  </div>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-medium">Saldo Setelah Pembelian:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg">🪙</span>
                      <span className={`font-bold ${newBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {newBalance}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning if not enough coins */}
              {!canAfford && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <span className="text-xl">⚠️</span>
                    <span className="text-sm font-medium">
                      Koin Anda tidak cukup untuk membeli item ini!
                    </span>
                  </div>
                </div>
              )}

              {/* Confirmation Text */}
              <p className="text-center text-gray-700 mb-6">
                Apakah Anda yakin ingin membeli <strong>{item.name}</strong>?
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  disabled={loading || !canAfford}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Success State */}
          {purchaseStatus === 'success' && (
            <div className="text-center py-6">
              <div className="text-6xl mb-4 animate-bounce">✅</div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Pembelian Berhasil!</h3>
              <p className="text-gray-600">
                <strong>{item.name}</strong> telah ditambahkan ke inventori Anda.
              </p>
            </div>
          )}

          {/* Error State */}
          {purchaseStatus === 'error' && (
            <div className="text-center py-6">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-2xl font-bold text-red-600 mb-2">Pembelian Gagal</h3>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <button
                onClick={() => setPurchaseStatus('idle')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
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
