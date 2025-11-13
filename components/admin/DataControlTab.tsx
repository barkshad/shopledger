import React, { useState, useEffect, useCallback } from 'react';
import { useSales } from '../../hooks/useSales';
import { useToast } from '../../hooks/useToast';
import ConfirmationDialog from '../ConfirmationDialog';
import { DownloadIcon, UploadCloudIcon, TrashIcon } from '../icons';

const DataControlTab: React.FC<{ logAction: (message: string) => void }> = ({ logAction }) => {
    const { sales, clearAllSales, addSale, refreshSales } = useSales();
    const { addToast } = useToast();

    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [storageUsage, setStorageUsage] = useState<string>('Calculating...');
    const [lastBackup, setLastBackup] = useState<string | null>(localStorage.getItem('lastBackup'));
    const [fileToImport, setFileToImport] = useState<File | null>(null);

    const calculateStorage = useCallback(async () => {
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            const usageMB = ((estimate.usage || 0) / (1024 * 1024)).toFixed(2);
            setStorageUsage(`${usageMB} MB`);
        } else {
            setStorageUsage('Not available');
        }
    }, []);

    useEffect(() => {
        calculateStorage();
    }, [sales, calculateStorage]);

    const handleExport = () => {
        const dataStr = JSON.stringify(sales, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shopledger-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        const backupTime = new Date().toLocaleString();
        localStorage.setItem('lastBackup', backupTime);
        setLastBackup(backupTime);
        addToast('Data exported successfully!', 'success');
        logAction('Exported all data to JSON.');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileToImport(e.target.files[0]);
            setImportDialogOpen(true);
        }
    };

    const confirmImport = () => {
        if (!fileToImport) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedSales = JSON.parse(e.target?.result as string);
                if (Array.isArray(importedSales)) {
                    await clearAllSales();
                    for (const sale of importedSales) {
                        // basic validation
                        if (sale.itemName && sale.quantity && sale.price && sale.date) {
                            await addSale(sale);
                        }
                    }
                    await refreshSales(); // Manually trigger a refresh after batch adding
                    addToast('Data imported successfully!', 'success');
                    logAction(`Imported ${importedSales.length} sales from JSON.`);
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                addToast('Failed to import data. Invalid file.', 'error');
                logAction('Attempted to import invalid JSON file.');
            }
        };
        reader.readAsText(fileToImport);
    };

    const confirmClear = async () => {
        await clearAllSales();
        addToast('All data has been cleared.', 'success');
        logAction('Cleared all sales data.');
    };

    return (
        <div className="space-y-8">
            <ConfirmationDialog isOpen={importDialogOpen} onClose={() => setImportDialogOpen(false)} onConfirm={confirmImport} title="Import Data" message="This will ERASE all current data and replace it with the backup. Are you sure you want to continue?" confirmText="Import" />
            <ConfirmationDialog isOpen={clearDialogOpen} onClose={() => setClearDialogOpen(false)} onConfirm={confirmClear} title="Clear All Data" message="This is irreversible. Are you absolutely sure you want to delete ALL sales data?" confirmText="Yes, delete everything" />

            <h2 className="text-2xl font-bold">Backup & Data Control</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background/50 p-4 rounded-lg border border-border-color">
                    <h3 className="font-semibold">Storage Usage</h3>
                    <p className="text-2xl">{storageUsage}</p>
                    <p className="text-sm text-subtle-text">{sales.length} sale records</p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg border border-border-color">
                    <h3 className="font-semibold">Last Backup</h3>
                    <p className="text-2xl">{lastBackup ? lastBackup : 'Never'}</p>
                </div>
            </div>

            <div className="space-y-4">
                <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white font-bold rounded-lg"><DownloadIcon /> Export All Data (JSON)</button>
                <div>
                    <input type="file" id="import-file" className="hidden" accept=".json" onChange={handleFileChange} />
                    <label htmlFor="import-file" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-bold rounded-lg cursor-pointer"><UploadCloudIcon /> Import Data (JSON)</label>
                </div>
            </div>

            <div className="border-t border-border-color pt-6">
                <h3 className="text-xl font-semibold text-red-600">Danger Zone</h3>
                <p className="text-subtle-text mb-4">This action is permanent and cannot be undone.</p>
                <button onClick={() => setClearDialogOpen(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-bold rounded-lg"><TrashIcon /> Clear All Data</button>
            </div>
        </div>
    );
};

export default DataControlTab;
