import React, { useState, useMemo } from 'react';
import { useSales } from '../../hooks/useSales';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { convertToCSV, downloadCSV } from '../../utils/csvUtils';
import StatCard from '../StatCard';
import { DollarSignIcon, StarIcon, ShoppingCartIcon, FileTextIcon, PrinterIcon } from '../icons';

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';

const ReportsTab: React.FC<{ logAction: (message: string) => void }> = ({ logAction }) => {
    const { sales } = useSales();
    const [period, setPeriod] = useState<ReportPeriod>('weekly');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });

    const reportData = useMemo(() => {
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date(now);

        switch (period) {
            case 'daily':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'weekly':
                startDate.setDate(now.getDate() - now.getDay());
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'monthly':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'custom':
                startDate = customRange.start ? new Date(customRange.start) : new Date(0);
                endDate = customRange.end ? new Date(customRange.end) : new Date();
                break;
        }

        const filteredSales = sales.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate >= startDate && saleDate <= endDate;
        });

        const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
        const totalSales = filteredSales.length;
        const itemCounts = filteredSales.reduce((acc: Record<string, number>, s) => {
            acc[s.itemName] = (acc[s.itemName] || 0) + s.quantity;
            return acc;
        }, {} as Record<string, number>);
        
        const mostSoldItem = Object.keys(itemCounts).length > 0
            ? Object.entries(itemCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0][0]
            : 'N/A';
        
        // Chart data - group by day
        const salesByDay = filteredSales.reduce((acc, sale) => {
            const day = new Date(sale.date).toLocaleDateString();
            acc[day] = (acc[day] || 0) + sale.total;
            return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(salesByDay).map(([name, sales]) => ({ name, sales }));

        return { sales: filteredSales, totalRevenue, totalSales, mostSoldItem, chartData };
    }, [sales, period, customRange]);

    const handleExportCSV = () => {
        downloadCSV(convertToCSV(reportData.sales), `report-${period}.csv`);
        logAction(`Exported ${period} report as CSV.`);
    };

    const handlePrint = () => {
        logAction(`Printed ${period} report.`);
        window.print();
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Reports & Analytics</h2>
            <div className="flex flex-wrap items-center gap-4">
                <select value={period} onChange={e => setPeriod(e.target.value as ReportPeriod)} className="px-3 py-2 bg-background border border-border-color rounded-lg">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                </select>
                {period === 'custom' && (
                    <div className="flex items-center gap-2">
                        <input type="date" value={customRange.start} onChange={e => setCustomRange(r => ({ ...r, start: e.target.value }))} className="px-3 py-2 bg-background border border-border-color rounded-lg"/>
                        <span>to</span>
                        <input type="date" value={customRange.end} onChange={e => setCustomRange(r => ({ ...r, end: e.target.value }))} className="px-3 py-2 bg-background border border-border-color rounded-lg"/>
                    </div>
                )}
                <div className="flex-grow"></div>
                <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg"><FileTextIcon className="h-5 w-5"/> Export CSV</button>
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg"><PrinterIcon className="h-5 w-5"/> Print</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total Revenue" value={`KSh ${reportData.totalRevenue.toFixed(2)}`} icon={<DollarSignIcon className="w-6 h-6"/>} />
                <StatCard title="Total Sales" value={reportData.totalSales.toString()} icon={<ShoppingCartIcon className="w-6 h-6"/>} />
                <StatCard title="Top Item" value={reportData.mostSoldItem} icon={<StarIcon className="w-6 h-6"/>} />
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-4">Sales Chart</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `KSh ${value.toFixed(2)}`} />
                        <Bar dataKey="sales" fill="#3B82F6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ReportsTab;
