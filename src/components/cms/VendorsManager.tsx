import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { Vendor, VendorCategory } from '../../types/tour';
import {
 Building2,
 Car,
 UserCheck,
 Compass,
 Ticket,
 Plane,
 Plus,
 Search,
 Filter,
 Phone,
 Mail,
 MapPin,
 Landmark,
 Star,
 Edit2,
 Trash2,
 X,
 CreditCard,
 CheckCircle2,
 Send,
} from 'lucide-react';

export const VendorsManager: React.FC<{
 onOpenVendorPayment?: (vendorId: string) => void;
}> = ({ onOpenVendorPayment }) => {
 const { vendors, addVendor, updateVendor, deleteVendor, currentStaffUser } = useTours();
 const [searchTerm, setSearchTerm] = useState('');
 const [categoryFilter, setCategoryFilter] = useState<string>('all');
 const [countryFilter, setCountryFilter] = useState<string>('all');
 const [stateFilter, setStateFilter] = useState<string>('all');
 const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
 const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
 const [isCreating, setIsCreating] = useState(false);

 const canEdit =
  currentStaffUser.role === 'super_admin' || currentStaffUser.permissions.canManageVendors;

 const categories: VendorCategory[] = [
  'Hotel',
  'Cab / Taxi Fleet',
  'Chauffeur / Driver',
  'Tour Guide',
  'Activity / Excursion',
  'Flight / Train Desk',
 ];

 const uniqueCountries = Array.from(new Set(vendors.map(v => v.country).filter(Boolean))).sort();
 const uniqueStates = Array.from(new Set(vendors.filter(v => countryFilter === 'all' || v.country === countryFilter).map(v => v.state).filter(Boolean))).sort();

 const [formData, setFormData] = useState<Omit<Vendor, 'id' | 'createdAt'>>({
  name: '',
  category: 'Cab / Taxi Fleet',
  contactPerson: '',
  phone: '',
  email: '',
  city: '',
  state: '',
  country: '',
  address: '',
  bankName: '',
  accountNumber: '',
  ifscOrSwift: '',
  upiId: '',
  rating: 4.8,
  status: 'active',
  notes: '',
 });

 const getCategoryIcon = (cat: VendorCategory) => {
  switch (cat) {
   case 'Hotel':
    return <Building2 className="w-4 h-4 text-amber-600" />;
   case 'Cab / Taxi Fleet':
    return <Car className="w-4 h-4 text-blue-600" />;
   case 'Chauffeur / Driver':
    return <UserCheck className="w-4 h-4 text-emerald-600" />;
   case 'Tour Guide':
    return <Compass className="w-4 h-4 text-purple-600" />;
   case 'Activity / Excursion':
    return <Ticket className="w-4 h-4 text-rose-600" />;
   case 'Flight / Train Desk':
    return <Plane className="w-4 h-4 text-indigo-600" />;
  }
 };

 const handleOpenCreate = () => {
  setFormData({
   name: '',
   category: 'Cab / Taxi Fleet',
   contactPerson: '',
   phone: '',
   email: '',
   city: '',
   state: '',
   country: '',
   address: '',
   bankName: '',
   accountNumber: '',
   ifscOrSwift: '',
   upiId: '',
   rating: 4.8,
   status: 'active',
   notes: '',
  });
  setIsCreating(true);
  setEditingVendor(null);
 };

 const handleOpenEdit = (v: Vendor) => {
  setEditingVendor(v);
  setFormData({
   name: v.name,
   category: v.category,
   contactPerson: v.contactPerson,
   phone: v.phone,
   email: v.email,
   city: v.city,
   state: v.state,
   country: v.country,
   address: v.address,
   bankName: v.bankName,
   accountNumber: v.accountNumber,
   ifscOrSwift: v.ifscOrSwift,
   upiId: v.upiId,
   rating: v.rating,
   status: v.status,
   notes: v.notes,
  });
  setIsCreating(false);
 };

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.name.trim()) return;

  if (editingVendor) {
   updateVendor({
    ...editingVendor,
    ...formData,
   });
   setEditingVendor(null);
  } else {
   addVendor(formData);
   setIsCreating(false);
  }
 };

 const filteredVendors = vendors.filter((v) => {
  const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;
  const matchesCountry = countryFilter === 'all' || v.country === countryFilter;
  const matchesState = stateFilter === 'all' || v.state === stateFilter;
  const matchesSearch =
   v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
   v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
   v.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
   v.phone.includes(searchTerm);
  return matchesCategory && matchesCountry && matchesState && matchesSearch;
 });

 // Bulk Selection Handlers
 const handleToggleSelectAll = () => {
  if (selectedVendorIds.length === filteredVendors.length && filteredVendors.length > 0) {
   setSelectedVendorIds([]);
  } else {
   setSelectedVendorIds(filteredVendors.map((v) => v.id));
  }
 };

 const handleToggleSelect = (id: string) => {
  setSelectedVendorIds((prev) =>
   prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
  );
 };

 const handleBulkDelete = () => {
  if (selectedVendorIds.length === 0) return;
  if (
   window.confirm(
    `Are you sure you want to delete ${selectedVendorIds.length} selected vendor(s)?`
   )
  ) {
   selectedVendorIds.forEach((id) => deleteVendor(id));
   setSelectedVendorIds([]);
  }
 };

 return (
  <div className="space-y-6" id="vendors-manager">
   {/* Header */}
   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 shadow-sm">
    <div>
     <div className="flex items-center gap-2">
      <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
       <Car className="w-5 h-5 text-[#FC3200]" />
       Vendors & Fleet Directory
      </h2>
      <span className="bg-red-50 dark:bg-red-950/50 text-red-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-red-200 ">
       {vendors.length} Partners
      </span>
     </div>
     <p className="text-sm text-stone-500 mt-1">
      Manage partner hotels, taxi fleets, executive chauffeurs, local tour guides, and activity desks.
     </p>
    </div>

    {canEdit && (
     <button
      type="button"
      onClick={handleOpenCreate}
      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FC3200] hover:bg-[#e02c00] text-white rounded-xl font-medium shadow-sm transition-all text-sm shrink-0 w-full md:w-auto"
      id="add-vendor-btn"
     >
      <Plus className="w-4 h-4" />
      Add New Vendor
     </button>
    )}
   </div>

   {/* Filter and Search Bar */}
   <div className="flex flex-col gap-3">
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
     <div className="relative w-full sm:w-1/3">
      <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -transtone-y-1/2" />
      <input
       type="text"
       placeholder="Search vendor by name, city, phone..."
       value={searchTerm}
       onChange={(e) => setSearchTerm(e.target.value)}
       className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-white dark:bg-stone-900 text-stone-900 "
      />
     </div>
     <div className="flex items-center gap-2 w-full sm:w-2/3 justify-end">
      <select
        value={countryFilter}
        onChange={(e) => {
         setCountryFilter(e.target.value);
         setStateFilter('all');
        }}
        className="px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white dark:bg-stone-900 text-stone-700 font-medium"
      >
       <option value="all">All Countries</option>
       {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      
      <select
        value={stateFilter}
        onChange={(e) => setStateFilter(e.target.value)}
        className="px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white dark:bg-stone-900 text-stone-700 font-medium"
        disabled={countryFilter === 'all' && uniqueStates.length === 0}
      >
       <option value="all">All States</option>
       {uniqueStates.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
     </div>
    </div>

    {/* Category Pills */}
    <div className="flex flex-wrap gap-1.5 w-full overflow-x-auto pb-1">
     <button
      type="button"
      onClick={() => setCategoryFilter('all')}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
       categoryFilter === 'all'
        ? 'bg-stone-900 dark:bg-white text-white '
        : 'bg-white dark:bg-stone-900 text-stone-600 border border-stone-200 '
      }`}
     >
      All Vendors
     </button>
     {categories.map((cat) => (
      <button
       key={cat}
       type="button"
       onClick={() => setCategoryFilter(cat)}
       className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
        categoryFilter === cat
         ? 'bg-[#FC3200] text-white shadow-sm'
         : 'bg-white dark:bg-stone-900 text-stone-600 border border-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
       }`}
      >
       {getCategoryIcon(cat)}
       {cat}
      </button>
     ))}
    </div>

    {/* Bulk Actions Bar */}
    {filteredVendors.length > 0 && (
     <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200 rounded-xl flex items-center justify-between text-xs">
      <label className="flex items-center gap-2 font-bold text-stone-700 dark:text-stone-300 cursor-pointer select-none">
       <input
        type="checkbox"
        checked={
         selectedVendorIds.length === filteredVendors.length && filteredVendors.length > 0
        }
        onChange={handleToggleSelectAll}
        className="w-4 h-4 rounded border-stone-300 text-[#FC3200] focus:ring-[#FC3200] cursor-pointer"
       />
       <span>Select All Vendors ({filteredVendors.length})</span>
      </label>

      {selectedVendorIds.length > 0 && (
       <div className="flex items-center gap-2 animate-fade-in">
        <span className="font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
         {selectedVendorIds.length} Selected
        </span>
        <button
         type="button"
         onClick={handleBulkDelete}
         className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
        >
         <Trash2 className="w-3.5 h-3.5" />
         <span>Delete Selected ({selectedVendorIds.length})</span>
        </button>
       </div>
      )}
     </div>
    )}
   </div>

   {/* Vendors Grid */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {filteredVendors.map((vendor) => (
     <div
      key={vendor.id}
      className={`rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
       selectedVendorIds.includes(vendor.id)
        ? 'border-[#FC3200] ring-2 ring-[#FC3200]/20 bg-orange-50/20'
        : 'bg-white dark:bg-stone-900 border-stone-200'
      }`}
      id={`vendor-card-${vendor.id}`}
     >
      <div>
       {/* Header */}
       <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
         <input
          type="checkbox"
          checked={selectedVendorIds.includes(vendor.id)}
          onChange={() => handleToggleSelect(vendor.id)}
          className="w-4 h-4 rounded border-stone-300 text-[#FC3200] focus:ring-[#FC3200] cursor-pointer"
         />
         <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 ">
          {getCategoryIcon(vendor.category)}
         </div>
         <div>
          <h3 className="font-bold text-stone-900 dark:text-white text-sm leading-tight">
           {vendor.name}
          </h3>
          <p className="text-xs text-stone-500 font-medium">{vendor.category}</p>
         </div>
        </div>

        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold border border-amber-200 ">
         <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
         {vendor.rating.toFixed(1)}
        </div>
       </div>

       {/* Contact Information */}
       <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600 ">
        <div className="flex items-center gap-2">
         <UserCheck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
         <span className="font-medium text-stone-700 truncate">
          {vendor.contactPerson || 'General Desk'}
         </span>
        </div>
        <div className="flex items-center gap-2">
         <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
         <span className="truncate">{vendor.phone || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
         <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
         <span className="truncate">{vendor.email || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
         <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
         <span className="truncate">
          {[vendor.city, vendor.state, vendor.country].filter(Boolean).join(', ') || 'Location N/A'}
         </span>
        </div>
       </div>

       {/* Banking & Payout Credentials Box */}
       <div className="mt-4 p-3 bg-stone-50 dark:bg-stone-950/60 rounded-xl border border-stone-100 text-[11px] space-y-1">
        <div className="flex items-center justify-between text-stone-500 font-bold uppercase tracking-wider text-[10px]">
         <span className="flex items-center gap-1">
          <Landmark className="w-3 h-3 text-[#FC3200]" /> Payout Banking Details
         </span>
         <span className="text-emerald-600 font-semibold">Verified</span>
        </div>
        <p className="text-stone-700 ">
         <span className="text-stone-400">Bank:</span> {vendor.bankName || 'HDFC / SBI'}
        </p>
        <p className="text-stone-700 ">
         <span className="text-stone-400">A/C:</span> {vendor.accountNumber || 'Pending'}
        </p>
        {vendor.upiId && (
         <p className="text-stone-700 ">
          <span className="text-stone-400">UPI:</span> {vendor.upiId}
         </p>
        )}
       </div>

       {vendor.notes && (
        <p className="mt-3 text-xs text-stone-500 italic bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-100">
         "{vendor.notes}"
        </p>
       )}
      </div>

      {/* Actions */}
      <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
       {onOpenVendorPayment && (
        <button
         type="button"
         onClick={() => onOpenVendorPayment(vendor.id)}
         className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/50 text-red-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center"
         id={`issue-voucher-${vendor.id}`}
        >
         <CreditCard className="w-3.5 h-3.5" />
         Issue Payment Voucher
        </button>
       )}

       {canEdit && (
        <div className="flex items-center gap-1 ml-auto">
         <button
          type="button"
          onClick={() => handleOpenEdit(vendor)}
          className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          title="Edit Vendor"
          id={`edit-vendor-${vendor.id}`}
         >
          <Edit2 className="w-3.5 h-3.5" />
         </button>
         <button
          type="button"
          onClick={() => {
           if (confirm(`Delete vendor partner ${vendor.name}?`)) {
            deleteVendor(vendor.id);
           }
          }}
          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
          title="Delete Vendor"
          id={`delete-vendor-${vendor.id}`}
         >
          <Trash2 className="w-3.5 h-3.5" />
         </button>
        </div>
       )}
      </div>
     </div>
    ))}
   </div>

   {/* Add / Edit Modal */}
   {(isCreating || editingVendor) && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
     <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full border border-stone-200 shadow-2xl flex flex-col max-h-[95vh]">
      <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/50">
       <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-[#FC3200]" />
        <h3 className="text-lg font-bold text-stone-900 dark:text-white">
         {editingVendor ? `Edit Vendor: ${editingVendor.name}` : 'Register New Vendor Partner'}
        </h3>
       </div>
       <button
        type="button"
        onClick={() => {
         setIsCreating(false);
         setEditingVendor(null);
        }}
        className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg"
       >
        <X className="w-5 h-5" />
       </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Vendor Business / Fleet Name *
         </label>
         <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-sm font-semibold"
          placeholder="e.g. Himalayan Cabs & Innovas"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Service Category *
         </label>
         <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as VendorCategory })}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-sm font-medium"
         >
          {categories.map((cat) => (
           <option key={cat} value={cat}>
            {cat}
           </option>
          ))}
         </select>
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Contact Person / Manager
         </label>
         <input
          type="text"
          value={formData.contactPerson}
          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-sm"
          placeholder="e.g. Farooq Ahmad"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Direct Phone / WhatsApp *
         </label>
         <input
          type="text"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-sm"
          placeholder="+91 94190 12345"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Official Email
         </label>
         <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-sm"
          placeholder="vendor@booking.com"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Country
         </label>
         <input
          type="text"
          value={formData.country}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-sm"
          placeholder="e.g. India / Indonesia"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          State / Province
         </label>
         <input
          type="text"
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-sm"
          placeholder="e.g. Jammu & Kashmir / Himachal Pradesh"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Operational City
         </label>
         <input
          type="text"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-sm"
          placeholder="e.g. Srinagar / Kuta"
         />
        </div>
       </div>

       {/* Payout Bank Details */}
       <div className="pt-4 border-t border-stone-100 space-y-3">
        <h4 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 w-full sm:w-auto justify-center">
         <Landmark className="w-4 h-4 text-[#FC3200]" /> Vendor Payout Bank Details
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
         <div>
          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
           Bank Name
          </label>
          <input
           type="text"
           value={formData.bankName}
           onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
           className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white dark:bg-stone-950 text-xs"
           placeholder="e.g. State Bank of India / HDFC"
          />
         </div>

         <div>
          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
           Bank Account Number
          </label>
          <input
           type="text"
           value={formData.accountNumber}
           onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
           className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white dark:bg-stone-950 text-xs"
           placeholder="e.g. 5020001234567"
          />
         </div>

         <div>
          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
           IFSC / SWIFT Code
          </label>
          <input
           type="text"
           value={formData.ifscOrSwift}
           onChange={(e) => setFormData({ ...formData, ifscOrSwift: e.target.value })}
           className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white dark:bg-stone-950 text-xs"
           placeholder="e.g. SBIN0000722"
          />
         </div>

         <div>
          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
           UPI ID / Virtual ID
          </label>
          <input
           type="text"
           value={formData.upiId}
           onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
           className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white dark:bg-stone-950 text-xs"
           placeholder="e.g. vendor@okhdfcbank"
          />
         </div>
        </div>
       </div>

       <div>
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
         Contract Terms / Operational Notes
        </label>
        <textarea
         rows={2}
         value={formData.notes}
         onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
         className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-xs"
         placeholder="e.g. Advance policy, vehicle models, driver night charges included..."
        />
       </div>

       <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 ">
        <button
         type="button"
         onClick={() => {
          setIsCreating(false);
          setEditingVendor(null);
         }}
         className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800"
        >
         Cancel
        </button>
        <button
         type="submit"
         className="px-5 py-2.5 bg-[#FC3200] hover:bg-[#e02c00] text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
         id="save-vendor-btn"
        >
         {editingVendor ? 'Save Changes' : 'Register Vendor'}
        </button>
       </div>
      </form>
     </div>
    </div>
   )}
  </div>
 );
};
