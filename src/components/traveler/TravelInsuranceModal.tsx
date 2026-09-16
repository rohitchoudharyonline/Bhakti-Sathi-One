import React from 'react';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  HeartPulse,
  Plane,
  Luggage,
  Clock,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface TravelInsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TravelInsuranceModal: React.FC<TravelInsuranceModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const COVERS = [
    {
      id: 'hosp',
      title: 'Hospitalization expenses for Injury',
      sum: 'INR 2,00,000',
      icon: HeartPulse,
      desc: 'Emergency in-patient medical treatments and accidental hospital care during trip',
      badge: 'Primary Cover',
    },
    {
      id: 'pa',
      title: 'Personal Accident Cover',
      sum: 'INR 5,00,000',
      icon: ShieldCheck,
      desc: 'Accidental death and permanent total disability cover during the tour period',
      badge: 'High Sum',
    },
    {
      id: 'evac',
      title: 'Medical Evacuation',
      sum: 'INR 50,000',
      icon: HeartPulse,
      desc: 'Emergency ambulance or transfer to nearest equipped medical facility',
    },
    {
      id: 'repat',
      title: 'Repatriation of Remains',
      sum: 'INR 50,000',
      icon: HeartPulse,
      desc: 'Transportation expenses for mortal remains back to home residence',
    },
    {
      id: 'cancel',
      title: 'Trip Cancellation',
      sum: 'INR 10,000',
      icon: Plane,
      desc: 'Reimbursement for unrecoverable trip costs for valid unforeseen emergencies',
    },
    {
      id: 'curtail',
      title: 'Trip Interruption & Curtailment',
      sum: 'INR 10,000',
      icon: Clock,
      desc: 'Coverage for unexpected mid-tour return due to covered emergencies',
    },
    {
      id: 'allowance',
      title: 'Daily Allowance (Hospitalization)',
      sum: 'INR 500 / day',
      subtext: 'Max 7 days (INR 3,500 total)',
      icon: HeartPulse,
      desc: 'Daily cash support during accidental in-hospital stay',
    },
    {
      id: 'bag_loss',
      title: 'Total Loss of Checked-in Baggage',
      sum: 'INR 5,000',
      icon: Luggage,
      desc: 'Compensation for verified total loss of checked luggage under airline custody',
    },
    {
      id: 'bag_delay',
      title: 'Delay of Checked-in Baggage',
      sum: 'INR 2,00,0',
      sumDisplay: 'INR 2,000',
      icon: Clock,
      desc: 'Emergency essentials allowance if baggage delayed over 6 hours',
    },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-stone-950 flex items-center justify-center shadow-lg shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400 text-stone-950 px-2 py-0.5 rounded-md">
                  100% Complimentary
                </span>
                <span className="text-xs text-amber-200 font-bold">Sum Insured: INR 200K</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
                Free Domestic Travel Insurance
              </h3>
            </div>
          </div>
          <p className="text-xs text-stone-300 mt-2 font-medium">
            Complimentary coverage included for all enrolled travelers during your tour duration.
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-stone-800 text-xs sm:text-sm divide-y divide-stone-100">
          {/* Table of Covers */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Schedule of Included Covers</span>
              </h4>
              <span className="text-[10px] font-bold text-stone-500">9 Benefits Included</span>
            </div>

            <div className="grid gap-2.5">
              {COVERS.map((cover) => {
                const Icon = cover.icon;
                return (
                  <div
                    key={cover.id}
                    className="p-3 sm:p-3.5 rounded-xl bg-stone-50/90 hover:bg-amber-50/40 border border-stone-200/90 hover:border-amber-300/80 transition flex flex-col gap-1.5"
                  >
                    {/* Header Row: Title & Sum Insured */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-900 flex items-center justify-center shrink-0 shadow-2xs">
                          <Icon className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-stone-950 text-xs sm:text-sm leading-tight">
                              {cover.title}
                            </span>
                            {cover.badge && (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded">
                                {cover.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Prominent Sum Insured Tag */}
                      <div className="text-right shrink-0">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-stone-900 text-amber-300 font-mono font-black text-xs sm:text-sm shadow-2xs whitespace-nowrap">
                          {cover.sumDisplay || cover.sum}
                        </span>
                        {cover.subtext && (
                          <span className="block text-[10px] text-stone-500 font-medium mt-0.5">
                            {cover.subtext}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Full Description without any truncation */}
                    <p className="text-xs text-stone-600 font-medium leading-normal pl-9">
                      {cover.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Straightforward Terms & Conditions / Liability Disclaimer */}
          <div className="pt-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-stone-900">
              <Lock className="w-4 h-4 text-stone-700" />
              <span>Straightforward Policy Terms & Liability Disclaimer</span>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 text-[11px] text-stone-700 space-y-2 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-stone-900 shrink-0 mt-0.5" />
                <p>
                  <strong>Complimentary Inclusions:</strong> Travel insurance is provided free of cost with tour packages as an added travel safety perk for all enrolled passengers.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-stone-900 shrink-0 mt-0.5" />
                <p>
                  <strong>Zero Agency Liability:</strong> Holidays Hunt operates purely as a tour operator and facilitator. Holidays Hunt is not an insurance provider and holds zero financial liability, obligation, or responsibility for any medical expenses, hospital dues, luggage losses, claim settlements, or disputes.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-stone-900 shrink-0 mt-0.5" />
                <p>
                  <strong>Claim Assessment:</strong> All claims, hospitalizations, pre-existing condition exclusions, and payouts are governed strictly by the issuing insurance partner's standard policy terms and guidelines.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-stone-900 shrink-0 mt-0.5" />
                <p>
                  <strong>Coverage Period:</strong> Protection is active strictly during the confirmed dates of your itinerary.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-stone-500 font-medium">
            Valid for Indian Nationals & Residents during package dates.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-stone-950 hover:bg-black text-amber-400 font-black text-xs transition shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>Understood & Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
