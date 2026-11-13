import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { isValidEmail } from '../../utils/validation';
import { EmailVerificationInput } from '../common/EmailVerificationInput';
import {
  Car,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Check,
  Clock,
  Phone,
  MessageCircle,
  Sparkles,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface CabOption {
  id: string;
  name: string;
  models: string;
  category: string;
  capacity: string;
  luggage: string;
  ratePerKm: number;
  minKmPerDay: number;
  image: string;
  badge?: string;
  features: string[];
}

const CAB_FLEET: CabOption[] = [
  {
    id: 'cab-sedan',
    name: 'AC Sedan',
    models: 'Swift Dzire, Toyota Etios, Honda Amaze',
    category: 'Budget Friendly',
    capacity: '4 Passengers',
    luggage: '2 Medium Bags',
    ratePerKm: 11,
    minKmPerDay: 250,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    badge: 'Most Popular',
    features: ['100% Sanitized', 'Chauffeur Driven', 'AC with Heater', 'Music System'],
  },
  {
    id: 'cab-suv-compact',
    name: 'Compact SUV',
    models: 'Maruti Ertiga, Kia Carens, Triber',
    category: 'Family Travel',
    capacity: '6 Passengers',
    luggage: '3 Bags',
    ratePerKm: 14,
    minKmPerDay: 250,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    badge: 'Best for Families',
    features: ['Extra Legroom', 'Spacious Boot Space', 'Expert Mountain Driver', 'USB Charging'],
  },
  {
    id: 'cab-innova-crysta',
    name: 'Toyota Innova Crysta',
    models: 'Innova Crysta 2.4 VX / ZX',
    category: 'Premium Luxury',
    capacity: '6-7 Passengers',
    luggage: '4 Large Bags',
    ratePerKm: 19,
    minKmPerDay: 250,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    badge: 'Luxury Mountain King',
    features: ['Captain Seats', 'Superior Mountain Suspension', 'Rear AC Vents', 'Top Safety Rating'],
  },
  {
    id: 'cab-tempo-traveller',
    name: 'Luxury Tempo Traveller',
    models: 'Force Urbania / 12 & 17 Seater Maharaja',
    category: 'Group Travel',
    capacity: '12 - 17 Passengers',
    luggage: '10+ Bags',
    ratePerKm: 26,
    minKmPerDay: 300,
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80',
    badge: 'Large Groups',
    features: ['Pushback Luxury Seats', 'Individual AC Vents', 'LED Screen', 'Large Luggage Carrier'],
  },
];

const POPULAR_ROUTES = [
  { from: 'Delhi / NCR', to: 'Haridwar / Rishikesh', distance: '230 KM', sedanFare: 3499, suvFare: 4999 },
  { from: 'Delhi / NCR', to: 'Shimla / Manali', distance: '550 KM', sedanFare: 7499, suvFare: 10999 },
  { from: 'Srinagar', to: 'Gulmarg / Pahalgam / Sonmarg', distance: 'Full Route', sedanFare: 2800, suvFare: 3800 },
  { from: 'Cochin Airport', to: 'Munnar / Thekkady / Alleppey', distance: 'Full Route', sedanFare: 3200, suvFare: 4500 },
  { from: 'Jaipur', to: 'Jodhpur / Udaipur / Jaisalmer', distance: 'Full Route', sedanFare: 3800, suvFare: 5200 },
  { from: 'Jammu Tawi / Katra', to: 'Vaishno Devi & Shivkhori (3 Days)', distance: 'Full Route', sedanFare: 4800, suvFare: 6800 },
  { from: 'Chandigarh / Delhi', to: 'Himachal 5 Devi Darshan (7 Days)', distance: 'Full Route', sedanFare: 18500, suvFare: 26000 },
];

export const CabsBookingSection: React.FC = () => {
  const { agencySettings, submitInquiry, travelerUser } = useTours();

  const [tripType, setTripType] = useState<'outstation' | 'local' | 'airport'>('outstation');
  const [pickupCity, setPickupCity] = useState('');
  const [dropCity, setDropCity] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [selectedCab, setSelectedCab] = useState('cab-sedan');
  const [customerName, setCustomerName] = useState(travelerUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(travelerUser?.email || '');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const activeCabData = CAB_FLEET.find((c) => c.id === selectedCab) || CAB_FLEET[0];

  const isFormValid = Boolean(
    pickupCity.trim() &&
    customerPhone.trim() &&
    isValidEmail(customerEmail)
  );

  const handleCabBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupCity.trim() || !customerPhone.trim() || !isValidEmail(customerEmail)) return;

    submitInquiry({
      packageId: 'cab-booking',
      travelerName: customerName || 'Cab Passenger',
      phone: customerPhone,
      email: customerEmail.trim().toLowerCase(),
      packageTitle: `Cab Booking: ${activeCabData.name} (${pickupCity} to ${dropCity || 'Local Sightseeing'})`,
      travelDate: travelDate || 'Immediate / Flexible',
      adults: 2,
      children: 0,
      specialRequests: `Cab Type: ${activeCabData.name} (${activeCabData.models}). Trip Type: ${tripType}. Route: ${pickupCity} -> ${dropCity}. Return Date: ${returnDate || 'One Way'}.`,
      estimatedTotal: activeCabData.ratePerKm * activeCabData.minKmPerDay,
    });

    setBookingSuccess(true);
  };

  const openWhatsAppCabQuote = (cabName: string) => {
    const text = `Namaste ${agencySettings.agencyName}! I need a quotation for *${cabName}* cab rental from *${pickupCity || 'Delhi / My City'}* to *${dropCity || 'Outstation'}*. Please share available rates and driver details.`;
    window.open(
      `https://wa.me/${agencySettings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Cab Booking Search Box */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-stone-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9b0000]/10 text-[#9b0000] text-xs font-black mb-1">
              <Car className="w-3.5 h-3.5" />
              <span>Chauffeur-Driven Sanitized Cabs</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-[#1D1C1C]">
              Book Private Outstation & Local Cabs
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
              Verified mountain drivers • Clean AC cars • Transparent per km billing • Zero surge pricing
            </p>
          </div>

          {/* Trip Type Selector Pills */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl self-start md:self-auto">
            <button
              type="button"
              onClick={() => setTripType('outstation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                tripType === 'outstation'
                  ? 'bg-[#9b0000] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Outstation Trip
            </button>
            <button
              type="button"
              onClick={() => setTripType('local')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                tripType === 'local'
                  ? 'bg-[#9b0000] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Local Sightseeing
            </button>
            <button
              type="button"
              onClick={() => setTripType('airport')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                tripType === 'airport'
                  ? 'bg-[#9b0000] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Airport Transfer
            </button>
          </div>
        </div>

        {/* Booking Form Fields */}
        {bookingSuccess ? (
          <div className="py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center mx-auto mb-3 font-bold text-xl">
              ✓
            </div>
            <h3 className="text-xl font-black text-[#1D1C1C]">Cab Booking Request Received!</h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
              Our cab dispatch desk will contact you on <b>{customerPhone}</b> with vehicle confirmation, driver details, and fixed fare voucher.
            </p>
            <button
              onClick={() => setBookingSuccess(false)}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#9b0000] text-white text-xs font-bold cursor-pointer"
            >
              Book Another Cab
            </button>
          </div>
        ) : (
          <form onSubmit={handleCabBooking} className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Pickup City */}
              <div>
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-stone-400 block mb-1">
                  Pickup City / Airport *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#9b0000] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={pickupCity}
                    onChange={(e) => setPickupCity(e.target.value)}
                    placeholder="e.g. Delhi, Srinagar, Haridwar, Cochin..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold outline-none focus:border-[#9b0000]"
                  />
                </div>
              </div>

              {/* Destination City */}
              <div>
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-stone-400 block mb-1">
                  Destination / Drop Location *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={dropCity}
                    onChange={(e) => setDropCity(e.target.value)}
                    placeholder="e.g. Manali, Gulmarg, Rishikesh, Munnar..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold outline-none focus:border-[#9b0000]"
                  />
                </div>
              </div>

              {/* Travel Date */}
              <div>
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-stone-400 block mb-1">
                  Pickup Date & Time *
                </label>
                <input
                  type="date"
                  required
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold outline-none focus:border-[#9b0000]"
                />
              </div>

              {/* WhatsApp / Phone */}
              <div>
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-stone-400 block mb-1">
                  Your WhatsApp / Mobile *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold outline-none focus:border-[#9b0000]"
                />
              </div>
            </div>

            {/* Traveler Contact Row for Profile Sync */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-stone-400 block mb-1">
                  Lead Passenger Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold outline-none focus:border-[#9b0000]"
                />
              </div>

              <EmailVerificationInput
                id="cabs-booking-email"
                value={customerEmail}
                onChange={(val) => setCustomerEmail(val)}
                label="Email Address (Verification Step)"
                placeholder="e.g. yourname@gmail.com"
                required
                helperText="Required to confirm cab reservation and sync bookings to your profile."
                inputClassName="px-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm"
              />
            </div>

            {/* Car Model Selector Cards */}
            <div className="mt-6">
              <div className="text-xs font-black uppercase tracking-wider text-stone-400 mb-3">
                Select Vehicle Category:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {CAB_FLEET.map((cab) => {
                  const isSelected = selectedCab === cab.id;
                  return (
                    <div
                      key={cab.id}
                      onClick={() => setSelectedCab(cab.id)}
                      className={`relative rounded-2xl p-4 border-2 transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#9b0000] bg-[#fff5f2] shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      {cab.badge && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-md bg-stone-900 text-white text-[9px] font-extrabold uppercase">
                          {cab.badge}
                        </span>
                      )}

                      <div>
                        <div className="aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-stone-100">
                          <img
                            src={cab.image}
                            alt={cab.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <b className="text-sm font-bold text-[#1D1C1C] block">{cab.name}</b>
                        <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{cab.models}</p>

                        <div className="flex items-center gap-2 text-[11px] font-semibold text-stone-600 mt-2">
                          <span>👤 {cab.capacity}</span>
                          <span>•</span>
                          <span>🧳 {cab.luggage}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-stone-200/80 flex items-end justify-between">
                        <div>
                          <span className="text-[10px] text-stone-400 font-bold block uppercase">
                            Starting Rate
                          </span>
                          <div className="flex items-baseline gap-0.5">
                            <b className="text-base font-black text-[#9b0000]">
                              {agencySettings.currencySymbol}{cab.ratePerKm}
                            </b>
                            <span className="text-[10px] text-stone-500">/ km</span>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-lg ${
                            isSelected ? 'bg-[#9b0000] text-white' : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {isSelected ? '✓ Selected' : 'Choose'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-stone-500 font-medium">
                <span className="font-bold text-[#1D1C1C]">Included:</span> Dedicated AC Car, Driver Allowance, Toll/Tax Estimates, 24x7 Helpline.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => openWhatsAppCabQuote(activeCabData.name)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Instant WhatsApp Quote</span>
                </button>

                <div className="flex flex-col items-stretch sm:items-end w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#9b0000] hover:bg-[#7D0000] disabled:bg-stone-300 disabled:cursor-not-allowed disabled:hover:bg-stone-300 text-white text-xs font-black transition shadow-sm cursor-pointer"
                  >
                    Confirm & Reserve Cab →
                  </button>
                  {!isValidEmail(customerEmail) && (
                    <span className="text-[10px] text-stone-500 font-semibold mt-1 text-center sm:text-right">
                      * Enter valid email to enable reservation
                    </span>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Popular Fixed Fare Outstation Routes */}
      <div className="mt-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#9b0000] font-black block">
              FIXED FARE GUARANTEE
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-[#1D1C1C]">
              Popular Outstation Taxi Routes
            </h3>
          </div>
          <span className="text-xs text-stone-500 font-bold hidden sm:block">
            All routes include professional mountain chauffeurs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {POPULAR_ROUTES.map((route, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs hover:border-stone-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#9b0000]" />
                  <span>{route.from}</span>
                  <ArrowRight className="w-3 h-3 text-stone-400" />
                  <span className="text-[#1D1C1C] font-bold">{route.to}</span>
                </div>
                <div className="text-[11px] text-stone-400 font-medium mt-0.5">
                  Approx Distance: {route.distance}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Sedan / SUV</div>
                  <b className="text-sm font-black text-[#1D1C1C]">
                    {agencySettings.currencySymbol}{route.sedanFare.toLocaleString('en-IN')} - {agencySettings.currencySymbol}{route.suvFare.toLocaleString('en-IN')}
                  </b>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPickupCity(route.from);
                    setDropCity(route.to);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#9b0000] hover:text-white text-stone-800 text-xs font-bold transition cursor-pointer"
                >
                  Book Route
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust guarantees bar for cabs */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200/80">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-[11px]">
            <b className="block text-[#1D1C1C]">100% Commercial Fleet</b>
            <span className="text-stone-500">Yellow plate tourist taxis</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-[#9b0000] shrink-0" />
          <div className="text-[11px]">
            <b className="block text-[#1D1C1C]">Zero Cancellation Fee</b>
            <span className="text-stone-500">Up to 6 hours before trip</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="text-[11px]">
            <b className="block text-[#1D1C1C]">Verified Mountain Drivers</b>
            <span className="text-stone-500">Police verified & licensed</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-[#9b0000] shrink-0" />
          <div className="text-[11px]">
            <b className="block text-[#1D1C1C]">24x7 Cab Support Desk</b>
            <span className="text-stone-500">Live trip tracking assistance</span>
          </div>
        </div>
      </div>
    </div>
  );
};
