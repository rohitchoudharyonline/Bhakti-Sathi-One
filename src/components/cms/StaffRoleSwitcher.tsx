import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { StaffMember } from '../../types/tour';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';
import { ShieldCheck, ChevronDown, Check, KeyRound, Sparkles } from 'lucide-react';

/**
 * Role switching is a development preview only. Production CMS access is
 * controlled by the server-side Google allowlist/session gate.
 */
export const StaffRoleSwitcher: React.FC = () => {
  const { staff, currentStaffUser, setCurrentStaffUser, mediaAssets } = useTours();
  const [isOpen, setIsOpen] = useState(false);

  if (import.meta.env.PROD) return null;

  const getRoleBadgeColor = (role: StaffMember['role']) => {
    switch (role) {
      case 'super_admin': return 'bg-red-500/10 text-red-700 border-red-200';
      case 'admin': return 'bg-amber-500/10 text-amber-700 border-amber-200';
      case 'operations': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'sales': return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
      case 'finance': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      default: return 'bg-slate-500/10 text-slate-700 border-slate-200';
    }
  };

  const formatRoleName = (role: StaffMember['role']) => {
    switch (role) {
      case 'super_admin': return 'Super Admin (Preview)';
      case 'operations': return 'Operations (Preview)';
      case 'sales': return 'Sales (Preview)';
      case 'finance': return 'Finance (Preview)';
      case 'sub_admin': return 'Sub Admin (Preview)';
      default: return 'Staff Member (Preview)';
    }
  };

  return (
    <div className="relative inline-block text-left" id="staff-role-switcher-container">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-all text-xs font-medium text-slate-700" id="role-switcher-btn">
        <img
          src={resolveDisplayImage(currentStaffUser.avatar, mediaAssets) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
          alt="Development staff preview"
          onError={(e) => handleImageError(e, currentStaffUser.avatar, mediaAssets, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80')}
          className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
        />
        <div className="text-left hidden sm:block">
          <p className="font-semibold text-slate-800 leading-tight flex items-center gap-1">{currentStaffUser.name}<ShieldCheck className="w-3.5 h-3.5 text-red-600" /></p>
          <p className="text-[10px] text-slate-500">Development preview</p>
        </div>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getRoleBadgeColor(currentStaffUser.role)}`}>{currentStaffUser.role.replace('_', ' ').toUpperCase()}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-2xl z-50 p-2 text-slate-800" id="role-switcher-dropdown">
            <div className="px-3 py-2 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Development Role Preview</span>
                <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><KeyRound className="w-2.5 h-2.5" /> DEV ONLY</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">This selector is intentionally removed from production. It is not an authorization mechanism.</p>
            </div>
            <div className="py-1 space-y-1 max-h-72 overflow-y-auto">
              {staff.map((member) => {
                const isSelected = member.id === currentStaffUser.id;
                return (
                  <button key={member.id} type="button" onClick={() => { setCurrentStaffUser(member); setIsOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${isSelected ? 'bg-red-50 text-red-900 font-medium' : 'hover:bg-slate-50 text-slate-700'}`}>
                    <img
                      src={resolveDisplayImage(member.avatar, mediaAssets) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                      alt="Development staff preview"
                      onError={(e) => handleImageError(e, member.avatar, mediaAssets, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80')}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between"><span className="text-xs font-semibold truncate text-slate-900">{member.name}</span>{isSelected && <Check className="w-4 h-4 text-red-600 shrink-0" />}</div>
                      <p className="text-[11px] text-slate-500 truncate">{formatRoleName(member.role)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="p-2 border-t border-slate-100 bg-slate-50 rounded-b-lg text-[11px] text-slate-600 flex gap-1 font-semibold"><Sparkles className="w-3 h-3 text-red-600" /> Development preview only</div>
          </div>
        </>
      )}
    </div>
  );
};
