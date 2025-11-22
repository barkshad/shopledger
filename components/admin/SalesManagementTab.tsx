
import React, { useState, useMemo } from 'react';
import { useSales } from '../../hooks/useSales';
import { useToast } from '../../hooks/useToast';
import { Sale } from '../../types';
import Spinner from '../Spinner';
import ConfirmationDialog from '../ConfirmationDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { EditIcon, TrashIcon, SaveIcon, CancelIcon, PackageIcon, InfoIcon, SortAscIcon, SortDescIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons';

type SortableKey = 'itemName' | 'total' | 'date' | 'paymentMethod';

const SalesManagementTab: React.FC<{ logAction: (message: string) => void }> = ({ logAction }) => {
    const { sales, loading, updateSale, deleteSale } = useSales();
    const { addToast } = useToast();
    
    const [editingSale, setEditingSale] = useState<Sale | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [salesToDelete, setSalesToDelete] = useState<number[]>([]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
    
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [viewingSale, setViewingSale] = useState<Sale | null>(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;


    const filteredAndSortedSales = useMemo(() => {
        let filtered = sales
            .filter(s => s.itemName.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(s => priceRange.min === '' || s.total >= Number(priceRange.min))
            .filter(s => priceRange.max === '' || s.total <= Number(priceRange.max));

        filtered.sort((a, b) => {
            if (sortConfig.key === 'date') {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
            }

            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            // Handle Numeric Sorting
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
            }

            // Handle String Sorting (Case Insensitive)
            const strA = String(aValue || '').toLowerCase();
            const strB = String(bValue || '').toLowerCase();
            
            return sortConfig.direction === 'ascending'
                ? strA.localeCompare(strB)
                : strB.localeCompare(strA);
        });
        return filtered;
    }, [sales, searchTerm, priceRange, sortConfig]);
    
    const paginatedSales = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAndSortedSales, currentPage]);
    const totalPages = Math.ceil(filteredAndSortedSales.length / ITEMS_PER_PAGE);

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
            setSelectedIds(new Set(paginatedSales.map(s => s.id!)));
        } else {
            setSelectedIds(new Set());
        }
    };
    
    const handleUpdateSale = async () => {
        if (!editingSale) return;
        const saleToUpdate: Sale = {
            ...editingSale,
            total: editingSale.quantity * editingSale.price,
        };
        await updateSale(saleToUpdate);
        addToast(`Sale #${editingSale.id} updated.`, 'success');
        logAction(`Updated sale: ${editingSale.itemName}`);
        setEditingSale(null);
    };

    const handleDeleteClick = (ids: number[]) => {
        if (ids.length === 0) return;
        setSalesToDelete(ids);
        setDialogOpen(true);
    };

    const confirmDelete = async () => {
        for (const id of salesToDelete) {
            await deleteSale(id);
        }
        addToast(`${salesToDelete.length} sale(s) deleted.`, 'success');
        logAction(`Deleted ${salesToDelete.length} sale(s).`);
        setSelectedIds(new Set());
        setSalesToDelete([]);
    };
    
    const handleViewDetails = (sale: Sale) => {
        setViewingSale(sale);
        setIsDetailsModalOpen(true);
    };
    
    const handleSaveNotes = async () => {
        if(!viewingSale) return;
        await updateSale(viewingSale);
        addToast('Notes saved successfully!', 'success');
        logAction(`Updated notes for sale #${viewingSale.id}`);
    };

    if (loading) return <Spinner />;

    return (
        <div className="space-y-4">
             <ConfirmationDialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onConfirm={confirmDelete}
                title={`Delete ${salesToDelete.length} Sale(s)`}
                message={`Are you sure you want to delete ${salesToDelete.length} sale record(s)? This action cannot be undone.`}
            />
            <AnimatePresence>
                {isDetailsModalOpen && viewingSale && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setIsDetailsModalOpen(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-surface rounded-xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                            <div className="p-6 space-y-4">
                               <h3 className="text-xl font-bold">{viewingSale.itemName}</h3>
                               {viewingSale.photo && <img src={viewingSale.photo} alt={viewingSale.itemName} className="w-full h-64 object-cover rounded-lg" />}
                               <div className="grid grid-cols-2 gap-4 text-sm">
                                   <p><strong className="text-subtle-text">Date:</strong> {new Date(viewingSale.date).toLocaleString()}</p>
                                   <p><strong className="text-subtle-text">Quantity:</strong> {viewingSale.quantity}</p>
                                   <p><strong className="text-subtle-text">Price:</strong> KSh {viewingSale.price.toFixed(2)}</p>
                                   <p><strong className="text-subtle-text">Total:</strong> KSh {viewingSale.total.toFixed(2)}</p>
                                   <p className="col-span-2"><strong className="text-subtle-text">Payment Method:</strong> {viewingSale.paymentMethod || 'Cash'}</p>
                               </div>
                               <div>
                                   <label htmlFor="notes" className="block text-sm font-medium text-on-surface mb-1">Notes</label>
                                   <textarea id="notes" rows={3} className="w-full p-2 bg-background border border-border-color rounded-md" value={viewingSale.notes || ''} onChange={e => setViewingSale(v => v ? {...v, notes: e.target.value} : null)}></textarea>
                               </div>
                               <div className="flex justify-end gap-3">
                                   <button onClick={handleSaveNotes} className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold hover:bg-blue-600">Save Notes</button>
                                   <button onClick={() => setIsDetailsModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold">Close</button>
                               </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <h2 className="text-2xl font-bold">Sales Management</h2>
            <div className="flex flex-col md:flex-row gap-4">
                <input type="text" placeholder="Search item..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-1/3 px-3 py-2 bg-background border border-border-color rounded-lg"/>
                <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min price" value={priceRange.min} onChange={e => setPriceRange(p => ({...p, min: e.target.value}))} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg"/>
                    <span>-</span>
                    <input type="number" placeholder="Max price" value={priceRange.max} onChange={e => setPriceRange(p => ({...p, max: e.target.value}))} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg"/>
                </div>
                <button disabled={selectedIds.size === 0} onClick={() => handleDeleteClick(Array.from(selectedIds))} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg disabled:bg-gray-400">Delete Selected</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-background/80">
                        <tr>
                            <th className="px-4 py-3"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.size > 0 && selectedIds.size === paginatedSales.length} /></th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase cursor-pointer" onClick={() => handleSort('itemName')}>Item {sortConfig.key === 'itemName' && <SortIcon direction={sortConfig.direction}/>}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Qty</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase cursor-pointer" onClick={() => handleSort('total')}>Total {sortConfig.key === 'total' && <SortIcon direction={sortConfig.direction}/>}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase cursor-pointer" onClick={() => handleSort('paymentMethod')}>Payment {sortConfig.key === 'paymentMethod' && <SortIcon direction={sortConfig.direction}/>}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase cursor-pointer" onClick={() => handleSort('date')}>Date {sortConfig.key === 'date' && <SortIcon direction={sortConfig.direction}/>}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-border-color">
                        {paginatedSales.map(sale => (
                            editingSale?.id === sale.id ? (
                                <tr key={sale.id}>
                                    <td></td>
                                    <td className="px-6 py-4"><input value={editingSale.itemName} onChange={e => setEditingSale(s => s ? {...s, itemName: e.target.value} : null)} className="p-1 border rounded w-full"/></td>
                                    <td className="px-6 py-4"><input type="number" value={editingSale.quantity} onChange={e => setEditingSale(s => s ? {...s, quantity: Number(e.target.value)} : null)} className="p-1 border rounded w-20"/></td>
                                    <td className="px-6 py-4"><input type="number" value={editingSale.price} onChange={e => setEditingSale(s => s ? {...s, price: Number(e.target.value)} : null)} className="p-1 border rounded w-24"/></td>
                                    <td className="px-6 py-4">KSh {(editingSale.quantity * editingSale.price).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <select value={editingSale.paymentMethod || 'Cash'} onChange={e => setEditingSale(s => s ? {...s, paymentMethod: e.target.value} : null)} className="p-1 border rounded w-full text-sm">
                                            <option value="Cash">Cash</option>
                                            <option value="Mobile Money">Mobile Money</option>
                                            <option value="Paybill">Paybill</option>
                                            <option value="Bank Transfer">Bank Transfer</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4"><input type="date" value={new Date(editingSale.date).toISOString().split('T')[0]} onChange={e => setEditingSale(s => s ? {...s, date: new Date(e.target.value).toISOString()}: null)} className="p-1 border rounded"/></td>
                                    <td className="px-6 py-4 flex gap-2"><button onClick={handleUpdateSale}><SaveIcon className="h-5 w-5 text-green-500"/></button><button onClick={() => setEditingSale(null)}><CancelIcon className="h-5 w-5 text-gray-500"/></button></td>
                                </tr>
                            ) : (
                                <tr key={sale.id}>
                                    <td className="px-4 py-4"><input type="checkbox" checked={selectedIds.has(sale.id!)} onChange={() => handleSelect(sale.id!)} /></td>
                                    <td className="px-6 py-4 flex items-center gap-3"><div className="w-10 h-10 rounded bg-background flex-shrink-0 flex items-center justify-center">{sale.photo ? <img src={sale.photo} className="w-full h-full object-cover rounded"/> : <PackageIcon className="h-5 w-5 text-subtle-text"/>}</div> {sale.itemName}</td>
                                    <td className="px-6 py-4">{sale.quantity}</td>
                                    <td className="px-6 py-4">KSh {sale.price.toFixed(2)}</td>
                                    <td className="px-6 py-4">KSh {sale.total.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm">{sale.paymentMethod || 'Cash'}</td>
                                    <td className="px-6 py-4">{new Date(sale.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button onClick={() => handleViewDetails(sale)}><InfoIcon className="h-5 w-5 text-blue-500"/></button>
                                        <button onClick={() => setEditingSale(sale)}><EditIcon className="h-5 w-5 text-primary"/></button>
                                        <button onClick={() => handleDeleteClick([sale.id!])}><TrashIcon className="h-5 w-5 text-red-500"/></button>
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
export default SalesManagementTab;
