import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { isValidEmail } from '../../utils/validation';
import { EmailVerificationInput } from '../common/EmailVerificationInput';
import { generateCustomItineraryPdf } from '../../utils/customItineraryPdf';
import {
  Sparkles,
  MapPin,
  Calendar,
  Building,
  Car,
  Utensils,
  Users,
  Send,
  MessageCircle,
  CheckCircle2,
  Phone,
  User,
  Check,
  ShieldCheck,
  Award,
  HeartHandshake,
  Download,
} from 'lucide-react';

export const InteractiveTripPlanner: React.FC = () => {
  const { agencySettings, submitInquiry } = useTours();

  const [destination, setDestination] = useState('Kashmir Valley, Gulmarg & Pahalgam');
  const [durationDays, setDurationDays] = useState(6);
  const [hotelTier, setHotelTier] = useState('3-Star Deluxe & Verified Stays');
  const [vehicleType, setVehicleType] = useState('Private Mountain Innova Crysta / Sedan');
  const [mealPlan, setMealPlan] = useState('MAP Plan (Daily Breakfast & Dinner)');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [travelMonth, setTravelMonth] = useState('Next 30 Days (Upcoming)');
  const [specialInterests, setSpecialInterests] = useState<string[]>([
    'Sightseeing & Private Chauffeur',
    'Family & Honeymoon Special Inclusions',
    'Custom Meal Preferences On Request',
  ]);
  const [travelerName, setTravelerName] = useState('');
  const [travelerPhone, setTravelerPhone] = useState('');
  const [travelerEmail, setTravelerEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const HOLIDAY_DESTINATIONS = [
    { label: 'Kashmir Valley, Gulmarg & Pahalgam' },
    { label: 'Himachal Complete Tour (Shimla, Manali & Dharamshala)' },
    { label: 'Ladakh High Altitude Circuit (Leh, Nubra, Pangong)' },
    { label: 'Amritsar Golden Temple & Wagah Border' },
    { label: 'Mata Vaishno Devi Ji & Katra Yatra' },
    { label: 'Thailand (Bangkok, Pattaya & Coral Island)' },
    { label: 'Vietnam (Hanoi, Ha Long Bay & Da Nang)' },
    { label: 'Bali Tropical Villa & Nusa Penida Island' },
  ];

  const HOTEL_TIERS = [
    {
      id: '3-Star Clean Standard Stays',
      title: '3-Star Clean Standard Stays',
      desc: 'Comfortable hygienic rooms, 24/7 hot water, hotel dining',
      badge: 'Economical',
    },
    {
      id: '4-Star Luxury & Premium Hotels',
      title: '4-Star Luxury & Premium Hotels',
      desc: 'Premium hotel rooms, scenic views, priority check-in',
      badge: 'Most Popular',
    },
    {
      id: '5-Star Deluxe Resorts & Private Villas',
      title: '5-Star Deluxe Resorts & Private Villas',
      desc: 'Premium suites, luxury hospitality, dedicated concierge',
      badge: 'Signature Luxury',
    },
  ];

  const VEHICLE_OPTIONS = [
    { id: 'Private Mountain Innova Crysta / Sedan', label: 'Private Innova Crysta / Sedan', desc: 'Courteous chauffeur, 2-5 travelers' },
    { id: 'Luxury Force Urbania / Tempo Traveller', label: 'Luxury Force Urbania / Tempo Traveller', desc: '9-16 Seater for joint family & groups' },
    { id: 'Private Luxury AC Coach / Van', label: 'Private Luxury AC Coach / Van', desc: 'Airport transfers & custom circuits' },
  ];

  const INTEREST_OPTIONS = [
    'Sightseeing & Private Chauffeur',
    'Family & Honeymoon Special Inclusions',
    'Custom Meal Preferences On Request',
    'Adventure Sports & Gondola Coordination',
    'Senior Citizen Palki / Assistance',
    'Airport VIP Chauffeur Pickup',
  ];

  const toggleInterest = (item: string) => {
    setSpecialInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const isFormValid = Boolean(
    travelerName.trim() &&
    travelerPhone.trim() &&
    isValidEmail(travelerEmail)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!travelerName.trim() || !travelerPhone.trim() || !isValidEmail(travelerEmail)) return;

    submitInquiry({
      packageId: 'custom-tour-planner-lead',
      packageTitle: `Custom ${durationDays}D/${durationDays - 1}N ${destination} (${hotelTier})`,
      travelerName: travelerName.trim(),
      email: travelerEmail.trim().toLowerCase(),
      phone: travelerPhone.trim(),
      travelDate: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
      adults,
      children,
      specialRequests: `Destination: ${destination} | Duration: ${durationDays} Days | Hotel: ${hotelTier} | Vehicle: ${vehicleType} | Meal: ${mealPlan} | Travel Month: ${travelMonth} | Add-ons: ${specialInterests.join(', ')}`,
      estimatedTotal: 0,
    });

    setSubmitted(true);
  };

  const handleExportPdf = async () => {
    try {
      await generateCustomItineraryPdf({
        itineraryTitle: `Custom ${durationDays}D Itinerary - ${destination}`,
        destination,
        durationDays,
        hotelTier,
        vehicleType,
        mealPlan,
        travelerName: travelerName || 'Valued Traveler',
        travelerEmail: travelerEmail || 'guest@holidayshunt.com',
        travelerPhone: travelerPhone || agencySettings.phone,
        travelMonth,
        specialInterests,
        agencySettings,
      });
    } catch (err) {
      console.error('Failed to export PDF', err);
    }
  };

  const getWhatsAppMessage = () => {
    const text = `Hello ${agencySettings.agencyName}! I configured a custom holiday itinerary on your website:

✈️ Destination: ${destination}
⏱️ Duration: ${durationDays} Days / ${durationDays - 1} Nights
🏨 Accommodation: ${hotelTier}
🚗 Vehicle: ${vehicleType}
🍽️ Meal Plan: ${mealPlan}
👥 Travelers: ${adults} Adults, ${children} Children
📅 Travel Month: ${travelMonth}
✨ Special Add-ons: ${specialInterests.join(', ')}

👤 Traveler Name: ${travelerName || 'Guest'}
📞 Phone: ${travelerPhone || 'N/A'}
📧 Email: ${travelerEmail || 'N/A'}

Please provide the detailed custom itinerary and package quotation.`;

    return `https://wa.me/${agencySettings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="custom-planner-section" className="py-16 bg-stone-100/70 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-stone-300 text-stone-900 text-[11px] font-black uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Custom Holiday Wizard</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight mb-3 font-serif">
            Design Your Personalized Holiday &amp; Tour
          </h2>

          <p className="text-xs sm:text-base text-stone-600 font-medium">
            Tailor every detail—destinations, duration, private chauffeur vehicles, family &amp; honeymoon inclusions, verified stays, and 24/7 on-ground assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Wizard Form */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
            {submitted ? (
              <div className="text-center py-10 px-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-300">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-stone-900 mb-2 font-serif">
                  Holiday Inquiry Received!
                </h3>
                <p className="text-sm text-stone-600 max-w-md mx-auto mb-6 font-medium">
                  Thank you, <strong className="text-stone-900">{travelerName}</strong>. Our holiday travel desk has received your custom <strong>{durationDays}D {destination}</strong> itinerary configuration.
                </p>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 max-w-md mx-auto mb-6 text-xs text-emerald-950 text-left space-y-1.5 font-medium">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <Check className="w-4 h-4 text-emerald-600" /> Assigned to Dedicated Travel Planner
                  </div>
                  <div>• Estimated customized itinerary & quote: <strong>Under 30 minutes</strong></div>
                  <div>• 24/7 Helpline: <strong>{agencySettings.phone}</strong></div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={getWhatsAppMessage()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Connect on WhatsApp Helpline</span>
                  </a>

                  <button
                    onClick={() => setSubmitted(false)}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition cursor-pointer border border-stone-200"
                  >
                    Configure Another Holiday
                  </button>

                  <button
                    onClick={handleExportPdf}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-stone-900 hover:bg-black text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Customized Itinerary PDF</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Destination */}
                <div>
                  <label className="text-xs font-black uppercase text-stone-700 block mb-2.5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    Select Holiday Destination / Circuit
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {HOLIDAY_DESTINATIONS.map((dest) => (
                      <button
                        type="button"
                        key={dest.label}
                        onClick={() => setDestination(dest.label)}
                        className={`p-3.5 rounded-2xl text-left text-xs font-bold transition flex items-center gap-2.5 border cursor-pointer ${
                          destination === dest.label
                            ? 'bg-stone-100 border-stone-900 text-stone-900 shadow-2xs ring-1 ring-stone-900/20'
                            : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
                        }`}
                      >
                        <span className="truncate">{dest.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Duration Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black uppercase text-stone-700 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                      Trip Duration
                    </label>
                    <span className="text-xs font-bold text-stone-900 bg-stone-100 px-3 py-1 rounded-full border border-stone-300">
                      {durationDays} Days / {durationDays - 1} Nights
                    </span>
                  </div>

                  <input
                    type="range"
                    min="3"
                    max="14"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full accent-stone-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-stone-500 mt-1">
                    <span>3 Days (Quick Getaway)</span>
                    <span>6-8 Days (Standard Holiday)</span>
                    <span>14 Days (Grand Vacation)</span>
                  </div>
                </div>

                {/* Step 3: Hotel Category */}
                <div>
                  <label className="text-xs font-black uppercase text-stone-700 block mb-2.5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                    Preferred Stay Category
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {HOTEL_TIERS.map((tier) => (
                      <button
                        type="button"
                        key={tier.id}
                        onClick={() => setHotelTier(tier.id)}
                        className={`p-3.5 rounded-2xl text-left transition border cursor-pointer flex flex-col justify-between ${
                          hotelTier === tier.id
                            ? 'bg-stone-100 border-stone-900 shadow-2xs ring-1 ring-stone-900/20'
                            : 'bg-white border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-black text-stone-900">{tier.title}</span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-800">
                              {tier.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 leading-snug">{tier.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 4: Vehicle & Logistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase text-stone-700 block mb-2 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-bold">4</span>
                      Private Vehicle Selection
                    </label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full text-xs font-bold bg-white border border-stone-300 rounded-xl p-3 focus:border-stone-900 focus:outline-hidden"
                    >
                      {VEHICLE_OPTIONS.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-stone-700 block mb-2 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-bold">5</span>
                      Meal Plan Preference
                    </label>
                    <select
                      value={mealPlan}
                      onChange={(e) => setMealPlan(e.target.value)}
                      className="w-full text-xs font-bold bg-white border border-stone-300 rounded-xl p-3 focus:border-stone-900 focus:outline-hidden"
                    >
                      <option value="MAP Plan (Daily Breakfast & Dinner)">MAP Plan (Daily Breakfast & Dinner)</option>
                      <option value="CP Plan (Daily Breakfast Only)">CP Plan (Daily Breakfast Only)</option>
                      <option value="AP Plan (All Meals - Breakfast, Lunch & Dinner)">AP Plan (All Meals - Breakfast, Lunch & Dinner)</option>
                      <option value="Custom Meal Plan on Request">Custom Meal Plan on Request</option>
                    </select>
                  </div>
                </div>

                {/* Step 5: Special Devotional & Tour Add-ons */}
                <div>
                  <label className="text-xs font-black uppercase text-stone-700 block mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-bold">6</span>
                    Special Inclusions &amp; Add-ons
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((interest) => {
                      const active = specialInterests.includes(interest);
                      return (
                        <button
                          type="button"
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={`text-xs px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                            active
                              ? 'bg-stone-100 text-stone-900 border-stone-900 shadow-2xs'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {active && <Check className="w-3.5 h-3.5 text-stone-900" />}
                          <span>{interest}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="pt-4 border-t border-stone-200">
                  <h4 className="text-xs font-black uppercase text-stone-700 mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-bold">7</span>
                    Traveler Contact Details for Custom Itinerary
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-600 block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={travelerName}
                        onChange={(e) => setTravelerName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full text-xs font-semibold bg-white border border-stone-300 rounded-xl px-3 py-2.5 focus:border-stone-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-600 block mb-1">
                        WhatsApp / Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={travelerPhone}
                        onChange={(e) => setTravelerPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs font-semibold bg-white border border-stone-300 rounded-xl px-3 py-2.5 focus:border-stone-900 focus:outline-hidden"
                      />
                    </div>

                    <EmailVerificationInput
                      id="yatra-planner-email"
                      value={travelerEmail}
                      onChange={(val) => setTravelerEmail(val)}
                      label="Email Address (Verification Step)"
                      placeholder="e.g. rahul@example.com"
                      required
                      helperText="Enter a correctly formatted email to receive quotation and sync to your profile."
                      inputClassName="bg-white border-stone-300 py-2.5"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className="w-full py-4 px-6 rounded-2xl bg-stone-900 hover:bg-black disabled:bg-stone-300 disabled:cursor-not-allowed disabled:hover:bg-stone-300 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-[0.98]"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit &amp; Request Custom Holiday Quotation</span>
                  </button>
                  {!isValidEmail(travelerEmail) && (
                    <p className="text-[10px] text-center text-stone-500 font-semibold">
                      * Please enter a valid email address above to enable the submission button.
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Live Summary Preview Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-stone-200 shadow-lg sticky top-24">
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-900">
                  Live Tour Summary
                </span>
                <h3 className="text-base font-black text-stone-900 font-serif">
                  Configured Itinerary
                </h3>
              </div>
              <span className="w-8 h-8 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center border border-stone-300">
                <MapPin className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-2.5 text-xs mb-5">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="text-[10px] text-stone-500 font-extrabold uppercase">Destination</div>
                <div className="font-black text-stone-900 mt-0.5">{destination}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="text-[10px] text-stone-500 font-extrabold uppercase">Duration</div>
                  <div className="font-black text-stone-900 mt-0.5">{durationDays}D / {durationDays - 1}N</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="text-[10px] text-stone-500 font-extrabold uppercase">Travelers</div>
                  <div className="font-black text-stone-900 mt-0.5">{adults} Adults</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="text-[10px] text-stone-500 font-extrabold uppercase">Stay Category</div>
                <div className="font-bold text-stone-900 mt-0.5">{hotelTier}</div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="text-[10px] text-stone-500 font-extrabold uppercase">Vehicle & Meal Plan</div>
                <div className="font-bold text-stone-900 mt-0.5">{vehicleType}</div>
                <div className="text-[11px] text-emerald-800 font-bold mt-1">✓ {mealPlan}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-100 border border-stone-300 text-center mb-5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-900 mb-0.5">
                Holiday Tour Quote
              </div>
              <div className="text-xl font-black text-stone-900">
                Price on Request
              </div>
              <p className="text-[11px] text-stone-600 mt-1 leading-snug font-medium">
                Transparent direct ground rate with verified hotel stays and private chauffeur.
              </p>
            </div>

            <div className="mb-5">
              <button
                type="button"
                onClick={handleExportPdf}
                className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Customized Itinerary PDF</span>
              </button>
            </div>

            <div className="space-y-2 text-[11px] text-stone-700 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Govt. Registered Tour Operator</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-stone-900 shrink-0" />
                <span>Verified Handpicked Hotels & Private Cabs</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Dedicated Tour Coordinators & 24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
