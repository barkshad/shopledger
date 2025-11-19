
import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSales } from '../hooks/useSales';
import { useExpenses } from '../hooks/useExpenses';
import Spinner from './Spinner';
import { Sale, Expense } from '../types';
import { PackageIcon, CreditCardIcon, SearchIcon } from './icons';
import { useAdminSettings } from '../hooks/useAdminSettings';

type SearchResultItem = (Sale & { type: 'sale' }) | (Expense & { type: 'expense' });

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';
    const [searchTerm, setSearchTerm] = useState(query);

    const { sales, loading: salesLoading } = useSales();
    const { expenses, loading: expensesLoading } = useExpenses();
    const { settings } = useAdminSettings();

    useEffect(() => {
        setSearchTerm(query);
    }, [query]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchTerm.trim();
        if (trimmed) {
            navigate(`/search?q=${encodeURIComponent(trimmed)}`);
        } else {
            navigate('/search');
        }
    };

    const searchResults = useMemo(() => {
        if (!query) return [];

        const lowerCaseQuery = query.toLowerCase();

        const filteredSales = sales.filter(sale =>
            sale.itemName.toLowerCase().includes(lowerCaseQuery) ||
            sale.notes?.toLowerCase().includes(lowerCaseQuery) ||
            (sale.paymentMethod && sale.paymentMethod.toLowerCase().includes(lowerCaseQuery))
        ).map(sale => ({ ...sale, type: 'sale' as const }));

        const filteredExpenses = expenses.filter(expense =>
            expense.name.toLowerCase().includes(lowerCaseQuery) ||
            expense.note?.toLowerCase().includes(lowerCaseQuery) ||
            expense.category.toLowerCase().includes(lowerCaseQuery)
        ).map(expense => ({ ...expense, type: 'expense' as const }));

        const combinedResults: SearchResultItem[] = [...filteredSales, ...filteredExpenses];

        combinedResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return combinedResults;
    }, [query, sales, expenses]);

    const formatCurrency = (amount: number) => `${settings.currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

    if (salesLoading || expensesLoading) {
        return <Spinner />;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Search</h1>
            <form onSubmit={handleSearchSubmit} className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-subtle-text dark:text-dark-subtle-text" />
                </div>
                <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 border border-border-color dark:border-dark-border-color rounded-xl leading-5 bg-surface dark:bg-dark-surface placeholder-subtle-text dark:placeholder-dark-subtle-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-base"
                    placeholder="Search sales & expenses..."
                    autoFocus
                />
            </form>

            {query ? (
                <>
                    <p className="text-subtle-text dark:text-dark-subtle-text mb-6">Found {searchResults.length} results for <span className="font-semibold text-primary">"{query}"</span></p>

                    {searchResults.length > 0 ? (
                        <div className="bg-surface dark:bg-dark-surface rounded-2xl shadow-soft border border-border-color dark:border-dark-border-color overflow-hidden">
                            <ul className="divide-y divide-border-color dark:divide-dark-border-color">
                                {searchResults.map((item) => (
                                    <li key={`${item.type}-${item.id}`} className="p-4 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === 'sale' ? 'bg-green-100 dark:bg-green-500/20' : 'bg-red-100 dark:bg-red-500/20'}`}>
                                                    {item.type === 'sale' ? <PackageIcon className="w-6 h-6 text-green-500" /> : <CreditCardIcon className="w-6 h-6 text-red-500" />}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-semibold text-on-surface dark:text-dark-on-surface truncate">
                                                        {item.type === 'sale' ? (item as Sale).itemName : (item as Expense).name}
                                                    </p>
                                                    <div className="text-sm text-subtle-text dark:text-dark-subtle-text truncate flex gap-2">
                                                        <span>{formatDate(item.date)}</span>
                                                        <span>|</span>
                                                        <span>
                                                          {item.type === 'expense' 
                                                            ? `Category: ${(item as Expense).category}` 
                                                            : `Payment: ${(item as Sale).paymentMethod || 'Cash'}`
                                                          }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className={`font-bold text-lg ${item.type === 'sale' ? 'text-green-500' : 'text-danger'}`}>
                                                    {item.type === 'expense' && '-'}
                                                    {formatCurrency(item.type === 'sale' ? (item as Sale).total : (item as Expense).amount)}
                                                </p>
                                                <p className="text-xs uppercase font-semibold tracking-wider text-subtle-text dark:text-dark-subtle-text">{item.type}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-surface dark:bg-dark-surface rounded-2xl">
                            <p className="text-lg font-semibold text-on-surface dark:text-dark-on-surface">No results found</p>
                            <p className="text-subtle-text dark:text-dark-subtle-text mt-2">Try searching for something else.</p>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-16 bg-surface dark:bg-dark-surface rounded-2xl">
                     <SearchIcon className="h-12 w-12 mx-auto text-subtle-text dark:text-dark-subtle-text" />
                    <p className="text-lg text-subtle-text dark:text-dark-subtle-text mt-4">Search for transactions by name, category, notes, or payment method.</p>
                </div>
            )}
        </div>
    );
};

export default SearchResults;