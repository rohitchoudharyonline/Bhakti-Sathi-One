import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { getEmailVerificationState, isValidEmail } from '../../utils/validation';

interface EmailVerificationInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  className?: string;
  inputClassName?: string;
  showSyncBadge?: boolean;
  disabled?: boolean;
}

export const EmailVerificationInput: React.FC<EmailVerificationInputProps> = ({
  id = 'enquiry-email-input',
  value,
  onChange,
  label = 'Email Address (Verification Step)',
  placeholder = 'e.g. yourname@gmail.com',
  required = true,
  helperText,
  className = '',
  inputClassName = '',
  showSyncBadge = true,
  disabled = false,
}) => {
  const [touched, setTouched] = useState(false);
  const verification = getEmailVerificationState(value);
  const isInputValid = verification.isValid;
  const isInputInvalid = touched && !isInputValid && value.trim().length > 0;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-[10.5px] uppercase font-black tracking-wider text-stone-800 flex items-center gap-1.5"
        >
          <Mail className="w-3.5 h-3.5 text-[#9b0000]" />
          <span>{label}</span>
          {required && <span className="text-[#9b0000] font-bold">*</span>}
        </label>

        {showSyncBadge && (
          <span
            className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 transition select-none ${
              isInputValid
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : isInputInvalid
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-stone-100 text-stone-500 border-stone-200'
            }`}
          >
            {isInputValid ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Format Verified</span>
              </>
            ) : isInputInvalid ? (
              <>
                <AlertCircle className="w-3 h-3 text-rose-600" />
                <span>Invalid Email</span>
              </>
            ) : (
              <span>Required for Submission</span>
            )}
          </span>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
          <Mail className="w-4 h-4" />
        </div>

        <input
          id={id}
          type="email"
          required={required}
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          onBlur={() => setTouched(true)}
          onChange={(e) => {
            if (!touched) setTouched(true);
            onChange(e.target.value);
          }}
          className={`w-full pl-9 pr-9 py-2.5 rounded-xl text-xs font-semibold transition outline-none border ${
            isInputValid
              ? 'border-emerald-500 bg-emerald-50/20 text-stone-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500'
              : isInputInvalid
              ? 'border-rose-400 bg-rose-50/20 text-stone-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-400'
              : 'border-stone-300 bg-white text-stone-900 focus:border-[#9b0000] focus:ring-1 focus:ring-[#9b0000]'
          } ${inputClassName}`}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isInputValid && (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-in zoom-in-75 duration-200" />
          )}
          {isInputInvalid && (
            <AlertCircle className="w-4 h-4 text-rose-500 animate-in zoom-in-75 duration-200" />
          )}
        </div>
      </div>

      {/* Real-time status / helper message */}
      <div className="min-h-[16px] text-[10px]">
        {isInputValid ? (
          <p className="text-emerald-700 font-semibold flex items-center gap-1">
            <span>✓ {verification.message} — Submission enabled</span>
          </p>
        ) : isInputInvalid ? (
          <p className="text-rose-600 font-semibold flex items-center gap-1">
            <span>⚠ {verification.message}</span>
          </p>
        ) : (
          <p className="text-stone-500">
            {helperText || 'Enter a valid email (e.g. name@domain.com) to enable enquiry submission.'}
          </p>
        )}
      </div>
    </div>
  );
};
