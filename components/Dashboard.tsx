import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useSales } from '../hooks/useSales';
import { useExpenses } from '../hooks/useExpenses';
import { useAdminSettings } from '../hooks/useAdminSettings';
import StatCard from './StatCard';
import { getStartOfDay, getStartOfWeek, getStartOfMonth } from '../utils/dateUtils';
import Spinner from './Spinner';
import { 
    PlusCircleIcon,
    DollarSignIcon,
    StarIcon,
    CalendarIcon,
    PackageIcon,
    TrendingUpIcon,
    AwardIcon,
    BarChartIcon,
    SunIcon,
    ShoppingCartIcon,
    TrendingDownIcon,
    CreditCardIcon
} from './icons';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const Dashboard = () => {
  const { sales, loading: salesLoading } = useSales();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { settings } = useAdminSettings();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const {
    todaySales,
    todayExpenses,
    totalRevenue,
    mostSoldItem,
    recentActivity,
    avgSaleValue,
    netProfit,
    chartData
  } = useMemo(() => {
    const now = new Date();
    const startOfToday = getStartOfDay(now).getTime();
    
    // --- Sales Stats ---
    const todaySales = sales
      .filter(s => new Date(s.date).getTime() >= startOfToday)
      .reduce((sum, s) => sum + s.total, 0);
    
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

    const itemCounts = sales.reduce((acc: Record<string, number>, s) => {
        acc[s.itemName] = (acc[s.itemName] || 0) + s.quantity;
        return acc;
    }, {} as Record<string, number>);

    const mostSoldItem = Object.keys(itemCounts).length > 0
        ? Object.entries(itemCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0][0]
        : 'N/A';
        
    const avgSaleValue = sales.length > 0 ? totalRevenue / sales.length : 0;
    
    // --- Expenses Stats ---
    const todayExpenses = expenses
      .filter(e => new Date(e.date).getTime() >= startOfToday)
      .reduce((sum, e) => sum + e.amount, 0);

    // --- Combined Stats ---
    const netProfit = totalRevenue - expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // --- Chart Data (Last 7 Days) ---
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const salesByDay = sales.reduce((acc, sale) => {
        const dayKey = new Date(sale.date).toISOString().split('T')[0];
        if (last7Days.includes(dayKey)) acc[dayKey] = (acc[dayKey] || 0) + sale.total;
        return acc;
    }, {} as Record<string, number>);

    const expensesByDay = expenses.reduce((acc, expense) => {
        const dayKey = new Date(expense.date).toISOString().split('T')[0];
        if (last7Days.includes(dayKey)) acc[dayKey] = (acc[dayKey] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const chartData = last7Days.map(date => ({
        name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        sales: salesByDay[date] || 0,
        expenses: expensesByDay[date] || 0,
    }));
    
    // --- Recent Activity ---
    const mappedSales = sales.slice(0, 5).map(s => ({ ...s, type: 'sale', title: s.itemName, value: s.total, photo: s.photo, date: new Date(s.date)}));
    const mappedExpenses = expenses.slice(0, 5).map(e => ({ ...e, type: 'expense', title: e.name, value: e.amount, photo: e.receiptPhoto, date: new Date(e.date)}));
    const recentActivity = [...mappedSales, ...mappedExpenses]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5);

    return { todaySales, todayExpenses, totalRevenue, mostSoldItem, recentActivity, avgSaleValue, netProfit, chartData };
  }, [sales, expenses]);

  const formatCurrency = (amount: number) => `${settings.currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatTime = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (salesLoading || expensesLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, Shadrack 👋</h1>
          <p className="text-subtle-text mt-1">{formatTime(currentTime)}</p>
        </div>
        <button
          onClick={() => navigate('/add-sale')}
          className="bg-primary text-on-primary font-bold py-2 px-4 rounded-lg shadow-subtle hover:bg-blue-600 transition-colors flex items-center gap-2"
          aria-label="Add New Sale"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>Add New Sale</span>
        </button>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatCard title="Today's Sales" value={formatCurrency(todaySales)} icon={<TrendingUpIcon className="w-6 h-6 text-green-500"/>} />
        <StatCard title="Today's Expenses" value={formatCurrency(todayExpenses)} icon={<TrendingDownIcon className="w-6 h-6 text-red-500"/>} />
        <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<DollarSignIcon className="w-6 h-6"/>} description="All-time sales" />
        <StatCard title="Net Profit" value={formatCurrency(netProfit)} icon={<BarChartIcon className="w-6 h-6"/>} description="All-time profit" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
            className="lg:col-span-2 bg-surface rounded-xl shadow-subtle p-6 border border-border-color"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
        >
            <h2 className="text-xl font-semibold mb-4">Activity (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${settings.currency} ${value/1000}k`}/>
                <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)', border: '1px solid #E2E8F0', borderRadius: '0.75rem' }}
                    cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '3 3' }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name.charAt(0).toUpperCase() + name.slice(1)]} />
                <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 8 }}/>
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} dot={{ r: 4, fill: '#EF4444' }} activeDot={{ r: 8 }}/>
                </LineChart>
            </ResponsiveContainer>
        </motion.div>

        <div className="space-y-8">
            <motion.div 
                className="bg-surface rounded-xl shadow-subtle p-6 border border-border-color"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
            >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <TrendingUpIcon className="w-5 h-5 text-primary"/>
                    Performance Insights
                </h2>
                <ul className="space-y-4">
                    <li className="flex items-center justify-between text-sm">
                        <span className="text-subtle-text flex items-center gap-2"><DollarSignIcon className="w-4 h-4"/>Average Sale Value</span>
                        <span className="font-semibold text-on-surface">{formatCurrency(avgSaleValue)}</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                        <span className="text-subtle-text flex items-center gap-2"><StarIcon className="w-4 h-4"/>Best Selling Item</span>
                        <span className="font-semibold text-on-surface">{mostSoldItem}</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                        <span className="text-subtle-text flex items-center gap-2"><SunIcon className="w-4 h-4"/>Net Today</span>
                        <span className={`font-semibold ${todaySales - todayExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(todaySales - todayExpenses)}</span>
                    </li>
                </ul>
            </motion.div>
            <motion.div
                className="bg-surface rounded-xl shadow-subtle p-6 border border-border-color"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
            >
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                        {recentActivity.map((item) => (
                        <div key={`${item.type}-${item.id}`} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center flex-shrink-0">
                                    {item.photo ? (
                                        <img src={item.photo} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        item.type === 'sale' ? <PackageIcon className="w-5 h-5 text-subtle-text"/> : <CreditCardIcon className="w-5 h-5 text-subtle-text"/>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-on-surface text-sm truncate">{item.title}</p>
                                    <p className="text-xs text-subtle-text">{new Date(item.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <p className={`font-semibold text-sm whitespace-nowrap ${item.type === 'sale' ? 'text-green-600' : 'text-red-600'}`}>
                                {item.type === 'expense' && '-'}{formatCurrency(item.value)}
                            </p>
                        </div>
                        ))}
                        {sales.length > 5 && (
                            <Link to="/history" className="text-sm font-semibold text-primary hover:underline pt-2 block text-center">
                                View all &rarr;
                            </Link>
                        )}
                    </div>
                ) : (
                    <p className="text-subtle-text text-sm text-center py-4">No activity recorded yet.</p>
                )}
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
