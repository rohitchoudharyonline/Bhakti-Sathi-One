import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { supabase } from '../../lib/supabase';
import { Terminal, Shield, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';

interface AuthDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthDiagnosticsModal: React.FC<AuthDiagnosticsModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<Array<{ timestamp: string; type: 'info' | 'success' | 'error'; message: string; data?: any }>>([
    { timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Auth Diagnostics initialized for mybhaktisathi.com' },
  ]);
  const [rawGoogleResponse, setRawGoogleResponse] = useState<any>(null);

  if (!isOpen) return null;

  const addLog = (type: 'info' | 'success' | 'error', message: string, data?: any) => {
    setLogs((prev) => [
      { timestamp: new Date().toLocaleTimeString(), type, message, data },
      ...prev,
    ]);
  };

  const expectedClientId = '969580668423-u2tnqu48ng8qjgjm4dhb45aaaj5b7mtu.apps.googleusercontent.com';

  const testSupabaseEndpoint = async () => {
    addLog('info', 'Testing Supabase OAuth endpoint configuration...');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true,
        },
      });
      if (error) {
        addLog('error', `Supabase endpoint check error: ${error.message}`, error);
      } else {
        addLog('success', 'Supabase Google OAuth endpoint successfully generated URL:', data?.url);
      }
    } catch (err: any) {
      addLog('error', `Supabase test exception: ${err.message}`, err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-stone-900 text-stone-100 rounded-3xl shadow-2xl border border-stone-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-950 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wide text-white">Google OAuth &amp; Supabase Diagnostics</h2>
              <p className="text-[11px] text-stone-400">Environment Verification &amp; Raw Response Inspector</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300 transition cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow text-xs">
          
          {/* Environment Summary Card */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-black text-orange-400 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4" /> Environment Configuration Audit
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-stone-300">
              <div className="p-3 bg-stone-900 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-500 block uppercase font-bold">Target Domain</span>
                <span className="font-mono font-bold text-stone-200">mybhaktisathi.com</span>
              </div>
              <div className="p-3 bg-stone-900 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-500 block uppercase font-bold">Current Origin</span>
                <span className="font-mono font-bold text-stone-200 truncate block">{window.location.origin}</span>
              </div>
              <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 md:col-span-2">
                <span className="text-[10px] text-stone-500 block uppercase font-bold">Configured Google Client ID</span>
                <span className="font-mono text-emerald-400 font-bold break-all">{expectedClientId}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={testSupabaseEndpoint}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold flex items-center gap-2 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Test Supabase OAuth URL
              </button>
            </div>
          </div>

          {/* Live Google Sign-In Test Button */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-5 text-center space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Interactive Google Sign-In Test</h3>
            <p className="text-stone-400 max-w-lg mx-auto">
              Click the button below to invoke the official Google OAuth popup. The raw ID token response and JWT payload will be captured and inspected live below.
            </p>
            
            <div className="flex justify-center py-2">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  addLog('success', 'Google OAuth responded with raw credential token.', credentialResponse);
                  setRawGoogleResponse(credentialResponse);
                  try {
                    const decoded = jwtDecode(credentialResponse.credential || '');
                    addLog('success', 'JWT Decoded Payload successfully verified:', decoded);
                  } catch (e: any) {
                    addLog('error', `Failed to decode JWT token: ${e.message}`);
                  }
                }}
                onError={() => {
                  addLog('error', 'Google OAuth Sign-In returned an error or was dismissed by user.');
                }}
                theme="filled_black"
                size="large"
                text="signin_with"
              />
            </div>
          </div>

          {/* Raw Response Inspector */}
          {rawGoogleResponse && (
            <div className="bg-stone-950 border border-emerald-900/50 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Raw Google OAuth Response Inspector
                </span>
                <button
                  onClick={() => setRawGoogleResponse(null)}
                  className="text-[10px] text-stone-500 hover:text-stone-300 uppercase font-bold"
                >
                  Clear
                </button>
              </div>
              <pre className="p-3 bg-stone-900 rounded-xl text-stone-300 font-mono text-[10px] overflow-x-auto max-h-48 border border-stone-800">
                {JSON.stringify(rawGoogleResponse, null, 2)}
              </pre>
            </div>
          )}

          {/* Live Diagnostic Logs Console */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-400 uppercase tracking-wide">Live Diagnostics Terminal</span>
              <button
                onClick={() => setLogs([{ timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Logs cleared.' }])}
                className="text-[10px] text-stone-500 hover:text-stone-300 uppercase font-bold"
              >
                Clear Logs
              </button>
            </div>
            
            <div className="bg-stone-900 rounded-xl p-3 font-mono text-[11px] max-h-48 overflow-y-auto space-y-1.5 border border-stone-800">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-stone-500 shrink-0">[{log.timestamp}]</span>
                  <span className={`font-bold shrink-0 ${
                    log.type === 'success' ? 'text-emerald-400' : log.type === 'error' ? 'text-rose-400' : 'text-sky-400'
                  }`}>
                    {log.type.toUpperCase()}:
                  </span>
                  <span className="text-stone-300 break-all">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
