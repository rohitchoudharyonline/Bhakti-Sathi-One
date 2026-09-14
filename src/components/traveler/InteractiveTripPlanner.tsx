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

  const [destination, setDestination] = useState('Mata Vaishno Devi & Kashmir Shivkhori Cave (Heli Option)');
  const [durationDays, setDurationDays] = useState(6);
  const [hotelTier, setHotelTier] = useState('3-Star Deluxe & Verified Stays');
  const [vehicleType, setVehicleType] = useState('Private Mountain Innova Crysta');
  const [mealPlan, setMealPlan] = useState('MAP Plan (Daily Breakfast & Dinner)');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [travelMonth, setTravelMonth] = useState('Next 30 Days (Upcoming)');
  const [specialInterests, setSpecialInterests] = useState<string[]>([
    'Guided Darshan Assistance',
    'Senior Citizen Palki / Doli Support',
    'Custom Meal Preferences On Request',
  ]);
  const [travelerName, setTravelerName] = useState('');
  const [travelerPhone, setTravelerPhone] = useState('');
  const [travelerEmail, setTravelerEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const PILGRIMAGE_DESTINATIONS = [
    { label: 'Mata Vaishno Devi & Kashmir Shivkhori Cave (Heli Option)' },
    { label: 'Himachal 5 Devi Darshan (Jwala Ji, Kangra, Chintpurni)' },
    { label: 'Kashmir Valley & Gulmarg Family Holiday' },
    { label: 'Himachal Complete Tour (Shimla, Manali & Dharamshala)' },
    { label: 'Amritsar Golden Temple & Wagah Border' },
  ];

  const HOTEL_TIERS = [
    {
      id: '3-Star Clean Standard Stays',
      title: '3-Star Clean Standard Stays',
      desc: 'Comfortable hygienic rooms, 24/7 hot water, hotel dining',
      badge: 'Economical',
    },
    {
      id: '4-Star Luxury & Premium Bhawan Hotels',
      title: '4-Star Luxury & Premium Bhawan Hotels',
      desc: 'Premium hotel rooms, river/mountain views, priority shrine transit',
      badge: 'Most Revered',
    },
    {
      id: '5-Star Deluxe Pilgrim Resorts & Heli Camps',
      title: '5-Star Deluxe Pilgrim Resorts & Heli Camps',
      desc: 'Premium suites, luxury alpine tents, local guide assistance',
      badge: 'Signature',
    },
  ];

  const VEHICLE_OPTIONS = [
    { id: 'Private Mountain Innova Crysta', label: 'Private Mountain Innova Crysta', desc: 'Hill certified chauffeur, 2-5 pilgrims' },
    { id: 'Luxury Force Urbania / Tempo Traveller', label: 'Luxury Force Urbania / Tempo Traveller', desc: '9-16 Seater for joint family & groups' },
    { id: 'Helicopter Charter + Dedicated Ground Transit', label: 'Helicopter Charter + Dedicated Ground Transit', desc: 'Dehradun to Kedarnath & Badrinath' },
  ];

  const INTEREST_OPTIONS = [
    'Guided Darshan Assistance',
    'Senior Citizen Palki / Doli Support',
    'Custom Meal Preferences On Request',
    'Medical Oxygen Cylinder Mountain Kit',
    'Special Vedic Rudrabhishek Puja Seva',
    'Evening Ganga Aarti Private Boat Seva',
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
      packageId: 'custom-yatra-planner-lead',
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
        travelerEmail: travelerEmail || 'guest@mybhaktisathi.com',
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
    const text = `Namaste ${agencySettings.agencyName}! I configured a custom sacred pilgrimage itinerary on your website:

🕉️ Sacred Tour: ${destination}
⏱️ Duration: ${durationDays} Days / ${durationDays - 1} Nights
🏨 Accommodation: ${hotelTier}
🚗 Vehicle: ${vehicleType}
🍽️ Diet: ${mealPlan}
👥 Pilgrims: ${adults} Adults, ${children} Children
📅 Yatra Month: ${travelMonth}
✨ Sacred Add-ons: ${specialInterests.join(', ')}

👤 Pilgrim Name: ${travelerName || 'Devotee'}
📞 Phone: ${travelerPhone || 'N/A'}
📧 Email: ${travelerEmail || 'N/A'}

Please provide the detailed custom Yatra itinerary and package quotation.`;

    return `https://wa.me/${agencySettings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="custom-planner-section" className="py-16 bg-stone-100/70 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-stone-300 text-stone-900 text-[11px] font-black uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Custom Yatra Wizard</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight mb-3 font-serif">
            Design Your Personalized Sacred Pilgrimage
          </h2>

          <p className="text-xs sm:text-base text-stone-600 font-medium">
            Tailor every spiritual detail—sacred shrines, convenient Darshan time slots, sanitized mountain vehicles, senior citizen assistance, and comfortable stay options.
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
                  Sacred Yatra Inquiry Received!
                </h3>
                <p className="text-sm text-stone-600 max-w-md mx-auto mb-6 font-medium">
                  Jai Shri Ram! Thank you, <strong className="text-stone-900">{travelerName}</strong>. Our senior pilgrimage coordinator in Haridwar has received your custom <strong>{durationDays}D {destination}</strong> itinerary configuration.
                </p>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 max-w-md mx-auto mb-6 text-xs text-emerald-950 text-left space-y-1.5 font-medium">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <Check className="w-4 h-4 text-emerald-600" /> Assigned to Head Yatra Desk
                  </div>
                  <div>• Estimated itinerary & quotation: <strong>Under 30 minutes</strong></div>
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
                    Configure Another Yatra
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
                    Select Sacred Pilgrimage Destination
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PILGRIMAGE_DESTINATIONS.map((dest) => (
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
                      Yatra Duration
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
                    <span>3 Days (Short Yatra)</span>
                    <span>7-9 Days (Extended Tour)</span>
                    <span>14 Days (Complete Tour)</span>
                  </div>
                </div>

                {/* Step 3: Hotel Tier */}
                <div>
                  <label className="text-xs font-black uppercase text-stone-700 block mb-2.5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                    Accommodation Standard
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {HOTEL_TIERS.map((tier) => (
                      <button
                        type="button"
                        key={tier.id}
                        onClick={() => setHotelTier(tier.id)}
                        className={`p-4 rounded-2xl text-left transition flex flex-col justify-between border cursor-pointer ${
                          hotelTier === tier.id
                            ? 'bg-stone-100 border-stone-900 text-stone-900 shadow-2xs ring-1 ring-stone-900/20'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white text-stone-900 border border-stone-300 inline-block mb-1.5">
                            {tier.badge}
                          </span>
                          <h4 className="text-xs font-black text-stone-900 mb-1">{tier.title}</h4>
                          <p className="text-[11px] text-stone-600 leading-tight">{tier.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 4: Vehicle & Meal Plan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase text-stone-700 block mb-1.5 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-bold">4</span>
                      Private Chauffeur & Vehicle
                    </label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full text-xs font-bold bg-white border border-stone-300 rounded-xl px-3 py-2.5 focus:border-stone-900 focus:outline-hidden"
                    >
                      {VEHICLE_OPTIONS.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label} ({v.desc})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-stone-700 block mb-1.5 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-bold">5</span>
                      Meal Plan Selection
                    </label>
                    <select
                      value={mealPlan}
                      onChange={(e) => setMealPlan(e.target.value)}
                      className="w-full text-xs font-bold bg-white border border-stone-300 rounded-xl px-3 py-2.5 focus:border-stone-900 focus:outline-hidden"
                    >
                      <option value="MAP Plan (Daily Breakfast & Dinner)">MAP Plan (Daily Breakfast & Dinner)</option>
                      <option value="CP Plan (Daily Breakfast Only)">CP Plan (Daily Breakfast Only)</option>
                      <option value="Full AP Plan (Breakfast, Lunch & Dinner)">Full AP Plan (All 3 Meals Included)</option>
                      <option value="Custom Meal Plan on Request">Custom Meal Plan on Request</option>
                    </select>
                  </div>
                </div>

                {/* Step 5: Special Devotional Add-ons */}
                <div>
                  <label className="text-xs font-black uppercase text-stone-700 block mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-bold">6</span>
                    Sacred Add-ons & Senior Assistance
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
                    Pilgrim Contact Details for Custom Itinerary
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
                        placeholder="e.g. Rameshwar Sharma"
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
                      placeholder="e.g. sharma@example.com"
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
                    <span>Submit & Request Custom Yatra Quotation</span>
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
                  Live Yatra Summary
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
                <div className="text-[10px] text-stone-500 font-extrabold uppercase">Holy Tour</div>
                <div className="font-black text-stone-900 mt-0.5">{destination}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="text-[10px] text-stone-500 font-extrabold uppercase">Duration</div>
                  <div className="font-black text-stone-900 mt-0.5">{durationDays}D / {durationDays - 1}N</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="text-[10px] text-stone-500 font-extrabold uppercase">Pilgrims</div>
                  <div className="font-black text-stone-900 mt-0.5">{adults} Adults</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="text-[10px] text-stone-500 font-extrabold uppercase">Stay Category</div>
                <div className="font-bold text-stone-900 mt-0.5">{hotelTier}</div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="text-[10px] text-stone-500 font-extrabold uppercase">Vehicle & Dietary Meal</div>
                <div className="font-bold text-stone-900 mt-0.5">{vehicleType}</div>
                <div className="text-[11px] text-emerald-800 font-bold mt-1">✓ {mealPlan}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-100 border border-stone-300 text-center mb-5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-900 mb-0.5">
                Sacred Yatra Quote
              </div>
              <div className="text-xl font-black text-stone-900">
                Price on Request
              </div>
              <p className="text-[11px] text-stone-600 mt-1 leading-snug font-medium">
                Transparent direct ground rate with guided Darshan coordination & hotel stays.
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
                <span>Govt. Registered Shrine Operator</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-stone-900 shrink-0" />
                <span>Senior citizen & high-altitude medical care</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Dedicated Vedic Yatra Pandits & 24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
