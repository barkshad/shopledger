import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircleIcon, ShoppingCartIcon, CreditCardIcon } from './icons';
import { useNavigate } from 'react-router-dom';

const FAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleActionClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const parentVariants = {
    closed: { rotate: 0 },
    open: { rotate: 45 },
  };

  const childVariants = {
    closed: { y: 20, opacity: 0, scale: 0.8 },
    open: { y: 0, opacity: 1, scale: 1 },
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 md:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div className="flex flex-col items-center gap-4 mb-4">
            <motion.div
              variants={childVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 20 }}
              onClick={() => handleActionClick('/add-expense')}
              className="flex items-center gap-2 bg-surface dark:bg-dark-surface p-3 rounded-2xl shadow-soft cursor-pointer"
            >
              <span className="font-semibold text-sm">Add Expense</span>
              <CreditCardIcon className="h-6 w-6 text-danger dark:text-dark-danger" />
            </motion.div>
            <motion.div
              variants={childVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onClick={() => handleActionClick('/add-sale')}
              className="flex items-center gap-2 bg-surface dark:bg-dark-surface p-3 rounded-2xl shadow-soft cursor-pointer"
            >
              <span className="font-semibold text-sm">Add Sale</span>
              <ShoppingCartIcon className="h-6 w-6 text-primary" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        variants={parentVariants}
        animate={isOpen ? 'open' : 'closed'}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-glow"
        aria-label="Add new transaction"
      >
        <PlusCircleIcon className="h-8 w-8" />
      </motion.button>
    </div>
  );
};

export default FAB;
