import React from 'react';
import { cn } from '@/lib/utils';

const StatusBadge = ({ 
  status, 
  variant = 'default',
  size = 'default',
  className 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    signed_in: 'bg-green-100 text-green-800 border-green-200',
    signed_out: 'bg-gray-100 text-gray-800 border-gray-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    default: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  // Auto-detect variant based on status
  const getVariant = () => {
    if (variant !== 'default') return variant;
    
    const statusLower = status?.toLowerCase();
    if (statusLower?.includes('signed_in') || statusLower?.includes('active')) return 'signed_in';
    if (statusLower?.includes('signed_out') || statusLower?.includes('inactive')) return 'signed_out';
    if (statusLower?.includes('success')) return 'success';
    if (statusLower?.includes('warning') || statusLower?.includes('pending')) return 'warning';
    if (statusLower?.includes('error') || statusLower?.includes('failed')) return 'error';
    return 'default';
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium',
      variants[getVariant()],
      sizes[size],
      className
    )}>
      <span className={cn(
        'mr-1.5 h-2 w-2 rounded-full',
        getVariant() === 'signed_in' && 'bg-green-500',
        getVariant() === 'signed_out' && 'bg-gray-400',
        getVariant() === 'success' && 'bg-green-500',
        getVariant() === 'warning' && 'bg-yellow-500',
        getVariant() === 'error' && 'bg-red-500',
        getVariant() === 'info' && 'bg-blue-500',
        getVariant() === 'default' && 'bg-gray-400'
      )} />
      {status?.replace('_', ' ') || 'Unknown'}
    </span>
  );
};

export { StatusBadge };