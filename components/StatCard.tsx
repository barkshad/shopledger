import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 20,
    }
  },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description, className }) => {
  return (
    <motion.div variants={itemVariants} className={`bg-surface rounded-xl shadow-subtle p-5 border border-border-color ${className}`}>
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-subtle-text truncate">{title}</h3>
            <div className="text-subtle-text">{icon}</div>
        </div>
        <p className="mt-2 text-3xl font-bold text-on-surface truncate">{value}</p>
        {description && <p className="text-xs text-subtle-text mt-1 truncate">{description}</p>}
    </motion.div>
  );
};

export default StatCard;
