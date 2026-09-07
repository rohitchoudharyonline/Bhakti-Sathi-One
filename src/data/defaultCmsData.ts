import { StaffMember, Vendor, VendorPayment, Invoice } from '../types/tour';

// Source-controlled defaults must never contain real-looking staff identities,
// customer PII, bank accounts, payment references or invoice data.
// Production records belong in authenticated server-side storage.
export const DEFAULT_STAFF: StaffMember[] = [
  {
    id: 'staff-development-admin',
    name: 'Development Admin',
    email: 'admin@example.invalid',
    phone: '',
    role: 'super_admin',
    designation: 'Development Preview',
    avatar: '',
    status: 'active',
    permissions: {
      canManagePackages: true,
      canManageHotels: true,
      canManageInquiries: true,
      canManageVendors: true,
      canManageVendorPayments: true,
      canManageInvoices: true,
      canViewFinancials: true,
      canManageStaff: true,
      canManageSettings: true,
    },
    joinedAt: '2026-01-01',
  },
];

export const DEFAULT_VENDORS: Vendor[] = [];
export const DEFAULT_VENDOR_PAYMENTS: VendorPayment[] = [];
export const DEFAULT_INVOICES: Invoice[] = [];
