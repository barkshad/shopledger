import React, { useState, useMemo } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { Expense } from '../types';
import { useAdminSettings } from '../hooks/useAdminSettings';
import { EditIcon, TrashIcon, SaveIcon, CancelIcon, DownloadIcon, SortAscIcon, SortDescIcon, PackageIcon, ChevronLeftIcon, ChevronRightIcon, CreditCardIcon } from './icons';
import Spinner from './Spinner';
import ConfirmationDialog from './ConfirmationDialog';
import { convertToCSV, downloadCSV } from '../utils/csvUtils';
import { motion, AnimatePresence } from 'framer-motion';

const EXPENSE_CATEGORIES = ["Stock Purchase", "Transport", "Utilities", "Rent", "Salaries", "Miscellaneous"];

interface EditState extends Omit<Expense, 'id'> {
    id: number;
    receiptPhoto?: string;
}

const SummaryStatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
  <div className="bg-surface rounded-xl shadow-subtle p-4 border border-border-color">
    <h3 className="text-sm font-medium text-subtle-text truncate">{title}</h3>
    <p className="mt-1 text-2xl font-semibold text-on-surface">{value}</p>
  </div>
);

type SortableKey = 'name' | 'amount' | 'date' | 'category';

const ExpensesHistory = () => {
  const { expenses, loading, updateExpense, deleteExpense } = useExpenses();
  const { settings } = useAdminSettings();
  
  const [editingExpense, setEditingExpense] = useState<EditState | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showWithReceiptsOnly, setShowWithReceiptsOnly] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey, direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const formatCurrency = (amount: number) => `${settings.currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const openPhotoModal = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setIsPhotoModalOpen(true);
  };

  const closePhotoModal = () => {
    setIsPhotoModalOpen(false);
    setSelectedPhoto(null);
  };

  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start) start.setUTCHours(0, 0, 0, 0);
        if (end) end.setUTCHours(23, 59, 59, 999);

        const matchesSearch = expense.name.toLowerCase().includes(searchTerm.toLowerCase()) || expense.note?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = (!start || expenseDate >= start) && (!end || expenseDate <= end);
        const matchesReceiptFilter = !showWithReceiptsOnly || (showWithReceiptsOnly && !!expense.receiptPhoto);
        const matchesCategory = categoryFilter === 'All' || expense.category === categoryFilter;
        
        return matchesSearch && matchesDate && matchesReceiptFilter && matchesCategory;
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
  }, [expenses, searchTerm, startDate, endDate, sortConfig, showWithReceiptsOnly, categoryFilter]);

  const summaryStats = useMemo(() => {
    const totalCount = filteredAndSortedExpenses.length;
    if (totalCount === 0) return { totalExpenses: 0, avgExpense: 0, highestCategory: 'N/A' };
    
    const totalExpenses = filteredAndSortedExpenses.reduce((sum, s) => sum + s.amount, 0);
    const avgExpense = totalExpenses / totalCount;

    const categoryCounts = filteredAndSortedExpenses.reduce((acc: Record<string, number>, s) => {
        acc[s.category] = (acc[s.category] || 0) + s.amount;
        return acc;
    }, {} as Record<string, number>);

    const highestCategory = Object.keys(categoryCounts).length > 0
        ? Object.entries(categoryCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0][0]
        : 'N/A';
    
    return { totalExpenses, avgExpense, highestCategory };
  }, [filteredAndSortedExpenses]);
  
  const totalPages = Math.ceil(filteredAndSortedExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedExpenses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedExpenses, currentPage]);
  
  const handleSort = (key: SortableKey) => {
    setCurrentPage(1);
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending' }));
  };
  
  const handleEditClick = (expense: Expense) => {
    if (expense.id === undefined) return;
    setEditingExpense({ ...expense, id: expense.id, date: expense.date.split('T')[0] });
  };
  
  const handleCancelEdit = () => setEditingExpense(null);
  
  const handleUpdateExpense = async () => {
    if (!editingExpense) return;
    await updateExpense({ ...editingExpense, date: new Date(editingExpense.date).toISOString() });
    setEditingExpense(null);
  };
  
  const handleDeleteClick = (id: number) => {
    setExpenseToDelete(id);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (expenseToDelete !== null) {
      await deleteExpense(expenseToDelete);
      setExpenseToDelete(null);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (editingExpense) setEditingExpense({ ...editingExpense, [e.target.name]: e.target.value });
  };

  const handleDownloadReport = () => {
    setIsExporting(true);
    const csvData = convertToCSV(filteredAndSortedExpenses.map(({ receiptPhoto, ...rest }) => rest));
    downloadCSV(csvData, `expenses_report_${new Date().toISOString().split('T')[0]}.csv`);
    setTimeout(() => setIsExporting(false), 1000);
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const SortableHeader: React.FC<{ columnKey: SortableKey, title: string }> = ({ columnKey, title }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-subtle-text uppercase tracking-wider cursor-pointer" onClick={() => handleSort(columnKey)}>
        <div className="flex items-center gap-2">{title} {sortConfig.key === columnKey && (sortConfig.direction === 'ascending' ? <SortAscIcon className="h-4 w-4" /> : <SortDescIcon className="h-4 w-4" />)}</div>
    </th>
  );

  if (loading) return <Spinner />;

  return (
    <>
    <ConfirmationDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} onConfirm={confirmDelete} title="Delete Expense" message="Are you sure you want to delete this expense record? This action cannot be undone." confirmText="Delete" />
    <AnimatePresence>
      {isPhotoModalOpen && selectedPhoto && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={closePhotoModal}>
          <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} src={selectedPhoto} alt="Full size receipt" className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </motion.div>
      )}
    </AnimatePresence>
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Expenses History</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SummaryStatCard title="Total Expenses" value={formatCurrency(summaryStats.totalExpenses)} />
          <SummaryStatCard title="Average Expense" value={formatCurrency(summaryStats.avgExpense)} />
          <SummaryStatCard title="Highest Category" value={summaryStats.highestCategory} />
      </div>

      <div className="bg-surface p-4 rounded-xl shadow-subtle border border-border-color flex flex-col md:flex-row gap-4 items-center flex-wrap">
          <input type="text" placeholder="Search..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full md:w-auto md:flex-1 px-4 py-2 bg-background border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <select value={categoryFilter} onChange={e => {setCategoryFilter(e.target.value); setCurrentPage(1)}} className="w-full md:w-auto px-4 py-2 bg-background border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="All">All Categories</option>
            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-2 w-full md:w-auto">
              <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }} className="w-full px-4 py-2 bg-background border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"/>
              <span className="text-subtle-text">-</span>
              <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }} className="w-full px-4 py-2 bg-background border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"/>
          </div>
          <div className="flex items-center">
              <input id="receipt-filter" type="checkbox" checked={showWithReceiptsOnly} onChange={(e) => { setShowWithReceiptsOnly(e.target.checked); setCurrentPage(1); }} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"/>
              <label htmlFor="receipt-filter" className="ml-2 block text-sm text-on-surface">Receipts only</label>
          </div>
          <button onClick={handleDownloadReport} disabled={isExporting} className="w-full md:w-auto bg-primary text-on-primary font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400">
              {isExporting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <DownloadIcon className="h-5 w-5" />}
              {isExporting ? 'Exporting...' : 'Export'}
          </button>
      </div>

      <div className="bg-surface rounded-xl shadow-subtle border border-border-color overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-color">
            <thead className="bg-background/80">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-subtle-text uppercase tracking-wider">Receipt</th>
                <SortableHeader columnKey="name" title="Expense"/>
                <SortableHeader columnKey="category" title="Category"/>
                <SortableHeader columnKey="amount" title="Amount"/>
                <SortableHeader columnKey="date" title="Date"/>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-subtle-text uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border-color">
              {paginatedExpenses.map((expense) => (
                editingExpense?.id === expense.id ? (
                    <tr key={expense.id} className="bg-primary/5">
                        <td className="px-6 py-4">...</td>
                        <td className="px-6 py-4"><input type="text" name="name" value={editingExpense.name} onChange={handleEditChange} className="w-full p-1 border rounded bg-surface border-primary/50"/></td>
                        <td className="px-6 py-4"><select name="category" value={editingExpense.category} onChange={handleEditChange} className="w-full p-1 border rounded bg-surface border-primary/50">{EXPENSE_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></td>
                        <td className="px-6 py-4"><input type="number" name="amount" value={editingExpense.amount} onChange={handleEditChange} className="w-24 p-1 border rounded bg-surface border-primary/50"/></td>
                        <td className="px-6 py-4"><input type="date" name="date" value={editingExpense.date} onChange={handleEditChange} className="w-full p-1 border rounded bg-surface border-primary/50"/></td>
                        <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                                <button onClick={handleUpdateExpense} className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-100"><SaveIcon className="h-5 w-5"/></button>
                                <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-200"><CancelIcon className="h-5 w-5"/></button>
                            </div>
                        </td>
                    </tr>
                ) : (
                    <tr key={expense.id} className="even:bg-background/50 hover:bg-primary/5 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                            {expense.receiptPhoto ? <img src={expense.receiptPhoto} alt={expense.name} className="h-10 w-10 rounded-md object-cover cursor-pointer hover:scale-110 transition-transform" onClick={() => expense.receiptPhoto && openPhotoModal(expense.receiptPhoto)} /> : <div className="h-10 w-10 rounded-md bg-background flex items-center justify-center"><CreditCardIcon className="h-6 w-6 text-subtle-text"/></div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-on-surface">{expense.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-subtle-text">{expense.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-subtle-text font-semibold">{formatCurrency(expense.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-subtle-text">{formatDate(expense.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleEditClick(expense)} className="text-primary hover:text-blue-700 p-2 rounded-full hover:bg-primary/10"><EditIcon className="h-5 w-5"/></button>
                                <button onClick={() => expense.id && handleDeleteClick(expense.id)} className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100"><TrashIcon className="h-5 w-5"/></button>
                            </div>
                        </td>
                    </tr>
                )
              ))}
            </tbody>
          </table>
          {filteredAndSortedExpenses.length === 0 && (
            <div className="text-center p-10 text-subtle-text">
                {expenses.length === 0 ? "You haven't recorded any expenses yet." : "No expenses match the current filters."}
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
    </div>
    </>
  );
};

export default ExpensesHistory;
