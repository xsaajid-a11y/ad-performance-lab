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
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { supabase } from "../lib/supabase";

export interface LicenseKeyRow {
  id: string;
  key: string;
  is_active: boolean;
}

export interface AuthManagerProps {
  onVerified: (user: any, license: LicenseKeyRow) => void;
}

export const AuthManager: React.FC<AuthManagerProps> = ({ onVerified }) => {
  const [licenseKeyInput, setLicenseKeyInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = licenseKeyInput.trim();
    if (!trimmedKey) {
      setError("Please enter your License Key to proceed.");
      return;
    }

    setLoading(true);
    setError(null);

 try {
      const trimmedKey = licenseKeyInput.trim();
      
      const { data, error: queryError } = await supabase
        .from("license_keys")
        .select("*")
        .eq("license_key", trimmedKey)
        .maybeSingle();

      if (queryError) {
        console.error("Database query error:", queryError);
        setError(`Database connection error: ${queryError.message}`);
        setLoading(false);
        return;
      }

      // Diagnostic check: This will tell us EXACTLY what the database found
      if (!data) {
        setError(`Database connected, but found nothing. Looked for key: "${trimmedKey}"`);
        setLoading(false);
        return;
      }

      // Successful verification
      const userObj = {
        id: data.user_id || data.id,
        email: data.user_email || `user_${data.id.substring(0, 5)}@creativeslab.ai`
      };

const licenseObj: LicenseKeyRow = {
        id: data.id,
        key: data.license_key,
        is_active: !!data.is_active
      };

      // Save it here so the entire app can access it instantly!
      localStorage.setItem("workspace_license_key", data.license_key);

      onVerified(userObj, licenseObj);
    } catch (err: any) {
      console.error("Authentication exception:", err);
      setError(`Authentication failed: ${err.message || "Please check your network and try again."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center font-sans px-4 py-12 relative overflow-hidden">
      {/* Sleek ambient background glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-zinc-800/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Core Auth Card */}
      <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in">
        
        {/* Elegant Top Branding Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500/20 to-amber-500/5 border border-amber-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/5 relative group">
            <Key className="w-8 h-8 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-50 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Creatives Lab
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
              Unlock elite marketing hook simulation, ad creative iteration, and meta performance analysis.
            </p>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-2xl p-6 relative overflow-hidden space-y-6">
          {/* Subtle Cyber Accent Top Border */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-200">
              License Authorization
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Please enter your unique workspace license key to unlock access.
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
                  className="w-full h-11 pl-10 pr-4 bg-zinc-950 border border-zinc-800 focus:border-amber-500/85 text-zinc-100 placeholder-zinc-700 rounded-xl text-xs font-mono font-bold tracking-wider transition-all focus:ring-1 focus:ring-amber-500/30 outline-none"
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
              className="w-full h-11 bg-amber-400 hover:bg-amber-300 text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-500 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Validating Key...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Activate Workspace</span>
                  <ArrowRight className="w-4 h-4 text-zinc-950" />
                </>
              )}
            </button>
          </form>

          {/* Core Technical Specifications List */}
          <div className="pt-4 border-t border-zinc-800/60 grid grid-cols-3 gap-2.5">
            <div className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg flex flex-col items-center justify-center text-center">
              <Database className="w-4 h-4 text-zinc-600 mb-1" />
              <span className="text-[9px] font-bold text-zinc-400 block">Database</span>
              <span className="text-[8px] text-zinc-650 block mt-0.5">Real-time SQL</span>
            </div>
            <div className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg flex flex-col items-center justify-center text-center">
              <Cpu className="w-4 h-4 text-zinc-600 mb-1" />
              <span className="text-[9px] font-bold text-zinc-400 block">Model Engine</span>
              <span className="text-[8px] text-zinc-650 block mt-0.5">Gemini 2.5</span>
            </div>
            <div className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg flex flex-col items-center justify-center text-center">
              <Zap className="w-4 h-4 text-zinc-600 mb-1" />
              <span className="text-[9px] font-bold text-zinc-400 block">Gateway</span>
              <span className="text-[8px] text-zinc-650 block mt-0.5">Instant Verify</span>
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
            Please consult your delivery email or support desk for your product access keys.
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
