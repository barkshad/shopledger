
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description }) => {
  return (
    <div className="bg-surface rounded-xl shadow-sm p-6">
      <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-on-surface">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default StatCard;
