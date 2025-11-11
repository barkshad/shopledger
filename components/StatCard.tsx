import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description }) => {
  return (
    <div className="bg-surface rounded-xl shadow-subtle p-6 border border-border-color">
      <h3 className="text-sm font-medium text-subtle-text truncate">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-on-surface">{value}</p>
      <p className="text-sm text-subtle-text mt-1">{description}</p>
    </div>
  );
};

export default StatCard;