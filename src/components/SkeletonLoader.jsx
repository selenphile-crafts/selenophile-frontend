import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ type = 'card' }) => {
  if (type === 'card') {
    return (
      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-gutter animate-pulse flex flex-col gap-4">
        <div className="w-12 h-12 bg-surface-container-high rounded-full"></div>
        <div className="h-6 bg-surface-container-high rounded w-3/4"></div>
        <div className="h-4 bg-surface-container-high rounded w-full"></div>
        <div className="h-4 bg-surface-container-high rounded w-5/6"></div>
        <div className="mt-auto flex flex-col gap-3">
          <div className="h-10 bg-surface-container-high rounded-lg w-full"></div>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="flex items-start gap-3 p-4 border border-surface-container-high rounded-lg bg-white animate-pulse">
        <div className="w-5 h-5 bg-surface-container-high rounded-full mt-1"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-surface-container-high rounded w-1/2"></div>
          <div className="h-3 bg-surface-container-high rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className="h-4 bg-surface-container-high rounded w-full animate-pulse"></div>
    );
  }

  if (type === 'full') {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-bright">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 bg-surface-container-high rounded-full"></div>
          <div className="h-6 bg-surface-container-high rounded w-48"></div>
          <div className="h-4 bg-surface-container-high rounded w-32"></div>
        </div>
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
