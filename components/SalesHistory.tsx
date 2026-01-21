
import React, { useState, useMemo } from 'react';
import { useSales } from '../hooks/useSales';
import { Sale } from '../types';
import { EditIcon, TrashIcon, SaveIcon, CancelIcon, DownloadIcon, SortAscIcon, SortDescIcon, PackageIcon, ChevronLeftIcon, ChevronRightIcon, FileTextIcon, SearchIcon, PlusCircleIcon, CalendarIcon } from './icons';
import Spinner from './Spinner';
import ConfirmationDialog from './ConfirmationDialog';
import { convertToCSV, downloadCSV } from '../utils/csvUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useAdminSettings } from '../hooks/useAdminSettings';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';

interface EditState extends Omit<Sale, 'total'> {
    id: string;
}

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;
const MotionImg = motion.img as any;

const PAYMENT_METHODS = ['Cash', 'Mobile Money', 'Paybill', 'Bank Transfer', 'Other'];

const getPaymentBadgeColor = (method: string | undefined) => {
    switch (method) {
        case 'Cash': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'Mobile Money': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        case 'Paybill': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'Bank Transfer': return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
        default: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    }
};

type SortableKey = 'itemName' | 'total' | 'date' | 'paymentMethod';

const SalesHistory = () => {
  const { sales, loading, updateSale, deleteSale } = useSales();
  const { settings } = useAdminSettings();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [editingSale, setEditingSale] = useState<EditState | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const [isPdfExporting, setIsPdfExporting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey, direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
  
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const openPhotoModal = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setIsPhotoModalOpen(true);
  };

  const closePhotoModal = () => {
    setIsPhotoModalOpen(false);
    setSelectedPhoto(null);
  };

  const filteredAndSortedSales = useMemo(() => {
    let filtered = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start) start.setUTCHours(0, 0, 0, 0);
        if (end) end.setUTCHours(23, 59, 59, 999);

        const matchesSearch = sale.itemName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = (!start || saleDate >= start) && (!end || saleDate <= end);
        const matchesPayment = paymentFilter === 'All' || sale.paymentMethod === paymentFilter;
        
        return matchesSearch && matchesDate && matchesPayment;
    });

    if (sortConfig.key) {
        filtered.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (sortConfig.key === 'date') {
                return sortConfig.direction === 'ascending' 
                    ? new Date(a.date).getTime() - new Date(b.date).getTime()
                    : new Date(b.date).getTime() - new Date(a.date).getTime();
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
            }

            const strA = String(aValue || '').toLowerCase();
            const strB = String(bValue || '').toLowerCase();

            return sortConfig.direction === 'ascending' 
                ? strA.localeCompare(strB) 
                : strB.localeCompare(strA);
        });
    }

    return filtered;
  }, [sales, searchTerm, startDate, endDate, sortConfig, paymentFilter]);

  const handleEditClick = (sale: Sale) => {
    if (sale.id !== undefined) {
      const { total, ...saleData } = sale;
      setEditingSale({
        ...saleData,
        id: sale.id,
        paymentMethod: sale.paymentMethod || 'Cash',
        date: sale.date.split('T')[0],
      });
    }
  };

  const handleUpdateSale = async () => {
    if (!editingSale) return;
    const { id, itemName, quantity, price, date, photo, notes, paymentMethod } = editingSale;
    await updateSale({
      id,
      itemName,
      quantity: +quantity,
      price: +price,
      total: +quantity * +price,
      paymentMethod,
      date: new Date(date).toISOString(),
      photo: photo,
      notes: notes,
    });
    setEditingSale(null);
    addToast("Sale updated successfully", "success");
  };
  
  const handleDeleteClick = (id: string) => {
    setSaleToDelete(id);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (saleToDelete !== null) {
      await deleteSale(saleToDelete);
      setSaleToDelete(null);
      addToast("Sale deleted", "success");
    }
  };

  const handleExportPDF = () => {
      setIsPdfExporting(true);
      try {
          const doc = new jsPDF();
          doc.setFontSize(18);
          doc.text('Sales Report', 14, 22);
          doc.setFontSize(11);
          doc.setTextColor(100);
          doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

          const tableColumn = ["Item", "Qty", "Price", "Total", "Payment", "Date"];
          const tableRows: any[] = [];

          filteredAndSortedSales.forEach(sale => {
              tableRows.push([
                  sale.itemName,
                  sale.quantity,
                  `${settings.currency} ${sale.price.toFixed(2)}`,
                  `${settings.currency} ${sale.total.toFixed(2)}`,
                  sale.paymentMethod || "Cash",
                  new Date(sale.date).toLocaleDateString(),
              ]);
          });

          autoTable(doc, {
              head: [tableColumn],
              body: tableRows,
              startY: 35,
              theme: 'grid',
              headStyles: { fillColor: [0, 0, 0] },
          });

          const totalRevenue = filteredAndSortedSales.reduce((sum, s) => sum + s.total, 0);
          const finalY = (doc as any).lastAutoTable.finalY || 35;
          
          doc.setFontSize(12);
          doc.setTextColor(0);
          doc.text(`Total Sales: ${filteredAndSortedSales.length}`, 14, finalY + 10);
          doc.text(`Grand Total: ${settings.currency} ${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`, 14, finalY + 16);

          doc.save(`Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`);
          addToast("PDF Export Successful", "success");
      } catch (e) {
          addToast("Failed to export PDF", "error");
      } finally {
          setIsPdfExporting(false);
      }
  };

  const formatCurrency = (amount: number) => `${settings.currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <Spinner />;

  return (
    <>
    <ConfirmationDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Sale"
        message="Are you sure you want to delete this sale? This cannot be undone."
        confirmText="Delete"
    />

    <AnimatePresence>
      {isPhotoModalOpen && selectedPhoto && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
          onClick={closePhotoModal}
        >
          <MotionImg
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            src={selectedPhoto}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e: React.MouseEvent<HTMLImageElement>) => e.stopPropagation()}
          />
        </MotionDiv>
      )}
    </AnimatePresence>

    <div className="relative pb-24 min-h-[80vh]">
        {/* Modern Toolbar */}
        <div className="sticky top-16 md:top-0 z-30 bg-surface/90 dark:bg-dark-surface/90 backdrop-blur-lg border-b border-border-color dark:border-dark-border-color -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-6 flex items-center justify-between shadow-sm transition-all">
            <h1 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface">Sales</h1>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setShowFilters(!showFilters)} 
                    className={`p-2 rounded-full transition-colors ${showFilters ? 'bg-primary/10 text-primary' : 'text-subtle-text hover:bg-background'}`}
                >
                    <SearchIcon className="h-5 w-5" />
                </button>
                <button 
                    onClick={handleExportPDF} 
                    disabled={isPdfExporting}
                    className="p-2 rounded-full text-subtle-text hover:text-primary hover:bg-background disabled:opacity-50"
                >
                    {isPdfExporting ? <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"/> : <FileTextIcon className="h-5 w-5" />}
                </button>
            </div>
        </div>

        {/* Collapsible Filters */}
        <AnimatePresence>
            {showFilters && (
                <MotionDiv 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-6"
                >
                    <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border-color grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="px-4 py-2 rounded-lg bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        <select 
                            value={paymentFilter} 
                            onChange={e => setPaymentFilter(e.target.value)} 
                            className="px-4 py-2 rounded-lg bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                            <option value="All">All Payments</option>
                            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <div className="flex items-center gap-2">
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2 bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color rounded-lg focus:outline-none"/>
                        </div>
                         <div className="flex items-center gap-2">
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-2 bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color rounded-lg focus:outline-none"/>
                        </div>
                    </div>
                </MotionDiv>
            )}
        </AnimatePresence>

        {/* Sales List - Card View */}
        {filteredAndSortedSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                <div className="bg-surface dark:bg-dark-surface p-6 rounded-full mb-4">
                    <FileTextIcon className="h-12 w-12 text-subtle-text" />
                </div>
                <h3 className="text-xl font-medium">No sales found</h3>
                <p className="text-sm text-subtle-text mt-1">Try adjusting your filters or add a new sale.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredAndSortedSales.map((sale) => (
                    <MotionDiv
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={sale.id}
                        className="bg-surface dark:bg-dark-surface rounded-2xl p-4 shadow-sm border border-border-color dark:border-dark-border-color hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                        {editingSale?.id === sale.id ? (
                            /* Edit Mode */
                            <div className="space-y-3 relative z-10">
                                <h3 className="font-bold text-lg text-primary">Editing Sale</h3>
                                <div>
                                    <label className="text-xs text-subtle-text uppercase">Item Name</label>
                                    <input 
                                        value={editingSale.itemName} 
                                        onChange={e => setEditingSale({...editingSale, itemName: e.target.value})}
                                        className="w-full p-2 rounded-lg bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs text-subtle-text uppercase">Qty</label>
                                        <input 
                                            type="number"
                                            value={editingSale.quantity} 
                                            onChange={e => setEditingSale({...editingSale, quantity: Number(e.target.value)})}
                                            className="w-full p-2 rounded-lg bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color outline-none"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-subtle-text uppercase">Price</label>
                                        <input 
                                            type="number"
                                            value={editingSale.price} 
                                            onChange={e => setEditingSale({...editingSale, price: Number(e.target.value)})}
                                            className="w-full p-2 rounded-lg bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-subtle-text uppercase">Payment</label>
                                    <select 
                                        value={editingSale.paymentMethod} 
                                        onChange={e => setEditingSale({...editingSale, paymentMethod: e.target.value})}
                                        className="w-full p-2 rounded-lg bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color outline-none"
                                    >
                                        {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button onClick={handleUpdateSale} className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium flex justify-center items-center gap-2"><SaveIcon className="h-4 w-4"/> Save</button>
                                    <button onClick={() => setEditingSale(null)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium flex justify-center items-center gap-2"><CancelIcon className="h-4 w-4"/> Cancel</button>
                                </div>
                            </div>
                        ) : (
                            /* View Mode */
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-3 items-center">
                                            <div 
                                                className="w-12 h-12 rounded-xl bg-background dark:bg-dark-background flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer border border-border-color dark:border-dark-border-color"
                                                onClick={() => sale.photo && openPhotoModal(sale.photo)}
                                            >
                                                {sale.photo ? (
                                                    <img src={sale.photo} alt={sale.itemName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <PackageIcon className="h-6 w-6 text-subtle-text/50" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-on-surface dark:text-dark-on-surface leading-tight line-clamp-1">{sale.itemName}</h3>
                                                <div className="text-sm text-subtle-text mt-0.5 flex items-center gap-1">
                                                   <span>{sale.quantity}</span>
                                                   <span className="text-xs">x</span>
                                                   <span>{formatCurrency(sale.price)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-primary">{formatCurrency(sale.total)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 flex items-center justify-between text-xs text-subtle-text">
                                        <div className="flex items-center gap-1.5">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                            <span>{formatDate(sale.date)}</span>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getPaymentBadgeColor(sale.paymentMethod || 'Cash')}`}>
                                            {sale.paymentMethod || 'Cash'}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Actions */}
                                <div className="border-t border-border-color dark:border-dark-border-color mt-4 pt-3 flex justify-end gap-1">
                                    <button 
                                        onClick={() => handleEditClick(sale)} 
                                        className="p-2 rounded-lg text-subtle-text hover:text-primary hover:bg-primary/5 transition-colors"
                                    >
                                        <EditIcon className="h-5 w-5" />
                                    </button>
                                    <button 
                                        onClick={() => sale.id && handleDeleteClick(sale.id)} 
                                        className="p-2 rounded-lg text-subtle-text hover:text-red-500 hover:bg-red-500/5 transition-colors"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </MotionDiv>
                ))}
            </div>
        )}
    </div>

    {/* Dedicated FAB for Add Sale */}
    <MotionButton
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/add-sale')}
        className="fixed bottom-24 right-4 z-40 bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/30 flex items-center gap-2 md:hidden"
    >
        <PlusCircleIcon className="h-6 w-6" />
        <span className="font-bold">New Sale</span>
    </MotionButton>
    </>
  );
};

export default SalesHistory;
