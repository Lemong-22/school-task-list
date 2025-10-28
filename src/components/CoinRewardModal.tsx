/**
 * CoinRewardModal Component
 * Shows a modal with coin reward feedback after task completion
 * Phase 3E: UI Components
 */

import React, { useEffect } from 'react';
import { CoinRewardResult } from '../types/coin';

interface CoinRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardData: CoinRewardResult | null;
  taskTitle?: string;
}

export const CoinRewardModal: React.FC<CoinRewardModalProps> = ({
  isOpen,
  onClose,
  rewardData,
  taskTitle,
}) => {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !rewardData) {
    return null;
  }

  const { coins_awarded, is_bonus, is_on_time, total_coins } = rewardData;

  // Determine message and styling based on reward type
  const getMessage = () => {
    if (!is_on_time) {
      return {
        title: 'Task Completed',
        message: 'Task completed, but no coins awarded (late submission)',
        icon: '⏰',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
      };
    }

    if (is_bonus) {
      return {
        title: '🎉 Amazing! Top 3!',
        message: `You're one of the first 3 students to complete this task!`,
        icon: '🏆',
        bgColor: 'bg-gradient-to-r from-yellow-400 to-orange-500',
        textColor: 'text-white',
      };
    }

    return {
      title: '✅ Great Job!',
      message: 'Task completed on time!',
      icon: '✨',
      bgColor: 'bg-gradient-to-r from-green-400 to-blue-500',
      textColor: 'text-white',
    };
  };

  const messageData = getMessage();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-bounce-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className={`${messageData.bgColor} ${messageData.textColor} p-6 rounded-t-2xl text-center`}>
            <div className="text-6xl mb-2">{messageData.icon}</div>
            <h2 className="text-2xl font-bold mb-1">{messageData.title}</h2>
            <p className="text-sm opacity-90">{messageData.message}</p>
          </div>

          {/* Body */}
          <div className="p-6 text-center">
            {taskTitle && (
              <p className="text-gray-600 mb-4 text-sm">
                Task: <span className="font-semibold">{taskTitle}</span>
              </p>
            )}

            {/* Coins Awarded */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-5xl">🪙</span>
              <div className="text-left">
                <p className="text-3xl font-bold text-gray-800">
                  {coins_awarded > 0 ? `+${coins_awarded}` : '0'}
                </p>
                <p className="text-sm text-gray-500">
                  {coins_awarded > 0 ? 'Coins Earned' : 'No Coins'}
                </p>
              </div>
            </div>

            {/* Total Coins */}
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Your Total Coins</p>
              <p className="text-2xl font-bold text-gray-800">{total_coins} 🪙</p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Awesome!
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </>
  );
};
