import React from 'react';
import { cn } from '@/lib/utils';

const ActionButton = ({ 
  variant = 'primary',
  size = 'default',
  children,
  className,
  loading = false,
  icon: Icon,
  ...props
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm hover:shadow-md',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md',
    ghost: 'hover:bg-gray-100 text-gray-700',
    link: 'text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline'
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    default: 'h-10 px-4 py-2 text-sm',
    lg: 'h-12 px-6 text-base',
    icon: 'h-10 w-10'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'hover:-translate-y-0.5 active:translate-y-0',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {Icon && !loading && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};

export { ActionButton };