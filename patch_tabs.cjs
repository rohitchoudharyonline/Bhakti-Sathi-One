const fs = require('fs');

const path = 'src/components/cms/CMSDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

const newTabsConfig = `  const tabsConfig = [
    { id: 'dashboard', label: 'Operations Hub', icon: LayoutDashboard, count: null, show: canAccess('dashboard') },
    
    // Core WordPress-style Tabs
    { id: 'guides', label: 'All Posts (Guides)', icon: BookOpen, count: guides.length, show: canAccess('guides') },
    { id: 'categories', label: 'Categories & Tags', icon: Tag, count: null, show: canAccess('guides') },
    { id: 'pages', label: 'Pages', icon: FileEdit, count: null, show: canAccess('pages') },
    { id: 'media', label: 'Media Library', icon: Cloud, count: null, show: canAccess('media') },
    { id: 'seo', label: 'Rank Math SEO', icon: Globe, count: null, show: canAccess('guides') },

    { id: 'packages', label: 'Tour Packages', icon: Compass, count: packages.length, show: canAccess('packages') },
    {
      id: 'group-tours',
      label: 'Group Tours & Batches',
      icon: Bus,
      count: packages.filter((p) => p.isGroupTour || p.tourType === 'Group Tour').length,
      show: canAccess('group-tours'),
    },
    { id: 'post-editor', label: 'Post Editor', icon: FileEdit, count: null, show: canAccess('post-editor') },
    { id: 'destinations', label: 'Destinations Hub', icon: MapPin, count: null, show: canAccess('destinations') },
    { id: 'push-notifications', label: 'Push Broadcasts', icon: Bell, count: pushNotifications.length, show: true },
    { id: 'inquiries', label: 'Inquiries & Leads', icon: MessageSquare, count: inquiries.length, badgeNew: newInquiriesCount > 0, show: canAccess('inquiries') },
    { id: 'users', label: 'Travelers & Signups', icon: Users, count: registeredUsers?.length || 0, show: true },
    { id: 'invoices', label: 'Client Invoices', icon: Receipt, count: invoices.length, show: canAccess('invoices') },
    { id: 'payments', label: 'Vendor Payouts', icon: CreditCard, count: vendorPayments.length, show: canAccess('payments') },
    { id: 'vendors', label: 'Vendors & Fleets', icon: Car, count: vendors.length, show: canAccess('vendors') },
    { id: 'staff', label: 'Staff & RBAC', icon: Shield, count: staff.length, show: canAccess('staff') },
    { id: 'settings', label: 'Agency Settings', icon: Settings, count: null, show: canAccess('settings') },
  ];`;

content = content.replace(/const tabsConfig = \[\s*\{ id: 'dashboard'.*?\];/s, newTabsConfig);

// update activeCmsTab type
const newActiveCmsTab = `  const [activeCmsTab, setActiveCmsTab] = useState<
    | 'dashboard'
    | 'packages'
    | 'group-tours'
    | 'guides'
    | 'categories'
    | 'seo'
    | 'editor'
    | 'post-editor'
    | 'destinations'
    | 'pages'
    | 'media'
    | 'push-notifications'
    | 'inquiries'
    | 'users'
    | 'invoices'
    | 'payments'
    | 'vendors'
    | 'staff'
    | 'settings'
  >('dashboard');`;

content = content.replace(/const \[activeCmsTab, setActiveCmsTab\] = useState<\s*\|\s*'dashboard'.*?>\('dashboard'\);/s, newActiveCmsTab);

// update the switch statement in `canAccess` maybe?
// Let's add them to `canAccess`
content = content.replace(/case 'guides':\s*case 'post-editor':/s, "case 'guides':\n      case 'categories':\n      case 'seo':\n      case 'post-editor':");


fs.writeFileSync(path, content);
