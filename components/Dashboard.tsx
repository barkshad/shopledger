
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, YAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useSales } from '../hooks/useSales';
import { useExpenses } from '../hooks/useExpenses';
import { useAdminSettings } from '../hooks/useAdminSettings';
import StatCard from './StatCard';
import { getStartOfWeek, getStartOfMonth } from '../utils/dateUtils';
import Spinner from './Spinner';
import * as db from '../services/db';
import { Product } from '../types';
import { 
    DollarSignIcon,
    WalletIcon,
    ShoppingBasketIcon,
    TrendingUpIcon,
    BarChartIcon,
    PackageIcon,
    CreditCardIcon,
    FileTextIcon,
    CameraIcon,
    PlusCircleIcon,
    GaugeIcon,
    StatsIcon,
    AlertTriangleIcon
} from './icons';
import { calculateHealthScore } from '../utils/statsUtils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const HealthScoreGuage: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (score / 100) * circumference;
    let colorClass = 'text-green-500';
    if (score < 50) colorClass = 'text-red-500';
    else if (score < 75) colorClass = 'text-yellow-500';

    return (
        <div className="relative flex items-center justify-center w-32 h-32">
            <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                <circle
                    className="text-border-color dark:text-dark-border-color"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                />
                <circle
                    className={colorClass}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
            </svg>
            <span className={`text-3xl font-bold ${colorClass}`}>{score}%</span>
        </div>
    );
};


const Dashboard = () => {
  const { sales, loading: salesLoading } = useSales();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { settings } = useAdminSettings();
  const navigate = useNavigate();
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  useEffect(() => {
      const checkStock = async () => {
          const allProducts = await db.getAllProducts();
          setLowStockProducts(allProducts.filter(p => p.stock <= p.minStock));
      };
      checkStock();
  }, [sales]); // Re-check when sales change

  const {
    todaySales,
    weekSales,
    monthProfit,
    last7DaysChartData,
    recentActivity,
    shopHealthScore,
    allTimeSalesCount,
    allTimeRevenue
  } = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = getStartOfWeek(now).getTime();
    const startOfMonth = getStartOfMonth(now).getTime();
    
    // Sales Stats
    const todaySales = sales
      .filter(s => new Date(s.date).getTime() >= startOfToday)
      .reduce((sum, s) => sum + s.total, 0);
      
    const weekSales = sales
      .filter(s => new Date(s.date).getTime() >= startOfWeek)
      .reduce((sum, s) => sum + s.total, 0);
      
    // Profit Stats
    const monthSalesTotal = sales
      .filter(s => new Date(s.date).getTime() >= startOfMonth)
      .reduce((sum, s) => sum + s.total, 0);
      
    const monthExpensesTotal = expenses
      .filter(e => new Date(e.date).getTime() >= startOfMonth)
      .reduce((sum, e) => sum + e.amount, 0);
      
    const monthProfit = monthSalesTotal - monthExpensesTotal;
    
    // Chart Data (Last 7 Days Sparkline)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const salesByDay = sales.reduce((acc, sale) => {
        const dayKey = new Date(sale.date).toISOString().split('T')[0];
        acc[dayKey] = (acc[dayKey] || 0) + sale.total;
        return acc;
    }, {} as Record<string, number>);

    const last7DaysChartData = last7Days.map(date => ({
        name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        sales: salesByDay[date] || 0,
    }));
    
    // Recent Activity
    const mappedSales = sales.slice(0, 3).map(s => ({ ...s, type: 'sale', title: s.itemName, value: s.total, photo: s.photo, date: new Date(s.date)}));
    const mappedExpenses = expenses.slice(0, 3).map(e => ({ ...e, type: 'expense', title: e.name, value: e.amount, photo: e.receiptPhoto, date: new Date(e.date)}));
    const recentActivity = [...mappedSales, ...mappedExpenses]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 4);
        
    const shopHealthScore = calculateHealthScore(sales, expenses);

    // Lifetime Stats (All existing data)
    const allTimeSalesCount = sales.length;
    const allTimeRevenue = sales.reduce((sum, s) => sum + s.total, 0);

    return { todaySales, weekSales, monthProfit, last7DaysChartData, recentActivity, shopHealthScore, allTimeSalesCount, allTimeRevenue };
  }, [sales, expenses]);

  const formatCurrency = (amount: number) => `${settings.currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (salesLoading || expensesLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <h1 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Welcome back, Shadrack 👋</h1>
        <p className="text-subtle-text dark:text-dark-subtle-text mt-1">Here's your business snapshot.</p>
      </motion.div>

      {/* Lifetime Performance Card */}
      <motion.div 
        variants={itemVariants} 
        initial="hidden" 
        animate="visible" 
        className="bg-gradient-to-r from-primary/90 to-blue-600 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4"
      >
        <div className="text-center sm:text-left">
            <h2 className="text-lg font-medium opacity-90">Lifetime Performance</h2>
            <p className="text-sm opacity-75">All-time sales overview</p>
        </div>
        <div className="flex gap-8 text-center">
            <div>
                <p className="text-3xl font-bold">{allTimeSalesCount.toLocaleString()}</p>
                <p className="text-xs font-medium opacity-75 uppercase tracking-wider">Total Sales</p>
            </div>
            <div className="w-px bg-white/20"></div>
            <div>
                <p className="text-3xl font-bold">{formatCurrency(allTimeRevenue)}</p>
                <p className="text-xs font-medium opacity-75 uppercase tracking-wider">Total Revenue</p>
            </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatCard title="Today's Sales" value={formatCurrency(todaySales)} icon={<ShoppingBasketIcon className="w-6 h-6"/>} data={last7DaysChartData} dataKey="sales" color="#4EA8FF" />
        <StatCard title="This Week's Sales" value={formatCurrency(weekSales)} icon={<TrendingUpIcon className="w-6 h-6"/>} data={last7DaysChartData} dataKey="sales" color="#34D399" />
        <StatCard title="This Month's Profit" value={formatCurrency(monthProfit)} icon={<WalletIcon className="w-6 h-6"/>} data={last7DaysChartData} dataKey="sales" color="#F472B6" />
      </motion.div>

       {lowStockProducts.length > 0 && (
            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-start gap-4">
                <AlertTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-red-700 dark:text-red-300">Low Stock Alert</h3>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-2">The following items are running low:</p>
                    <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
                        {lowStockProducts.slice(0, 3).map(p => (
                            <li key={p.id}>{p.name} (Only {p.stock} left)</li>
                        ))}
                        {lowStockProducts.length > 3 && <li>...and {lowStockProducts.length - 3} more</li>}
                    </ul>
                    <Link to="/products" className="text-xs font-bold text-red-700 dark:text-red-300 underline mt-2 block">Manage Inventory &rarr;</Link>
                </div>
            </motion.div>
       )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="lg:col-span-1 bg-surface dark:bg-dark-surface rounded-2xl shadow-soft p-6 border border-border-color dark:border-dark-border-color flex flex-col items-center justify-center text-center">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><GaugeIcon /> Shop Health Score</h2>
              <p className="text-subtle-text dark:text-dark-subtle-text text-sm mb-4">An overview of your business performance.</p>
              <HealthScoreGuage score={shopHealthScore.score} />
              <p className="font-semibold mt-4">{shopHealthScore.status}</p>
               <button onClick={() => navigate('/statistics')} className="mt-4 w-full bg-primary/10 text-primary font-bold py-2 px-4 rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
                  View Full Statistics <StatsIcon className="w-5 h-5" />
               </button>
          </motion.div>
          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="lg:col-span-2 bg-surface dark:bg-dark-surface rounded-2xl shadow-soft p-6 border border-border-color dark:border-dark-border-color">
              <h2 className="text-xl font-bold mb-4">Weekly Performance</h2>
              <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={last7DaysChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4EA8FF" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4EA8FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <YAxis tick={{ fill: '#5A6474', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${settings.currency}${value/1000}k`}/>
                  <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)', border: '1px solid #E6EBF2', borderRadius: '0.75rem' }}
                      cursor={{ stroke: '#4EA8FF', strokeWidth: 1, strokeDasharray: '3 3' }}
                      formatter={(value: number) => [formatCurrency(value), "Sales"]} />
                  <Area type="monotone" dataKey="sales" stroke="#4EA8FF" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
              </ResponsiveContainer>
          </motion.div>
      </div>

      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-surface dark:bg-dark-surface rounded-2xl shadow-soft p-6 border border-border-color dark:border-dark-border-color">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
              <div className="space-y-4">
                  {recentActivity.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-12 h-12 bg-background dark:bg-dark-background rounded-lg flex items-center justify-center flex-shrink-0">
                              {item.photo ? (
                                  <img src={item.photo} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                  item.type === 'sale' ? <PackageIcon className="w-6 h-6 text-subtle-text dark:text-dark-subtle-text"/> : <CreditCardIcon className="w-6 h-6 text-subtle-text dark:text-dark-subtle-text"/>
                              )}
                          </div>
                          <div>
                              <p className="font-semibold text-on-surface dark:text-dark-on-surface truncate">{item.title}</p>
                              <p className="text-sm text-subtle-text dark:text-dark-subtle-text">{new Date(item.date).toLocaleDateString()}</p>
                          </div>
                      </div>
                      <p className={`font-semibold whitespace-nowrap ${item.type === 'sale' ? 'text-green-500' : 'text-danger dark:text-dark-danger'}`}>
                          {item.type === 'expense' && '-'}{formatCurrency(item.value)}
                      </p>
                  </div>
                  ))}
                  {(sales.length > 3 || expenses.length > 3) && (
                      <Link to="/history" className="text-sm font-semibold text-primary hover:underline pt-2 block text-center">
                          View all activity &rarr;
                      </Link>
                  )}
              </div>
          ) : (
              <p className="text-subtle-text dark:text-dark-subtle-text text-sm text-center py-4">No activity recorded yet.</p>
          )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
