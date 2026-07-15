import React, { useState } from "react";
import { 
  Key, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Sparkles, 
  Database, 
  Cpu, 
  Zap,
  HelpCircle
} from "lucide-react";

interface LicenseKeyRow {
  id: string;
  key: string;
  is_active: boolean;
}

interface AuthManagerProps {
  onVerified: (user: any, license: LicenseKeyRow) => void;
}

const SUPABASE_URL = "https://padpxqjycrrfhmeujoyg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZHB4cWp5Y3JyZmhtZXVqb3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMTI4NTYsImV4cCI6MjA5OTU4ODg1Nn0.vnYlOScZWe0fV58-_NJKm-ewaEoikt3zbJ-XqwYEhhc";

export const AuthManager: React.FC<AuthManagerProps> = ({ onVerified }) => {
  const [licenseKeyInput, setLicenseKeyInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // The fixed verification function
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. We query your newly updated 'license_key' column in Supabase
      const keyUrl = `${SUPABASE_URL}/rest/v1/license_keys?license_key=eq.${encodeURIComponent(licenseKeyInput)}`;
      const keyRes = await fetch(keyUrl, {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      // 2. If the database returns an error, we catch it here
      if (!keyRes.ok) {
        throw new Error(`Database connection failed: Status ${keyRes.status}`);
      }

      const keysList = await keyRes.json();

      // 3. Check if we found any matching license key
      if (!Array.isArray(keysList) || keysList.length === 0) {
        setError("Invalid license key. Please verify your key and try again.");
        setLoading(false);
        return;
      }

      const matchedLicense = keysList[0];
      
      // 4. Check if the license key is active
      if (matchedLicense.is_active === false) {
        setError("This license key is currently deactivated. Please contact support.");
        setLoading(false);
        return;
      }

      // 5. Successful verification! We prepare the user data to log them in
      const finalKey = matchedLicense.license_key || licenseKeyInput;
      const userObj = { 
        id: matchedLicense.user_id || finalKey, 
        email: matchedLicense.user_email || `licensed_${finalKey.substring(0, 4)}...`
      };
      const licenseObj = {
        id: matchedLicense.id || finalKey,
        key: finalKey,
        is_active: true
      };

      // 6. Send the successful login data back to your main app
      onVerified(userObj, licenseObj);

    } catch (err: any) {
      console.error("Verification exception:", err);
      setError(`Authentication failed: ${err.message || "Please check your network connection and try again."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center font-sans px-4 py-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-25%] left-[-25%] w-[70%] h-[70%] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-25%] w-[70%] h-[70%] bg-zinc-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Core Gate Card */}
      <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in">
        
        {/* Elegant Top Branding Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500/20 to-amber-400/5 border border-amber-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/5 relative group">
            <Key className="w-8 h-8 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-transparent font-display">
              Creatives Lab
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
              Analyze, iterate, and optimize top-performing marketing hooks and reel scripts with instant metrics.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-2xl p-6 relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-200">
              License Authorization
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Enter your purchase license key below to unlock the creative intelligence workspace.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="license-key" className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                Product License Key
              </label>
              <div className="relative">
                <input
                  id="license-key"
                  type="text"
                  required
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={licenseKeyInput}
                  onChange={(e) => setLicenseKeyInput(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-zinc-950 border border-zinc-800 focus:border-amber-500/80 text-zinc-100 placeholder-zinc-700 rounded-xl text-xs font-mono font-bold tracking-wider transition-all focus:ring-1 focus:ring-amber-500/30 outline-none"
                  disabled={loading}
                />
                <Key className="w-4 h-4 text-zinc-600 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/15 border border-red-900/30 rounded-xl flex gap-2.5 text-xs text-red-400 leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-zinc-100 hover:bg-zinc-50 text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-500 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                  <span>Validating credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Activate Key & Enter Lab</span>
                </>
              )}
            </button>
          </form>

          {/* Minimalist Tech Stats */}
          <div className="pt-4 border-t border-zinc-800/60 grid grid-cols-3 gap-2.5">
            <div className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg flex flex-col items-center justify-center text-center">
              <Database className="w-4 h-4 text-zinc-600 mb-1" />
              <span className="text-[9px] font-bold text-zinc-400 block">Supabase SQL</span>
              <span className="text-[8px] text-zinc-600 block mt-0.5">Encrypted</span>
            </div>
            <div className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg flex flex-col items-center justify-center text-center">
              <Cpu className="w-4 h-4 text-zinc-600 mb-1" />
              <span className="text-[9px] font-bold text-zinc-400 block">Analytical AI</span>
              <span className="text-[8px] text-zinc-600 block mt-0.5">Active</span>
            </div>
            <div className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg flex flex-col items-center justify-center text-center">
              <Zap className="w-4 h-4 text-zinc-600 mb-1" />
              <span className="text-[9px] font-bold text-zinc-400 block">Instant Gate</span>
              <span className="text-[8px] text-zinc-600 block mt-0.5">Verified</span>
            </div>
          </div>
        </div>

        {/* Bottom Help Text */}
        <div className="flex flex-col items-center text-center space-y-1.5 text-[10px] text-zinc-600 mt-2">
          <div className="flex items-center gap-1.5 justify-center">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-700" />
            <span>Need assistance or purchase information?</span>
          </div>
          <p className="max-w-[280px] leading-relaxed">
            Please consult your delivery email or contact support for help retrieving your key.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Are you sure you want to request permanent deletion of your simulation history and registered license identifiers? This action is irreversible. Click OK to proceed to support to complete data deletion.")) {
                  window.open("https://wa.link/2u1gmp", "_blank");
                }
              }}
              className="text-zinc-600 hover:text-red-400 underline transition-colors cursor-pointer focus:outline-none"
            >
              Delete My Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
