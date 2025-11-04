'use client';

import { useEffect } from 'react';

interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  variant?: 'success' | 'error' | 'warning' | 'info';
}

export default function AlertDialog({
  isOpen,
  title,
  message,
  onClose,
  variant = 'info',
}: AlertDialogProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    success: {
      icon: '✓',
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      messageColor: 'text-green-700',
    },
    error: {
      icon: '✕',
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      messageColor: 'text-red-700',
    },
    warning: {
      icon: '⚠',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      messageColor: 'text-yellow-700',
    },
    info: {
      icon: 'ℹ',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideInRight">
      <div
        className={`${styles.bg} ${styles.border} border-2 rounded-xl shadow-lg max-w-md p-4 flex items-start gap-3`}
      >
        {/* Icon */}
        <div
          className={`${styles.iconBg} ${styles.iconColor} w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold shrink-0`}
        >
          {styles.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold ${styles.titleColor} mb-1`}>
            {title}
          </h4>
          <p className={`text-sm ${styles.messageColor} leading-relaxed`}>
            {message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
