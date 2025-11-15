import { Sale, Expense } from '../types';
import {
  getStartOfDay, getEndOfDay, getStartOfWeek, getEndOfWeek, getStartOfMonth, getEndOfMonth,
  getStartOfYesterday, getEndOfYesterday, getStartOfLastWeek, getEndOfLastWeek, getStartOfLastMonth, getEndOfLastMonth
} from './dateUtils';

// --- Trend Analysis ---
const calculateTotal = (items: (Sale | Expense)[], startDate: Date, endDate: Date): number => {
  return items
    .filter(item => {
      const itemDate = new Date('total' in item ? item.date : item.date);
      return itemDate >= startDate && itemDate <= endDate;
    })
    .reduce((sum, item) => sum + ('total' in item ? item.total : item.amount), 0);
};

const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const calculateTrends = (sales: Sale[], expenses: Expense[]) => {
  const now = new Date();

  // Daily
  const todaySales = calculateTotal(sales, getStartOfDay(now), getEndOfDay(now));
  const yesterdaySales = calculateTotal(sales, getStartOfYesterday(now), getEndOfYesterday(now));
  const dailySalesChange = calculateChange(todaySales, yesterdaySales);

  // Weekly
  const thisWeekSales = calculateTotal(sales, getStartOfWeek(now), getEndOfWeek(now));
  const lastWeekSales = calculateTotal(sales, getStartOfLastWeek(now), getEndOfLastWeek(now));
  const weeklySalesChange = calculateChange(thisWeekSales, lastWeekSales);

  // Monthly
  const thisMonthSales = calculateTotal(sales, getStartOfMonth(now), getEndOfMonth(now));
  const lastMonthSales = calculateTotal(sales, getStartOfLastMonth(now), getEndOfLastMonth(now));
  const monthlySalesChange = calculateChange(thisMonthSales, lastMonthSales);
  
  // Chart Data (Last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  }).reverse();

  const trendChartData = last30Days.map(date => {
    const dayStart = getStartOfDay(date);
    const dayEnd = getEndOfDay(date);
    return {
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sales: calculateTotal(sales, dayStart, dayEnd),
      expenses: calculateTotal(expenses, dayStart, dayEnd),
    };
  });


  return {
    daily: { current: todaySales, previous: yesterdaySales, change: dailySalesChange },
    weekly: { current: thisWeekSales, previous: lastWeekSales, change: weeklySalesChange },
    monthly: { current: thisMonthSales, previous: lastMonthSales, change: monthlySalesChange },
    trendChartData
  };
};

// --- Product Insights ---
export const getTopProducts = (sales: Sale[]) => {
    const productStats: { [key: string]: { quantity: number; revenue: number } } = {};
    sales.forEach(sale => {
        if (!productStats[sale.itemName]) {
            productStats[sale.itemName] = { quantity: 0, revenue: 0 };
        }
        productStats[sale.itemName].quantity += sale.quantity;
        productStats[sale.itemName].revenue += sale.total;
    });

    return Object.entries(productStats)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
};

export const getSlowMovingProducts = (sales: Sale[]) => {
    const allProducts: { [key: string]: { lastSold: Date } } = {};
    sales.forEach(sale => {
        const saleDate = new Date(sale.date);
        if (!allProducts[sale.itemName] || saleDate > allProducts[sale.itemName].lastSold) {
            allProducts[sale.itemName] = { lastSold: saleDate };
        }
    });
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
    now.setDate(now.getDate() + 7); // Reset date
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    return Object.entries(allProducts)
        .map(([name, data]) => ({ name, ...data}))
        .filter(p => p.lastSold < thirtyDaysAgo)
        .sort((a, b) => a.lastSold.getTime() - b.lastSold.getTime());
};

// --- Peak Times ---
export const getPeakTimes = (sales: Sale[]) => {
    const hourlySales: number[] = Array(24).fill(0);
    const dailySales: number[] = Array(7).fill(0);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    sales.forEach(sale => {
        const date = new Date(sale.date);
        hourlySales[date.getHours()] += sale.total;
        dailySales[date.getDay()] += sale.total;
    });
    
    const busiestHour = hourlySales.indexOf(Math.max(...hourlySales));
    const busiestDayIndex = dailySales.indexOf(Math.max(...dailySales));
    const slowestDayIndex = dailySales.indexOf(Math.min(...dailySales));
    
    const hourlyChartData = hourlySales.map((sales, hour) => ({ name: `${hour}:00`, sales }));

    return {
        busiestHour: `${busiestHour}:00 - ${busiestHour + 1}:00`,
        busiestDay: dayNames[busiestDayIndex],
        slowestDay: dayNames[slowestDayIndex],
        hourlyChartData,
    };
};


// --- Expense Analysis ---
export const getExpenseCategoryDistribution = (expenses: Expense[]) => {
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => b.value - a.value);
};


// --- Forecasting ---
export const getSalesForecast = (sales: Sale[]) => {
    if (sales.length < 7) return { nextDay: 0, nextWeek: 0 };

    const salesByDay: { [key: string]: number } = {};
    sales.forEach(sale => {
        const day = new Date(sale.date).toISOString().split('T')[0];
        salesByDay[day] = (salesByDay[day] || 0) + sale.total;
    });

    const dailySales = Object.values(salesByDay);
    if(dailySales.length < 7) return { nextDay: 0, nextWeek: 0 };
    
    const last7Days = dailySales.slice(-7);
    const movingAverage = last7Days.reduce((sum, val) => sum + val, 0) / 7;

    return {
        nextDay: movingAverage,
        nextWeek: movingAverage * 7,
    };
};


// --- Sales Heatmap ---
export const getSalesForHeatmap = (sales: Sale[]) => {
    const salesByDate: { [key: string]: number } = {};
    sales.forEach(sale => {
        const dateStr = new Date(sale.date).toISOString().split('T')[0];
        salesByDate[dateStr] = (salesByDate[dateStr] || 0) + sale.total;
    });
    return salesByDate;
};


// --- Shop Health Score ---
export const calculateHealthScore = (sales: Sale[], expenses: Expense[]) => {
  if (sales.length === 0) return { score: 0, status: 'No Data' };
  
  const now = new Date();
  
  // 1. Sales Growth (30%)
  const thisWeekSales = calculateTotal(sales, getStartOfWeek(now), getEndOfWeek(now));
  const lastWeekSales = calculateTotal(sales, getStartOfLastWeek(now), getEndOfLastWeek(now));
  const growth = calculateChange(thisWeekSales, lastWeekSales);
  const growthScore = Math.max(0, Math.min(100, 50 + growth)); // 50 is baseline, caps at 100

  // 2. Profitability (40%)
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  const profitScore = Math.max(0, Math.min(100, profitMargin * 2.5)); // 40% margin = 100 score

  // 3. Activity/Consistency (30%)
  const salesByDay = new Set(sales.map(s => new Date(s.date).toISOString().split('T')[0]));
  const activeDaysInLast30 = Array.from(salesByDay).filter(d => new Date(d) > new Date(new Date().setDate(now.getDate() - 30))).length;
  const activityScore = Math.min(100, (activeDaysInLast30 / 30) * 120); // 25 active days = 100 score

  const score = Math.round(
    growthScore * 0.3 +
    profitScore * 0.4 +
    activityScore * 0.3
  );

  let status = "Stable";
  if (score >= 80) status = "🏆 Excellent & Growing";
  else if (score >= 60) status = "✅ Good & Healthy";
  else if (score >= 40) status = "⚠️ Needs Attention";
  else status = "🚨 Critical Condition";

  return { score, status };
};
