
import React, { useState, useEffect } from 'react';
import * as db from '../services/db';
import { Customer } from '../types';
import { useToast } from '../hooks/useToast';
import { EditIcon, TrashIcon, PlusCircleIcon, SearchIcon, UsersIcon } from './icons';
import ConfirmationDialog from './ConfirmationDialog';
import { useAdminSettings } from '../hooks/useAdminSettings';

const CustomerManagement = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState<Omit<Customer, 'id'>>({ name: '', phone: '', email: '', totalSpent: 0, visitCount: 0, notes: '' });
    const { addToast } = useToast();
    const { settings } = useAdminSettings();
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const refreshCustomers = async () => {
        setCustomers(await db.getAllCustomers());
    };

    useEffect(() => {
        refreshCustomers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCustomer && editingCustomer.id) {
                await db.updateCustomer({ ...formData, id: editingCustomer.id });
                addToast('Customer updated', 'success');
            } else {
                await db.addCustomer(formData);
                addToast('Customer added', 'success');
            }
            setIsModalOpen(false);
            setEditingCustomer(null);
            setFormData({ name: '', phone: '', email: '', totalSpent: 0, visitCount: 0, notes: '' });
            refreshCustomers();
        } catch (e) {
            addToast('Error saving customer. Phone number might be duplicate.', 'error');
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormData(customer);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (deleteId) {
            await db.deleteCustomer(deleteId);
            addToast('Customer deleted', 'success');
            setDeleteId(null);
            refreshCustomers();
        }
    };

    const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone?.includes(searchTerm));
    const inputClass = "w-full p-2 border border-border-color rounded bg-background dark:bg-dark-background";

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Customer Management</h1>
                <button onClick={() => { setEditingCustomer(null); setFormData({ name: '', phone: '', email: '', totalSpent: 0, visitCount: 0, notes: '' }); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-blue-600">
                    <PlusCircleIcon className="h-5 w-5" /> Add Customer
                </button>
            </div>

            <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl shadow-sm border border-border-color">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-subtle-text" />
                    <input type="text" placeholder="Search by name or phone..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-color bg-background dark:bg-dark-background" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map(c => (
                    <div key={c.id} className="bg-surface dark:bg-dark-surface p-4 rounded-xl shadow-sm border border-border-color flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="bg-primary/10 p-2 rounded-full text-primary"><UsersIcon className="h-5 w-5"/></div>
                                    <h3 className="font-bold text-lg">{c.name}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(c)} className="text-subtle-text hover:text-primary"><EditIcon className="h-4 w-4"/></button>
                                    <button onClick={() => setDeleteId(c.id!)} className="text-subtle-text hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                                </div>
                            </div>
                            <p className="text-sm text-subtle-text">{c.phone}</p>
                            <p className="text-sm text-subtle-text mb-2">{c.email}</p>
                            {c.notes && <p className="text-xs bg-background/50 p-2 rounded italic mb-2">"{c.notes}"</p>}
                        </div>
                        <div className="border-t border-border-color pt-2 mt-2 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-subtle-text">Visits</p>
                                <p className="font-bold">{c.visitCount}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-subtle-text">Total Spent</p>
                                <p className="font-bold text-green-500">{settings.currency} {c.totalSpent.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {filteredCustomers.length === 0 && <p className="text-center text-subtle-text">No customers found.</p>}

             {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface dark:bg-dark-surface p-6 rounded-xl max-w-md w-full shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">{editingCustomer ? 'Edit Customer' : 'New Customer'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm mb-1">Name</label><input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} /></div>
                            <div><label className="block text-sm mb-1">Phone</label><input value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inputClass} /></div>
                            <div><label className="block text-sm mb-1">Email</label><input type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputClass} /></div>
                            <div><label className="block text-sm mb-1">Notes</label><textarea rows={3} value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} className={inputClass} /></div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
             <ConfirmationDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Customer" message="Are you sure?" confirmText="Delete" />
        </div>
    );
};

export default CustomerManagement;
