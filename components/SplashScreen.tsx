import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen = () => {
  return (
    <motion.div
      key="splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background dark:bg-dark-background"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center">
        <div className="flex justify-center items-center mb-6">
          <div className="relative inline-flex">
            <div className="w-20 h-20 bg-primary/20 rounded-full"></div>
            <div className="w-20 h-20 bg-primary/20 rounded-full absolute top-0 left-0 animate-ping"></div>
            <div className="w-20 h-20 bg-primary rounded-full absolute top-0 left-0 animate-pulse flex items-center justify-center text-on-primary text-3xl font-bold shadow-glow">
              SL
            </div>
          </div>
        </div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold text-on-surface dark:text-dark-on-surface"
        >
          ShopLedger
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-2 text-lg text-subtle-text dark:text-dark-subtle-text"
        >
          Smart Sales Recorder
        </motion.p>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
