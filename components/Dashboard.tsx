import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSales } from '../hooks/useSales';
import StatCard from './StatCard';
import { getStartOfDay, getStartOfWeek, getStartOfMonth } from '../utils/dateUtils';
import Spinner from './Spinner';
import { PlusCircleIcon } from './icons';

const Dashboard = () => {
  const { sales, loading } = useSales();
  const navigate = useNavigate();

  const { todaySales, weekSales, monthSales, chartData } = useMemo(() => {
    const now = new Date();
    const startOfToday = getStartOfDay(now).getTime();
    const startOfWeek = getStartOfWeek(now).getTime();
    const startOfMonth = getStartOfMonth(now).getTime();
    
    let todaySales = 0;
    let weekSales = 0;
    let monthSales = 0;

    const salesByDay: { [key: string]: number } = {};

    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const saleTime = saleDate.getTime();
      
      if (saleTime >= startOfToday) {
        todaySales += sale.total;
      }
      if (saleTime >= startOfWeek) {
        weekSales += sale.total;
      }
      if (saleTime >= startOfMonth) {
        monthSales += sale.total;
      }

      // Aggregate data for chart (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      if (saleTime >= getStartOfDay(thirtyDaysAgo).getTime()) {
        const dayKey = saleDate.toISOString().split('T')[0];
        if (!salesByDay[dayKey]) {
          salesByDay[dayKey] = 0;
        }
        salesByDay[dayKey] += sale.total;
      }
    });

    const chartData = Object.keys(salesByDay)
      .map(date => ({
        date,
        sales: salesByDay[date],
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { todaySales, weekSales, monthSales, chartData };
  }, [sales]);

  const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString()}`;

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-subtle-text mt-1">Welcome back! Here's your sales overview.</p>
        </div>
        <button
          onClick={() => navigate('/add-sale')}
          className="bg-primary text-on-primary font-bold py-2 px-4 rounded-lg shadow-subtle hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <PlusCircleIcon className="h-5 w-5" />
          Add New Sale
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Today's Sales" value={formatCurrency(todaySales)} description="Total sales recorded today" />
        <StatCard title="This Week's Sales" value={formatCurrency(weekSales)} description="From Monday to now" />
        <StatCard title="This Month's Sales" value={formatCurrency(monthSales)} description="Since the start of the month" />
      </div>

      <div className="bg-surface rounded-xl shadow-subtle p-6 border border-border-color">
        <h2 className="text-xl font-semibold mb-4">Daily Sales (Last 30 Days)</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                formatter={(value: number) => [formatCurrency(value), 'Sales']} />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <h3 className="text-lg font-semibold text-on-surface">No Recent Sales Data</h3>
            <p className="text-subtle-text mt-1">Sales from the last 30 days will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;