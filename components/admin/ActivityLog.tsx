import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Log {
  message: string;
  timestamp: Date;
}

interface ActivityLogProps {
  logs: Log[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ logs }) => {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-2 text-on-surface">Recent Activity</h3>
      <div className="bg-background/50 rounded-lg p-4 border border-border-color h-48 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-subtle-text text-sm h-full flex items-center justify-center">No recent activity.</p>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {logs.map((log, index) => (
                <motion.li
                  key={log.timestamp.toISOString() + index}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="text-sm text-subtle-text flex justify-between"
                >
                  <span>{log.message}</span>
                  <span className="text-xs flex-shrink-0 ml-4">{log.timestamp.toLocaleTimeString()}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
