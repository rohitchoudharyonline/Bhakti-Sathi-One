import React, { useMemo, useState } from 'react';
import { useTours } from '../../context/TourContext';
import { PremiumPackageDetail } from './PremiumPackageDetail';
import { BrandLogo } from '../common/BrandLogo';
import { ArrowRight, CalendarDays, Heart, MapPin, Menu, Search, Star, X, MessageCircle, Phone } from 'lucide-react';
import { isValidEmail } from '../../utils/validation';
import { EmailVerificationInput } from '../common/EmailVerificationInput';

const destinations = [
  { name: 'Kashmir', sub: 'Srinagar · Gulmarg · Pahalgam', image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Himachal Pradesh', sub: 'Manali · Shimla · Dharamshala', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mata Vaishno Devi', sub: 'Katra · Bhawan · Shivkhori', image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Kerala Backwaters', sub: 'Munnar · Alleppey · Thekkady', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80' },
];
const filters = ['All', 'Kashmir', 'Himachal', 'Vaishno Devi', 'Kerala', 'Rajasthan', 'Goa'];

export const PremiumTravelMarketplace: React.FC = () => {
  const { packages, selectedPackageId, setSelectedPackageId, setActiveView, toggleWishlist, isWishlisted, submitInquiry, agencySettings, travelerUser } = useTours();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [menu, setMenu] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const [name, setName] = useState(travelerUser?.name || '');
  const [email, setEmail] = useState(travelerUser?.email || '');
  const [phone, setPhone] = useState('');

  const selected = selectedPackageId ? packages.find(p => p.id === selectedPackageId || p.slug === selectedPackageId || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === selectedPackageId.toLowerCase()) : undefined;
  if (selected) return <PremiumPackageDetail pkg={selected} onBack={() => setSelectedPackageId(null)} />;

  const published = packages.filter(p => p.status === 'published');
  const filtered = published.filter(p => {
    const q = query.toLowerCase();
    const matchesQuery = !q || `${p.title} ${p.destination} ${p.tagline}`.toLowerCase().includes(q);
    const f = filter.toLowerCase();
    const matchesFilter = filter === 'All' || `${p.title} ${p.destination} ${p.category}`.toLowerCase().includes(f);
    return matchesQuery && matchesFilter;
  });

  const isFormValid = Boolean(name.trim() && phone.trim() && isValidEmail(email));

  const sendQuickInquiry = () => {
    if (!name.trim() || !phone.trim() || !isValidEmail(email)) return;
    submitInquiry({
      packageId: filtered[0]?.id || '',
      packageTitle: filtered[0]?.title || 'Custom holiday',
      travelerName: name,
      email: email.trim().toLowerCase(),
      phone,
      travelDate: '',
      adults: 2,
      children: 0,
      specialRequests: 'Travel marketplace consultation request',
      estimatedTotal: 0
    });
    setShowInquiry(false);
    setName('');
    setPhone('');
  };

  return (
    <div className="min-h-screen bg-white text-[#1D1C1C]">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <BrandLogo size="md" />
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-stone-700">
            <a href="#destinations" className="hover:text-stone-900 transition">Destinations</a>
            <a href="#packages" className="hover:text-stone-900 transition">All Packages</a>
            <a href={`tel:${agencySettings.phone}`} className="hover:text-stone-900 transition flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-stone-900" />
              <span>{agencySettings.phone}</span>
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveView('cms')} className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold hover:bg-stone-50 transition">
              ERP / CMS
            </button>
            <button onClick={() => setShowInquiry(true)} className="px-3.5 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition">
              Enquire
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-stone-900 font-extrabold block">CURATED PACKAGES</span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1D1C1C] mt-1">Tour Packages & Itineraries</h1>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  filter === f ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => (
            <article key={p.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col">
              <div className="h-52 relative overflow-hidden bg-stone-100">
                <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-stone-900 text-white text-[10px] font-extrabold uppercase">
                  {p.badge || 'Verified'}
                </div>
                <button
                  onClick={() => toggleWishlist(p.id)}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 shadow grid place-items-center cursor-pointer hover:bg-white"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted(p.id) ? 'fill-stone-900 text-stone-900' : 'text-stone-600'}`} />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-stone-500 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-900" />
                    <span>{p.destination}</span>
                  </div>
                  <h3 onClick={() => setSelectedPackageId(p.id)} className="font-bold text-base text-[#1D1C1C] hover:text-stone-600 cursor-pointer">
                    {p.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">{p.tagline}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold block">
                      {p.priceOnRequest || (!p.price && !p.discountedPrice) || ((p.price || 0) <= 0 && (!p.discountedPrice || p.discountedPrice <= 0)) ? 'Quotation' : 'Starting'}
                    </span>
                    {p.priceOnRequest || (!p.price && !p.discountedPrice) || ((p.price || 0) <= 0 && (!p.discountedPrice || p.discountedPrice <= 0)) ? (
                      <b className="text-sm font-black text-stone-900">Price on Request</b>
                    ) : (
                      <b className="text-lg text-stone-900">{p.currency || '₹'}{(p.discountedPrice ?? p.price).toLocaleString('en-IN')}</b>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedPackageId(p.id)}
                    className="px-3 py-2 rounded-xl bg-[#1D1C1C] text-white text-xs font-bold hover:bg-black transition cursor-pointer"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {showInquiry && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs grid place-items-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 relative">
            <button onClick={() => setShowInquiry(false)} className="absolute top-4 right-4 p-2 rounded-full bg-stone-100">
              <X className="w-4 h-4" />
            </button>
            <BrandLogo size="xs" className="mb-2" />
            <h3 className="text-xl font-black text-[#1D1C1C] mt-1">Get Custom Holiday Quote</h3>
            <div className="grid gap-3 mt-4">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name *" className="border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-stone-900" />
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="WhatsApp / Phone Number *" className="border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-stone-900" />
              <EmailVerificationInput
                id="marketplace-lead-email"
                value={email}
                onChange={val => setEmail(val)}
                label="Email Address (Verification Step)"
                placeholder="e.g. yourname@gmail.com"
                required
                helperText="Required to verify inquiry and sync bookings to your profile."
              />
              <button
                disabled={!isFormValid}
                onClick={sendQuickInquiry}
                className="py-2.5 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-xs font-bold cursor-pointer transition"
              >
                Submit Request →
              </button>
              {!isValidEmail(email) && (
                <p className="text-[10px] text-center text-stone-500 font-semibold">
                  * Enter a valid email address to enable submission.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
