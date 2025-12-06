
import React, { useMemo, useState } from 'react';
import { useSales } from '../hooks/useSales';
import { useAdminSettings } from '../hooks/useAdminSettings';
import { Sale } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { getStartOfWeek, getEndOfWeek } from '../utils/dateUtils';
import { CalendarIcon, ChevronDownIcon, ChevronUpIcon, ShoppingBasketIcon, DollarSignIcon, CreditCardIcon, PackageIcon } from './icons';
import Spinner from './Spinner';

interface WeeklySummary {
    weekId: string;
    label: string;
    totalRevenue: number;
    totalCount: number;
    topItem: string;
    topPayment: string;
    sales: Sale[];
}

const MotionDiv = motion.div as any;

const WeeklySales = () => {
    const { sales, loading } = useSales();
    const { settings } = useAdminSettings();
    const [expandedWeekId, setExpandedWeekId] = useState<string | null>(null);

    const weeklyData = useMemo(() => {
        if (!sales.length) return [];

        const groups: Record<string, Sale[]> = {};

        sales.forEach(sale => {
            const date = new Date(sale.date);
            const startOfWeek = getStartOfWeek(date);
            const weekId = startOfWeek.toISOString().split('T')[0]; // Use Monday's date as ID
            
            if (!groups[weekId]) {
                groups[weekId] = [];
            }
            groups[weekId].push(sale);
        });

        // Convert groups to array and sort by date (newest first)
        const summaries: WeeklySummary[] = Object.entries(groups).map(([weekId, weekSales]) => {
            const startDate = new Date(weekId);
            const endDate = getEndOfWeek(startDate);
            
            const label = `Week of ${startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
            
            const totalRevenue = weekSales.reduce((sum, s) => sum + s.total, 0);
            
            // Calculate Top Item
            const itemCounts: Record<string, number> = {};
            weekSales.forEach(s => { itemCounts[s.itemName] = (itemCounts[s.itemName] || 0) + s.quantity });
            const topItem = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

            // Calculate Top Payment
            const paymentCounts: Record<string, number> = {};
            weekSales.forEach(s => { 
                const method = s.paymentMethod || 'Cash';
                paymentCounts[method] = (paymentCounts[method] || 0) + 1; 
            });
            const topPayment = Object.entries(paymentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

            // Sort individual sales by date desc
            weekSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            return {
                weekId,
                label,
                totalRevenue,
                totalCount: weekSales.length,
                topItem,
                topPayment,
                sales: weekSales
            };
        });

        return summaries.sort((a, b) => new Date(b.weekId).getTime() - new Date(a.weekId).getTime());
    }, [sales]);

    const formatCurrency = (val: number) => `${settings.currency} ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const toggleWeek = (id: string) => {
        setExpandedWeekId(expandedWeekId === id ? null : id);
    };

    if (loading) return <Spinner />;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Weekly Sales</h1>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {weeklyData.length} Weeks Recorded
                </div>
            </div>

            {weeklyData.length === 0 ? (
                <div className="text-center py-20 bg-surface dark:bg-dark-surface rounded-2xl border border-border-color">
                    <p className="text-lg text-subtle-text">No sales data available to group.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {weeklyData.map((week) => (
                        <MotionDiv
                            key={week.weekId}
                            layout
                            className="bg-surface dark:bg-dark-surface rounded-2xl shadow-soft border border-border-color dark:border-dark-border-color overflow-hidden"
                        >
                            <div 
                                onClick={() => toggleWeek(week.weekId)}
                                className="p-6 cursor-pointer hover:bg-background/50 transition-colors"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-on-surface dark:text-dark-on-surface flex items-center gap-2">
                                            {week.label}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-subtle-text">
                                            <span className="flex items-center gap-1"><ShoppingBasketIcon className="h-4 w-4"/> {week.totalCount} Sales</span>
                                            <span className="flex items-center gap-1"><PackageIcon className="h-4 w-4"/> Top: {week.topItem}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-6">
                                        <div className="text-right">
                                            <p className="text-xs text-subtle-text uppercase font-semibold">Total Revenue</p>
                                            <p className="text-xl font-bold text-primary">{formatCurrency(week.totalRevenue)}</p>
                                        </div>
                                        {expandedWeekId === week.weekId ? <ChevronUpIcon className="h-6 w-6 text-subtle-text"/> : <ChevronDownIcon className="h-6 w-6 text-subtle-text"/>}
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedWeekId === week.weekId && (
                                    <MotionDiv
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-border-color dark:border-dark-border-color bg-background/30"
                                    >
                                        <div className="p-4 space-y-3">
                                            {week.sales.map((sale) => (
                                                <div key={sale.id} className="bg-surface dark:bg-dark-surface p-4 rounded-xl flex items-center justify-between shadow-sm border border-border-color/50">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                            {sale.quantity}x
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-on-surface dark:text-dark-on-surface">{sale.itemName}</p>
                                                            <div className="flex items-center gap-2 text-xs text-subtle-text mt-0.5">
                                                                <span>{new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                                <span>•</span>
                                                                <span className="flex items-center gap-1"><CreditCardIcon className="h-3 w-3"/> {sale.paymentMethod || 'Cash'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-on-surface dark:text-dark-on-surface">{formatCurrency(sale.total)}</p>
                                                        <p className="text-xs text-subtle-text">{formatCurrency(sale.price)}/ea</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-4 bg-primary/5 text-center">
                                            <button className="text-primary font-semibold text-sm hover:underline">Export Weekly Report (Coming Soon)</button>
                                        </div>
                                    </MotionDiv>
                                )}
                            </AnimatePresence>
                        </MotionDiv>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WeeklySales;
