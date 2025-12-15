import React from 'react';
import { cn } from '@/lib/utils';

const FormField = ({ 
  label, 
  children, 
  error, 
  required = false,
  className,
  description 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      <div className="relative">
        {children}
        {error && (
          <div className="absolute -bottom-5 left-0">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Input = React.forwardRef(({ 
  className, 
  type = 'text', 
  error,
  ...props 
}, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
        "placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

const Select = React.forwardRef(({ 
  className, 
  children, 
  error,
  ...props 
}, ref) => {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
        "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});

const Textarea = React.forwardRef(({ 
  className, 
  error,
  ...props 
}, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
        "placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
        "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";
Select.displayName = "Select";
Textarea.displayName = "Textarea";

export { FormField, Input, Select, Textarea };