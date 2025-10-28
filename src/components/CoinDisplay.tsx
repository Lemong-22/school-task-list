/**
 * CoinDisplay Component
 * Displays the student's total coins with an icon
 * Phase 3E: UI Components
 */

import React from 'react';

interface CoinDisplayProps {
  totalCoins: number;
  className?: string;
}

export const CoinDisplay: React.FC<CoinDisplayProps> = ({ totalCoins, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-lg shadow-md">
        <span className="text-2xl mr-2">🪙</span>
        <div className="flex flex-col">
          <span className="text-xs font-medium opacity-90">Total Coins</span>
          <span className="text-xl font-bold">{totalCoins}</span>
        </div>
      </div>
    </div>
  );
};
