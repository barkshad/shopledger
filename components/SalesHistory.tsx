
import React, { useState, useMemo } from 'react';
import { useSales } from '../hooks/useSales';
import { Sale } from '../types';
import { EditIcon, TrashIcon, SaveIcon, CancelIcon, DownloadIcon, SortAscIcon, SortDescIcon, PackageIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import Spinner from './Spinner';
import ConfirmationDialog from './ConfirmationDialog';
import { convertToCSV, downloadCSV } from '../utils/csvUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EditState extends Omit<Sale, 'id' | 'total'> {
    id: number;
}

const SummaryStatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
  <div className="bg-surface rounded-xl shadow-subtle p-4 border border-border-color">
    <h3 className="text-sm font-medium text-subtle-text truncate">{title}</h3>
    <p className="mt-1 text-2xl font-semibold text-on-surface">{value}</p>
  </div>
);

type SortableKey = 'itemName' | 'total' | 'date';

const SalesHistory = () => {
  const { sales, loading, updateSale, deleteSale } = useSales();
  
  const [editingSale, setEditingSale] = useState<EditState | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey, direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredAndSortedSales = useMemo(() => {
    let filtered = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start) start.setUTCHours(0, 0, 0, 0);
        if (end) end.setUTCHours(23, 59, 59, 999);

        const matchesSearch = sale.itemName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = (!start || saleDate >= start) && (!end || saleDate <= end);
        
        return matchesSearch && matchesDate;
    });

    if (sortConfig.key) {
        filtered.sort((a, b) => {
            let aValue: string | number = a[sortConfig.key];
            let bValue: string | number = b[sortConfig.key];

            if (sortConfig.key === 'date') {
                aValue = new Date(a.date).getTime();
                bValue = new Date(b.date).getTime();
            }

            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }

    return filtered;
  }, [sales, searchTerm, startDate, endDate, sortConfig]);

  const summaryStats = useMemo(() => {
    const totalSalesCount = filteredAndSortedSales.length;
    if (totalSalesCount === 0) return { totalSales: 0, totalRevenue: 0, avgSale: 0, mostSoldItem: 'N/A' };
    
    const totalRevenue = filteredAndSortedSales.reduce((sum, s) => sum + s.total, 0);
    const avgSale = totalRevenue / totalSalesCount;

    const itemCounts = filteredAndSortedSales.reduce((acc, s) => {
        acc[s.itemName] = (acc[s.itemName] || 0) + s.quantity;
        return acc;
    }, {} as Record<string, number>);

    // FIX: The destructuring in the sort callback was causing a type error. Using direct array access to ensure correct type inference.
    const mostSoldItem = Object.keys(itemCounts).length > 0
        ? Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0][0]
        : 'N/A';
    
    return { totalSales: totalSalesCount, totalRevenue, avgSale, mostSoldItem };
  }, [filteredAndSortedSales]);
  
  const chartData = useMemo(() => {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
      }).reverse();

      const salesByDay = sales.reduce((acc, sale) => {
          const dayKey = new Date(sale.date).toISOString().split('T')[0];
          if (last7Days.includes(dayKey)) {
              acc[dayKey] = (acc[dayKey] || 0) + sale.total;
          }
          return acc;
      }, {} as Record<string, number>);

      return last7Days.map(date => ({
          name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          sales: salesByDay[date] || 0,
      }));
  }, [sales]);

  const totalPages = Math.ceil(filteredAndSortedSales.length / ITEMS_PER_PAGE);
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedSales, currentPage]);
  
  const handleSort = (key: SortableKey) => {
    setCurrentPage(1);
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };
  
  const handleEditClick = (sale: Sale) => sale.id && setEditingSale({ ...sale, date: sale.date.split('T')[0] });
  const handleCancelEdit = () => setEditingSale(null);
  
  const handleUpdateSale = async () => {
    if (!editingSale) return;
    const { id, itemName, quantity, price, date } = editingSale;
    await updateSale({
      id,
      itemName,
      quantity: +quantity,
      price: +price,
      total: +quantity * +price,
      date: new Date(date).toISOString(),
    });
    setEditingSale(null);
  };
  
  const handleDeleteClick = (id: number) => {
    setSaleToDelete(id);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (saleToDelete !== null) {
      await deleteSale(saleToDelete);
      setSaleToDelete(null);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingSale) setEditingSale({ ...editingSale, [e.target.name]: e.target.value });
  };

  const handleDownloadReport = () => {
    setIsExporting(true);
    const csvData = convertToCSV(filteredAndSortedSales);
    downloadCSV(csvData, `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    setTimeout(() => setIsExporting(false), 1000);
  };

  const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const SortableHeader: React.FC<{ columnKey: SortableKey, title: string }> = ({ columnKey, title }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-subtle-text uppercase tracking-wider cursor-pointer" onClick={() => handleSort(columnKey)}>
        <div className="flex items-center gap-2">
            {title}
            {sortConfig.key === columnKey && (
                sortConfig.direction === 'ascending' ? <SortAscIcon className="h-4 w-4" /> : <SortDescIcon className="h-4 w-4" />
            )}
        </div>
    </th>
  );

  if (loading) return <Spinner />;

  return (
    <>
    <ConfirmationDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Sale"
        message="Are you sure you want to delete this sale record? This action cannot be undone."
        confirmText="Delete"
    />
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Sales History & Analysis</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryStatCard title="Total Sales" value={summaryStats.totalSales.toLocaleString()} />
          <SummaryStatCard title="Total Revenue" value={formatCurrency(summaryStats.totalRevenue)} />
          <SummaryStatCard title="Average Sale Value" value={formatCurrency(summaryStats.avgSale)} />
          <SummaryStatCard title="Most Sold Item" value={summaryStats.mostSoldItem} />
      </div>

      <div className="bg-surface p-4 rounded-xl shadow-subtle border border-border-color flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Search by item name..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full md:w-1/3 px-4 py-2 bg-background border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex items-center gap-2 w-full md:w-auto">
              <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }} className="w-full px-4 py-2 bg-background border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"/>
              <span className="text-subtle-text">-</span>
              <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }} className="w-full px-4 py-2 bg-background border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"/>
          </div>
          <button
            onClick={handleDownloadReport}
            disabled={isExporting}
            className="w-full md:w-auto ml-auto bg-primary text-on-primary font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
              {isExporting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <DownloadIcon className="h-5 w-5" />}
              {isExporting ? 'Exporting...' : 'Download Report'}
          </button>
      </div>

      <div className="bg-surface rounded-xl shadow-subtle border border-border-color overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-color">
            <thead className="bg-background/80 backdrop-blur-sm sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-subtle-text uppercase tracking-wider">Product</th>
                <SortableHeader columnKey="itemName" title="Item"/>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-subtle-text uppercase tracking-wider">Qty</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-subtle-text uppercase tracking-wider">Price</th>
                <SortableHeader columnKey="total" title="Total"/>
                <SortableHeader columnKey="date" title="Date"/>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-subtle-text uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border-color">
              {paginatedSales.map((sale) => (
                editingSale?.id === sale.id ? (
                    <tr key={sale.id} className="bg-primary/5">
                        <td className="px-6 py-4 whitespace-nowrap"><PackageIcon className="h-6 w-6 text-subtle-text"/></td>
                        <td className="px-6 py-4"><input type="text" name="itemName" value={editingSale.itemName} onChange={handleEditChange} className="w-full p-1 border rounded bg-surface border-primary/50"/></td>
                        <td className="px-6 py-4"><input type="number" name="quantity" value={editingSale.quantity} onChange={handleEditChange} className="w-20 p-1 border rounded bg-surface border-primary/50"/></td>
                        <td className="px-6 py-4"><input type="number" name="price" value={editingSale.price} onChange={handleEditChange} className="w-24 p-1 border rounded bg-surface border-primary/50"/></td>
                        <td className="px-6 py-4 font-medium">{formatCurrency(editingSale.quantity * editingSale.price)}</td>
                        <td className="px-6 py-4"><input type="date" name="date" value={editingSale.date} onChange={handleEditChange} className="w-full p-1 border rounded bg-surface border-primary/50"/></td>
                        <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                                <button onClick={handleUpdateSale} className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-100"><SaveIcon className="h-5 w-5"/></button>
                                <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-200"><CancelIcon className="h-5 w-5"/></button>
                            </div>
                        </td>
                    </tr>
                ) : (
                    <tr key={sale.id} className="even:bg-background/50 hover:bg-primary/5 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap"><PackageIcon className="h-6 w-6 text-subtle-text"/></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-on-surface relative">
                            {sale.itemName}
                            <div className="absolute hidden group-hover:block bg-slate-800 text-white text-xs rounded py-1 px-2 z-20 -top-8 left-0 shadow-lg whitespace-nowrap">
                                <p><strong>Total:</strong> {formatCurrency(sale.total)}</p>
                                <p><strong>Date:</strong> {formatDate(sale.date)}</p>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-subtle-text">{sale.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-subtle-text">{formatCurrency(sale.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-subtle-text font-semibold">{formatCurrency(sale.total)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-subtle-text">{formatDate(sale.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleEditClick(sale)} className="text-primary hover:text-blue-700 p-2 rounded-full hover:bg-primary/10"><EditIcon className="h-5 w-5"/></button>
                                <button onClick={() => handleDeleteClick(sale.id!)} className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100"><TrashIcon className="h-5 w-5"/></button>
                            </div>
                        </td>
                    </tr>
                )
              ))}
            </tbody>
          </table>
          {filteredAndSortedSales.length === 0 && (
            <div className="text-center p-10 text-subtle-text">
                {sales.length === 0 ? "You haven't recorded any sales yet." : "No sales match the current filters."}
            </div>
          )}
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-color rounded-lg text-sm font-semibold hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronLeftIcon className="h-4 w-4"/> Previous
          </button>
          <span className="text-sm text-subtle-text">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-color rounded-lg text-sm font-semibold hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed">
            Next <ChevronRightIcon className="h-4 w-4"/>
          </button>
        </div>
      )}

      <div className="bg-surface rounded-xl shadow-subtle p-6 border border-border-color mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Sales Activity (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(value) => `KSh ${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}
                  formatter={(value: number) => [formatCurrency(value), 'Sales']}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}/>
                <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    </>
  );
};

export default SalesHistory;