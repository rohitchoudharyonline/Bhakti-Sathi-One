import React, { useState } from 'react';
import { TourPackage } from '../../types/tour';
import { useTours } from '../../context/TourContext';
import { isValidEmail } from '../../utils/validation';
import { EmailVerificationInput } from '../common/EmailVerificationInput';
import {
  X,
  Send,
  MessageCircle,
  Calendar,
  Users,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';

interface InquiryModalProps {
  pkg: TourPackage;
  isOpen: boolean;
  onClose: () => void;
  initialAdults?: number;
  initialChildren?: number;
  initialDate?: string;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  pkg,
  isOpen,
  onClose,
  initialAdults = 2,
  initialChildren = 0,
  initialDate = '',
}) => {
  const { submitInquiry, agencySettings } = useTours();

  const [travelerName, setTravelerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [travelDate, setTravelDate] = useState(
    initialDate ||
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedInquiryId, setSubmittedInquiryId] = useState('');

  if (!isOpen) return null;

  const isFormValid = Boolean(
    travelerName.trim() &&
    phone.trim() &&
    isValidEmail(email)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!travelerName.trim() || !phone.trim() || !isValidEmail(email)) return;

    const newInq = {
      packageId: pkg.id,
      packageTitle: pkg.title,
      travelerName: travelerName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      travelDate,
      adults,
      children,
      specialRequests: specialRequests.trim(),
      estimatedTotal: 0,
    };

    const inqId = submitInquiry(newInq);
    setSubmittedInquiryId(inqId || Date.now().toString().slice(-6));
    setSubmitted(true);
  };

  const getWhatsAppMessage = () => {
    const text = `Hi ${agencySettings.agencyName}! 🙏
I would like to inquire about the pilgrimage package:
📌 *${pkg.title}* (${pkg.durationDays}D / ${pkg.durationNights}N)
📅 Travel Date: ${travelDate}
👥 Devotees/Travelers: ${adults} Adults, ${children} Children
👤 Name: ${travelerName}
📱 Phone: ${phone}
${specialRequests ? `📝 Special Requests: ${specialRequests}` : ''}

Please share the complete pilgrimage itinerary, darshan assistance details, and package rates!`;

    const cleanNum = (agencySettings?.whatsapp || '').replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNum}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative">
        {/* Modal Header */}
        <div className="bg-white p-5 text-slate-900 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand">
                Official Travel Inquiry
              </span>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Request Custom Quotation
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                Inquiry Received!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ref ID: <strong>#CV-{submittedInquiryId}</strong>
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Package:</span>
                <span className="font-bold text-slate-900">{pkg.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Travel Date:</span>
                <span className="font-semibold text-slate-800">{travelDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Travelers:</span>
                <span className="font-semibold text-slate-800">
                  {adults} Adults {children > 0 && `, ${children} Children`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pricing:</span>
                <span className="font-bold text-brand">Price on Request</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Our travel specialists at <strong>{agencySettings.agencyName}</strong> will review your details and send a personalized itinerary with transparent rates via WhatsApp & Email within 30 minutes.
            </p>

            <div className="pt-2 flex flex-col gap-2.5">
              <a
                href={getWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Instant Confirmation on WhatsApp</span>
              </a>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Close & Return to Tour
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Selected Package Banner */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center gap-3">
              <img
                src={pkg.coverImage}
                alt={pkg.title}
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {pkg.title}
                </h4>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>{pkg.durationDays}D / {pkg.durationNights}N</span>
                  <span>•</span>
                  <span className="text-brand font-bold">Price on Request</span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={travelerName}
                  onChange={(e) => setTravelerName(e.target.value)}
                  placeholder="e.g., Rajesh Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden font-medium"
                  />
                </div>

                <div>
                  <EmailVerificationInput
                    id="inquiry-modal-email"
                    value={email}
                    onChange={(val) => setEmail(val)}
                    label="Email Address (Verification Step) *"
                    placeholder="name@example.com"
                    required
                    helperText="Required to verify inquiry & sync bookings to your profile."
                    inputClassName="bg-slate-50 border-slate-200 py-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="font-bold text-slate-700 block mb-1">
                    Travel Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden font-medium text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Adults (12+)
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Adult' : 'Adults'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Children (≤11)
                  </label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden font-medium"
                  >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Child' : 'Children'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Custom Requirements / Special Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Guided darshan assistance, senior citizen support, sattvic meal preferences, railway/airport pick up..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:bg-white focus:border-brand focus:outline-hidden"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={!isFormValid}
                className="w-full py-3.5 px-4 rounded-xl bg-brand hover:bg-brand-dark disabled:bg-slate-300 disabled:cursor-not-allowed disabled:hover:bg-slate-300 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry for Custom Quote</span>
              </button>
              {!isValidEmail(email) && (
                <p className="text-[10px] text-center text-slate-500 font-semibold">
                  * Please enter a valid email address above to enable inquiry submission.
                </p>
              )}

              <p className="text-[10px] text-center text-slate-400">
                🔒 Privacy Protected • No spam • Direct contact with Choudhary Vacations consultants
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
