import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { StaffMember, StaffPermissions, StaffRole } from '../../types/tour';
import {
  Shield,
  ShieldCheck,
  UserPlus,
  Edit2,
  Trash2,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  X,
  Sparkles,
  Info,
} from 'lucide-react';

export const StaffManager: React.FC = () => {
  const { staff, currentStaffUser, addStaffMember, updateStaffMember, deleteStaffMember } = useTours();
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'super_admin' | 'operations' | 'sales' | 'finance'>('all');

  const isSuperAdmin = currentStaffUser.role === 'super_admin' || currentStaffUser.permissions.canManageStaff;

  const defaultPermissions: StaffPermissions = {
    canManagePackages: false,
    canManageHotels: false,
    canManageInquiries: true,
    canManageVendors: false,
    canManageVendorPayments: false,
    canManageInvoices: false,
    canViewFinancials: false,
    canManageStaff: false,
    canManageSettings: false,
  };

  const [formData, setFormData] = useState<Omit<StaffMember, 'id' | 'joinedAt'>>({
    name: '',
    email: '',
    phone: '',
    role: 'sales',
    designation: 'Holiday Travel Consultant',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    permissions: defaultPermissions,
  });

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'sales',
      designation: 'Holiday Travel Consultant',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      status: 'active',
      permissions: { ...defaultPermissions },
    });
    setIsCreating(true);
    setEditingStaff(null);
  };

  const handleOpenEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      designation: member.designation,
      avatar: member.avatar,
      status: member.status,
      permissions: { ...member.permissions },
    });
    setIsCreating(false);
  };

  const handleRolePresetChange = (newRole: StaffRole) => {
    let perms: StaffPermissions = { ...defaultPermissions };
    let desig = 'Staff Specialist';

    if (newRole === 'super_admin') {
      perms = {
        canManagePackages: true,
        canManageHotels: true,
        canManageInquiries: true,
        canManageVendors: true,
        canManageVendorPayments: true,
        canManageInvoices: true,
        canViewFinancials: true,
        canManageStaff: true,
        canManageSettings: true,
      };
      desig = 'Managing Director / Super Admin';
    } else if (newRole === 'admin') {
      perms = {
        canManagePackages: true,
        canManageHotels: true,
        canManageInquiries: true,
        canManageVendors: true,
        canManageVendorPayments: true,
        canManageInvoices: true,
        canViewFinancials: true,
        canManageStaff: false,
        canManageSettings: false,
      };
      desig = 'Operations Director';
    } else if (newRole === 'operations') {
      perms = {
        canManagePackages: true,
        canManageHotels: true,
        canManageInquiries: true,
        canManageVendors: true,
        canManageVendorPayments: true,
        canManageInvoices: false,
        canViewFinancials: false,
        canManageStaff: false,
        canManageSettings: false,
      };
      desig = 'Logistics & Ground Operations Manager';
    } else if (newRole === 'sales') {
      perms = {
        canManagePackages: false,
        canManageHotels: false,
        canManageInquiries: true,
        canManageVendors: false,
        canManageVendorPayments: false,
        canManageInvoices: true,
        canViewFinancials: false,
        canManageStaff: false,
        canManageSettings: false,
      };
      desig = 'Senior Holiday Consultant';
    } else if (newRole === 'finance') {
      perms = {
        canManagePackages: false,
        canManageHotels: false,
        canManageInquiries: false,
        canManageVendors: true,
        canManageVendorPayments: true,
        canManageInvoices: true,
        canViewFinancials: true,
        canManageStaff: false,
        canManageSettings: false,
      };
      desig = 'Billing & Accounts Manager';
    }

    setFormData((prev) => ({
      ...prev,
      role: newRole,
      designation: desig,
      permissions: perms,
    }));
  };

  const handleTogglePermission = (permKey: keyof StaffPermissions) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permKey]: !prev.permissions[permKey],
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (editingStaff) {
      updateStaffMember({
        ...editingStaff,
        ...formData,
      });
      setEditingStaff(null);
    } else {
      addStaffMember(formData);
      setIsCreating(false);
    }
  };

  const filteredStaff = staff.filter((s) => {
    if (activeTab === 'all') return true;
    return s.role === activeTab;
  });

  return (
    <div className="space-y-6" id="staff-rbac-manager">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Staff & Role-Based Access Control (RBAC)
            </h2>
            <span className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-800">
              {staff.length} Team Members
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Control which features each staff member can view and manage (Hotels, Invoices, Cabs, Payouts, Leads).
          </p>
        </div>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-sm transition-all text-sm shrink-0"
            id="add-staff-btn"
          >
            <UserPlus className="w-4 h-4" />
            Add Sub Admin / Staff
          </button>
        )}
      </div>

      {/* Role Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {(
          [
            { key: 'all', label: 'All Staff' },
            { key: 'super_admin', label: 'Super Admins' },
            { key: 'operations', label: 'Operations & Fleet' },
            { key: 'sales', label: 'Sales & Inquiries' },
            { key: 'finance', label: 'Finance & Billing' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStaff.map((member) => {
          const isCurrent = member.id === currentStaffUser.id;
          return (
            <div
              key={member.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border ${
                isCurrent
                  ? 'border-red-400 dark:border-red-700 ring-2 ring-red-500/10'
                  : 'border-slate-200 dark:border-slate-800'
              } p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
              id={`staff-card-${member.id}`}
            >
              <div>
                {/* Top Member Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-sm"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {member.name}
                        {member.role === 'super_admin' && (
                          <ShieldCheck className="w-4 h-4 text-red-600" title="Super Admin" />
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {member.designation}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      member.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{member.phone || 'No phone recorded'}</span>
                  </div>
                </div>

                {/* Permission Badges Matrix */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Permitted Modules:</span>
                    <span className="text-[10px] lowercase font-normal text-slate-400">
                      {Object.values(member.permissions).filter(Boolean).length}/9 enabled
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.permissions.canManagePackages && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-medium border border-blue-100 dark:border-blue-900">
                        Packages
                      </span>
                    )}
                    {member.permissions.canManageHotels && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-medium border border-amber-100 dark:border-amber-900">
                        Hotels
                      </span>
                    )}
                    {member.permissions.canManageInquiries && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[11px] font-medium border border-purple-100 dark:border-purple-900">
                        Inquiries & Quotes
                      </span>
                    )}
                    {member.permissions.canManageVendors && (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 text-[11px] font-medium border border-cyan-100 dark:border-cyan-900">
                        Vendors & Cabs
                      </span>
                    )}
                    {member.permissions.canManageVendorPayments && (
                      <span className="px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-[11px] font-medium border border-orange-100 dark:border-orange-900">
                        Vendor Payouts
                      </span>
                    )}
                    {member.permissions.canManageInvoices && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium border border-emerald-100 dark:border-emerald-900">
                        Invoices & Billing
                      </span>
                    )}
                    {member.permissions.canViewFinancials && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium border border-indigo-100 dark:border-indigo-900">
                        Financials
                      </span>
                    )}
                    {member.permissions.canManageStaff && (
                      <span className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-[11px] font-medium border border-red-100 dark:border-red-900">
                        Staff RBAC
                      </span>
                    )}
                    {member.permissions.canManageSettings && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                        Agency Settings
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              {isSuperAdmin && (
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Joined {member.joinedAt}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(member)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                      title="Edit Permissions"
                      id={`edit-staff-${member.id}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit RBAC</span>
                    </button>
                    {member.role !== 'super_admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove staff account for ${member.name}?`)) {
                            deleteStaffMember(member.id);
                          }
                        }}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                        title="Delete Member"
                        id={`delete-staff-${member.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {(isCreating || editingStaff) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingStaff ? `Edit Permissions: ${editingStaff.name}` : 'Add New Staff / Sub Admin'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingStaff(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                    placeholder="e.g. Rahul Verma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                    placeholder="rahul@choudharyvacations.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                    placeholder="+91 98765 00000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Role Archetype
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRolePresetChange(e.target.value as StaffRole)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium"
                  >
                    <option value="super_admin">Super Admin (Unrestricted Full Access)</option>
                    <option value="operations">Operations (Fleet, Cabs, Hotels & Drivers)</option>
                    <option value="sales">Sales (Leads, Quotations & Client Invoices)</option>
                    <option value="finance">Finance & Accounts (Billing & Vendor Payouts)</option>
                    <option value="sub_admin">Custom Sub Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                    placeholder="e.g. Lead Travel Consultant"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                  >
                    <option value="active">Active (Permit Login)</option>
                    <option value="inactive">Suspended / Inactive</option>
                  </select>
                </div>
              </div>

              {/* Granular Permission Checklist */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Granular Module Permissions
                    </h4>
                    <p className="text-xs text-slate-500">
                      Staff will only be allowed to access checked modules in their dashboard.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  {(
                    [
                      {
                        key: 'canManageInquiries',
                        label: 'Manage Inquiries & Quotes',
                        desc: 'View traveler requests, send quotes, update lead stage',
                      },
                      {
                        key: 'canManageInvoices',
                        label: 'Manage Invoices & Billing',
                        desc: 'Generate tax invoices, client receipts & track payments',
                      },
                      {
                        key: 'canManageVendors',
                        label: 'Manage Vendors & Directory',
                        desc: 'Hotels, cab fleets, drivers, guides directory & bank records',
                      },
                      {
                        key: 'canManageVendorPayments',
                        label: 'Vendor Payouts & Vouchers',
                        desc: 'Create service orders, release driver/hotel payments & vouchers',
                      },
                      {
                        key: 'canManagePackages',
                        label: 'Tour Packages Editor',
                        desc: 'Create, edit, duplicate, and publish tour itineraries',
                      },
                      {
                        key: 'canManageHotels',
                        label: 'Hotels Inventory',
                        desc: 'Manage hotel listings, room photos & amenity catalogs',
                      },
                      {
                        key: 'canViewFinancials',
                        label: 'View Financial Metrics',
                        desc: 'Access gross margins, revenue charts & collection stats',
                      },
                      {
                        key: 'canManageStaff',
                        label: 'Staff & RBAC Admin',
                        desc: 'Create sub admins & configure permission access',
                      },
                      {
                        key: 'canManageSettings',
                        label: 'Agency Settings & Bank Setup',
                        desc: 'Configure business address, GSTIN, UPI, and invoice terms',
                      },
                    ] as { key: keyof StaffPermissions; label: string; desc: string }[]
                  ).map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions[item.key]}
                        onChange={() => handleTogglePermission(item.key)}
                        className="mt-1 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.label}</p>
                        <p className="text-[11px] text-slate-500">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingStaff(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
                  id="save-staff-btn"
                >
                  {editingStaff ? 'Update Staff Permissions' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
