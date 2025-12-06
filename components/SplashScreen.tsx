
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCartIcon } from './icons';

const MotionDiv = motion.div as any;
const MotionH1 = motion.h1 as any;
const MotionP = motion.p as any;

const SplashScreen = () => {
  return (
    <MotionDiv
      key="splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-background dark:bg-dark-background overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:to-dark-background opacity-70" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 px-4">
        {/* Logo Animation */}
        <MotionDiv
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-tr from-primary to-blue-600 rounded-2xl shadow-glow flex items-center justify-center transform -rotate-3">
            <ShoppingCartIcon className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          {/* Decorative Ring */}
          <div className="absolute inset-0 border-2 border-primary/20 rounded-2xl transform rotate-6 -z-10" />
        </MotionDiv>

        {/* Text Animation */}
        <div className="text-center space-y-2">
            <MotionH1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                className="text-4xl font-extrabold text-on-surface dark:text-dark-on-surface tracking-tight"
            >
                ShopLedger
            </MotionH1>

            <MotionP
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-lg font-medium text-primary tracking-wide"
            >
                Simple. Smart. Sales.
            </MotionP>
        </div>

        {/* Loader */}
        <MotionDiv
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 140 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="h-1 bg-border-color dark:bg-dark-border-color rounded-full mt-12 overflow-hidden relative"
        >
            <MotionDiv 
                className="absolute inset-0 bg-primary"
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
            />
        </MotionDiv>
      </div>

      {/* Footer */}
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="pb-8 text-center relative z-10"
      >
        <p className="text-xs font-bold text-subtle-text/70 dark:text-dark-subtle-text/70 uppercase tracking-widest">
          Built by Shadrack
        </p>
        <p className="text-[10px] text-subtle-text/40 mt-1 font-mono">v1.0</p>
      </MotionDiv>
    </MotionDiv>
  );
};

export default SplashScreen;
