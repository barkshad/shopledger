import React, { useMemo } from 'react';
import { useSales } from '../hooks/useSales';
import { useExpenses } from '../hooks/useExpenses';
import { useAdminSettings } from '../hooks/useAdminSettings';
import Spinner from './Spinner';
import * as statsUtils from '../utils/statsUtils';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from 'recharts';
import {
    ArrowUpRightIcon, ArrowDownRightIcon, TrendingUpIcon,
    PieChartIcon, CpuIcon, GaugeIcon, StarIcon, TrendingDownIcon
} from './icons';
import { Sale } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const StatInsightCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <motion.div
        variants={itemVariants}
        className={`bg-surface/70 dark:bg-dark-surface/70 backdrop-blur-md rounded-2xl shadow-soft p-6 border border-border-color dark:border-dark-border-color ${className}`}
    >
        {children}
    </motion.div>
);

const TrendDisplay: React.FC<{ title: string, current: number, change: number, currency: string }> = ({ title, current, change, currency }) => (
    <div>
        <p className="text-sm text-subtle-text dark:text-dark-subtle-text">{title}</p>
        <p className="text-2xl font-bold">{currency} {current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <div className={`flex items-center text-sm font-semibold ${change >= 0 ? 'text-green-500' : 'text-danger'}`}>
            {change >= 0 ? <ArrowUpRightIcon className="h-4 w-4"/> : <ArrowDownRightIcon className="h-4 w-4"/>}
            {Math.abs(change).toFixed(1)}% vs last period
        </div>
    </div>
);

const HealthScoreGuage: React.FC<{ score: number, status: string }> = ({ score, status }) => {
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (score / 100) * circumference;
    let colorClass = 'text-green-500';
    if (score < 50) colorClass = 'text-red-500';
    else if (score < 75) colorClass = 'text-yellow-500';

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><GaugeIcon /> Shop Health Score</h2>
            <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 120 120">
                    <circle className="text-border-color dark:text-dark-border-color" strokeWidth="10" stroke="currentColor" fill="transparent" r="52" cx="60" cy="60" />
                    <motion.circle
                        className={colorClass}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="52"
                        cx="60"
                        cy="60"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-4xl font-bold ${colorClass}`}>{score}%</span>
                </div>
            </div>
            <p className="font-semibold mt-4 text-lg">{status}</p>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label, currency }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-sm p-3 rounded-lg border border-border-color dark:border-dark-border-color shadow-md">
                <p className="font-semibold">{label}</p>
                {payload.map((pld: any) => (
                    <p key={pld.dataKey} style={{ color: pld.color }}>
                        {`${pld.dataKey.charAt(0).toUpperCase() + pld.dataKey.slice(1)}: ${currency} ${pld.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};


const Statistics = () => {
  const { sales, loading: salesLoading } = useSales();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { settings } = useAdminSettings();

  const data = useMemo(() => {
    if (salesLoading || expensesLoading) return null;
    return {
        trends: statsUtils.calculateTrends(sales, expenses),
        topProducts: statsUtils.getTopProducts(sales),
        slowMoving: statsUtils.getSlowMovingProducts(sales),
        peakTimes: statsUtils.getPeakTimes(sales),
        expenseCategories: statsUtils.getExpenseCategoryDistribution(expenses),
        forecast: statsUtils.getSalesForecast(sales),
        heatmapData: statsUtils.getSalesForHeatmap(sales),
        healthScore: statsUtils.calculateHealthScore(sales, expenses),
    };
  }, [sales, expenses, salesLoading, expensesLoading]);

  if (!data) {
    return <Spinner />;
  }

  const formatCurrency = (amount: number) => `${settings.currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const PIE_COLORS = ['#4EA8FF', '#34D399', '#F472B6', '#FBBF24', '#A78BFA', '#60A5FA'];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        <h1 className="text-4xl font-bold text-on-surface dark:text-dark-on-surface">Statistics & Insights</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatInsightCard className="lg:col-span-2">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUpIcon /> Performance Trends</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <TrendDisplay title="Today's Sales" {...data.trends.daily} currency={settings.currency}/>
                    <TrendDisplay title="This Week" {...data.trends.weekly} currency={settings.currency}/>
                    <TrendDisplay title="This Month" {...data.trends.monthly} currency={settings.currency}/>
                </div>
                 <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={data.trends.trendChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4EA8FF" stopOpacity={0.8}/><stop offset="95%" stopColor="#4EA8FF" stopOpacity={0}/></linearGradient>
                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F472B6" stopOpacity={0.8}/><stop offset="95%" stopColor="#F472B6" stopOpacity={0}/></linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fill: '#5A6474', fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: '#5A6474', fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip currency={settings.currency}/>} />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Area type="monotone" dataKey="sales" stroke="#4EA8FF" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                        <Area type="monotone" dataKey="expenses" stroke="#F472B6" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                    </AreaChart>
                </ResponsiveContainer>
            </StatInsightCard>
            <StatInsightCard>
                <HealthScoreGuage score={data.healthScore.score} status={data.healthScore.status} />
            </StatInsightCard>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatInsightCard>
                 <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><StarIcon /> Top Selling Products</h2>
                 <div className="space-y-3">
                     {data.topProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-primary w-5">{index + 1}.</span>
                                <p className="font-semibold truncate">{product.name}</p>
                            </div>
                             <div className="text-right">
                                <p className="font-bold">{formatCurrency(product.revenue)}</p>
                                <p className="text-xs text-subtle-text">{product.quantity} sold</p>
                             </div>
                        </div>
                     ))}
                     {data.topProducts.length === 0 && <p className="text-center text-subtle-text py-8">No sales data available.</p>}
                 </div>
            </StatInsightCard>
             <StatInsightCard>
                 <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingDownIcon /> Slow Moving Stock</h2>
                 <div className="space-y-3">
                     {data.slowMoving.slice(0, 5).map((product, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                            <p className="font-semibold truncate">{product.name}</p>
                             <div className="text-right">
                                <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 rounded-full">SLOW</span>
                                <p className="text-xs text-subtle-text mt-1">Last sold: {product.lastSold.toLocaleDateString()}</p>
                             </div>
                        </div>
                     ))}
                     {data.slowMoving.length === 0 && <p className="text-center text-subtle-text py-8">No slow-moving items found. Good job!</p>}
                 </div>
            </StatInsightCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
             <StatInsightCard className="lg:col-span-3">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><PieChartIcon /> Expense Categories</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={data.expenseCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                                const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                return <text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px">{(percent * 100).toFixed(0)}%</text>;
                            }}>
                            {data.expenseCategories.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                    </PieChart>
                </ResponsiveContainer>
            </StatInsightCard>
             <StatInsightCard className="lg:col-span-2">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CpuIcon /> Sales Forecast</h2>
                <div className="h-full flex flex-col justify-around text-center">
                    <div>
                        <p className="text-subtle-text">Tomorrow's Estimated Sales</p>
                        <p className="text-4xl font-bold text-primary">{formatCurrency(data.forecast.nextDay)}</p>
                    </div>
                    <div>
                        <p className="text-subtle-text">Next 7 Days Estimate</p>
                        <p className="text-4xl font-bold text-primary">{formatCurrency(data.forecast.nextWeek)}</p>
                    </div>
                    <p className="text-xs text-subtle-text">Based on a 7-day moving average. For planning purposes only.</p>
                </div>
            </StatInsightCard>
        </div>
        
    </motion.div>
  );
};

export default Statistics;
