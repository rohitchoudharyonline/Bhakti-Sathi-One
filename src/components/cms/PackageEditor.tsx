import React, { useState, useMemo } from 'react';
import {
  TourPackage,
  ItineraryDay,
  HotelStay,
  GalleryItem,
  PackageCategory,
  PackageBadge,
  MealType,
  TourInclusionItem,
  TourInclusionIconType,
  PricingTiers,
  HOTEL_CATEGORY_OPTIONS,
  GroupTourBatch,
  GroupTourDetails,
  DEFAULT_TRAVELER_GUIDELINES,
  DEFAULT_CANCELLATION_TERMS,
  resolveTourPolicies,
} from '../../types/tour';
import { useTours } from '../../context/TourContext';
import { DestinationMeta } from '../../data/destinationsData';
import {
  Save,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Building,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  MapPin,
  Sparkles,
  Layers,
  Star,
  Check,
  Eye,
  Copy,
  ChevronDown,
  ChevronUp,
  Search,
  Bot,
  Car,
  Utensils,
  Plane,
  Camera,
  Ship,
  Compass,
  ShieldCheck,
  Users,
  Bus,
  Clock,
  Edit2,
} from 'lucide-react';
import { UniversalImageUploader } from './UniversalImageUploader';
import { CMSSEOEditor } from './CMSSEOEditor';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';

interface PackageEditorProps {
  initialPackage?: TourPackage | null;
  onSaveComplete: (savedId: string) => void;
  onCancel: () => void;
}

const PRESET_INCLUSIONS = [
  '4/5-Star Luxury Accommodations with daily breakfast',
  'Exclusive Private Chauffeur AC Vehicle for all transfers & sightseeing',
  'Airport VIP Pickup & Drop transfers',
  'All toll taxes, parking fees, driver allowance and fuel',
  'Sightseeing & excursion permits as per itinerary',
  'Daily Buffet Breakfast and Gourmet Dinners',
  'English-speaking local certified guide during heritage tours',
  'Welcome drink & traditional arrival ceremony',
  'Pre-booked attraction entry passes and cable car/boat tickets',
];

const PRESET_EXCLUSIONS = [
  'Domestic / International Airfare & Train tickets',
  'Personal expenses (laundry, telephone, mini-bar, alcoholic drinks)',
  'Monument / Museum entry camera tickets where applicable',
  'Travel insurance & medical expenses',
  'Tips and gratuities for driver and local guides',
  'City tourist tax / Tourism Dirham fee paid at hotel check-in',
  'Any meals or services not explicitly mentioned under inclusions',
];

const PRESET_INCLUDED_ICON_OPTIONS: { icon: TourInclusionIconType; label: string; name: string }[] = [
  { icon: 'hotel', label: 'Hotel', name: 'Hotel Accommodations' },
  { icon: 'meals', label: 'Meals', name: 'Daily Meals' },
  { icon: 'cab', label: 'Private Cab', name: 'Private AC Vehicle' },
  { icon: 'flight', label: 'Flight', name: 'Flight / Airfare' },
  { icon: 'sightseeing', label: 'Sightseeing', name: 'Sightseeing & Excursions' },
  { icon: 'transport', label: 'Transport', name: 'All Transfers' },
  { icon: 'houseboat', label: 'Houseboat', name: 'Luxury Houseboat' },
  { icon: 'shikara', label: 'Shikara', name: 'Shikara Cruise' },
  { icon: 'guide', label: 'Tour Guide', name: 'Tour Manager / Guide' },
  { icon: 'activities', label: 'Activities', name: 'Adventure & Passes' },
  { icon: 'permits', label: 'Permits', name: 'Tolls & Inner Line Permits' },
];

const DEFAULT_INCLUDED_ICONS: TourInclusionItem[] = [
  { id: 'inc-1', icon: 'hotel', label: 'Hotel' },
  { id: 'inc-2', icon: 'meals', label: 'Meals' },
  { id: 'inc-3', icon: 'cab', label: 'Private Cab' },
  { id: 'inc-4', icon: 'sightseeing', label: 'Sightseeing' },
  { id: 'inc-5', icon: 'transport', label: 'Transport' },
];

const SAMPLE_COVERS = [
  { label: 'Kashmir Mountains', url: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Bali Tropical', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Swiss Alps', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Dubai Skyline', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Kerala Backwaters', url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Vietnam Karst', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Santorini Greece', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Japan Blossom', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80' },
];

export const PackageEditor: React.FC<PackageEditorProps> = ({
  initialPackage,
  onSaveComplete,
  onCancel,
}) => {
  const { addPackage, updatePackage, agencySettings, temples, mediaAssets, destinations } = useTours();

  const destinationList = useMemo(() => {
    if (!destinations) return [];
    return (Object.values(destinations) as DestinationMeta[]).filter((d) => Boolean(d && (d.slug || d.id)));
  }, [destinations]);

  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'itinerary' | 'inclusions' | 'hotels' | 'policies' | 'seo' | 'group'>('basic');

  // Form states
  const [title, setTitle] = useState(initialPackage?.title || '');
  const [slug, setSlug] = useState(initialPackage?.slug || '');
  const [tagline, setTagline] = useState(initialPackage?.tagline || '');
  const [destination, setDestination] = useState(initialPackage?.destination || '');
  const [destinationTag, setDestinationTag] = useState<string>(() => {
    if (initialPackage?.destinationTag) return initialPackage.destinationTag;
    if (destinations) {
      const list = Object.values(destinations) as DestinationMeta[];
      if (list.length > 0 && list[0]?.slug) return list[0].slug;
    }
    return 'jammu-kashmir';
  });
  const [selectedTempleIds, setSelectedTempleIds] = useState<string[]>(() => {
    if (initialPackage?.templeIds && initialPackage.templeIds.length > 0) {
      return initialPackage.templeIds;
    }
    if (initialPackage?.temples && initialPackage.temples.length > 0) {
      return initialPackage.temples.map((tName) => {
        const match = temples.find((t) => t.name.toLowerCase() === tName.toLowerCase() || t.slug.toLowerCase() === tName.toLowerCase());
        return match ? match.id : tName;
      });
    }
    return [];
  });
  const [templeSearchQuery, setTempleSearchQuery] = useState('');
  const [templeCategoryFilter, setTempleCategoryFilter] = useState<string>('all');
  const [country, setCountry] = useState(initialPackage?.country || '');
  const [category, setCategory] = useState<PackageCategory>(initialPackage?.category || 'Family');
  const [badge, setBadge] = useState<PackageBadge | ''>(initialPackage?.badge || 'Best Seller');
  const [tourType, setTourType] = useState<TourPackage['tourType']>(
    initialPackage?.tourType || 
    (initialPackage?.category && ['Family', 'Honeymoon', 'Pilgrimage'].includes(initialPackage.category) ? initialPackage.category : undefined) || 
    'Family'
  );
  const [groupSizeLimit, setGroupSizeLimit] = useState(initialPackage?.groupSizeLimit || 'Max 12 People (Private Available)');
  const [bestTimeToVisit, setBestTimeToVisit] = useState(initialPackage?.bestTimeToVisit || 'Year Round');
  const [startLocation, setStartLocation] = useState(initialPackage?.startLocation || 'Srinagar / Jammu / Chandigarh');
  const [endLocation, setEndLocation] = useState(initialPackage?.endLocation || 'Srinagar / Jammu / Chandigarh');
  const [overview, setOverview] = useState(initialPackage?.overview || '');
  const [coverImage, setCoverImage] = useState(
    initialPackage?.coverImage || SAMPLE_COVERS[0].url
  );

  // Group Tour state
  const [isGroupTour, setIsGroupTour] = useState<boolean>(
    Boolean(initialPackage?.isGroupTour || initialPackage?.tourType === 'Group Tour')
  );
  const [groupTheme, setGroupTheme] = useState<string>(
    initialPackage?.groupTourDetails?.groupTheme || 'Sacred Devotee Sangha & Fixed Departure'
  );
  const [coachType, setCoachType] = useState<string>(
    initialPackage?.groupTourDetails?.coachType || '2x2 AC Pushback Luxury Coach'
  );
  const [batchSchedule, setBatchSchedule] = useState<string>(
    initialPackage?.groupTourDetails?.batchSchedule || 'Weekly Departures (Every Friday & 15th)'
  );
  const [nextDeparture, setNextDeparture] = useState<string>(
    initialPackage?.groupTourDetails?.nextDeparture || '15 Oct 2025'
  );
  const [totalSeats, setTotalSeats] = useState<number>(
    initialPackage?.groupTourDetails?.totalSeats || 24
  );
  const [bookedSeats, setBookedSeats] = useState<number>(
    initialPackage?.groupTourDetails?.bookedSeats || 16
  );
  const [perPersonSavings, setPerPersonSavings] = useState<number>(
    initialPackage?.groupTourDetails?.perPersonSavings || 3500
  );
  const [tourLeader, setTourLeader] = useState<string>(
    initialPackage?.groupTourDetails?.tourLeader || 'Dedicated Devotee Guide & Tour Coordinator Included'
  );
  const [boardingPointsStr, setBoardingPointsStr] = useState<string>(
    (initialPackage?.groupTourDetails?.boardingPoints || [
      'Delhi (Kashmere Gate)',
      'Chandigarh (Sector 43)',
      'Jammu Tawi Railway Station',
    ]).join(', ')
  );
  const [batches, setBatches] = useState<GroupTourBatch[]>(
    initialPackage?.groupTourDetails?.batches || [
      { id: 'b-1', batchName: 'Diwali Special Sangha', startDate: '15 Oct 2025', totalSeats: 24, bookedSeats: 18, status: 'Filling Fast' },
      { id: 'b-2', batchName: 'Kartik Purnima Batch', startDate: '28 Oct 2025', totalSeats: 24, bookedSeats: 12, status: 'Guaranteed Departure' },
      { id: 'b-3', batchName: 'Winter Devotion Batch', startDate: '08 Nov 2025', totalSeats: 24, bookedSeats: 5, status: 'Available' },
    ]
  );
  const [newBatchDateInput, setNewBatchDateInput] = useState('');
  const [newBatchNameInput, setNewBatchNameInput] = useState('');
  const [newBatchStatusInput, setNewBatchStatusInput] = useState<GroupTourBatch['status']>('Guaranteed Departure');
  
  // SEO states
  const [seoTitle, setSeoTitle] = useState(initialPackage?.seoTitle || initialPackage?.seoMetaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialPackage?.metaDescription || initialPackage?.seoMetaDescription || '');
  const [seoKeywords, setSeoKeywords] = useState(initialPackage?.seoKeywords || '');
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);

  // Gallery
  const [gallery, setGallery] = useState<GalleryItem[]>(
    initialPackage?.gallery || [
      { id: 'g1', url: SAMPLE_COVERS[0].url, caption: 'Scenic destination vista' },
    ]
  );
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryCaption, setNewGalleryCaption] = useState('');

  // Pricing & duration
  const [durationDays, setDurationDays] = useState(initialPackage?.durationDays || 5);
  const [durationNights, setDurationNights] = useState(initialPackage?.durationNights || 4);
  const [price, setPrice] = useState<number>(initialPackage ? (initialPackage.price ?? 0) : 0);
  const [discountedPrice, setDiscountedPrice] = useState<number | undefined>(
    initialPackage?.discountedPrice
  );
  const [priceOnRequest, setPriceOnRequest] = useState<boolean>(
    initialPackage?.priceOnRequest ?? (initialPackage?.price === 0)
  );
  const [pricingTiers, setPricingTiers] = useState<PricingTiers>(initialPackage?.pricingTiers || {});
  const [currency, setCurrency] = useState(initialPackage?.currency || agencySettings.currencySymbol);
  const [status, setStatus] = useState<'published' | 'draft'>(initialPackage?.status || 'published');
  const [featured, setFeatured] = useState<boolean>(initialPackage?.featured ?? true);

  // Day-wise itinerary
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(
    initialPackage?.itinerary || [
      {
        id: 'day-1',
        dayNumber: 1,
        title: 'Arrival & Welcome Reception',
        location: 'Destination City',
        description: 'Meet and greet by our private chauffeur at the airport. Transfer to the hotel with welcome drink. Evening at leisure.',
        meals: ['Dinner'],
        stayHotel: 'Grand Luxury 5-Star Resort',
        activities: ['Airport VIP Transfer', 'Welcome Dinner', 'Evening City Walk'],
      },
      {
        id: 'day-2',
        dayNumber: 2,
        title: 'Full-Day Highlights & Sightseeing Tour',
        location: 'Historic / Scenic Quarter',
        description: 'Guided tour covering the premier landmarks, viewpoints, and cultural heritage monuments with lunch.',
        meals: ['Breakfast', 'Dinner'],
        stayHotel: 'Grand Luxury 5-Star Resort',
        activities: ['Guided Landmark Visit', 'Scenic Viewpoint', 'Local Market Stroll'],
      },
    ]
  );

  // Inclusions & Exclusions
  const [inclusions, setInclusions] = useState<string[]>(
    initialPackage?.inclusions || [
      '4 Nights Luxury Hotel Accommodations with daily breakfast',
      'Exclusive Private Chauffeur AC Vehicle for all transfers',
      'Airport Pickup and Drop assistance',
      'All toll taxes, parking fees, driver allowance',
      'Pre-booked attraction entry tickets as per itinerary',
    ]
  );
  const [newInclusion, setNewInclusion] = useState('');

  // Tour Includes Highlight Icons (shown as icons row on traveler tour page)
  const [includedIcons, setIncludedIcons] = useState<TourInclusionItem[]>(
    initialPackage?.includedIcons && initialPackage.includedIcons.length > 0
      ? initialPackage.includedIcons
      : DEFAULT_INCLUDED_ICONS
  );
  const [newCustomIconType, setNewCustomIconType] = useState<TourInclusionIconType>('hotel');
  const [newCustomIconLabel, setNewCustomIconLabel] = useState('');

  const [exclusions, setExclusions] = useState<string[]>(
    initialPackage?.exclusions || [
      'Airfare / Train tickets',
      'Personal expenses, laundry, and mini-bar',
      'Camera / Video fees where applicable',
      'Travel and medical insurance',
    ]
  );
  const [newExclusion, setNewExclusion] = useState('');

  // Hotels
  const [hotels, setHotels] = useState<HotelStay[]>(
    initialPackage?.hotels || [
      {
        id: 'h-1',
        name: 'Grand Royal Resort & Spa',
        location: 'City Center / Riverfront',
        roomType: 'Deluxe Premier Suite with View',
        nights: 4,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
        amenities: ['Free WiFi', 'Swimming Pool', 'Buffet Breakfast', 'Spa & Fitness Center'],
      },
    ]
  );
  
  const [fetchHotelUrl, setFetchHotelUrl] = useState('');
  const [isFetchingHotel, setIsFetchingHotel] = useState(false);
  const [fetchHotelError, setFetchHotelError] = useState('');

  // Policies (always pre-populated with permanent defaults + any tour-specific extras)
  const resolvedInitialPolicies = resolveTourPolicies(initialPackage);
  const [customPoliciesEdited, setCustomPoliciesEdited] = useState<boolean>(
    Boolean(initialPackage?.policies?.customPoliciesEdited)
  );
  const [cancellationPolicy, setCancellationPolicy] = useState<string[]>(
    resolvedInitialPolicies.cancellationPolicy
  );
  const [newCancelRule, setNewCancelRule] = useState('');
  const [editingCancelIdx, setEditingCancelIdx] = useState<number | null>(null);
  const [editingCancelVal, setEditingCancelVal] = useState('');

  const [importantNotes, setImportantNotes] = useState<string[]>(
    resolvedInitialPolicies.importantNotes
  );
  const [newNote, setNewNote] = useState('');
  const [editingNoteIdx, setEditingNoteIdx] = useState<number | null>(null);
  const [editingNoteVal, setEditingNoteVal] = useState('');

  // Validation
  const [validationError, setValidationError] = useState('');

  const handleGenerateSeo = async () => {
    if (!title.trim() || !destination.trim()) {
      setValidationError('Please enter a Package Title and Destination to generate SEO content.');
      return;
    }
    
    setIsGeneratingSeo(true);
    setValidationError('');
    
    try {
      const response = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, destination, tagline, overview })
      });
      
      const data = await response.json();
      
      if (response.ok && data) {
        if (data.seoTitle) setSeoTitle(data.seoTitle);
        if (data.metaDescription) setMetaDescription(data.metaDescription);
      } else {
        throw new Error(data.error || 'Failed to generate');
      }
    } catch {
      // Local fallback in case of server/network hiccups
      const fallbackTitle = `${title.trim()} - ${destination.trim()} | Holidays Hunt`.slice(0, 60);
      const fallbackDesc = (tagline?.trim() || overview?.trim() || `Book our ${title.trim()} in ${destination.trim()} with verified hotel stays, private transfers & daily meals.`).slice(0, 155);
      setSeoTitle(fallbackTitle);
      setMetaDescription(fallbackDesc);
    } finally {
      setIsGeneratingSeo(false);
    }
  };

  const handleSave = (statusOverride?: 'published' | 'draft', e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!title.trim()) {
      setValidationError('Please enter a Package Title in Basic Details.');
      setActiveTab('basic');
      return;
    }
    if (!destination.trim()) {
      setValidationError('Please enter a Destination in Basic Details.');
      setActiveTab('basic');
      return;
    }
    if (itinerary.length === 0) {
      setValidationError('Please add at least one Day to the Itinerary.');
      setActiveTab('itinerary');
      return;
    }

    setValidationError('');

    const finalStatus = statusOverride || status;
    const finalSlug = (slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/(^-|-$)/g, '') || 
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const packageData = {
      slug: finalSlug,
      title: title.trim(),
      tagline: tagline.trim() || `Explore the best of ${destination}`,
      destination: destination.trim(),
      destinationTag: destinationTag || destination.toLowerCase(),
      country: country.trim() || destination.trim(),
      category: (['Family', 'Honeymoon', 'Pilgrimage'].includes(category as any)
        ? category
        : ['Family', 'Honeymoon', 'Pilgrimage'].includes(tourType as any)
        ? (tourType as any)
        : 'Family') as PackageCategory,
      badge: badge ? (badge as PackageBadge) : undefined,
      durationDays: Number(durationDays),
      durationNights: Number(durationNights),
      price: Number(price) || 0,
      discountedPrice: discountedPrice && Number(discountedPrice) > 0 ? Number(discountedPrice) : undefined,
      priceOnRequest: priceOnRequest || Number(price) <= 0,
      pricingTiers,
      currency: currency || agencySettings.currencySymbol,
      rating: initialPackage?.rating || 4.9,
      reviewCount: initialPackage?.reviewCount || 24,
      coverImage: coverImage.trim(),
      gallery,
      overview: overview.trim() || `Experience an unforgettable vacation across ${destination}.`,
      startLocation: startLocation.trim(),
      endLocation: endLocation.trim(),
      groupSizeLimit: groupSizeLimit.trim(),
      bestTimeToVisit: bestTimeToVisit.trim(),
      tourType: (['Family', 'Honeymoon', 'Pilgrimage'].includes(category as any)
        ? category
        : ['Family', 'Honeymoon', 'Pilgrimage'].includes(tourType as any)
        ? (tourType as any)
        : 'Family') as TourPackage['tourType'],
      isGroupTour,
      templeIds: selectedTempleIds,
      temples: selectedTempleIds.map((id) => {
        const match = temples.find((t) => t.id === id || t.slug === id);
        return match ? match.name : id;
      }),
      groupTourDetails: isGroupTour
        ? {
            isGroupTour: true,
            groupTheme: groupTheme.trim(),
            coachType: coachType.trim(),
            batchSchedule: batchSchedule.trim(),
            nextDeparture: nextDeparture.trim(),
            totalSeats: Number(totalSeats) || 24,
            bookedSeats: Number(bookedSeats) || 0,
            minGroupSize: 10,
            maxGroupSize: Number(totalSeats) || 24,
            perPersonSavings: Number(perPersonSavings) || 0,
            tourLeader: tourLeader.trim(),
            boardingPoints: boardingPointsStr
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
            batches,
          }
        : undefined,
      itinerary,
      inclusions,
      exclusions,
      includedIcons,
      hotels,
      policies: {
        paymentPolicy: [],
        importantNotes,
        cancellationPolicy,
        termsAndConditions: importantNotes,
        customPoliciesEdited,
      },
      importantNotes,
      status: finalStatus,
      featured,
      seoTitle: seoTitle.trim(),
      seoMetaTitle: seoTitle.trim(),
      metaDescription: metaDescription.trim(),
      seoMetaDescription: metaDescription.trim(),
      seoKeywords: seoKeywords.trim(),
    };

    if (initialPackage?.id) {
      updatePackage({
        ...packageData,
        id: initialPackage.id,
        createdAt: initialPackage.createdAt,
      });
      onSaveComplete(initialPackage.id);
    } else {
      const newId = addPackage(packageData);
      onSaveComplete(newId);
    }
  };

  // Itinerary helpers
  const handleAddDay = () => {
    const nextDayNum = itinerary.length + 1;
    const newDay: ItineraryDay = {
      id: `day-${Date.now().toString(36)}`,
      dayNumber: nextDayNum,
      title: `Day ${nextDayNum} Sightseeing & Excursion`,
      location: destination || 'City Highlights',
      description: 'Morning guided sightseeing followed by afternoon excursion and scenic photo points.',
      meals: ['Breakfast'],
      stayHotel: hotels[0]?.name || 'Luxury 4/5-Star Hotel',
      activities: ['Scenic Excursion', 'Photography Stop', 'Leisure Walk'],
    };
    setItinerary([...itinerary, newDay]);
    setDurationDays(nextDayNum);
    setDurationNights(Math.max(1, nextDayNum - 1));
  };

  const handleUpdateDay = (dayId: string, updates: Partial<ItineraryDay>) => {
    setItinerary((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, ...updates } : d))
    );
  };

  const handleDeleteDay = (dayId: string) => {
    const filtered = itinerary.filter((d) => d.id !== dayId);
    const renumbered = filtered.map((d, index) => ({
      ...d,
      dayNumber: index + 1,
    }));
    setItinerary(renumbered);
    setDurationDays(renumbered.length);
    setDurationNights(Math.max(1, renumbered.length - 1));
  };

  const handleToggleMeal = (dayId: string, meal: MealType) => {
    setItinerary((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d;
        const exists = d.meals.includes(meal);
        const newMeals = exists ? d.meals.filter((m) => m !== meal) : [...d.meals, meal];
        return { ...d, meals: newMeals };
      })
    );
  };

  // Hotel helpers
  const handleAddHotel = () => {
    const newH: HotelStay = {
      id: `hotel-${Date.now().toString(36)}`,
      name: 'New Hotel / Resort',
      city: destination || 'City Center',
      location: destination || 'City Center',
      roomType: 'Deluxe Room with Breakfast',
      nights: 2,
      image: SAMPLE_COVERS[1].url,
      amenities: ['Free WiFi', 'Breakfast Included', 'Swimming Pool'],
    };
    setHotels([...hotels, newH]);
  };

  const handleUpdateHotel = (hotelId: string, updates: Partial<HotelStay>) => {
    setHotels((prev) =>
      prev.map((h) => (h.id === hotelId ? { ...h, ...updates } : h))
    );
  };

  const handleFetchHotelViaAI = async () => {
    if (!fetchHotelUrl.trim()) {
      setFetchHotelError('Please enter a URL or hotel name');
      return;
    }
    
    setIsFetchingHotel(true);
    setFetchHotelError('');
    
    try {
      const res = await fetch('/api/fetch-hotel-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fetchHotelUrl })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch hotel details');
      }

      const newH: HotelStay = {
        id: `hotel-${Date.now().toString(36)}`,
        name: data.name || 'New Luxury Hotel',
        starRating: data.starRating || 4,
        city: data.city || data.location || destination || 'City Center',
        location: data.location || destination || 'City Center',
        roomType: 'Deluxe Room with View',
        nights: 2,
        image: data.images?.[0] || SAMPLE_COVERS[1].url,
        amenities: data.amenities?.slice(0, 4) || ['Free WiFi', 'Breakfast Included'],
      };
      
      setHotels([...hotels, newH]);
      setFetchHotelUrl('');
    } catch (err: any) {
      setFetchHotelError(err.message || 'AI extraction failed. Please add details manually.');
    } finally {
      setIsFetchingHotel(false);
    }
  };

  const handleDeleteHotel = (hotelId: string) => {
    setHotels((prev) => prev.filter((h) => h.id !== hotelId));
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {initialPackage ? 'Edit Tour Package' : 'Create New Tour Package'}
              </h2>
              <p className="text-xs text-slate-500">
                {title ? title : 'Fill in the package builder steps below'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Selector */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStatus('published')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  status === 'published'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Published (Live)
              </button>
              <button
                type="button"
                onClick={() => setStatus('draft')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  status === 'draft'
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Draft
              </button>
            </div>

            <button
              onClick={() => handleSave('draft')}
              className="px-3 sm:px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              Save as Draft
            </button>

            <button
              onClick={() => handleSave('published')}
              className="px-4 sm:px-5 py-2 rounded-xl bg-[#9b0000] hover:bg-[#E03A00] text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Live</span>
            </button>
          </div>
        </div>
      </div>

      {/* Validation banner */}
      {validationError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between">
            <span>⚠️ {validationError}</span>
            <button onClick={() => setValidationError('')} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main CMS Builder Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Step Tabs */}
        <div className="bg-slate-50 rounded-2xl p-1.5 border border-slate-200 shadow-2xs flex flex-wrap items-center gap-1 text-xs font-bold mb-6">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'basic' ? 'bg-brand text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Basic & Photos</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'pricing' ? 'bg-brand text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>2. Pricing & Days</span>
          </button>

          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'itinerary' ? 'bg-brand text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>3. Day-Wise Itinerary ({itinerary.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inclusions')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'inclusions' ? 'bg-brand text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>4. Inclusions ({inclusions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hotels')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'hotels' ? 'bg-brand text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>5. Hotels ({hotels.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'policies' ? 'bg-brand text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>6. Policies & Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'seo' ? 'bg-brand text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>7. SEO & AI</span>
          </button>

          <button
            onClick={() => setActiveTab('group')}
            className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'group'
                ? 'bg-[#9b0000] text-white shadow-xs'
                : isGroupTour
                ? 'text-[#9b0000] bg-[#FDF2F2]/80 hover:bg-[#FCE8E8]/60 border border-[#F5C2C2]/60'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>8. Group Tour & Batches {isGroupTour && '🟢'}</span>
          </button>
        </div>

        {/* TAB 1: BASIC DETAILS & PHOTOS */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
              <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand" />
                Package General Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Package Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Kashmir Paradise: Valley of Dreams & Houseboat"
                    className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tagline / One-line Summary
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Experience heaven on earth with Shikara rides, Gulmarg gondola, and snowcapped peaks"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:bg-white focus:border-brand focus:outline-hidden transition"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Destination Hub / Page *
                    </label>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {destinationList.length} destination{destinationList.length === 1 ? '' : 's'} in list
                    </span>
                  </div>
                  <select
                    value={destinationTag}
                    onChange={(e) => setDestinationTag(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden font-bold text-slate-800"
                  >
                    {destinationList.length === 0 ? (
                      <option value="">No destinations created yet — add in Destinations Hub</option>
                    ) : (
                      <>
                        {destinationList.map((dest) => (
                          <option key={dest.slug || dest.id} value={dest.slug || dest.id}>
                            📍 {dest.displayName || dest.name} {dest.state ? `(${dest.state})` : ''}
                          </option>
                        ))}
                        {/* If existing package has a custom destinationTag not in list, preserve it */}
                        {destinationTag && !destinationList.some((d) => d.slug === destinationTag || d.id === destinationTag) && (
                          <option value={destinationTag}>
                            Current: {destinationTag}
                          </option>
                        )}
                      </>
                    )}
                  </select>
                  {destinationList.length === 0 && (
                    <p className="text-[11px] text-amber-600 mt-1 font-medium">
                      ⚠️ No destinations found. Go to <strong>CMS → Destinations Hub</strong> to add destinations, and they will immediately appear here.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Destination (City/Region Text) *
                  </label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Katra, Vaishno Devi & Patnitop"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:bg-white focus:border-brand focus:outline-hidden transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. India"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:bg-white focus:border-brand focus:outline-hidden transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tour Category *
                  </label>
                  <select
                    value={category || tourType || 'Family'}
                    onChange={(e) => {
                      const val = e.target.value as PackageCategory;
                      setCategory(val);
                      setTourType(val as TourPackage['tourType']);
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden font-bold text-slate-800"
                  >
                    <option value="Family">Family Tour</option>
                    <option value="Honeymoon">Honeymoon Tour</option>
                    <option value="Pilgrimage">Pilgrimage / Yatra Tour</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Determines which section on the homepage and directory this tour appears in.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Best Time to Visit
                  </label>
                  <input
                    type="text"
                    value={bestTimeToVisit}
                    onChange={(e) => setBestTimeToVisit(e.target.value)}
                    placeholder="e.g. April to October & Dec-Feb"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:bg-white focus:border-brand focus:outline-hidden transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tour Detailed Overview
                  </label>
                  <textarea
                    rows={3}
                    value={overview}
                    onChange={(e) => setOverview(e.target.value)}
                    placeholder="Detailed narrative describing the magical experience, landscapes, transport and stay highlights..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:bg-white focus:border-brand focus:outline-hidden transition"
                  />
                </div>

                {/* TOP ATTRACTIONS & SIGHTSEEING SELECTION */}
                <div className="md:col-span-2 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#9b0000]" />
                        <span>Top Attractions & Must-Visit Landmarks Visited on this Tour</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FCE8E8] text-[#9b0000] text-[10px] font-black">
                          {selectedTempleIds.length} Selected
                        </span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Tag top attractions and key landmarks to enable travelers to filter and discover this package by specific locations on the homepage and directory.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedTempleIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedTempleIds([])}
                          className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Search and Category Filter for Temples/Attractions */}
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      value={templeSearchQuery}
                      onChange={(e) => setTempleSearchQuery(e.target.value)}
                      placeholder="Search attractions by name, location, or keyword..."
                      className="w-full sm:w-64 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:bg-white focus:border-[#9b0000] focus:outline-hidden"
                    />

                    <div className="flex items-center gap-1 overflow-x-auto w-full pb-1 scrollbar-none">
                      {['all', 'Shaktipeeth', 'Jyotirlinga', 'Char Dham', 'Cave Shrine', 'Ancient Dham'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setTempleCategoryFilter(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                            templeCategoryFilter === cat
                              ? 'bg-[#9b0000] text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat === 'all' ? 'All Shrines' : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shrines Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1 border border-slate-200 rounded-2xl bg-slate-50/50">
                    {temples
                      .filter((t) => {
                        const matchesQuery =
                          t.name.toLowerCase().includes(templeSearchQuery.toLowerCase()) ||
                          (t.hindiName && t.hindiName.toLowerCase().includes(templeSearchQuery.toLowerCase())) ||
                          t.city.toLowerCase().includes(templeSearchQuery.toLowerCase()) ||
                          (t.deity && t.deity.toLowerCase().includes(templeSearchQuery.toLowerCase()));
                        const matchesCat =
                          templeCategoryFilter === 'all' || t.category === templeCategoryFilter;
                        return matchesQuery && matchesCat;
                      })
                      .map((temple) => {
                        const isSelected =
                          selectedTempleIds.includes(temple.id) ||
                          selectedTempleIds.includes(temple.slug) ||
                          selectedTempleIds.includes(temple.name);

                        return (
                          <div
                            key={temple.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedTempleIds((prev) =>
                                  prev.filter(
                                    (id) =>
                                      id !== temple.id &&
                                      id !== temple.slug &&
                                      id !== temple.name
                                  )
                                );
                              } else {
                                setSelectedTempleIds((prev) => [...prev, temple.id]);
                              }
                            }}
                            className={`p-2 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer select-none ${
                              isSelected
                                ? 'bg-[#FDF2F2] border-[#9b0000] shadow-xs'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-[#9b0000] focus:ring-[#9b0000] cursor-pointer shrink-0"
                            />
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                              <img
                                src={resolveDisplayImage(temple.image, mediaAssets)}
                                alt={temple.name}
                                onError={(e) => handleImageError(e, temple.image, mediaAssets)}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {temple.name}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">
                                {temple.city}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Image & Presets */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand" />
                Featured Cover Image & Gallery
              </h3>

              <div>
                <UniversalImageUploader
                  label="Main Cover Image (Auto-Compress to Cloudflare R2)"
                  description="Upload banner photo. Choose width (700, 800, 1000, 1200, 1600px) & format (WebP, PNG, JPG, GIF). Shows exact compression reduction."
                  folder="tours"
                  defaultWidth={1200}
                  defaultFormat="webp"
                  currentUrl={coverImage}
                  onImageSelected={(url) => setCoverImage(url)}
                />

                <div className="mt-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Or paste direct image URL:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:bg-white focus:border-brand focus:outline-hidden transition"
                    />
                  </div>
                </div>

                {/* Cover presets */}
                <div className="mt-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">
                    Or select from curated travel presets:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SAMPLE_COVERS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCoverImage(preset.url)}
                        className={`text-left p-1.5 rounded-xl border flex items-center gap-2 text-xs transition cursor-pointer ${
                          coverImage === preset.url
                            ? 'border-brand bg-brand/10 text-brand font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <img src={preset.url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <span className="truncate">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {coverImage && (
                  <div className="mt-4 rounded-2xl overflow-hidden aspect-[21/9] max-h-48 border border-slate-200 relative">
                    <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-slate-950/70 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                      Current Cover Preview
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery Items */}
              <div className="pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Additional Gallery Photos ({gallery.length})
                </label>

                {/* Direct Upload & Auto-Compress to Cloudflare R2 */}
                <div className="mb-4">
                  <UniversalImageUploader
                    variant="compact"
                    label="Upload & Auto-Compress New Photo (R2)"
                    folder="tours/gallery"
                    defaultWidth={1000}
                    defaultFormat="webp"
                    onImageSelected={(url) => {
                      setGallery((prev) => [
                        ...prev,
                        {
                          id: `g-${Date.now().toString(36)}`,
                          url,
                          caption: newGalleryCaption.trim() || 'Tour view',
                        },
                      ]);
                      setNewGalleryCaption('');
                    }}
                  />
                </div>

                {/* Or add via URL input */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-3">
                  <input
                    type="url"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder="Photo Image URL (https://...)"
                    className="sm:col-span-7 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:border-brand focus:outline-hidden"
                  />
                  <input
                    type="text"
                    value={newGalleryCaption}
                    onChange={(e) => setNewGalleryCaption(e.target.value)}
                    placeholder="Photo Caption"
                    className="sm:col-span-3 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:border-brand focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newGalleryUrl.trim()) return;
                      setGallery([
                        ...gallery,
                        {
                          id: `g-${Date.now().toString(36)}`,
                          url: newGalleryUrl.trim(),
                          caption: newGalleryCaption.trim() || 'Tour view',
                        },
                      ]);
                      setNewGalleryUrl('');
                      setNewGalleryCaption('');
                    }}
                    className="sm:col-span-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Photo</span>
                  </button>
                </div>

                {/* Gallery list */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {gallery.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-xl overflow-hidden aspect-[4/3] border border-slate-200 bg-slate-100"
                    >
                      <img src={item.url} alt={item.caption} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-2 text-white text-[10px]">
                        <span className="truncate font-medium">{item.caption}</span>
                        <button
                          type="button"
                          onClick={() => setGallery(gallery.filter((g) => g.id !== item.id))}
                          className="self-end p-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRICING & DURATION */}
        {activeTab === 'pricing' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-brand" />
                Duration, Logistics & Pricing Policy
              </h3>
              <span className="text-xs font-bold text-brand bg-brand/10 px-3 py-1 rounded-full border border-brand/20 inline-flex items-center gap-1.5 self-start">
                <Sparkles className="w-3.5 h-3.5" /> Choudhary Vacations "Price on Request" Active
              </span>
            </div>

            {/* Price on Request Notice */}
            <div className="bg-brand/5 border border-brand/20 rounded-2xl p-4 text-xs text-slate-800 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-brand shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold text-brand block mb-0.5">Agency Policy: "Price on Request"</strong>
                All packages on traveler catalog & PDF brochures will display <strong>"Price on Request"</strong>. The internal base rate below is used exclusively for reference and backend quote estimation.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Duration (Days) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={45}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:bg-white focus:border-brand focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Duration (Nights) *
                </label>
                <input
                  type="number"
                  min={0}
                  max={45}
                  value={durationNights}
                  onChange={(e) => setDurationNights(Number(e.target.value))}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:bg-white focus:border-brand focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Group Size Limit
                </label>
                <input
                  type="text"
                  value={groupSizeLimit}
                  onChange={(e) => setGroupSizeLimit(e.target.value)}
                  placeholder="e.g. Max 12 People (Private Available)"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:bg-white focus:border-brand focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Regular Price per Person *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 focus:bg-white focus:border-brand focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Offer / Discounted Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={discountedPrice || ''}
                    onChange={(e) => setDiscountedPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Leave empty if none"
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 focus:bg-white focus:border-brand focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  id="priceOnRequest"
                  checked={priceOnRequest}
                  onChange={(e) => setPriceOnRequest(e.target.checked)}
                  className="w-4 h-4 text-brand bg-slate-50 border-slate-300 rounded focus:ring-brand"
                />
                <label htmlFor="priceOnRequest" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Set Base Price as "Price on Request"
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:bg-white focus:border-brand focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Start / Pickup City
                </label>
                <input
                  type="text"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  placeholder="e.g. Srinagar Airport (SXR)"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:bg-white focus:border-brand focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  End / Drop City
                </label>
                <input
                  type="text"
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  placeholder="e.g. Srinagar Airport (SXR)"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:bg-white focus:border-brand focus:outline-hidden"
                />
              </div>
            </div>

            {/* Hotel Category Tiers */}
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-sm font-black text-slate-900 mb-1">Hotel Category Pricing Tiers</h4>
              <p className="text-xs text-slate-500 mb-4">
                Enable only the hotel categories available for this package (2★ Budget Hotels, 3★, 4★, 5★). Only enabled categories are shown to travelers.
              </p>
              <div className="grid gap-4">
                {HOTEL_CATEGORY_OPTIONS.map((opt) => {
                  const tierKey = opt.key;
                  const existingTier = pricingTiers[tierKey];
                  const isEnabled = Boolean(existingTier && existingTier.enabled !== false);
                  const tierData = existingTier || {
                    enabled: false,
                    starRating: opt.starRating,
                    tierName: opt.tierName,
                    price: price,
                    discountedPrice: discountedPrice,
                    priceOnRequest: priceOnRequest,
                  };
                  return (
                    <div
                      key={tierKey}
                      className={`border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end transition ${
                        isEnabled ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-200/80 opacity-80'
                      }`}
                    >
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPricingTiers((prev) => ({
                                  ...prev,
                                  [tierKey]: {
                                    ...tierData,
                                    enabled: true,
                                    starRating: opt.starRating,
                                    tierName: opt.tierName,
                                    price: Number(tierData.price ?? price ?? 0),
                                    discountedPrice: tierData.discountedPrice,
                                    priceOnRequest: Boolean(tierData.priceOnRequest ?? priceOnRequest),
                                  },
                                }));
                              } else {
                                setPricingTiers((prev) => {
                                  const next = { ...prev };
                                  delete next[tierKey];
                                  return next;
                                });
                              }
                            }}
                            className="w-4 h-4 text-[#9b0000] bg-white border-slate-300 rounded focus:ring-[#9b0000]"
                          />
                          <span className="text-xs font-black text-slate-900">{opt.cmsLabel}</span>
                        </label>

                        {isEnabled && (
                          <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(tierData.priceOnRequest)}
                              onChange={(e) => {
                                setPricingTiers((prev) => ({
                                  ...prev,
                                  [tierKey]: { ...tierData, enabled: true, starRating: opt.starRating, tierName: opt.tierName, priceOnRequest: e.target.checked },
                                }));
                              }}
                              className="w-4 h-4 text-[#9b0000] bg-white border-slate-300 rounded focus:ring-[#9b0000]"
                            />
                            <span className="text-xs font-bold text-slate-700">Price on Request</span>
                          </label>
                        )}
                      </div>

                      {isEnabled && !tierData.priceOnRequest && (
                        <>
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">Tier Price</label>
                            <input
                              type="number"
                              value={tierData.price ?? 0}
                              onChange={(e) => {
                                setPricingTiers((prev) => ({
                                  ...prev,
                                  [tierKey]: { ...tierData, enabled: true, starRating: opt.starRating, tierName: opt.tierName, price: Number(e.target.value) },
                                }));
                              }}
                              className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">Offer Price</label>
                            <input
                              type="number"
                              value={tierData.discountedPrice || ''}
                              onChange={(e) => {
                                setPricingTiers((prev) => ({
                                  ...prev,
                                  [tierKey]: { ...tierData, enabled: true, starRating: opt.starRating, tierName: opt.tierName, discountedPrice: e.target.value ? Number(e.target.value) : undefined },
                                }));
                              }}
                              className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DAY-WISE ITINERARY BUILDER */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand" />
                    Day-Wise Itinerary Builder ({itinerary.length} Days)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add narrative plans, meal inclusions, overnight stays, and sightseeing tags for each day
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddDay}
                  className="px-4 py-2 bg-brand hover:bg-brand-dark text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Day {itinerary.length + 1}</span>
                </button>
              </div>

              {/* Day Editor Cards */}
              <div className="space-y-6">
                {itinerary.map((day) => (
                  <div
                    key={day.id}
                    className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200 hover:border-brand/40 transition space-y-4"
                  >
                    {/* Day Header */}
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-lg bg-brand text-white">
                        Day {day.dayNumber}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteDay(day.id)}
                        disabled={itinerary.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer disabled:opacity-30"
                        title="Delete Day"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-8">
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Day Title *
                        </label>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => handleUpdateDay(day.id, { title: e.target.value })}
                          placeholder="e.g. Arrival & Sunset Shikara Cruise on Dal Lake"
                          className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={day.location}
                          onChange={(e) => handleUpdateDay(day.id, { location: e.target.value })}
                          placeholder="e.g. Srinagar / Gulmarg"
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden"
                        />
                      </div>

                      <div className="sm:col-span-12">
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Day Description & Schedule *
                        </label>
                        <textarea
                          rows={2}
                          value={day.description}
                          onChange={(e) => handleUpdateDay(day.id, { description: e.target.value })}
                          placeholder="Describe the full day sightseeing, drives, photo points and evening activities..."
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden"
                        />
                      </div>

                      {/* Stay Hotel */}
                      <div className="sm:col-span-6">
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Overnight Stay Hotel / Resort
                        </label>
                        <input
                          type="text"
                          value={day.stayHotel || ''}
                          onChange={(e) => handleUpdateDay(day.id, { stayHotel: e.target.value })}
                          placeholder="e.g. Royal Heritage Luxury Houseboat"
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden"
                        />
                      </div>

                      {/* Meals toggles */}
                      <div className="sm:col-span-6">
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Included Meals on Day {day.dayNumber}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(['Breakfast', 'Lunch', 'Dinner', 'Hi-Tea'] as MealType[]).map((m) => {
                            const isSelected = day.meals.includes(m);
                            return (
                              <button
                                key={m}
                                type="button"
                                onClick={() => handleToggleMeal(day.id, m)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                  isSelected
                                    ? 'bg-brand text-white border-brand shadow-2xs'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {isSelected ? `✓ ${m}` : m}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INCLUSIONS & EXCLUSIONS */}
        {activeTab === 'inclusions' && (
          <div className="space-y-6">
            {/* Tour Highlights Icons Manager (Shown on Tour Page) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-100">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    "Tour Includes" Highlights Icons ({includedIcons.length} Selected)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select, add, or delete the feature icons displayed in the "Tour Includes" section on the traveler tour page.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIncludedIcons(DEFAULT_INCLUDED_ICONS)}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncludedIcons([])}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* 1-Click Quick Preset Icons to Add */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  1-Click Quick Add Feature Icons:
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_INCLUDED_ICON_OPTIONS.map((preset) => {
                    const isAlreadyAdded = includedIcons.some((item) => item.icon === preset.icon);
                    return (
                      <button
                        key={preset.icon}
                        type="button"
                        onClick={() => {
                          if (isAlreadyAdded) {
                            // Remove if already added
                            setIncludedIcons(includedIcons.filter((item) => item.icon !== preset.icon));
                          } else {
                            // Add
                            setIncludedIcons([
                              ...includedIcons,
                              {
                                id: `inc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
                                icon: preset.icon,
                                label: preset.label,
                              },
                            ]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                          isAlreadyAdded
                            ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs font-extrabold ring-1 ring-amber-400'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className="p-1 rounded-lg bg-white border border-slate-200 text-amber-700">
                          {preset.icon === 'hotel' && <Building className="w-3.5 h-3.5" />}
                          {preset.icon === 'meals' && <Utensils className="w-3.5 h-3.5" />}
                          {preset.icon === 'cab' && <Car className="w-3.5 h-3.5" />}
                          {preset.icon === 'flight' && <Plane className="w-3.5 h-3.5" />}
                          {preset.icon === 'sightseeing' && <Camera className="w-3.5 h-3.5" />}
                          {preset.icon === 'transport' && <Car className="w-3.5 h-3.5" />}
                          {preset.icon === 'houseboat' && <Ship className="w-3.5 h-3.5" />}
                          {preset.icon === 'shikara' && <Compass className="w-3.5 h-3.5" />}
                          {preset.icon === 'guide' && <ShieldCheck className="w-3.5 h-3.5" />}
                          {preset.icon === 'activities' && <Sparkles className="w-3.5 h-3.5" />}
                          {preset.icon === 'permits' && <FileText className="w-3.5 h-3.5" />}
                        </span>
                        <span>{preset.name}</span>
                        <span className="text-[10px] font-black">{isAlreadyAdded ? '✓' : '+'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Icon & Custom Label Adder */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Or Add Custom Icon with Custom Label:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-4">
                    <select
                      value={newCustomIconType}
                      onChange={(e) => setNewCustomIconType(e.target.value as TourInclusionIconType)}
                      className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-amber-500 focus:outline-hidden"
                    >
                      <option value="hotel">🏨 Hotel Stay</option>
                      <option value="meals">🍽️ Daily Meals / Buffet</option>
                      <option value="cab">🚗 Dedicated AC Cab</option>
                      <option value="flight">✈️ Flight / Air Tickets</option>
                      <option value="sightseeing">📷 Sightseeing / Photo Stops</option>
                      <option value="transport">🚙 Airport & Intercity Transfers</option>
                      <option value="houseboat">⛵ Luxury Houseboat Stay</option>
                      <option value="shikara">🛶 Shikara Dal Lake Ride</option>
                      <option value="guide">🛡️ Tour Manager / Guide</option>
                      <option value="activities">✨ Adventure Passes / Activities</option>
                      <option value="permits">📋 Permits & Toll Taxes</option>
                    </select>
                  </div>
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      value={newCustomIconLabel}
                      onChange={(e) => setNewCustomIconLabel(e.target.value)}
                      placeholder="Custom Display Label (e.g., 'Gondola Ride', 'Daily Meals', 'Luxury Cab')"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={() => {
                        const labelToAdd = newCustomIconLabel.trim() || newCustomIconType.toUpperCase();
                        setIncludedIcons([
                          ...includedIcons,
                          {
                            id: `inc-${Date.now().toString(36)}`,
                            icon: newCustomIconType,
                            label: labelToAdd,
                          },
                        ]);
                        setNewCustomIconLabel('');
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Icon</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Selected Inclusions Grid with Inline Edit & Delete */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Active Selected Icons ({includedIcons.length}):
                </label>
                {includedIcons.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                    No icons selected. Click any quick add preset button above to add icons.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {includedIcons.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 flex flex-col items-center justify-between text-center relative group hover:shadow-xs transition"
                      >
                        <button
                          type="button"
                          onClick={() => setIncludedIcons(includedIcons.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Remove Icon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs mb-2 mt-1">
                          {item.icon === 'hotel' && <Building className="w-5 h-5 text-amber-600" />}
                          {item.icon === 'meals' && <Utensils className="w-5 h-5 text-emerald-600" />}
                          {item.icon === 'cab' && <Car className="w-5 h-5 text-blue-600" />}
                          {item.icon === 'flight' && <Plane className="w-5 h-5 text-sky-600" />}
                          {item.icon === 'sightseeing' && <Camera className="w-5 h-5 text-purple-600" />}
                          {item.icon === 'transport' && <Car className="w-5 h-5 text-indigo-600" />}
                          {item.icon === 'houseboat' && <Ship className="w-5 h-5 text-teal-600" />}
                          {item.icon === 'shikara' && <Compass className="w-5 h-5 text-cyan-600" />}
                          {item.icon === 'guide' && <ShieldCheck className="w-5 h-5 text-emerald-700" />}
                          {item.icon === 'activities' && <Sparkles className="w-5 h-5 text-amber-600" />}
                          {item.icon === 'permits' && <FileText className="w-5 h-5 text-slate-700" />}
                        </div>

                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => {
                            const updated = [...includedIcons];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            setIncludedIcons(updated);
                          }}
                          className="w-full text-center text-xs font-black text-slate-900 bg-white border border-slate-200 rounded-lg px-1.5 py-1 focus:border-amber-500 focus:outline-hidden"
                          title="Click to edit label"
                        />
                        <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                          {item.icon}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inclusions Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Detailed Inclusions List ({inclusions.length})
                  </h3>
                </div>

                {/* Add new inclusion */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInclusion}
                    onChange={(e) => setNewInclusion(e.target.value)}
                    placeholder="Add an included feature..."
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newInclusion.trim()) return;
                      setInclusions([...inclusions, newInclusion.trim()]);
                      setNewInclusion('');
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Preset suggestions */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Quick Preset Inclusions:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_INCLUSIONS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (!inclusions.includes(preset)) {
                            setInclusions([...inclusions, preset]);
                          }
                        }}
                        className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-1 rounded-md transition cursor-pointer"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inclusions List */}
                <ul className="space-y-2 pt-2">
                  {inclusions.map((inc, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{inc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInclusions(inclusions.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclusions Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-rose-600" />
                    Package Exclusions ({exclusions.length})
                  </h3>
                </div>

                {/* Add new exclusion */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newExclusion}
                    onChange={(e) => setNewExclusion(e.target.value)}
                    placeholder="Add an excluded item..."
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newExclusion.trim()) return;
                      setExclusions([...exclusions, newExclusion.trim()]);
                      setNewExclusion('');
                    }}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Preset suggestions */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Quick Preset Exclusions:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_EXCLUSIONS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (!exclusions.includes(preset)) {
                            setExclusions([...exclusions, preset]);
                          }
                        }}
                        className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 px-2 py-1 rounded-md transition cursor-pointer"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exclusions List */}
                <ul className="space-y-2 pt-2">
                  {exclusions.map((exc, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{exc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExclusions(exclusions.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: HOTELS & STAYS */}
        {activeTab === 'hotels' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-brand" />
                    Verified Accommodations & Star Resorts ({hotels.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add verified hotels, star ratings, room categories, night counts, and photos
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddHotel}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Manual Blank Stay</span>
                </button>
              </div>

              {/* AI Fetcher Bar */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-brand" />
                  Auto-Add Hotel Details via AI
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Paste a TripAdvisor / Booking.com link or type the hotel name to auto-fill its star rating, location, image, and top amenities into the itinerary stay.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={fetchHotelUrl}
                      onChange={(e) => setFetchHotelUrl(e.target.value)}
                      placeholder="e.g. 'Taj Palace New Delhi' or https://tripadvisor.com/..."
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:border-brand focus:outline-hidden transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchHotelViaAI}
                    disabled={isFetchingHotel}
                    className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isFetchingHotel ? 'Fetching...' : 'Fetch & Add Hotel'}
                  </button>
                </div>
                {fetchHotelError && (
                  <p className="text-xs text-rose-500 mt-2 font-medium flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    {fetchHotelError}
                  </p>
                )}
              </div>

              <div className="space-y-6">
                {hotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200 hover:border-brand/40 transition space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{hotel.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteHotel(hotel.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                      <div className="sm:col-span-6">
                        <label className="font-bold text-slate-700 block mb-1">Hotel Name *</label>
                        <input
                          type="text"
                          value={hotel.name}
                          onChange={(e) => handleUpdateHotel(hotel.id, { name: e.target.value })}
                          placeholder="e.g. Radisson Blu Resort & Spa"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden font-semibold"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="font-bold text-slate-700 block mb-1">Hotel Category</label>
                        <select
                          value={hotel.starRating ? String(hotel.starRating) : ''}
                          onChange={(e) =>
                            handleUpdateHotel(hotel.id, {
                              starRating: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden font-semibold text-slate-800"
                        >
                          <option value="">Not Specified</option>
                          <option value="2">2-Star (Budget Hotels)</option>
                          <option value="3">3-Star</option>
                          <option value="4">4-Star</option>
                          <option value="5">5-Star</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="font-bold text-slate-700 block mb-1">Nights Count</label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={hotel.nights}
                          onChange={(e) =>
                            handleUpdateHotel(hotel.id, { nights: Number(e.target.value) })
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden font-semibold"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="font-bold text-slate-700 block mb-1">Location</label>
                        <input
                          type="text"
                          value={hotel.location}
                          onChange={(e) => handleUpdateHotel(hotel.id, { location: e.target.value, city: e.target.value })}
                          placeholder="e.g. Pahalgam Riverside"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden font-semibold"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="font-bold text-slate-700 block mb-1">Room Category</label>
                        <input
                          type="text"
                          value={hotel.roomType}
                          onChange={(e) => handleUpdateHotel(hotel.id, { roomType: e.target.value })}
                          placeholder="e.g. Deluxe Valley View Room"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="font-bold text-slate-700 block mb-1">Hotel Image URL</label>
                        <input
                          type="url"
                          value={hotel.image}
                          onChange={(e) => handleUpdateHotel(hotel.id, { image: e.target.value })}
                          placeholder="https://..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden"
                        />
                      </div>

                      <div className="sm:col-span-12">
                        <label className="font-bold text-slate-700 block mb-1">Amenities (comma separated)</label>
                        <input
                          type="text"
                          value={hotel.amenities?.join(', ') || ''}
                          onChange={(e) => handleUpdateHotel(hotel.id, { amenities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                          placeholder="WiFi, Pool, Spa..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: POLICIES & NOTES */}
        {activeTab === 'policies' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand" />
                  <span>Policies & Traveler Guidelines</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Both policies are permanently included in all tours by default. You can edit existing points or add more for this tour.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setImportantNotes([...DEFAULT_TRAVELER_GUIDELINES]);
                  setCancellationPolicy([...DEFAULT_CANCELLATION_TERMS]);
                  setCustomPoliciesEdited(false);
                  setEditingNoteIdx(null);
                  setEditingCancelIdx(null);
                }}
                className="self-start sm:self-auto px-3 py-1.5 bg-[#FDF2F2] hover:bg-[#FCE8E8] text-brand border border-[#F5C2C2] text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Reset to Standard Defaults</span>
              </button>
            </div>

            {/* 1. Important Traveler Notes & Guidelines */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-brand" />
                <span>1. Important Traveler Notes & Guidelines ({importantNotes.length})</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newNote.trim()) {
                      e.preventDefault();
                      setImportantNotes([...importantNotes, newNote.trim()]);
                      setNewNote('');
                      setCustomPoliciesEdited(true);
                    }
                  }}
                  placeholder="Add an additional traveler guideline or note for this tour..."
                  className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:border-brand focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newNote.trim()) return;
                    setImportantNotes([...importantNotes, newNote.trim()]);
                    setNewNote('');
                    setCustomPoliciesEdited(true);
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
              </div>

              <ul className="space-y-1.5">
                {importantNotes.map((note, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                  >
                    {editingNoteIdx === i ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingNoteVal}
                          onChange={(e) => setEditingNoteVal(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && editingNoteVal.trim()) {
                              e.preventDefault();
                              const updated = [...importantNotes];
                              updated[i] = editingNoteVal.trim();
                              setImportantNotes(updated);
                              setCustomPoliciesEdited(true);
                              setEditingNoteIdx(null);
                            }
                          }}
                          className="flex-1 text-xs bg-white border border-brand rounded-lg px-2.5 py-1.5 focus:outline-hidden"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingNoteVal.trim()) return;
                            const updated = [...importantNotes];
                            updated[i] = editingNoteVal.trim();
                            setImportantNotes(updated);
                            setCustomPoliciesEdited(true);
                            setEditingNoteIdx(null);
                          }}
                          className="p-1.5 bg-[#9b0000] text-white rounded-lg cursor-pointer"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingNoteIdx(null)}
                          className="p-1.5 bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 leading-relaxed">• {note}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteIdx(i);
                              setEditingNoteVal(note);
                            }}
                            className="text-slate-500 hover:text-[#9b0000] p-1 cursor-pointer"
                            title="Edit guideline"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setImportantNotes(importantNotes.filter((_, idx) => idx !== i));
                              setCustomPoliciesEdited(true);
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="Delete guideline"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Cancellation & Refund Terms */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#9b0000]" />
                <span>2. Cancellation & Refund Terms ({cancellationPolicy.length})</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCancelRule}
                  onChange={(e) => setNewCancelRule(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCancelRule.trim()) {
                      e.preventDefault();
                      setCancellationPolicy([...cancellationPolicy, newCancelRule.trim()]);
                      setNewCancelRule('');
                      setCustomPoliciesEdited(true);
                    }
                  }}
                  placeholder="Add an additional cancellation or refund term..."
                  className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:border-brand focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newCancelRule.trim()) return;
                    setCancellationPolicy([...cancellationPolicy, newCancelRule.trim()]);
                    setNewCancelRule('');
                    setCustomPoliciesEdited(true);
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Term</span>
                </button>
              </div>

              <ul className="space-y-1.5">
                {cancellationPolicy.map((line, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                  >
                    {editingCancelIdx === i ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingCancelVal}
                          onChange={(e) => setEditingCancelVal(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && editingCancelVal.trim()) {
                              e.preventDefault();
                              const updated = [...cancellationPolicy];
                              updated[i] = editingCancelVal.trim();
                              setCancellationPolicy(updated);
                              setCustomPoliciesEdited(true);
                              setEditingCancelIdx(null);
                            }
                          }}
                          className="flex-1 text-xs bg-white border border-brand rounded-lg px-2.5 py-1.5 focus:outline-hidden"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingCancelVal.trim()) return;
                            const updated = [...cancellationPolicy];
                            updated[i] = editingCancelVal.trim();
                            setCancellationPolicy(updated);
                            setCustomPoliciesEdited(true);
                            setEditingCancelIdx(null);
                          }}
                          className="p-1.5 bg-[#9b0000] text-white rounded-lg cursor-pointer"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCancelIdx(null)}
                          className="p-1.5 bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 leading-relaxed">• {line}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCancelIdx(i);
                              setEditingCancelVal(line);
                            }}
                            className="text-slate-500 hover:text-[#9b0000] p-1 cursor-pointer"
                            title="Edit term"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCancellationPolicy(cancellationPolicy.filter((_, idx) => idx !== i));
                              setCustomPoliciesEdited(true);
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="Delete term"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 7: SEO & AI */}
        {activeTab === 'seo' && (
          <CMSSEOEditor
            type="package"
            itemName={title}
            slug={slug}
            extraData={{
              city: destination,
              price: price,
            }}
            seoMetaTitle={seoTitle}
            seoMetaDescription={metaDescription}
            seoKeywords={seoKeywords}
            onChange={(field, val) => {
              if (field === 'slug') setSlug(val);
              if (field === 'seoMetaTitle') setSeoTitle(val);
              if (field === 'seoMetaDescription') setMetaDescription(val);
              if (field === 'seoKeywords') setSeoKeywords(val);
            }}
            onApplyAll={(data) => {
              if (data.slug) setSlug(data.slug);
              setSeoTitle(data.seoMetaTitle);
              setMetaDescription(data.seoMetaDescription);
              setSeoKeywords(data.seoKeywords);
            }}
          />
        )}

        {/* TAB 8: GROUP TOUR & FIXED DEPARTURE BATCHES */}
        {activeTab === 'group' && (
          <div className="space-y-6">
            {/* Master Toggle Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#FDF2F2] text-[#9b0000] border border-[#9b0000]/20 mt-0.5">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Fixed Departure Group Tour Settings
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enable group departures to display seat inventory, coach details, and scheduled batch dates on the storefront.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGroupTour}
                    onChange={(e) => {
                      setIsGroupTour(e.target.checked);
                      if (e.target.checked) setTourType('Group Tour');
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-13 h-7 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#9b0000]"></div>
                  <span className="ml-3 text-xs font-bold text-slate-900">
                    {isGroupTour ? 'Group Tour Active' : 'Disabled (Private Tour)'}
                  </span>
                </label>
              </div>

              {isGroupTour && (
                <div className="mt-6 space-y-6">
                  {/* General Group Tour Operations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Group Theme / Yatra Title
                      </label>
                      <input
                        type="text"
                        value={groupTheme}
                        onChange={(e) => setGroupTheme(e.target.value)}
                        placeholder="e.g. Sacred Devotee Sangha & Fixed Departure"
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Coach / Vehicle Type
                      </label>
                      <input
                        type="text"
                        value={coachType}
                        onChange={(e) => setCoachType(e.target.value)}
                        placeholder="e.g. 2x2 AC Pushback Luxury Coach"
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Next Upcoming Departure Date
                      </label>
                      <input
                        type="text"
                        value={nextDeparture}
                        onChange={(e) => setNextDeparture(e.target.value)}
                        placeholder="e.g. 15 Oct 2025"
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Departure Frequency / Schedule
                      </label>
                      <input
                        type="text"
                        value={batchSchedule}
                        onChange={(e) => setBatchSchedule(e.target.value)}
                        placeholder="e.g. Weekly Departures (Every Friday & 15th)"
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Tour Leader / Coordinator Details
                      </label>
                      <input
                        type="text"
                        value={tourLeader}
                        onChange={(e) => setTourLeader(e.target.value)}
                        placeholder="e.g. Dedicated Devotee Guide & Tour Coordinator Included"
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Per Person Group Savings (₹)
                      </label>
                      <input
                        type="number"
                        value={perPersonSavings}
                        onChange={(e) => setPerPersonSavings(Number(e.target.value))}
                        placeholder="3500"
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden transition"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Boarding Points (Comma-Separated)
                      </label>
                      <input
                        type="text"
                        value={boardingPointsStr}
                        onChange={(e) => setBoardingPointsStr(e.target.value)}
                        placeholder="e.g. Delhi (Kashmere Gate), Chandigarh (Sector 43), Jammu Tawi Railway Station"
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden transition"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Separate each pickup point with a comma.</p>
                    </div>
                  </div>

                  {/* Seat Occupancy Meter Controls */}
                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                    <h4 className="text-xs font-black uppercase text-stone-700 tracking-wider mb-3">
                      Current Batch Seat Inventory
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Total Seats in Coach
                        </label>
                        <input
                          type="number"
                          min="4"
                          max="60"
                          value={totalSeats}
                          onChange={(e) => setTotalSeats(Number(e.target.value))}
                          className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3.5 py-2"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Booked Seats
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={totalSeats}
                          value={bookedSeats}
                          onChange={(e) => setBookedSeats(Number(e.target.value))}
                          className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3.5 py-2"
                        />
                      </div>
                    </div>

                    {/* Progress preview */}
                    <div className="mt-4 pt-3 border-t border-stone-200">
                      <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                        <span className="text-stone-700">
                          {bookedSeats} / {totalSeats} Seats Booked ({Math.round(((bookedSeats || 0) / (totalSeats || 24)) * 100)}% Full)
                        </span>
                        <span className="text-[#9b0000]">
                          {Math.max(0, (totalSeats || 24) - (bookedSeats || 0))} Seats Available
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#9b0000] h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.round(((bookedSeats || 0) / (totalSeats || 24)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Batches Table & Add Batch */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                        Scheduled Departure Batches ({batches.length})
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {batches.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-[#9b0000]" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{b.startDate}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FCE8E8] text-[#7D0000]">
                                  {b.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                {b.batchName || 'Sangha Batch'} • {b.bookedSeats} / {b.totalSeats} seats booked
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setBatches(batches.filter((item) => item.id !== b.id))}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                            title="Remove batch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Inline Add Batch */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Date (e.g. 15 Nov 2025)
                        </label>
                        <input
                          type="text"
                          value={newBatchDateInput}
                          onChange={(e) => setNewBatchDateInput(e.target.value)}
                          placeholder="15 Nov 2025"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Batch Name
                        </label>
                        <input
                          type="text"
                          value={newBatchNameInput}
                          onChange={(e) => setNewBatchNameInput(e.target.value)}
                          placeholder="e.g. Kartik Purnima Batch"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Status Tag
                        </label>
                        <select
                          value={newBatchStatusInput}
                          onChange={(e) => setNewBatchStatusInput(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        >
                          <option value="Guaranteed Departure">Guaranteed Departure</option>
                          <option value="Filling Fast">Filling Fast</option>
                          <option value="Available">Available</option>
                          <option value="Sold Out">Sold Out</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        disabled={!newBatchDateInput.trim()}
                        onClick={() => {
                          if (!newBatchDateInput.trim()) return;
                          setBatches([
                            ...batches,
                            {
                              id: `batch-${Date.now()}`,
                              batchName: newBatchNameInput.trim() || `Batch ${newBatchDateInput}`,
                              startDate: newBatchDateInput.trim(),
                              totalSeats: totalSeats || 24,
                              bookedSeats: 0,
                              status: newBatchStatusInput,
                            },
                          ]);
                          setNewBatchDateInput('');
                          setNewBatchNameInput('');
                        }}
                        className="py-1.5 px-3 bg-[#9b0000] hover:bg-[#7D0000] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Batch</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
