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
    default: 'bg-codedex-yellow text-black shadow-brutal hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px]',
    success: 'bg-codedex-green text-black shadow-brutal hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px]',
    danger: 'bg-codedex-pink text-white shadow-brutal hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px]',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 animate-fade-in"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`bg-codedex-slate rounded-md shadow-brutal-xl border-2 border-gray-700 ${sizeClasses[size]} w-full overflow-hidden animate-scale-in`}
        style={{
          animation: 'scaleIn 0.2s ease-out',
        }}
      >
        {/* Modal Header */}
        <div className="bg-codedex-navy border-b-2 border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-100">{title}</h3>
            <button
              onClick={onClose}
              disabled={primaryActionLoading}
              className="text-gray-300 hover:text-gray-100 transition-colors disabled:opacity-50"
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
        <div className="px-6 py-4 bg-codedex-slate">{children}</div>

        {/* Modal Actions */}
        {(onPrimaryAction || onSecondaryAction) && (
          <div className="bg-codedex-navy border-t-2 border-gray-700 px-6 py-4 flex justify-end gap-3">
            {/* Secondary Action (Cancel) */}
            <button
              onClick={handleSecondaryAction}
              disabled={primaryActionLoading}
              className="px-4 py-2 bg-transparent border-2 border-gray-600 text-gray-300 rounded-sm hover:bg-codedex-slate transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {secondaryActionText}
            </button>

            {/* Primary Action */}
            {onPrimaryAction && (
              <button
                onClick={onPrimaryAction}
                disabled={primaryActionDisabled || primaryActionLoading}
                className={`px-4 py-2 font-bold rounded-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-brutal disabled:hover:translate-x-0 disabled:hover:translate-y-0 ${variantStyles[variant]} min-w-[100px]`}
              >
                {primaryActionLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-none h-4 w-4 border-b-2 border-current"></div>
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
