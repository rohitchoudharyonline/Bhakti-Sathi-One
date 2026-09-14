import React, { useState, useMemo } from 'react';
import { useTours } from '../../context/TourContext';
import { TourPackage, GroupTourBatch, GroupTourDetails } from '../../types/tour';
import {
  Users,
  Calendar,
  Bus,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Filter,
  Edit,
  Trash2,
  Copy,
  Eye,
  ShieldCheck,
  Tag,
  MapPin,
  Check,
  ChevronRight,
  X,
  Save,
  Layers,
} from 'lucide-react';

interface GroupToursManagerProps {
  onEditPackage: (pkg: TourPackage) => void;
  onCreateGroupTour: () => void;
}

export const GroupToursManager: React.FC<GroupToursManagerProps> = ({
  onEditPackage,
  onCreateGroupTour,
}) => {
  const {
    packages,
    updatePackage,
    deletePackage,
    duplicatePackage,
    setSelectedPackageId,
    setActiveView,
    agencySettings,
    destinations,
  } = useTours();

  const destinationList = useMemo(() => {
    if (!destinations) return [];
    return (Object.values(destinations) as any[]).filter((d) => Boolean(d && (d.slug || d.id)));
  }, [destinations]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'filling' | 'guaranteed' | 'soldout'>('all');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [selectedPkgIds, setSelectedPkgIds] = useState<string[]>([]);

  // Quick Batch Manager Modal
  const [batchModalPkg, setBatchModalPkg] = useState<TourPackage | null>(null);
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchDate, setNewBatchDate] = useState('');
  const [newBatchSeats, setNewBatchSeats] = useState(24);
  const [newBatchBooked, setNewBatchBooked] = useState(0);
  const [newBatchStatus, setNewBatchStatus] = useState<GroupTourBatch['status']>('Guaranteed Departure');

  // Convert Regular Package Modal
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedPkgToConvert, setSelectedPkgToConvert] = useState<string>('');
  const [convertCoachType, setConvertCoachType] = useState('2x2 AC Pushback Luxury Coach');
  const [convertSeats, setConvertSeats] = useState(24);
  const [convertSavings, setConvertSavings] = useState(3500);
  const [convertNextDate, setConvertNextDate] = useState('15 Oct 2025');

  // Delete Group Tour Confirmation Modal
  const [deleteModalPkg, setDeleteModalPkg] = useState<TourPackage | null>(null);

  // Filter all packages that are group tours
  const groupPackages = useMemo(() => {
    return packages.filter((pkg) => pkg.isGroupTour || pkg.tourType === 'Group Tour');
  }, [packages]);

  // Packages available for conversion (non-group)
  const regularPackages = useMemo(() => {
    return packages.filter((pkg) => !pkg.isGroupTour && pkg.tourType !== 'Group Tour');
  }, [packages]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalGroupTours = groupPackages.length;
    let totalBatches = 0;
    let totalCapacity = 0;
    let totalBooked = 0;

    groupPackages.forEach((pkg) => {
      const details = pkg.groupTourDetails;
      const cap = details?.totalSeats || 24;
      const bkd = details?.bookedSeats || 0;
      totalCapacity += cap;
      totalBooked += bkd;

      if (details?.batches && details.batches.length > 0) {
        totalBatches += details.batches.length;
      } else {
        totalBatches += 1; // default batch
      }
    });

    const occupancyRate = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

    return {
      totalGroupTours,
      totalBatches,
      totalCapacity,
      totalBooked,
      occupancyRate,
    };
  }, [groupPackages]);

  // Filtered group packages
  const filteredGroupPackages = useMemo(() => {
    return groupPackages.filter((pkg) => {
      const matchesSearch =
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pkg.groupTourDetails?.coachType || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDest = destinationFilter === 'all' || pkg.destinationTag === destinationFilter;

      let matchesStatus = true;
      if (statusFilter === 'filling') {
        const details = pkg.groupTourDetails;
        const remaining = (details?.totalSeats || 24) - (details?.bookedSeats || 0);
        matchesStatus = remaining > 0 && remaining <= 8;
      } else if (statusFilter === 'guaranteed') {
        matchesStatus = (pkg.groupTourDetails?.batches || []).some(
          (b) => b.status === 'Guaranteed Departure'
        ) || true;
      } else if (statusFilter === 'soldout') {
        const details = pkg.groupTourDetails;
        matchesStatus = (details?.bookedSeats || 0) >= (details?.totalSeats || 24);
      }

      return matchesSearch && matchesDest && matchesStatus;
    });
  }, [groupPackages, searchTerm, destinationFilter, statusFilter]);

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedPkgIds.length === filteredGroupPackages.length && filteredGroupPackages.length > 0) {
      setSelectedPkgIds([]);
    } else {
      setSelectedPkgIds(filteredGroupPackages.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedPkgIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedPkgIds.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedPkgIds.length} selected group tour(s)? This action cannot be undone.`
      )
    ) {
      selectedPkgIds.forEach((id) => deletePackage(id));
      setSelectedPkgIds([]);
    }
  };

  // Handle Quick Batch Addition
  const handleAddBatch = (pkg: TourPackage) => {
    if (!newBatchDate.trim()) return;

    const currentBatches = pkg.groupTourDetails?.batches || [];
    const newBatch: GroupTourBatch = {
      id: `batch-${Date.now()}`,
      batchName: newBatchName.trim() || `Batch ${newBatchDate}`,
      startDate: newBatchDate,
      totalSeats: Number(newBatchSeats) || 24,
      bookedSeats: Number(newBatchBooked) || 0,
      status: newBatchStatus,
    };

    const updatedBatches = [...currentBatches, newBatch];
    const updatedDetails: GroupTourDetails = {
      isGroupTour: true,
      groupTheme: pkg.groupTourDetails?.groupTheme || 'Sacred Devotee Sangha',
      coachType: pkg.groupTourDetails?.coachType || '2x2 AC Pushback Luxury Coach',
      batchSchedule: pkg.groupTourDetails?.batchSchedule || 'Weekly Departures',
      nextDeparture: pkg.groupTourDetails?.nextDeparture || newBatchDate,
      totalSeats: pkg.groupTourDetails?.totalSeats || 24,
      bookedSeats: pkg.groupTourDetails?.bookedSeats || 0,
      perPersonSavings: pkg.groupTourDetails?.perPersonSavings || 3500,
      tourLeader: pkg.groupTourDetails?.tourLeader || 'Dedicated Devotee Guide & Tour Coordinator Included',
      boardingPoints: pkg.groupTourDetails?.boardingPoints || ['Delhi', 'Jammu', 'Haridwar'],
      batches: updatedBatches,
    };

    const updatedPkg: TourPackage = {
      ...pkg,
      isGroupTour: true,
      tourType: 'Group Tour',
      groupTourDetails: updatedDetails,
    };

    updatePackage(updatedPkg);
    setBatchModalPkg(updatedPkg);
    setNewBatchName('');
    setNewBatchDate('');
  };

  // Handle Delete Batch
  const handleDeleteBatch = (pkg: TourPackage, batchId: string) => {
    const currentBatches = pkg.groupTourDetails?.batches || [];
    const updatedBatches = currentBatches.filter((b) => b.id !== batchId);

    const updatedDetails: GroupTourDetails = {
      ...(pkg.groupTourDetails as GroupTourDetails),
      batches: updatedBatches,
    };

    const updatedPkg: TourPackage = {
      ...pkg,
      groupTourDetails: updatedDetails,
    };

    updatePackage(updatedPkg);
    setBatchModalPkg(updatedPkg);
  };

  // Handle Quick Conversion of Regular Package to Group Tour
  const handleConvertPackage = () => {
    if (!selectedPkgToConvert) return;
    const target = packages.find((p) => p.id === selectedPkgToConvert);
    if (!target) return;

    const defaultBatches: GroupTourBatch[] = [
      {
        id: `batch-${Date.now()}-1`,
        batchName: 'Diwali / Kartik Sangha Departure',
        startDate: convertNextDate,
        totalSeats: convertSeats,
        bookedSeats: Math.floor(convertSeats * 0.65),
        status: 'Filling Fast',
      },
      {
        id: `batch-${Date.now()}-2`,
        batchName: 'Next Upcoming Weekend Batch',
        startDate: '28 Oct 2025',
        totalSeats: convertSeats,
        bookedSeats: Math.floor(convertSeats * 0.3),
        status: 'Guaranteed Departure',
      },
    ];

    const groupDetails: GroupTourDetails = {
      isGroupTour: true,
      groupTheme: 'Sacred Devotee Sangha & Fixed Departure',
      coachType: convertCoachType,
      batchSchedule: 'Fixed Scheduled Departures (Bi-Monthly)',
      nextDeparture: convertNextDate,
      totalSeats: convertSeats,
      bookedSeats: Math.floor(convertSeats * 0.65),
      minGroupSize: 10,
      maxGroupSize: convertSeats,
      perPersonSavings: convertSavings,
      tourLeader: 'Dedicated Bhakti Guide & On-Ground Coordinator Included',
      boardingPoints: ['Delhi (Kashmere Gate)', 'Chandigarh (Sector 43)', 'Jammu Tawi Station'],
      batches: defaultBatches,
    };

    const updated: TourPackage = {
      ...target,
      isGroupTour: true,
      tourType: 'Group Tour',
      groupTourDetails: groupDetails,
    };

    updatePackage(updated);
    setShowConvertModal(false);
    setSelectedPkgToConvert('');
  };

  // Handle Delete Group Tour Permanently from CMS & App
  const handleDeleteGroupTourPermanently = (pkgId: string) => {
    deletePackage(pkgId);
    setDeleteModalPkg(null);
  };

  // Handle Remove from Group Tours Only (revert to regular tour)
  const handleRemoveGroupStatusOnly = (pkg: TourPackage) => {
    const updated: TourPackage = {
      ...pkg,
      isGroupTour: false,
      tourType: pkg.tourType === 'Group Tour' ? 'Customizable Tour' : pkg.tourType,
    };
    updatePackage(updated);
    setDeleteModalPkg(null);
  };

  return (
    <div className="space-y-6" id="cms-group-tours-manager">
      {/* 1. Header with Stats & Actions */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-50 text-[#FF4B00] border border-[#FF4B00]/20">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Group Tours & Fixed Departures ERP
              </h2>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200">
                Live Module
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1">
              Manage fixed departure dates, coach inventory, seat occupancies, and devotee tour leader assignments.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowConvertModal(true)}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-300 transition cursor-pointer flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-stone-600" />
              <span>Convert Existing Tour</span>
            </button>

            <button
              type="button"
              onClick={onCreateGroupTour}
              className="px-4 py-2 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Group Tour</span>
            </button>
          </div>
        </div>

        {/* Top Operational Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5 pt-5 border-t border-stone-100">
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80">
            <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
              <span>Active Group Tours</span>
              <Bus className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-black text-stone-900 mt-1">{stats.totalGroupTours}</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Published on storefront</p>
          </div>

          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80">
            <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
              <span>Scheduled Batches</span>
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-stone-900 mt-1">{stats.totalBatches}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Guaranteed departures</p>
          </div>

          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80">
            <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
              <span>Total Seats Filled</span>
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-stone-900 mt-1">
              {stats.totalBooked} <span className="text-sm font-semibold text-stone-400">/ {stats.totalCapacity}</span>
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">{stats.totalCapacity - stats.totalBooked} seats remaining</p>
          </div>

          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80">
            <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
              <span>Average Occupancy</span>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-black text-stone-900 mt-1">{stats.occupancyRate}%</p>
            <div className="w-full bg-stone-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.occupancyRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search group tours, destinations, coach..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 cursor-pointer focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="filling">Filling Fast (≤8 Seats Left)</option>
              <option value="guaranteed">Guaranteed Departures</option>
              <option value="soldout">Sold Out</option>
            </select>

            {/* Destination Filter */}
            <select
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 cursor-pointer focus:outline-none"
            >
              <option value="all">All Destinations</option>
              {destinationList.map((d) => (
                <option key={d.slug || d.id} value={d.slug || d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions Sub-Bar */}
        {filteredGroupPackages.length > 0 && (
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 font-bold text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={
                  selectedPkgIds.length === filteredGroupPackages.length &&
                  filteredGroupPackages.length > 0
                }
                onChange={handleToggleSelectAll}
                className="w-4 h-4 rounded border-stone-300 text-[#FF4B00] focus:ring-[#FF4B00] cursor-pointer"
              />
              <span>Select All Group Tours ({filteredGroupPackages.length})</span>
            </label>

            {selectedPkgIds.length > 0 && (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  {selectedPkgIds.length} Selected
                </span>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedPkgIds.length})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Group Tours List / Cards */}
      {filteredGroupPackages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-2xs">
          <div className="w-14 h-14 bg-orange-50 text-[#FF4B00] rounded-2xl grid place-items-center mx-auto mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-stone-900">No Group Tours Found</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-5">
            {searchTerm || statusFilter !== 'all'
              ? 'Try resetting your search filters or status selection.'
              : 'You have not marked any packages as Group Tours yet. Convert an existing package or create a new one!'}
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowConvertModal(true)}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-300 transition cursor-pointer"
            >
              Convert Existing Tour
            </button>
            <button
              type="button"
              onClick={onCreateGroupTour}
              className="px-4 py-2 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white text-xs font-bold transition cursor-pointer"
            >
              Create Group Tour
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroupPackages.map((pkg) => {
            const details = pkg.groupTourDetails || {
              isGroupTour: true,
              totalSeats: 24,
              bookedSeats: 16,
              coachType: '2x2 AC Pushback Coach',
              nextDeparture: '15 Oct 2025',
              perPersonSavings: 3500,
              tourLeader: 'Dedicated Bhakti Guide Included',
              batches: [],
            };

            const total = details.totalSeats || 24;
            const booked = details.bookedSeats || 0;
            const remaining = Math.max(0, total - booked);
            const occupancyPct = Math.round((booked / total) * 100);
            const batchesCount = details.batches?.length || 1;

            return (
              <div
                key={pkg.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between group relative ${
                  selectedPkgIds.includes(pkg.id)
                    ? 'border-[#FF4B00] ring-2 ring-[#FF4B00]/20 bg-orange-50/20'
                    : 'border-stone-200'
                }`}
              >
                {/* Image Header & Badges */}
                <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                  {/* Checkbox Overlay */}
                  <div className="absolute top-2.5 left-2.5 z-20">
                    <input
                      type="checkbox"
                      checked={selectedPkgIds.includes(pkg.id)}
                      onChange={() => handleToggleSelect(pkg.id)}
                      className="w-5 h-5 rounded border-2 border-white shadow-md text-[#FF4B00] focus:ring-[#FF4B00] cursor-pointer bg-black/40"
                    />
                  </div>

                  <img
                    src={pkg.coverImage}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-10 right-2.5 flex items-center justify-between">
                    <span className="bg-[#FF4B00] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Bus className="w-3 h-3" />
                      <span>Group Departure</span>
                    </span>

                    <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                      {pkg.durationDays}D / {pkg.durationNights}N
                    </span>
                  </div>

                  {/* Bottom Title on Image */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{pkg.destination}</span>
                    </span>
                    <h4 className="text-sm font-black leading-tight line-clamp-1 mt-0.5">
                      {pkg.title}
                    </h4>
                  </div>
                </div>

                {/* Content & Seat Meter */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Next Departure & Coach Type */}
                    <div className="flex items-center justify-between text-xs py-1 border-b border-stone-100">
                      <span className="text-stone-500 font-medium">Next Departure:</span>
                      <span className="font-bold text-stone-900 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200/60">
                        {details.nextDeparture || '15 Oct 2025'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1 border-b border-stone-100">
                      <span className="text-stone-500 font-medium">Coach / Vehicle:</span>
                      <span className="font-semibold text-stone-800 truncate max-w-[170px]">
                        {details.coachType || 'AC Pushback Luxury Coach'}
                      </span>
                    </div>

                    {/* Seat Inventory Progress */}
                    <div className="mt-3 bg-stone-50 rounded-xl p-2.5 border border-stone-200/80">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-stone-700">
                          {booked} / {total} Seats Booked
                        </span>
                        <span
                          className={`font-black ${
                            remaining <= 6 ? 'text-[#FF4B00]' : 'text-emerald-700'
                          }`}
                        >
                          {remaining === 0 ? 'SOLD OUT' : `${remaining} Seats Left`}
                        </span>
                      </div>

                      <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            remaining <= 6 ? 'bg-[#FF4B00]' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Price & Savings */}
                    <div className="flex items-center justify-between mt-3 pt-2">
                      <div>
                        <span className="text-[10px] text-stone-500 block uppercase font-medium">
                          Per Yatri Rate
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-stone-900">
                            ₹{(pkg.discountedPrice || pkg.price).toLocaleString('en-IN')}
                          </span>
                          {pkg.discountedPrice && (
                            <span className="text-xs text-stone-400 line-through">
                              ₹{pkg.price.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      {details.perPersonSavings && details.perPersonSavings > 0 && (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-md border border-emerald-200">
                          Save ₹{details.perPersonSavings.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBatchModalPkg(pkg)}
                      className="flex-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Manage departure dates & seat numbers"
                    >
                      <Calendar className="w-3.5 h-3.5 text-stone-600" />
                      <span>Batches ({batchesCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditPackage(pkg)}
                      className="py-1.5 px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Edit Tour Package"
                    >
                      <Edit className="w-3.5 h-3.5 text-stone-600" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPackageId(pkg.id);
                        setActiveView('traveler');
                      }}
                      className="py-1.5 px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer"
                      title="Preview on Storefront"
                    >
                      <Eye className="w-3.5 h-3.5 text-stone-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => duplicatePackage(pkg.id)}
                      className="py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer"
                      title="Duplicate Tour"
                    >
                      <Copy className="w-3.5 h-3.5 text-stone-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteModalPkg(pkg)}
                      className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200/80 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer"
                      title="Delete / Remove Group Tour"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Batch Management Modal */}
      {batchModalPkg && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900">
                  Manage Fixed Departure Batches
                </h3>
                <p className="text-xs text-stone-500 line-clamp-1">{batchModalPkg.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setBatchModalPkg(null)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 grid place-items-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Existing Batches List */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider">
                Scheduled Batches ({batchModalPkg.groupTourDetails?.batches?.length || 0})
              </h4>

              {(batchModalPkg.groupTourDetails?.batches || []).length === 0 ? (
                <div className="bg-stone-50 p-4 rounded-xl text-center text-xs text-stone-500 border border-dashed border-stone-200">
                  No individual batch dates recorded. Add your first departure date below.
                </div>
              ) : (
                <div className="space-y-2">
                  {(batchModalPkg.groupTourDetails?.batches || []).map((batch) => (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{batch.startDate}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              batch.status === 'Guaranteed Departure'
                                ? 'bg-emerald-100 text-emerald-800'
                                : batch.status === 'Filling Fast'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {batch.status}
                          </span>
                        </div>
                        <p className="text-stone-500 text-[11px] mt-0.5">
                          {batch.batchName || 'Devotee Sangha'} • {batch.bookedSeats} / {batch.totalSeats} seats filled
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteBatch(batchModalPkg, batch.id)}
                        className="w-7 h-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 grid place-items-center cursor-pointer"
                        title="Delete batch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Batch Form */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
              <h4 className="text-xs font-black uppercase text-stone-700 tracking-wider">
                + Schedule New Departure Date
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Departure Date (e.g. 15 Oct 2025)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Oct 2025 or 2025-10-15"
                    value={newBatchDate}
                    onChange={(e) => setNewBatchDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Batch Label / Theme
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Navratri Special Yatra"
                    value={newBatchName}
                    onChange={(e) => setNewBatchName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Total Seats Available
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={newBatchSeats}
                    onChange={(e) => setNewBatchSeats(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Already Booked Seats
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={newBatchSeats}
                    value={newBatchBooked}
                    onChange={(e) => setNewBatchBooked(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Departure Status Tag
                  </label>
                  <select
                    value={newBatchStatus}
                    onChange={(e) => setNewBatchStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-medium"
                  >
                    <option value="Guaranteed Departure">Guaranteed Departure</option>
                    <option value="Filling Fast">Filling Fast (Limited Seats)</option>
                    <option value="Available">Available for Booking</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAddBatch(batchModalPkg)}
                disabled={!newBatchDate.trim()}
                className="w-full py-2 bg-[#FF4B00] hover:bg-[#E04200] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Save Departure Batch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Convert Regular Tour to Group Tour Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900">
                  Convert Existing Package to Group Tour
                </h3>
                <p className="text-xs text-stone-500">
                  Instantly enable fixed departures, coach capacity, and group savings.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowConvertModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 grid place-items-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Select Package to Convert
                </label>
                <select
                  value={selectedPkgToConvert}
                  onChange={(e) => setSelectedPkgToConvert(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium"
                >
                  <option value="">-- Choose from existing packages --</option>
                  {regularPackages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.destination})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Coach / Vehicle Type
                </label>
                <input
                  type="text"
                  value={convertCoachType}
                  onChange={(e) => setConvertCoachType(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Total Seats Capacity
                  </label>
                  <input
                    type="number"
                    value={convertSeats}
                    onChange={(e) => setConvertSeats(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Group Discount (₹ / Person)
                  </label>
                  <input
                    type="number"
                    value={convertSavings}
                    onChange={(e) => setConvertSavings(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  First Departure Date
                </label>
                <input
                  type="text"
                  value={convertNextDate}
                  onChange={(e) => setConvertNextDate(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConvertModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedPkgToConvert}
                onClick={handleConvertPackage}
                className="px-4 py-2 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] disabled:opacity-50 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Enable as Group Tour</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Delete Group Tour Confirmation Modal */}
      {deleteModalPkg && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5 text-rose-600">
                <div className="w-9 h-9 rounded-xl bg-rose-50 grid place-items-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">Delete Group Tour</h3>
                  <p className="text-[11px] text-stone-500 font-medium">Choose how you want to remove this tour</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalPkg(null)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 grid place-items-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              <p className="font-bold text-stone-900 line-clamp-2">{deleteModalPkg.title}</p>
              <div className="text-stone-500 mt-1 flex items-center gap-1.5 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{deleteModalPkg.destination}</span>
                <span>•</span>
                <span>{deleteModalPkg.durationDays}D / {deleteModalPkg.durationNights}N</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleDeleteGroupTourPermanently(deleteModalPkg.id)}
                className="w-full p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <div>
                    <p className="font-black text-xs">Permanently Delete Package</p>
                    <p className="text-[10.5px] text-rose-100 font-normal">Removes this tour completely from the website and CMS</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleRemoveGroupStatusOnly(deleteModalPkg)}
                className="w-full p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <Layers className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <p className="font-black text-xs text-amber-950">Remove from Group Tours Only</p>
                    <p className="text-[10.5px] text-amber-700 font-normal">Converts back to a standard private pilgrimage in your catalog</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-700 shrink-0" />
              </button>
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setDeleteModalPkg(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
