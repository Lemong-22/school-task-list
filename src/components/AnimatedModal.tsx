/**
 * AnimatedModal Component
 * Beautiful, animated modal for confirmations and dialogs
 * Phase 4.2: Coin Shop (Deluxe Edition)
 */

import React, { useEffect } from 'react';

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  primaryActionText?: string;
  secondaryActionText?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryActionDisabled?: boolean;
  primaryActionLoading?: boolean;
  variant?: 'default' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  primaryActionText = 'Confirm',
  secondaryActionText = 'Cancel',
  onPrimaryAction,
  onSecondaryAction,
  primaryActionDisabled = false,
  primaryActionLoading = false,
  variant = 'default',
  size = 'md',
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    } else {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  };

  const variantStyles = {
    default: 'bg-indigo-600 hover:bg-indigo-700',
    success: 'bg-green-600 hover:bg-green-700',
    danger: 'bg-red-600 hover:bg-red-700',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`bg-white rounded-lg shadow-2xl ${sizeClasses[size]} w-full overflow-hidden animate-scale-in`}
        style={{
          animation: 'scaleIn 0.2s ease-out',
        }}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button
              onClick={onClose}
              disabled={primaryActionLoading}
              className="text-white hover:text-gray-200 transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4">{children}</div>

        {/* Modal Actions */}
        {(onPrimaryAction || onSecondaryAction) && (
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            {/* Secondary Action (Cancel) */}
            <button
              onClick={handleSecondaryAction}
              disabled={primaryActionLoading}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {secondaryActionText}
            </button>

            {/* Primary Action */}
            {onPrimaryAction && (
              <button
                onClick={onPrimaryAction}
                disabled={primaryActionDisabled || primaryActionLoading}
                className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium ${variantStyles[variant]} min-w-[100px]`}
              >
                {primaryActionLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Loading...</span>
                  </span>
                ) : (
                  primaryActionText
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.15s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};
