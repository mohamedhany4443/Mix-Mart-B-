import React, { useState } from 'react';
import { useCoffee } from '../context/CoffeeContext';
import { Drink } from '../types';
import {
  X,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Download,
  DollarSign,
  Tag,
  Clock,
  KeyRound,
  TrendingUp,
  Crown,
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSales?: () => void;
  onOpenOwner?: () => void;
  onOpenManager?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onOpenSales,
  onOpenOwner,
}) => {
  const {
    categories,
    drinks,
    orders,
    settings,
    updateOrderStatus,
    addDrink,
    updateDrink,
    deleteDrink,
    toggleDrinkAvailability,
    addCategory,
    deleteCategory,
    updateSettings,
    resetToDefaults,
    exportCatalogJSON,
    importCatalogJSON,
  } = useCoffee();

  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'drinks' | 'categories' | 'settings'>('drinks');

  // Filter state for drinks manager
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [drinkSearch, setDrinkSearch] = useState('');

  // Add/Edit Drink Modal State
  const [isEditingDrink, setIsEditingDrink] = useState<Drink | null>(null);
  const [isAddingDrink, setIsAddingDrink] = useState(false);
  const [drinkFormData, setDrinkFormData] = useState({
    name: '',
    price: '',
    categoryId: categories[0]?.id || '',
    note: '',
    image: '/src/assets/images/drink_gold_velvet_latte_1793735059448.jpg',
    isAvailable: true,
    isPopular: false,
    temperature: 'both' as 'hot' | 'iced' | 'both',
  });

  // Category Edit state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Import JSON state
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.adminPin || pinInput === '1234') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Incorrect PIN. (Default is 1234)');
    }
  };

  const openAddDrinkModal = () => {
    setDrinkFormData({
      name: '',
      price: '',
      categoryId: categories[0]?.id || '',
      note: '',
      image: '/src/assets/images/drink_espresso_cappuccino_1793735059392.jpg',
      isAvailable: true,
      isPopular: false,
      temperature: 'both',
    });
    setIsAddingDrink(true);
  };

  const openEditDrinkModal = (drink: Drink) => {
    setIsEditingDrink(drink);
    setDrinkFormData({
      name: drink.name,
      price: drink.price.toString(),
      categoryId: drink.categoryId,
      note: drink.note || '',
      image: drink.image || '/src/assets/images/drink_espresso_cappuccino_1793735059392.jpg',
      isAvailable: drink.isAvailable,
      isPopular: !!drink.isPopular,
      temperature: drink.temperature || 'both',
    });
  };

  const handleSaveDrink = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(drinkFormData.price);
    if (!drinkFormData.name.trim() || isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid drink name and positive price.');
      return;
    }

    if (isEditingDrink) {
      updateDrink({
        ...isEditingDrink,
        name: drinkFormData.name.trim(),
        price: priceNum,
        categoryId: drinkFormData.categoryId,
        note: drinkFormData.note.trim() || undefined,
        image: drinkFormData.image.trim() || undefined,
        isAvailable: drinkFormData.isAvailable,
        isPopular: drinkFormData.isPopular,
        temperature: drinkFormData.temperature,
      });
      setIsEditingDrink(null);
    } else {
      addDrink({
        name: drinkFormData.name.trim(),
        price: priceNum,
        categoryId: drinkFormData.categoryId,
        note: drinkFormData.note.trim() || undefined,
        image: drinkFormData.image.trim() || undefined,
        isAvailable: drinkFormData.isAvailable,
        isPopular: drinkFormData.isPopular,
        temperature: drinkFormData.temperature,
      });
      setIsAddingDrink(false);
    }
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
      name: newCatName.trim(),
      description: newCatDesc.trim(),
      sortOrder: categories.length + 1,
    });
    setNewCatName('');
    setNewCatDesc('');
    setIsAddingCategory(false);
  };

  const handleExport = () => {
    const data = exportCatalogJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mix-mart-menu-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    const ok = importCatalogJSON(importText);
    if (ok) {
      setImportStatus('Menu imported successfully!');
      setTimeout(() => setImportStatus(null), 3000);
      setImportText('');
    } else {
      setImportStatus('Invalid JSON format. Please verify schema.');
    }
  };

  // Filtered drinks list
  const filteredDrinks = drinks.filter((d) => {
    const matchesCat = filterCategory === 'all' || d.categoryId === filterCategory;
    const matchesSearch =
      drinkSearch === '' || d.name.toLowerCase().includes(drinkSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl text-slate-900 max-h-[92vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="h-1 bg-slate-900" />

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 relative">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950">
                MIX MART Management Console
              </h2>
              <div className="text-[11px] text-slate-500 font-medium">
                Manage Drinks, Prices, Categories & Live Pickup Orders
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Screen if not authenticated */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4 relative">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
              <KeyRound className="w-7 h-7" />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-950">Staff Verification</h3>
            <p className="text-xs text-slate-600">
              Enter the 4-digit barista / manager security PIN to access the drinks catalog and live orders.
            </p>

            <form onSubmit={handlePinSubmit} className="w-full space-y-3 pt-2">
              <input
                type="password"
                maxLength={8}
                autoFocus
                placeholder="Enter PIN (Default: 1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-900 text-center font-mono tracking-widest text-lg rounded-xl text-slate-900 outline-none"
              />
              {pinError && <div className="text-xs text-rose-600 font-medium">{pinError}</div>}
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Unlock Admin Console
              </button>
              <div className="text-[11px] text-slate-500 font-medium">
                Demo Default PIN: <strong className="text-slate-900 font-bold">1234</strong>
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <>
            {/* Tab Navigation */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 overflow-x-auto no-scrollbar gap-2 relative">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('drinks')}
                  className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                    activeTab === 'drinks'
                      ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Drinks & Prices ({drinks.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                    activeTab === 'orders'
                      ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pickup Queue ({orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('categories')}
                  className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                    activeTab === 'categories'
                      ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Categories ({categories.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                    activeTab === 'settings'
                      ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Store Settings & Backup</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 my-1">
                {onOpenOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenOwner();
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-full bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-300" />
                    <span>Owner Portal</span>
                  </button>
                )}

                {onOpenSales && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSales();
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-full bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-slate-900" />
                    <span>Sales %</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* TAB 1: DRINKS & PRICES */}
              {activeTab === 'drinks' && (
                <div className="space-y-4">
                  {/* Top Bar: Search, Category Filter, Add Button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      <input
                        type="text"
                        placeholder="Search drink name..."
                        value={drinkSearch}
                        onChange={(e) => setDrinkSearch(e.target.value)}
                        className="px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-900 text-xs rounded-xl text-slate-900 outline-none min-w-[160px]"
                      />
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-900 text-xs rounded-xl text-slate-900 outline-none"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={openAddDrinkModal}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Drink</span>
                    </button>
                  </div>

                  {/* Drinks Table / List */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="py-3 px-4">Drink Name</th>
                          <th className="py-3 px-3">Category</th>
                          <th className="py-3 px-3">Price</th>
                          <th className="py-3 px-3 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredDrinks.map((dr) => {
                          const cat = categories.find((c) => c.id === dr.categoryId);
                          return (
                            <tr
                              key={dr.id}
                              className={`hover:bg-slate-50 transition-colors ${
                                !dr.isAvailable ? 'opacity-60 bg-slate-50/50' : ''
                              }`}
                            >
                              <td className="py-3 px-4">
                                <div className="font-display text-sm font-bold text-slate-950">
                                  {dr.name}
                                </div>
                                {dr.note && (
                                  <div className="text-[11px] text-slate-500 truncate max-w-xs">
                                    {dr.note}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3 text-slate-600 font-medium">
                                {cat ? cat.name : 'Unknown'}
                              </td>
                              <td className="py-3 px-3 font-mono font-bold tabular-nums text-slate-950">
                                {settings.currencySymbol}
                                {dr.price.toFixed(2)}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleDrinkAvailability(dr.id)}
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                    dr.isAvailable
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                                  }`}
                                >
                                  {dr.isAvailable ? 'In Stock' : 'Sold Out'}
                                </button>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openEditDrinkModal(dr)}
                                    title="Edit Drink or Price"
                                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Delete "${dr.name}" from catalog?`)) {
                                        deleteDrink(dr.id);
                                      }
                                    }}
                                    title="Delete Drink"
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: PICKUP ORDERS QUEUE */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Real-time Counter Pickup Orders</span>
                    <span>Total Orders: {orders.length}</span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <Clock className="w-8 h-8 mx-auto text-slate-400" />
                      <p>No active customer pickup orders right now.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                        >
                          {/* Order Info */}
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-base font-bold text-slate-950">
                                #{ord.orderNumber}
                              </span>
                              <span className="font-semibold text-slate-900">
                                {ord.customerName}
                              </span>
                              <span className="text-slate-500">({ord.customerPhone})</span>
                            </div>

                            <div className="text-[11px] text-slate-600 flex items-center gap-3">
                              <span>Pickup Target: <strong className="text-slate-950">{ord.pickupTime}</strong></span>
                              <span>·</span>
                              <span>Total: <strong className="text-slate-950 font-mono font-bold">{settings.currencySymbol}{ord.total.toFixed(2)}</strong></span>
                            </div>

                            <div className="text-[11px] text-slate-700 pt-1">
                              {ord.items.map((it, idx) => (
                                <span key={idx} className="mr-2 inline-block">
                                  {it.quantity}× {it.name} ({it.size})
                                </span>
                              ))}
                            </div>

                            {ord.notes && (
                              <div className="text-[11px] text-amber-800 italic">
                                Note: {ord.notes}
                              </div>
                            )}
                          </div>

                          {/* Status Actions */}
                          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-slate-500 mr-1 font-medium">Status:</span>

                            <button
                              type="button"
                              onClick={() => updateOrderStatus(ord.id, 'received')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                ord.status === 'received'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Received
                            </button>

                            <button
                              type="button"
                              onClick={() => updateOrderStatus(ord.id, 'preparing')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                ord.status === 'preparing'
                                  ? 'bg-slate-900 text-white font-extrabold'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Brewing
                            </button>

                            <button
                              type="button"
                              onClick={() => updateOrderStatus(ord.id, 'ready')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                ord.status === 'ready'
                                  ? 'bg-emerald-600 text-white font-bold'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Ready for Pickup
                            </button>

                            <button
                              type="button"
                              onClick={() => updateOrderStatus(ord.id, 'completed')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                ord.status === 'completed'
                                  ? 'bg-slate-200 text-slate-900'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Completed
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CATEGORIES */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      Manage menu categories displayed in the exterior rail and section headers.
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Category</span>
                    </button>
                  </div>

                  {isAddingCategory && (
                    <form
                      onSubmit={handleAddCategorySubmit}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                    >
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
                        Create New Category
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Category Name (e.g. Seasonal Holiday Specials)"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          className="px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 text-xs rounded-xl text-slate-900 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Short description / subtitle"
                          value={newCatDesc}
                          onChange={(e) => setNewCatDesc(e.target.value)}
                          className="px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 text-xs rounded-xl text-slate-900 outline-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingCategory(false)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
                        >
                          Save Category
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {categories.map((cat) => {
                      const count = drinks.filter((d) => d.categoryId === cat.id).length;
                      return (
                        <div
                          key={cat.id}
                          className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-xs"
                        >
                          <div>
                            <div className="font-display text-sm font-semibold text-slate-950">
                              {cat.name}
                            </div>
                            {cat.description && (
                              <div className="text-[11px] text-slate-500">
                                {cat.description}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[11px] text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 font-bold">
                              {count} {count === 1 ? 'drink' : 'drinks'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (count > 0) {
                                  alert(
                                    `Cannot delete category "${cat.name}" while it has ${count} drink(s). Reassign or delete those drinks first.`
                                  );
                                  return;
                                }
                                if (confirm(`Delete empty category "${cat.name}"?`)) {
                                  deleteCategory(cat.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: STORE SETTINGS & DATA BACKUP */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Store Configurations */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                    <h3 className="font-display text-base font-bold text-slate-950">
                      Storefront & Pickup Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">
                          Store Name
                        </label>
                        <input
                          type="text"
                          value={settings.storeName}
                          onChange={(e) => updateSettings({ storeName: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">
                          Pickup Counter Name
                        </label>
                        <input
                          type="text"
                          value={settings.pickupCounterName}
                          onChange={(e) => updateSettings({ pickupCounterName: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">
                          Estimated Wait Time (Minutes)
                        </label>
                        <input
                          type="number"
                          value={settings.defaultWaitTimeMinutes}
                          onChange={(e) =>
                            updateSettings({ defaultWaitTimeMinutes: parseInt(e.target.value) || 10 })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">
                          Admin Security PIN
                        </label>
                        <input
                          type="text"
                          maxLength={8}
                          value={settings.adminPin}
                          onChange={(e) => updateSettings({ adminPin: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Menu Backup & Restore */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                    <h3 className="font-display text-base font-bold text-slate-950">
                      Menu Data Backup & JSON Sync
                    </h3>
                    <p className="text-xs text-slate-500">
                      Export your entire MIX MART coffee catalog and prices to a JSON file or import a backup.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleExport}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        <Download className="w-4 h-4 text-slate-900" />
                        <span>Export Menu JSON</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              'Reset menu back to MIX MART factory default items and categories? Any custom drinks will be replaced.'
                            )
                          ) {
                            resetToDefaults();
                            alert('Menu reset to MIX MART defaults.');
                          }
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Reset to Factory Menu</span>
                      </button>
                    </div>

                    <div className="pt-2 space-y-2">
                      <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        Paste JSON to Import
                      </label>
                      <textarea
                        rows={3}
                        placeholder='{"categories": [...], "drinks": [...]}'
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleImportSubmit}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                      >
                        Import JSON
                      </button>
                      {importStatus && (
                        <span className="text-xs ml-3 text-slate-700 font-medium">{importStatus}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal: Add / Edit Drink */}
        {(isAddingDrink || isEditingDrink) && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
              className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-900 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-display text-xl font-bold text-slate-950">
                  {isEditingDrink ? 'Edit Drink & Price' : 'Add New Drink'}
                </h3>
                <button
                  onClick={() => {
                    setIsAddingDrink(false);
                    setIsEditingDrink(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-900 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveDrink} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">
                    Drink Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spanish Saffron Latte"
                    value={drinkFormData.name}
                    onChange={(e) =>
                      setDrinkFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">
                      Price ({settings.currencySymbol}) *
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.5"
                      required
                      placeholder="e.g. 5.75"
                      value={drinkFormData.price}
                      onChange={(e) =>
                        setDrinkFormData((p) => ({ ...p, price: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-xl text-xs text-slate-900 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">
                      Category *
                    </label>
                    <select
                      value={drinkFormData.categoryId}
                      onChange={(e) =>
                        setDrinkFormData((p) => ({ ...p, categoryId: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-xl text-xs text-slate-900 outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">
                    Roast / Origin / Tasting Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Double shot · notes of honey and roasted hazelnut"
                    value={drinkFormData.note}
                    onChange={(e) =>
                      setDrinkFormData((p) => ({ ...p, note: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={drinkFormData.isAvailable}
                      onChange={(e) =>
                        setDrinkFormData((p) => ({ ...p, isAvailable: e.target.checked }))
                      }
                      className="rounded accent-slate-900"
                    />
                    <span>In Stock</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={drinkFormData.isPopular}
                      onChange={(e) =>
                        setDrinkFormData((p) => ({ ...p, isPopular: e.target.checked }))
                      }
                      className="rounded accent-slate-900"
                    />
                    <span>Highlight as Favorite</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingDrink(false);
                      setIsEditingDrink(null);
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 hover:bg-slate-100 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Save Drink
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
