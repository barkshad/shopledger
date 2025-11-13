import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useSales } from '../hooks/useSales';
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
    ShoppingCartIcon
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
  const { sales, loading } = useSales();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const {
    todaySales,
    weekSales,
    monthSales,
    totalRevenue,
    mostSoldItem,
    recentSales,
    avgSaleValue,
    totalUniqueItems,
    busiestDay,
    chartData
  } = useMemo(() => {
    const now = new Date();
    const startOfToday = getStartOfDay(now).getTime();
    const startOfWeek = getStartOfWeek(now).getTime();
    const startOfMonth = getStartOfMonth(now).getTime();
    
    // --- Basic Stats ---
    const todaySales = sales
      .filter(s => new Date(s.date).getTime() >= startOfToday)
      .reduce((sum, s) => sum + s.total, 0);
    
    const weekSales = sales
      .filter(s => new Date(s.date).getTime() >= startOfWeek)
      .reduce((sum, s) => sum + s.total, 0);
    
    const monthSales = sales
      .filter(s => new Date(s.date).getTime() >= startOfMonth)
      .reduce((sum, s) => sum + s.total, 0);
    
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

    // --- Performance Insights ---
    const itemCounts = sales.reduce((acc: Record<string, number>, s) => {
        acc[s.itemName] = (acc[s.itemName] || 0) + s.quantity;
        return acc;
    }, {} as Record<string, number>);

    const mostSoldItem = Object.keys(itemCounts).length > 0
        ? Object.entries(itemCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0][0]
        : 'N/A';
        
    const avgSaleValue = sales.length > 0 ? totalRevenue / sales.length : 0;
    const totalUniqueItems = new Set(sales.map(s => s.itemName)).size;

    // --- Chart & Recent Sales ---
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const salesByDayForChart = sales.reduce((acc, sale) => {
        const dayKey = new Date(sale.date).toISOString().split('T')[0];
        if (last7Days.includes(dayKey)) {
            acc[dayKey] = (acc[dayKey] || 0) + sale.total;
        }
        return acc;
    }, {} as Record<string, number>);

    const chartData = last7Days.map(date => ({
        name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        sales: salesByDayForChart[date] || 0,
    }));
    
    const busiestDay = chartData.length > 0 
        ? chartData.reduce((max, day) => day.sales > max.sales ? day : max).name 
        : 'N/A';

    const recentSales = sales.slice(0, 5);

    return { todaySales, weekSales, monthSales, totalRevenue, mostSoldItem, recentSales, avgSaleValue, totalUniqueItems, busiestDay, chartData };
  }, [sales]);

  const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatTime = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (loading) {
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatCard title="Today's Sales" value={formatCurrency(todaySales)} icon={<SunIcon className="w-6 h-6"/>} />
        <StatCard title="This Week" value={formatCurrency(weekSales)} icon={<CalendarIcon className="w-6 h-6"/>} />
        <StatCard title="This Month" value={formatCurrency(monthSales)} icon={<BarChartIcon className="w-6 h-6"/>} />
        <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<DollarSignIcon className="w-6 h-6"/>} description="All-time revenue" />
        <StatCard title="Top Item" value={mostSoldItem} icon={<StarIcon className="w-6 h-6"/>} description="Most units sold" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
            className="lg:col-span-2 bg-surface rounded-xl shadow-subtle p-6 border border-border-color"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
        >
            <h2 className="text-xl font-semibold mb-4">Sales Trend (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `KSh ${value/1000}k`}/>
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid #E2E8F0',
                        borderRadius: '0.75rem',
                    }}
                    cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '3 3' }}
                    formatter={(value: number) => [formatCurrency(value), 'Sales']} />
                <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 8 }}/>
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
                        <span className="text-subtle-text flex items-center gap-2"><AwardIcon className="w-4 h-4"/>Busiest Day (Last 7)</span>
                        <span className="font-semibold text-on-surface">{busiestDay}</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                        <span className="text-subtle-text flex items-center gap-2"><PackageIcon className="w-4 h-4"/>Unique Items Sold</span>
                        <span className="font-semibold text-on-surface">{totalUniqueItems.toLocaleString()}</span>
                    </li>
                </ul>
            </motion.div>
            <motion.div
                className="bg-surface rounded-xl shadow-subtle p-6 border border-border-color"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
            >
                <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>
                {recentSales.length > 0 ? (
                    <div className="space-y-4">
                        {recentSales.map((sale) => (
                        <div key={sale.id} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center flex-shrink-0">
                                    {sale.photo ? (
                                        <img src={sale.photo} alt={sale.itemName} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <PackageIcon className="w-5 h-5 text-subtle-text"/>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-on-surface text-sm truncate">{sale.itemName}</p>
                                    <p className="text-xs text-subtle-text">{new Date(sale.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <p className="font-semibold text-primary text-sm whitespace-nowrap">{formatCurrency(sale.total)}</p>
                        </div>
                        ))}
                        {sales.length > 5 && (
                            <Link to="/history" className="text-sm font-semibold text-primary hover:underline pt-2 block text-center">
                                View all sales &rarr;
                            </Link>
                        )}
                    </div>
                ) : (
                    <p className="text-subtle-text text-sm text-center py-4">No sales recorded yet.</p>
                )}
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
