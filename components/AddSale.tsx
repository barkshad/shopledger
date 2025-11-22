
import React, { useState, useEffect, useRef } from 'react';
import { useSales } from '../hooks/useSales';
import { useToast } from '../hooks/useToast';
import { useAdminSettings } from '../hooks/useAdminSettings';
import * as db from '../services/db';
import { Product, Customer, Sale } from '../types';
import { PlusCircleIcon, TrashIcon, ShoppingCartIcon, UsersIcon, CreditCardIcon, SaveIcon, SearchIcon } from './icons';
import { nanoid } from 'nanoid';

const PAYMENT_METHODS = ['Cash', 'Mobile Money', 'Paybill', 'Bank Transfer', 'Other', 'Split'];

interface CartItem {
    tempId: string;
    productId?: number;
    name: string;
    quantity: number;
    price: number;
    discount: number; // Fixed amount
    total: number;
}

const AddSale = () => {
  const { addSale } = useSales();
  const { addToast } = useToast();
  const { settings } = useAdminSettings();

  // Data Sources
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Form State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [salesperson, setSalesperson] = useState('Admin');
  
  // Product Input State
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  
  // Checkout State
  const [isCheckout, setIsCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountTendered, setAmountTendered] = useState(0);
  const [splitDetails, setSplitDetails] = useState<{method: string, amount: number}[]>([{method: 'Cash', amount: 0}, {method: 'Mobile Money', amount: 0}]);

  useEffect(() => {
      const loadData = async () => {
          setProducts(await db.getAllProducts());
          setCustomers(await db.getAllCustomers());
      };
      loadData();
  }, []);

  const addToCart = (product?: Product, manualName?: string, manualPrice?: number) => {
      const existingItem = product ? cart.find(item => item.productId === product.id) : null;
      
      if (existingItem) {
          setCart(cart.map(item => 
              item.tempId === existingItem.tempId 
                  ? { ...item, quantity: item.quantity + 1, total: (item.price * (item.quantity + 1)) - item.discount } 
                  : item
          ));
      } else {
          const price = product ? product.price : (manualPrice || 0);
          const name = product ? product.name : (manualName || 'Unknown Item');
          const newItem: CartItem = {
              tempId: nanoid(),
              productId: product?.id,
              name,
              quantity: 1,
              price,
              discount: 0,
              total: price,
          };
          setCart([...cart, newItem]);
      }
      setSearchTerm('');
      setBarcodeInput('');
  };

  const handleBarcodeScan = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          const product = products.find(p => p.barcode === barcodeInput);
          if (product) {
              addToCart(product);
              addToast(`Added ${product.name}`, 'success');
          } else {
              addToast('Product not found', 'error');
          }
          setBarcodeInput('');
      }
  };

  const handleProductSearch = (term: string) => {
      setSearchTerm(term);
  };

  const selectProduct = (product: Product) => {
      addToCart(product);
  };

  const removeFromCart = (tempId: string) => {
      setCart(cart.filter(item => item.tempId !== tempId));
  };

  const updateCartItem = (tempId: string, field: keyof CartItem, value: number) => {
      setCart(cart.map(item => {
          if (item.tempId === tempId) {
              const updated = { ...item, [field]: value };
              updated.total = (updated.price * updated.quantity) - updated.discount;
              return updated;
          }
          return item;
      }));
  };

  const calculateGrandTotal = () => {
      return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const handleCheckout = async () => {
      if (cart.length === 0) {
          addToast('Cart is empty', 'error');
          return;
      }
      
      const grandTotal = calculateGrandTotal();
      let finalPaymentDetails = '';
      
      if (paymentMethod === 'Split') {
          const splitTotal = splitDetails.reduce((sum, s) => sum + s.amount, 0);
          if (Math.abs(splitTotal - grandTotal) > 1) {
              addToast(`Split amounts must equal total (${formatCurrency(grandTotal)})`, 'error');
              return;
          }
          finalPaymentDetails = JSON.stringify(splitDetails);
      } else if (paymentMethod === 'Cash') {
           if (amountTendered < grandTotal && amountTendered !== 0) { // Allow 0 for quick entry if needed, but usually check
               // warning
           }
      }

      const transactionId = nanoid();

      // Save Sales
      for (const item of cart) {
          const saleData: Omit<Sale, 'id'> = {
              itemName: item.name,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
              paymentMethod,
              date: new Date(date).toISOString(),
              productId: item.productId,
              customerId: selectedCustomer?.id,
              salesperson,
              discount: item.discount,
              transactionId,
              paymentDetails: finalPaymentDetails || undefined
          };
          await addSale(saleData);

          // Deduct Stock
          if (item.productId) {
              const product = products.find(p => p.id === item.productId);
              if (product) {
                  await db.updateProduct({ ...product, stock: product.stock - item.quantity });
              }
          }
      }

      // Update Customer Loyalty
      if (selectedCustomer && selectedCustomer.id) {
          await db.updateCustomer({
              ...selectedCustomer,
              totalSpent: selectedCustomer.totalSpent + grandTotal,
              visitCount: selectedCustomer.visitCount + 1,
              lastVisit: new Date().toISOString()
          });
      }

      addToast('Sale completed successfully!', 'success');
      setCart([]);
      setIsCheckout(false);
      setSelectedCustomer(null);
      setAmountTendered(0);
      
      // Refresh products to reflect stock changes
      setProducts(await db.getAllProducts());
  };

  const formatCurrency = (amount: number) => `${settings.currency} ${amount.toLocaleString()}`;

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode?.includes(searchTerm));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
        {/* Left Panel: Product Selection & Cart */}
        <div className="lg:col-span-2 flex flex-col gap-4 h-full overflow-hidden">
            <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl shadow-sm border border-border-color flex flex-col gap-4">
                <div className="flex gap-4">
                     <div className="flex-1 relative">
                        <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-subtle-text"/>
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-color bg-background dark:bg-dark-background focus:ring-2 focus:ring-primary focus:outline-none"
                            value={searchTerm}
                            onChange={e => handleProductSearch(e.target.value)}
                        />
                        {searchTerm && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-surface dark:bg-dark-surface border border-border-color rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
                                {filteredProducts.map(p => (
                                    <div key={p.id} onClick={() => selectProduct(p)} className="p-3 hover:bg-primary/10 cursor-pointer flex justify-between border-b border-border-color last:border-0">
                                        <span>{p.name}</span>
                                        <div className="text-right">
                                            <span className="font-bold block">{formatCurrency(p.price)}</span>
                                            <span className={`text-xs ${p.stock <= p.minStock ? 'text-red-500' : 'text-green-500'}`}>{p.stock} in stock</span>
                                        </div>
                                    </div>
                                ))}
                                <div onClick={() => addToCart(undefined, searchTerm, 0)} className="p-3 hover:bg-primary/10 cursor-pointer text-primary font-semibold border-t border-border-color">
                                    Add custom item "{searchTerm}"
                                </div>
                            </div>
                        )}
                     </div>
                     <input 
                        type="text" 
                        placeholder="Scan Barcode" 
                        className="w-40 px-4 py-2 rounded-lg border border-border-color bg-background dark:bg-dark-background focus:ring-2 focus:ring-primary focus:outline-none"
                        value={barcodeInput}
                        onChange={e => setBarcodeInput(e.target.value)}
                        onKeyDown={handleBarcodeScan}
                        autoFocus
                     />
                </div>
            </div>

            <div className="flex-1 bg-surface dark:bg-dark-surface rounded-xl shadow-sm border border-border-color overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border-color flex justify-between items-center bg-background/50">
                    <h2 className="font-bold flex items-center gap-2"><ShoppingCartIcon className="h-5 w-5"/> Current Cart ({cart.length})</h2>
                    <button onClick={() => setCart([])} className="text-red-500 text-sm hover:underline">Clear Cart</button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-subtle-text">
                            <ShoppingCartIcon className="h-12 w-12 mb-2 opacity-20"/>
                            <p>Cart is empty</p>
                            <p className="text-xs">Scan barcode or search items</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-background text-xs uppercase text-subtle-text sticky top-0">
                                <tr>
                                    <th className="p-3">Item</th>
                                    <th className="p-3 w-20">Price</th>
                                    <th className="p-3 w-24">Qty</th>
                                    <th className="p-3 w-20">Disc.</th>
                                    <th className="p-3 w-24 text-right">Total</th>
                                    <th className="p-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color">
                                {cart.map(item => (
                                    <tr key={item.tempId} className="hover:bg-primary/5">
                                        <td className="p-3">
                                            <div className="font-medium">{item.name}</div>
                                        </td>
                                        <td className="p-3">
                                            <input 
                                                type="number" 
                                                value={item.price} 
                                                onChange={(e) => updateCartItem(item.tempId, 'price', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center border border-border-color rounded-md bg-background">
                                                <button onClick={() => updateCartItem(item.tempId, 'quantity', Math.max(1, item.quantity - 1))} className="px-2 hover:bg-gray-200">-</button>
                                                <input 
                                                    type="number" 
                                                    value={item.quantity} 
                                                    onChange={(e) => updateCartItem(item.tempId, 'quantity', parseFloat(e.target.value) || 1)}
                                                    className="w-full text-center bg-transparent border-none focus:ring-0 p-0 text-sm no-spinner"
                                                />
                                                <button onClick={() => updateCartItem(item.tempId, 'quantity', item.quantity + 1)} className="px-2 hover:bg-gray-200">+</button>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <input 
                                                type="number" 
                                                value={item.discount} 
                                                onChange={(e) => updateCartItem(item.tempId, 'discount', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-transparent border-b border-border-color focus:border-primary focus:ring-0 p-0 text-sm"
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="p-3 text-right font-semibold">
                                            {formatCurrency(item.total)}
                                        </td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => removeFromCart(item.tempId)} className="text-subtle-text hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="p-4 border-t border-border-color bg-surface">
                    <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total</span>
                        <span className="text-primary">{formatCurrency(calculateGrandTotal())}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Panel: Transaction Details */}
        <div className="bg-surface dark:bg-dark-surface rounded-xl shadow-sm border border-border-color p-6 h-full flex flex-col gap-6 overflow-y-auto">
            <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2"><UsersIcon className="h-4 w-4"/> Customer & Salesperson</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-subtle-text block mb-1">Select Customer</label>
                        <select 
                            className="w-full p-2 rounded-lg border border-border-color bg-background dark:bg-dark-background"
                            onChange={(e) => setSelectedCustomer(customers.find(c => c.id === Number(e.target.value)) || null)}
                            value={selectedCustomer?.id || ''}
                        >
                            <option value="">Walk-in Customer</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-subtle-text block mb-1">Salesperson</label>
                         <select 
                            className="w-full p-2 rounded-lg border border-border-color bg-background dark:bg-dark-background"
                            value={salesperson}
                            onChange={e => setSalesperson(e.target.value)}
                        >
                            <option>Admin</option>
                            <option>Staff 1</option>
                            <option>Staff 2</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-xs text-subtle-text block mb-1">Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 rounded-lg border border-border-color bg-background dark:bg-dark-background" />
                    </div>
                </div>
            </div>

            <hr className="border-border-color"/>

            <div>
                 <h3 className="font-semibold mb-3 flex items-center gap-2"><CreditCardIcon className="h-4 w-4"/> Payment</h3>
                 <div className="grid grid-cols-2 gap-2 mb-4">
                     {PAYMENT_METHODS.map(method => (
                         <button 
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${paymentMethod === method ? 'bg-primary text-white border-primary' : 'bg-background border-border-color hover:border-primary'}`}
                         >
                             {method}
                         </button>
                     ))}
                 </div>

                 {paymentMethod === 'Cash' && (
                     <div className="space-y-3 bg-background/50 p-4 rounded-lg">
                         <div>
                             <label className="text-xs text-subtle-text block mb-1">Amount Tendered</label>
                             <input type="number" value={amountTendered} onChange={e => setAmountTendered(parseFloat(e.target.value))} className="w-full p-2 rounded-lg border border-border-color text-lg font-bold" />
                         </div>
                         <div className="flex justify-between items-center text-sm">
                             <span>Change:</span>
                             <span className={`font-bold ${amountTendered - calculateGrandTotal() < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                 {formatCurrency(amountTendered > 0 ? amountTendered - calculateGrandTotal() : 0)}
                             </span>
                         </div>
                     </div>
                 )}

                 {paymentMethod === 'Split' && (
                     <div className="space-y-2 bg-background/50 p-4 rounded-lg">
                         {splitDetails.map((split, idx) => (
                             <div key={idx} className="flex gap-2">
                                 <select 
                                    value={split.method}
                                    onChange={(e) => {
                                        const newSplits = [...splitDetails];
                                        newSplits[idx].method = e.target.value;
                                        setSplitDetails(newSplits);
                                    }}
                                    className="flex-1 p-1 text-sm rounded border border-border-color"
                                 >
                                     {PAYMENT_METHODS.filter(p => p !== 'Split').map(p => <option key={p}>{p}</option>)}
                                 </select>
                                 <input 
                                    type="number" 
                                    value={split.amount}
                                    onChange={(e) => {
                                        const newSplits = [...splitDetails];
                                        newSplits[idx].amount = parseFloat(e.target.value) || 0;
                                        setSplitDetails(newSplits);
                                    }}
                                    className="w-24 p-1 text-sm rounded border border-border-color"
                                 />
                                 <button onClick={() => setSplitDetails(splitDetails.filter((_, i) => i !== idx))} className="text-red-500">x</button>
                             </div>
                         ))}
                         <button onClick={() => setSplitDetails([...splitDetails, {method: 'Cash', amount: 0}])} className="text-xs text-primary font-semibold">+ Add Payment</button>
                         <div className="text-right text-xs">
                             Total: {formatCurrency(splitDetails.reduce((s, i) => s + i.amount, 0))} / {formatCurrency(calculateGrandTotal())}
                         </div>
                     </div>
                 )}
            </div>

            <div className="mt-auto">
                <button 
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SaveIcon className="h-6 w-6"/> 
                    Checkout {formatCurrency(calculateGrandTotal())}
                </button>
            </div>
        </div>
    </div>
  );
};

export default AddSale;
