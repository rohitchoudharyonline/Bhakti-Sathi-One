import React, { useState, useMemo } from 'react';
import { useTours } from '../../context/TourContext';
import { RegisteredTravelerUser } from '../../types/cms';
import { formatBookingNumber } from '../../utils/bookingHelper';
import {
  Users,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  CheckCircle2,
  Ban,
  Trash2,
  Edit,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Copy,
  ExternalLink,
  MessageCircle,
  X,
  CreditCard,
  Luggage,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const UsersManager: React.FC = () => {
  const {
    registeredUsers,
    addRegisteredUser,
    updateRegisteredUser,
    toggleBlockUser,
    deleteRegisteredUser,
    inquiries,
    agencySettings,
  } = useTours();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'blocked'>('All');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<RegisteredTravelerUser | null>(null);
  const [selectedUserForBookings, setSelectedUserForBookings] = useState<RegisteredTravelerUser | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // New / Edit User Form State
  const [userFormData, setUserFormData] = useState<Partial<RegisteredTravelerUser>>({
    name: '',
    email: '',
    phone: '+91 ',
    city: 'Srinagar',
    state: 'Jammu & Kashmir',
    country: 'India',
    memberTier: 'Member',
    status: 'active',
    authProvider: 'google',
    notes: '',
  });

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return registeredUsers.filter((u) => {
      if (statusFilter !== 'All' && u.status !== statusFilter) return false;
      if (tierFilter !== 'All' && u.memberTier !== tierFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesPhone = (u.phone || '').toLowerCase().includes(q);
        const matchesCity = (u.city || '').toLowerCase().includes(q);
        const matchesState = (u.state || '').toLowerCase().includes(q);
        const matchesBooking = (u.bookingIds || []).some((b) =>
          formatBookingNumber(b).toLowerCase().includes(q)
        );
        return matchesName || matchesEmail || matchesPhone || matchesCity || matchesState || matchesBooking;
      }
      return true;
    });
  }, [registeredUsers, statusFilter, tierFilter, searchTerm]);

  // Statistics
  const totalUsersCount = registeredUsers.length;
  const activeUsersCount = registeredUsers.filter((u) => u.status === 'active').length;
  const blockedUsersCount = registeredUsers.filter((u) => u.status === 'blocked').length;
  const totalBookingsCount = registeredUsers.reduce((sum, u) => sum + (u.totalBookings || 0), 0);

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedUserIds.length} selected traveler account(s)?`
      )
    ) {
      selectedUserIds.forEach((id) => deleteRegisteredUser(id));
      setSelectedUserIds([]);
    }
  };

  // Copy Feedback Helper
  const triggerCopyFeedback = (msg: string) => {
    setCopiedNotice(msg);
    setTimeout(() => setCopiedNotice(null), 3000);
  };

  // 1. Export Excel / CSV Function
  const exportToCSV = () => {
    const headers = [
      'Full Name',
      'Email Address',
      'WhatsApp / Phone',
      'City',
      'State',
      'Country',
      'Account Status',
      'Membership Tier',
      'Auth Provider',
      'Signup Date',
      'Total Bookings',
      'Total Spent (INR)',
      'Booking Reference IDs',
      'Admin Notes',
    ];

    const rows = filteredUsers.map((u) => [
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email.replace(/"/g, '""')}"`,
      `"${(u.phone || '').replace(/"/g, '""')}"`,
      `"${(u.city || '').replace(/"/g, '""')}"`,
      `"${(u.state || '').replace(/"/g, '""')}"`,
      `"${(u.country || '').replace(/"/g, '""')}"`,
      `"${u.status.toUpperCase()}"`,
      `"${u.memberTier}"`,
      `"${u.authProvider}"`,
      `"${u.signupDate}"`,
      u.totalBookings || 0,
      u.totalSpent || 0,
      `"${(u.bookingIds || []).map((b) => formatBookingNumber(b)).join(', ')}"`,
      `"${(u.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Holidays_Hunt_Travelers_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerCopyFeedback('Excel / CSV Export Downloaded');
  };

  // 2. Export Word (.doc) Function
  const exportToWord = () => {
    const rowsHtml = filteredUsers
      .map(
        (u, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
        <td style="padding: 8px; border: 1px solid #ddd;">${u.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${u.email}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${u.phone || 'N/A'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${u.city || 'N/A'}, ${u.state || ''}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: ${u.status === 'active' ? '#047857' : '#b91c1c'};">${u.status.toUpperCase()}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${u.memberTier}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${(u.bookingIds || []).map((b) => formatBookingNumber(b)).join(', ') || 'None'}</td>
      </tr>
    `
      )
      .join('');

    const wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Holidays Hunt - Registered Travelers Directory</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #FF4B00; font-size: 20pt; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background-color: #1A1A1A; color: white; padding: 10px; border: 1px solid #1A1A1A; text-align: left; }
        </style>
      </head>
      <body>
        <h1>${agencySettings.agencyName} - Registered Travelers & Users Directory</h1>
        <p><strong>Generated On:</strong> ${new Date().toLocaleString('en-IN')} | <strong>Total Accounts:</strong> ${filteredUsers.length}</p>
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email Address</th>
              <th>WhatsApp / Phone</th>
              <th>Location</th>
              <th>Status</th>
              <th>Member Tier</th>
              <th>Booking Numbers</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF', wordContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Holidays_Hunt_Travelers_Directory_${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerCopyFeedback('Word Document (.doc) Exported');
  };

  // 3. Export PDF Function via jsPDF & AutoTable
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Header Branding
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, 297, 24, 'F');

    doc.setTextColor(255, 75, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${agencySettings.agencyName} - Registered Travelers & Leads Directory`, 14, 15);

    doc.setTextColor(200, 200, 200);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exported: ${new Date().toLocaleDateString('en-IN')} | Total Accounts: ${filteredUsers.length}`, 200, 15);

    const tableData = filteredUsers.map((u) => [
      u.name,
      u.email,
      u.phone || 'N/A',
      `${u.city || ''}, ${u.state || ''}`,
      u.status.toUpperCase(),
      u.memberTier,
      (u.bookingIds || []).map((b) => formatBookingNumber(b)).join(', ') || 'N/A',
      u.signupDate || 'N/A',
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Name', 'Email Address', 'WhatsApp / Phone', 'City / State', 'Status', 'Tier', 'Booking Numbers', 'Joined']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 75, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 30, 30],
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      styles: {
        cellPadding: 3,
      },
    });

    doc.save(`Holidays_Hunt_Travelers_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    triggerCopyFeedback('PDF Directory Report Downloaded');
  };

  // 4. Quick Broadcast Copy Handlers
  const copyEmailsList = () => {
    const emails = filteredUsers
      .map((u) => u.email)
      .filter(Boolean)
      .join(', ');
    navigator.clipboard.writeText(emails);
    triggerCopyFeedback(`Copied ${filteredUsers.length} Emails for Newsletter / BCC`);
  };

  const copyWhatsAppList = () => {
    const phones = filteredUsers
      .map((u) => (u.phone || '').replace(/[^0-9+]/g, ''))
      .filter(Boolean)
      .join('\n');
    navigator.clipboard.writeText(phones);
    triggerCopyFeedback(`Copied ${filteredUsers.length} WhatsApp Numbers`);
  };

  // Form Handlers
  const handleOpenEdit = (user: RegisteredTravelerUser) => {
    setSelectedUserForEdit(user);
    setUserFormData({ ...user });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name || !userFormData.email) {
      alert('Please enter user name and email.');
      return;
    }

    if (selectedUserForEdit) {
      updateRegisteredUser({
        ...selectedUserForEdit,
        ...userFormData,
      } as RegisteredTravelerUser);
      setSelectedUserForEdit(null);
      triggerCopyFeedback('User Account Updated Successfully');
    } else {
      addRegisteredUser({
        name: userFormData.name || 'Traveler User',
        email: userFormData.email || '',
        phone: userFormData.phone || '+91 ',
        city: userFormData.city || 'Srinagar',
        state: userFormData.state || 'Jammu & Kashmir',
        country: userFormData.country || 'India',
        status: userFormData.status || 'active',
        memberTier: userFormData.memberTier || 'Member',
        authProvider: userFormData.authProvider || 'google',
        lastLogin: 'Just now',
        totalBookings: 0,
        totalSpent: 0,
        avatar: userFormData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        notes: userFormData.notes || '',
        bookingIds: [],
      });
      setIsAddUserModalOpen(false);
      triggerCopyFeedback('New Traveler User Created');
    }
  };

  // Find linked inquiries for a specific user
  const getUserInquiries = (user: RegisteredTravelerUser) => {
    return inquiries.filter(
      (inq) =>
        inq.email.toLowerCase() === user.email.toLowerCase() ||
        (user.bookingIds && user.bookingIds.some((b) => b === inq.id || formatBookingNumber(b) === formatBookingNumber(inq.id)))
    );
  };

  return (
    <div className="space-y-6" id="registered-users-module">
      {/* Toast Notification */}
      {copiedNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs font-black px-4 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{copiedNotice}</span>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Total Travelers</span>
            <Users className="w-4 h-4 text-[#FF4B00]" />
          </div>
          <div className="text-2xl font-black text-stone-900">{totalUsersCount}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">Signed up & Active profiles</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Active Accounts</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{activeUsersCount}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">Verified & Allowed login</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Blocked Accounts</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">{blockedUsersCount}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">Restricted from portal</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Linked Bookings</span>
            <Luggage className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600">{totalBookingsCount}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">With custom booking IDs</div>
        </div>
      </div>

      {/* Main Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Name, Email, WhatsApp Phone, City, or Booking Number (e.g. HH76868)..."
              className="w-full text-xs font-bold bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40 placeholder:font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Buttons: Add User & Export Multi-Format */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setUserFormData({
                  name: '',
                  email: '',
                  phone: '+91 ',
                  city: 'Srinagar',
                  state: 'Jammu & Kashmir',
                  country: 'India',
                  memberTier: 'Member',
                  status: 'active',
                  authProvider: 'google',
                  notes: '',
                });
                setSelectedUserForEdit(null);
                setIsAddUserModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add User Profile</span>
            </button>

            {/* Export Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#FF4B00] hover:bg-[#E03E00] text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export & Broadcast Data</span>
            </button>
          </div>
        </div>

        {/* Filter Pills & Quick Copy Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider mr-1">Status:</span>
            {(['All', 'active', 'blocked'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st === 'All' ? 'All Accounts' : st === 'active' ? 'Active Only' : 'Blocked Only'}
              </button>
            ))}

            <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider ml-2 mr-1">Tier:</span>
            {['All', 'Member', 'Silver Explorer', 'Gold Explorer', 'Holidays Hunt Elite'].map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setTierFilter(tier)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                  tierFilter === tier
                    ? 'bg-[#FFF0EB] border border-[#FF4B00]/40 text-[#FF4B00]'
                    : 'bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={copyWhatsAppList}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Copy WhatsApp numbers for bulk broadcast"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copy WhatsApp List</span>
            </button>

            <button
              type="button"
              onClick={copyEmailsList}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Copy emails for Newsletter / BCC"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>Copy Email List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-stone-900">Traveler User Accounts</h3>
            <span className="text-xs bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full font-black">
              {filteredUsers.length} shown
            </span>
          </div>

          {filteredUsers.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={
                    selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0
                  }
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded border-stone-300 text-[#FF4B00] focus:ring-[#FF4B00] cursor-pointer"
                />
                <span>Select All ({filteredUsers.length})</span>
              </label>

              {selectedUserIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedUserIds.length})</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] uppercase tracking-wider font-black text-stone-500">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0
                    }
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-stone-300 text-[#FF4B00] focus:ring-[#FF4B00] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Traveler / Account</th>
                <th className="py-3.5 px-4">Contact Details</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Bookings & IDs</th>
                <th className="py-3.5 px-4">Tier & Spend</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isBlocked = user.status === 'blocked';
                  const userInquiries = getUserInquiries(user);

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-stone-50/80 transition ${
                        selectedUserIds.includes(user.id) ? 'bg-orange-50/30' : isBlocked ? 'bg-rose-50/40 opacity-80' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={() => handleToggleSelect(user.id)}
                          className="w-4 h-4 rounded border-stone-300 text-[#FF4B00] focus:ring-[#FF4B00] cursor-pointer"
                        />
                      </td>
                      {/* Traveler Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border border-stone-200 shrink-0"
                          />
                          <div>
                            <div className="font-black text-stone-900 text-sm flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {user.email === 'care@holidayshunt.com' && (
                                <span className="bg-[#FFF0EB] text-[#FF4B00] text-[9px] px-1.5 py-0.2 rounded-md uppercase font-black">
                                  Official
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-400 mt-0.5">
                              Joined: {user.signupDate || '2026-08'} • {user.authProvider === 'google' ? 'Google Auth' : 'Email'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-stone-900">
                          <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-stone-600 font-semibold">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{user.phone || '+91 94199 15255'}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-stone-700 font-bold">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{user.city || 'Srinagar'}</span>
                        </div>
                        <div className="text-[11px] text-stone-400">{user.state || 'Jammu & Kashmir'}</div>
                      </td>

                      {/* Bookings & IDs */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => setSelectedUserForBookings(user)}
                            className="inline-flex items-center gap-1 font-black text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-xl transition cursor-pointer"
                          >
                            <Luggage className="w-3 h-3 text-purple-600" />
                            <span>{user.totalBookings || userInquiries.length || 1} Bookings</span>
                          </button>

                          {/* Render booking number pills */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {((user.bookingIds && user.bookingIds.length > 0)
                              ? user.bookingIds
                              : userInquiries.map((i) => i.id)
                            )
                              .slice(0, 2)
                              .map((bId) => {
                                const formatted = formatBookingNumber(bId);
                                return (
                                  <span
                                    key={bId}
                                    className="text-[10px] font-black bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md border border-stone-200"
                                  >
                                    {formatted}
                                  </span>
                                );
                              })}
                          </div>
                        </div>
                      </td>

                      {/* Tier & Spend */}
                      <td className="py-4 px-4">
                        <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                          {user.memberTier}
                        </span>
                        <div className="text-[11px] font-bold text-stone-700 mt-1">
                          ₹{(user.totalSpent || 45000).toLocaleString('en-IN')} Spent
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                            <Ban className="w-3 h-3 text-rose-600" />
                            <span>Blocked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Action Controls */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Block / Unblock Button */}
                          <button
                            type="button"
                            onClick={() => {
                              toggleBlockUser(user.id);
                              triggerCopyFeedback(
                                isBlocked ? `User ${user.name} Unblocked` : `User ${user.name} Blocked`
                              );
                            }}
                            className={`p-2 rounded-xl border transition cursor-pointer ${
                              isBlocked
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                            title={isBlocked ? 'Unblock User' : 'Block User from Signing In'}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit User Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition cursor-pointer"
                            title="Edit User Profile"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to permanently delete ${user.name}'s account?`)) {
                                deleteRegisteredUser(user.id);
                                triggerCopyFeedback(`Deleted account ${user.name}`);
                              }
                            }}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-600 border border-stone-200 hover:border-red-200 transition cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    <p className="font-bold text-sm">No registered travelers match your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================= */}
      {/* MODAL: EXPORT & BROADCAST OPTIONS                             */}
      {/* ============================================================= */}
      {showExportModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowExportModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#FF4B00] text-white flex items-center justify-center font-black">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">Download & Broadcast Directory</h3>
                  <p className="text-xs text-stone-500">Export traveler contacts for marketing & operations</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Excel / CSV */}
              <button
                type="button"
                onClick={() => {
                  exportToCSV();
                  setShowExportModal(false);
                }}
                className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition flex flex-col justify-between gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black text-emerald-950 text-xs group-hover:text-emerald-900">Excel / CSV File</div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">Spreadsheet with all contact & spend fields</div>
                </div>
              </button>

              {/* PDF Document */}
              <button
                type="button"
                onClick={() => {
                  exportToPDF();
                  setShowExportModal(false);
                }}
                className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-left transition flex flex-col justify-between gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black text-rose-950 text-xs group-hover:text-rose-900">PDF Document</div>
                  <div className="text-[10px] text-rose-700 mt-0.5">Official branded roster with logo & table</div>
                </div>
              </button>

              {/* Word (.doc) */}
              <button
                type="button"
                onClick={() => {
                  exportToWord();
                  setShowExportModal(false);
                }}
                className="p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition flex flex-col justify-between gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black text-blue-950 text-xs group-hover:text-blue-900">Word (.doc)</div>
                  <div className="text-[10px] text-blue-700 mt-0.5">Editable document formatted for MS Word</div>
                </div>
              </button>
            </div>

            <div className="pt-3 border-t border-stone-100 space-y-2">
              <h4 className="text-xs font-black text-stone-800">Quick Campaign Broadcast Lists</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    copyWhatsAppList();
                    setShowExportModal(false);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copy WhatsApp Numbers</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    copyEmailsList();
                    setShowExportModal(false);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Copy Email Addresses</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: ADD OR EDIT USER                                        */}
      {/* ============================================================= */}
      {(isAddUserModalOpen || selectedUserForEdit) && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => {
              setIsAddUserModalOpen(false);
              setSelectedUserForEdit(null);
            }}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10">
            <div className="bg-stone-900 text-white p-6 relative">
              <button
                type="button"
                onClick={() => {
                  setIsAddUserModalOpen(false);
                  setSelectedUserForEdit(null);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-base font-black text-white">
                {selectedUserForEdit ? 'Edit Traveler Profile' : 'Add New Registered Traveler'}
              </h3>
              <p className="text-xs text-stone-300 mt-0.5">
                Manage contact credentials, member tier, and access privileges.
              </p>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={userFormData.name || ''}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="e.g. Rahul Verma"
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={userFormData.email || ''}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    WhatsApp / Phone
                  </label>
                  <input
                    type="text"
                    value={userFormData.phone || ''}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                    placeholder="+91 94199 15255"
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={userFormData.city || ''}
                    onChange={(e) => setUserFormData({ ...userFormData, city: e.target.value })}
                    placeholder="e.g. Srinagar"
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    State / Region
                  </label>
                  <input
                    type="text"
                    value={userFormData.state || ''}
                    onChange={(e) => setUserFormData({ ...userFormData, state: e.target.value })}
                    placeholder="e.g. Jammu & Kashmir"
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    Member Tier
                  </label>
                  <select
                    value={userFormData.memberTier || 'Member'}
                    onChange={(e) => setUserFormData({ ...userFormData, memberTier: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40"
                  >
                    <option value="Member">Member</option>
                    <option value="Silver Explorer">Silver Explorer</option>
                    <option value="Gold Explorer">Gold Explorer</option>
                    <option value="Holidays Hunt Elite">Holidays Hunt Elite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    Account Status
                  </label>
                  <select
                    value={userFormData.status || 'active'}
                    onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40"
                  >
                    <option value="active">Active (Normal Access)</option>
                    <option value="blocked">Blocked (Access Restricted)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                  Internal Staff Notes (Private)
                </label>
                <textarea
                  rows={2}
                  value={userFormData.notes || ''}
                  onChange={(e) => setUserFormData({ ...userFormData, notes: e.target.value })}
                  placeholder="e.g. VIP client, preferred driver Gulzar Ahmed, vegetarian meals only."
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddUserModalOpen(false);
                    setSelectedUserForEdit(null);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-stone-100 text-stone-600 text-xs font-bold hover:bg-stone-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-[#FF4B00] hover:bg-[#E03E00] text-white text-xs font-black transition cursor-pointer shadow-xs"
                >
                  {selectedUserForEdit ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: VIEW USER'S BOOKINGS & EASY-TO-REMEMBER BOOKING NUMBERS */}
      {/* ============================================================= */}
      {selectedUserForBookings && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setSelectedUserForBookings(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-stone-900">
                  Bookings for {selectedUserForBookings.name}
                </h3>
                <p className="text-xs text-stone-500">{selectedUserForBookings.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForBookings(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {getUserInquiries(selectedUserForBookings).length > 0 ? (
                getUserInquiries(selectedUserForBookings).map((inq) => {
                  const bNum = formatBookingNumber(inq.id);
                  return (
                    <div
                      key={inq.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black bg-[#1A1A1A] text-white px-2.5 py-1 rounded-lg">
                            {bNum}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(bNum);
                              triggerCopyFeedback(`Copied Booking Number ${bNum}`);
                            }}
                            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200"
                            title="Copy Booking Number"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                            inq.status === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : inq.status === 'Quotation Sent'
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : 'bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>

                      <div className="font-bold text-xs text-stone-900">{inq.packageTitle}</div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-500">
                        <div>Travel Date: <strong className="text-stone-800">{inq.travelDate}</strong></div>
                        <div>Guests: <strong className="text-stone-800">{inq.adults} Adults</strong></div>
                        <div>Amount: <strong className="text-stone-800">₹{inq.estimatedTotal?.toLocaleString('en-IN')}</strong></div>
                        <div>Created: <strong className="text-stone-800">{inq.createdAt?.slice(0, 10)}</strong></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-stone-400 bg-stone-50 rounded-2xl">
                  <Luggage className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                  <p className="text-xs font-bold">No active inquiries recorded for this traveler yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
