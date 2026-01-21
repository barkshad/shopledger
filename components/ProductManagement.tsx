
import React, { useState, useEffect, useCallback } from 'react';
import * as db from '../services/db';
import { Product } from '../types';
import { useToast } from '../hooks/useToast';
import { useAdminSettings } from '../hooks/useAdminSettings';
import { useAuth } from '../hooks/useAuth';
import { EditIcon, TrashIcon, PlusCircleIcon, SearchIcon } from './icons';
import ConfirmationDialog from './ConfirmationDialog';

const ProductManagement = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Omit<Product, 'id'>>({ name: '', barcode: '', price: 0, costPrice: 0, stock: 0, minStock: 5, category: '' });
    const { addToast } = useToast();
    const { settings } = useAdminSettings();
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const refreshProducts = useCallback(async () => {
        if (!user) return;
        setProducts(await db.getAllProducts(user.uid));
    }, [user]);

    useEffect(() => {
        refreshProducts();
    }, [refreshProducts]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            if (editingProduct && editingProduct.id) {
                await db.updateProduct(user.uid, { ...formData, id: editingProduct.id });
                addToast('Product updated', 'success');
            } else {
                await db.addProduct(user.uid, formData);
                addToast('Product added', 'success');
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            setFormData({ name: '', barcode: '', price: 0, costPrice: 0, stock: 0, minStock: 5, category: '' });
            refreshProducts();
        } catch (e) {
            addToast('Error saving product.', 'error');
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData(product);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (deleteId && user) {
            await db.deleteProduct(user.uid, deleteId);
            addToast('Product deleted', 'success');
            setDeleteId(null);
            refreshProducts();
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode?.includes(searchTerm));

    const inputClass = "w-full p-2 border border-border-color rounded bg-background dark:bg-dark-background";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Product Inventory</h1>
                <button onClick={() => { setEditingProduct(null); setFormData({ name: '', barcode: '', price: 0, costPrice: 0, stock: 0, minStock: 5, category: '' }); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-zinc-800">
                    <PlusCircleIcon className="h-5 w-5" /> Add Product
                </button>
            </div>

            <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl shadow-sm border border-border-color">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-subtle-text" />
                    <input type="text" placeholder="Search by name or barcode..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-color bg-background dark:bg-dark-background" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="bg-surface dark:bg-dark-surface rounded-xl shadow-sm border border-border-color overflow-hidden">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-background/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-subtle-text uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-subtle-text uppercase">Barcode</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-subtle-text uppercase">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-subtle-text uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-subtle-text uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {filteredProducts.map(p => (
                            <tr key={p.id} className="hover:bg-primary/5">
                                <td className="px-6 py-4">{p.name}</td>
                                <td className="px-6 py-4 font-mono text-sm">{p.barcode || '-'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock <= p.minStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {p.stock}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-semibold">{settings.currency} {p.price}</td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button onClick={() => handleEdit(p)} className="text-primary"><EditIcon className="h-5 w-5" /></button>
                                    <button onClick={() => setDeleteId(p.id!)} className="text-red-500"><TrashIcon className="h-5 w-5" /></button>
                                </td>
                            </tr>
                        ))}
                        {filteredProducts.length === 0 && <tr><td colSpan={5} className="text-center p-6 text-subtle-text">No products found.</td></tr>}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface dark:bg-dark-surface p-6 rounded-xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm mb-1">Product Name</label><input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm mb-1">Barcode</label><input value={formData.barcode || ''} onChange={e => setFormData({ ...formData, barcode: e.target.value })} className={inputClass} placeholder="Scan or type" /></div>
                                <div><label className="block text-sm mb-1">Category</label><input value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} className={inputClass} list="categories" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm mb-1">Selling Price</label><input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} className={inputClass} /></div>
                                <div><label className="block text-sm mb-1">Cost Price (Optional)</label><input type="number" value={formData.costPrice || 0} onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })} className={inputClass} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm mb-1">Stock Qty</label><input type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })} className={inputClass} /></div>
                                <div><label className="block text-sm mb-1">Min Stock Alert</label><input type="number" required value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value) })} className={inputClass} /></div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-zinc-800">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Product" message="Are you sure?" confirmText="Delete" />
        </div>
    );
};

export default ProductManagement;
