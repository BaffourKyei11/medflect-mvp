import React from 'react';
import { motion } from 'framer-motion';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="animate-pulse">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>
    </div>
  </div>
);

export const TestimonialSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="animate-pulse">
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="ml-3 space-y-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    </div>
  </div>
);

export const ButtonSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-48"></div>
  </div>
);

export const NavSkeleton: React.FC = () => (
  <div className="animate-pulse flex items-center space-x-4">
    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
  </div>
);

interface PulseLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'teal' | 'blue' | 'white' | 'gray';
}

export const PulseLoader: React.FC<PulseLoaderProps> = ({ 
  size = 'md', 
  color = 'teal' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    teal: 'border-teal-600 border-t-transparent',
    blue: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent'
  };

  return (
    <div 
      className={`${sizeClasses[size]} border-2 ${colorClasses[color]} rounded-full animate-spin`}
    />
  );
};

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={`animate-pulse space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div 
        key={index}
        className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
          index === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      />
    ))}
  </div>
);

export const PageLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    {/* Header Skeleton */}
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <NavSkeleton />
          <div className="flex items-center space-x-4">
            <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <ButtonSkeleton />
          </div>
        </div>
      </div>
    </div>

    {/* Hero Section Skeleton */}
    <div className="py-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
          <div className="flex justify-center space-x-4">
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-xl w-48"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-xl w-32"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Features Section Skeleton */}
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

interface SyncAnimationProps {
  isVisible: boolean;
  status: 'syncing' | 'success' | 'error' | 'offline';
}

export const SyncAnimation: React.FC<SyncAnimationProps> = ({ 
  isVisible, 
  status 
}) => {
  if (!isVisible) return null;

  const statusConfig = {
    syncing: {
      color: 'bg-blue-500',
      icon: '⟳',
      message: 'Syncing data...',
      animation: 'animate-spin'
    },
    success: {
      color: 'bg-green-500',
      icon: '✓',
      message: 'Data synced successfully',
      animation: ''
    },
    error: {
      color: 'bg-red-500',
      icon: '⚠',
      message: 'Sync failed - working offline',
      animation: ''
    },
    offline: {
      color: 'bg-gray-500',
      icon: '📱',
      message: 'Working offline',
      animation: ''
    }
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-20 right-4 z-50"
    >
      <div className={`${config.color} text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2`}>
        <span className={`text-lg ${config.animation}`}>
          {config.icon}
        </span>
        <span className="text-sm font-medium">
          {config.message}
        </span>
      </div>
    </motion.div>
  );
};
