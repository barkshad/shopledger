
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  data?: Record<string, any>[];
  dataKey?: string;
  color?: string;
}

const itemVariants: Variants = {
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

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, data, dataKey, color }) => {
  return (
    <motion.div 
        variants={itemVariants} 
        whileHover={{ translateY: -5, transition: { type: 'spring', stiffness: 300 } }}
        className="bg-surface dark:bg-dark-surface rounded-2xl shadow-soft p-6 border border-border-color dark:border-dark-border-color overflow-hidden relative"
    >
      <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary">
            {icon}
          </div>
      </div>
      <p className="mt-4 text-sm font-medium text-subtle-text dark:text-dark-subtle-text truncate">{title}</p>
      <p className="text-3xl font-bold text-on-surface dark:text-dark-on-surface truncate">{value}</p>
      {data && dataKey && color && (
        <div className="absolute bottom-0 right-0 left-0 h-20">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#gradient-${dataKey})`} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
