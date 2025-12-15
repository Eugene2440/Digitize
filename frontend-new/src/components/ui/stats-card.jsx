import React from 'react';
import { cn } from '@/lib/utils';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  className,
  gradient = "from-blue-500 to-blue-600"
}) => {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-gray-100",
      "hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span className={cn(
                "text-xs font-medium",
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              )}>
                {trend === 'up' ? '↗' : '↘'} {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br",
          gradient
        )}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className={cn(
        "absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r",
        gradient
      )} />
    </div>
  );
};

export { StatsCard };