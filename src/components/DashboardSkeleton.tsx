import React from 'react';
import { motion } from 'motion/react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner Skeleton */}
      <motion.div
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-3xl p-6 md:p-8 relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-3 w-full md:w-2/3">
            <div className="h-4 w-32 bg-emerald-200 dark:bg-emerald-800 rounded-full"></div>
            <div className="h-8 w-3/4 bg-emerald-300 dark:bg-emerald-700 rounded-xl"></div>
            <div className="h-4 w-1/2 bg-emerald-200/70 dark:bg-emerald-800/70 rounded-lg"></div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="h-10 w-28 bg-emerald-300 dark:bg-emerald-700 rounded-xl"></div>
            <div className="h-10 w-32 bg-emerald-400 dark:bg-emerald-600 rounded-xl"></div>
          </div>
        </div>
      </motion.div>

      {/* Grid widgets skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weather Card Skeleton */}
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <div className="h-5 w-28 bg-stone-200 dark:bg-stone-800 rounded-md"></div>
            <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-stone-200 dark:bg-stone-800 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="h-8 w-20 bg-stone-200 dark:bg-stone-800 rounded-lg"></div>
              <div className="h-3 w-32 bg-stone-200 dark:bg-stone-800 rounded-md"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <div className="h-10 bg-stone-100 dark:bg-stone-800/50 rounded-xl"></div>
            <div className="h-10 bg-stone-100 dark:bg-stone-800/50 rounded-xl"></div>
            <div className="h-10 bg-stone-100 dark:bg-stone-800/50 rounded-xl"></div>
          </div>
        </motion.div>

        {/* Irrigation / Pump Card Skeleton */}
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.4 }}
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 bg-stone-200 dark:bg-stone-800 rounded-md"></div>
            <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-800"></div>
          </div>
          <div className="h-16 bg-stone-100 dark:bg-stone-800/60 rounded-xl flex items-center px-4 justify-between">
            <div className="w-10 h-10 rounded-xl bg-stone-200 dark:bg-stone-700"></div>
            <div className="space-y-2 w-1/2">
              <div className="h-4 w-full bg-stone-200 dark:bg-stone-700 rounded-md"></div>
              <div className="h-3 w-2/3 bg-stone-200 dark:bg-stone-700 rounded-md"></div>
            </div>
          </div>
          <div className="h-10 w-full bg-stone-200 dark:bg-stone-800 rounded-xl"></div>
        </motion.div>

        {/* Soil Health Card Skeleton */}
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.6 }}
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <div className="h-5 w-28 bg-stone-200 dark:bg-stone-800 rounded-md"></div>
            <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-800"></div>
          </div>
          <div className="space-y-3">
            <div className="h-3 w-full bg-stone-100 dark:bg-stone-800 rounded-full"></div>
            <div className="h-3 w-4/5 bg-stone-100 dark:bg-stone-800 rounded-full"></div>
            <div className="h-3 w-3/4 bg-stone-100 dark:bg-stone-800 rounded-full"></div>
          </div>
          <div className="h-10 w-full bg-stone-200 dark:bg-stone-800 rounded-xl"></div>
        </motion.div>
      </div>

      {/* Main Lower Section Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.3 }}
          className="lg:col-span-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-6 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <div className="h-6 w-48 bg-stone-200 dark:bg-stone-800 rounded-md"></div>
            <div className="h-8 w-24 bg-stone-200 dark:bg-stone-800 rounded-xl"></div>
          </div>
          <div className="space-y-4">
            <div className="h-20 bg-stone-100 dark:bg-stone-800/40 rounded-xl"></div>
            <div className="h-20 bg-stone-100 dark:bg-stone-800/40 rounded-xl"></div>
            <div className="h-20 bg-stone-100 dark:bg-stone-800/40 rounded-xl"></div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.5 }}
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-6 shadow-sm"
        >
          <div className="h-6 w-36 bg-stone-200 dark:bg-stone-800 rounded-md"></div>
          <div className="space-y-4">
            <div className="h-14 bg-stone-100 dark:bg-stone-800/50 rounded-xl"></div>
            <div className="h-14 bg-stone-100 dark:bg-stone-800/50 rounded-xl"></div>
            <div className="h-14 bg-stone-100 dark:bg-stone-800/50 rounded-xl"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
