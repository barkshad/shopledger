
import React, { useState, useMemo } from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { useToast } from '../../hooks/useToast';
import { Expense } from '../../types';
import Spinner from '../Spinner';
import ConfirmationDialog from '../ConfirmationDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { EditIcon, TrashIcon, SaveIcon, CancelIcon, CreditCardIcon, InfoIcon, SortAscIcon, SortDescIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons';

type SortableKey = 'name' | 'amount' | 'date' | 'category';

const MotionDiv = motion.div as any;

const ExpensesManagementTab: React.FC<{ logAction: (message: string) => void }> = ({ logAction }) => {
    const { expenses, loading, updateExpense, deleteExpense } = useExpenses();
    const { addToast } = useToast();
    
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [expensesToDelete, setExpensesToDelete] = useState<number[]>([]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [amountRange, setAmountRange] = useState({ min: '', max: '' });
    const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
    
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const filteredAndSortedExpenses = useMemo(() => {
        let filtered = expenses
            .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(e => amountRange.min === '' || e.amount >= Number(amountRange.min))
            .filter(e => amountRange.max === '' || e.amount <= Number(amountRange.max));

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
        return filtered;
    }, [expenses, searchTerm, amountRange, sortConfig]);
    
    const paginatedExpenses = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedExpenses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAndSortedExpenses, currentPage]);
    const totalPages = Math.ceil(filteredAndSortedExpenses.length / ITEMS_PER_PAGE);

    const handleSort = (key: SortableKey) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending' }));
    };

    const handleSelect = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(paginatedExpenses.map(s => s.id!)));
        } else {
            setSelectedIds(new Set());
        }
    };
    
    const handleUpdateExpense = async () => {
        if (!editingExpense) return;
        await updateExpense(editingExpense);
        addToast(`Expense #${editingExpense.id} updated.`, 'success');
        logAction(`Updated expense: ${editingExpense.name}`);
        setEditingExpense(null);
    };

    const handleDeleteClick = (ids: number[]) => {
        if (ids.length === 0) return;
        setExpensesToDelete(ids);
        setDialogOpen(true);
    };

    const confirmDelete = async () => {
        for (const id of expensesToDelete) {
            await deleteExpense(id);
        }
        addToast(`${expensesToDelete.length} expense(s) deleted.`, 'success');
        logAction(`Deleted ${expensesToDelete.length} expense(s).`);
        setSelectedIds(new Set());
        setExpensesToDelete([]);
    };
    
    const handleViewDetails = (expense: Expense) => {
        setViewingExpense(expense);
        setIsDetailsModalOpen(true);
    };
    
    const handleSaveNotes = async () => {
        if(!viewingExpense) return;
        await updateExpense(viewingExpense);
        addToast('Notes saved successfully!', 'success');
        logAction(`Updated notes for expense #${viewingExpense.id}`);
    };

    if (loading) return <Spinner />;

    return (
        <div className="space-y-4">
             <ConfirmationDialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onConfirm={confirmDelete}
                title={`Delete ${expensesToDelete.length} Expense(s)`}
                message={`Are you sure you want to delete ${expensesToDelete.length} expense record(s)? This action cannot be undone.`}
            />
            <AnimatePresence>
                {isDetailsModalOpen && viewingExpense && (
                    <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setIsDetailsModalOpen(false)}>
                        <MotionDiv initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-surface rounded-xl shadow-xl w-full max-w-lg" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
                            <div className="p-6 space-y-4">
                               <h3 className="text-xl font-bold">{viewingExpense.name}</h3>
                               {viewingExpense.receiptPhoto && <img src={viewingExpense.receiptPhoto} alt={viewingExpense.name} className="w-full h-64 object-cover rounded-lg" />}
                               <div className="grid grid-cols-2 gap-4 text-sm">
                                   <p><strong className="text-subtle-text">Date:</strong> {new Date(viewingExpense.date).toLocaleString()}</p>
                                   <p><strong className="text-subtle-text">Category:</strong> {viewingExpense.category}</p>
                                   <p><strong className="text-subtle-text">Amount:</strong> KSh {viewingExpense.amount.toFixed(2)}</p>
                               </div>
                               <div>
                                   <label htmlFor="notes" className="block text-sm font-medium text-on-surface mb-1">Notes</label>
                                   <textarea id="notes" rows={3} className="w-full p-2 bg-background border border-border-color rounded-md" value={viewingExpense.note || ''} onChange={e => setViewingExpense(v => v ? {...v, note: e.target.value} : null)}></textarea>
                               </div>
                               <div className="flex justify-end gap-3">
                                   <button onClick={handleSaveNotes} className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold hover:bg-blue-600">Save Notes</button>
                                   <button onClick={() => setIsDetailsModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold">Close</button>
                               </div>
                            </div>
                        </MotionDiv>
                    </MotionDiv>
                )}
            </AnimatePresence>

            <h2 className="text-2xl font-bold">Expenses Management</h2>
            <div className="flex flex-col md:flex-row gap-4">
                <input type="text" placeholder="Search expense..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-1/3 px-3 py-2 bg-background border border-border-color rounded-lg"/>
                <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min amount" value={amountRange.min} onChange={e => setAmountRange(p => ({...p, min: e.target.value}))} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg"/>
                    <span>-</span>
                    <input type="number" placeholder="Max amount" value={amountRange.max} onChange={e => setAmountRange(p => ({...p, max: e.target.value}))} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg"/>
                </div>
                <button disabled={selectedIds.size === 0} onClick={() => handleDeleteClick(Array.from(selectedIds))} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg disabled:bg-gray-400">Delete Selected</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-background/80">
                        <tr>
                            <th className="px-4 py-3"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.size > 0 && selectedIds.size === paginatedExpenses.length} /></th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Expense</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase cursor-pointer" onClick={() => handleSort('category')}>Category {sortConfig.key === 'category' && <SortIcon direction={sortConfig.direction}/>}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase cursor-pointer" onClick={() => handleSort('amount')}>Amount {sortConfig.key === 'amount' && <SortIcon direction={sortConfig.direction}/>}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase cursor-pointer" onClick={() => handleSort('date')}>Date {sortConfig.key === 'date' && <SortIcon direction={sortConfig.direction}/>}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-border-color">
                        {paginatedExpenses.map(expense => (
                            editingExpense?.id === expense.id ? (
                                <tr key={expense.id}>
                                    <td></td>
                                    <td className="px-6 py-4"><input value={editingExpense.name} onChange={e => setEditingExpense(s => s ? {...s, name: e.target.value} : null)} className="p-1 border rounded w-full"/></td>
                                    <td className="px-6 py-4"><input value={editingExpense.category} onChange={e => setEditingExpense(s => s ? {...s, category: e.target.value} : null)} className="p-1 border rounded w-full"/></td>
                                    <td className="px-6 py-4"><input type="number" value={editingExpense.amount} onChange={e => setEditingExpense(s => s ? {...s, amount: Number(e.target.value)} : null)} className="p-1 border rounded w-24"/></td>
                                    <td className="px-6 py-4"><input type="date" value={new Date(editingExpense.date).toISOString().split('T')[0]} onChange={e => setEditingExpense(s => s ? {...s, date: new Date(e.target.value).toISOString()}: null)} className="p-1 border rounded"/></td>
                                    <td className="px-6 py-4 flex gap-2"><button onClick={handleUpdateExpense}><SaveIcon className="h-5 w-5 text-green-500"/></button><button onClick={() => setEditingExpense(null)}><CancelIcon className="h-5 w-5 text-gray-500"/></button></td>
                                </tr>
                            ) : (
                                <tr key={expense.id}>
                                    <td className="px-4 py-4"><input type="checkbox" checked={selectedIds.has(expense.id!)} onChange={() => handleSelect(expense.id!)} /></td>
                                    <td className="px-6 py-4 flex items-center gap-3"><div className="w-10 h-10 rounded bg-background flex-shrink-0 flex items-center justify-center">{expense.receiptPhoto ? <img src={expense.receiptPhoto} className="w-full h-full object-cover rounded"/> : <CreditCardIcon className="h-5 w-5 text-subtle-text"/>}</div> {expense.name}</td>
                                    <td className="px-6 py-4">{expense.category}</td>
                                    <td className="px-6 py-4">KSh {expense.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4">{new Date(expense.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button onClick={() => handleViewDetails(expense)}><InfoIcon className="h-5 w-5 text-blue-500"/></button>
                                        <button onClick={() => setEditingExpense(expense)}><EditIcon className="h-5 w-5 text-primary"/></button>
                                        <button onClick={() => handleDeleteClick([expense.id!])}><TrashIcon className="h-5 w-5 text-red-500"/></button>
                                    </td>
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>
            </div>
             {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-color rounded-lg text-sm font-semibold hover:bg-background disabled:opacity-50">
                        <ChevronLeftIcon className="h-4 w-4"/> Previous
                    </button>
                    <span className="text-sm text-subtle-text">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-color rounded-lg text-sm font-semibold hover:bg-background disabled:opacity-50">
                        Next <ChevronRightIcon className="h-4 w-4"/>
                    </button>
                </div>
            )}
        </div>
    );
};
const SortIcon: React.FC<{direction: 'ascending' | 'descending'}> = ({direction}) => direction === 'ascending' ? <SortAscIcon className="inline h-4 w-4"/> : <SortDescIcon className="inline h-4 w-4"/>;
export default ExpensesManagementTab;
