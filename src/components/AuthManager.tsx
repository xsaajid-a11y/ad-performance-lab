import React, { useState } from "react";
import { 
  Key, 
  Mail,
  Lock,
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
import { ReCaptcha } from "./ReCaptcha";
import { getDailyLoginCount, incrementDailyLoginCount } from "../lib/captchaTracker";

interface LicenseKeyRow {
  id: string;
  key: string;
  user_id: string | null;
  user_email: string | null;
  is_active: boolean;
  tokens_left: number;
  days_left: number;
  marketing_consent: boolean;
  device_ids: string[];
}

interface AuthManagerProps {
  onVerified: (user: any, license: LicenseKeyRow) => void;
}

const SUPABASE_URL = "https://padpxqjycrrfhmeujoyg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZHB4cWp5Y3JyZmhtZXVqb3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMTI4NTYsImV4cCI6MjA5OTU4ODg1Nn0.vnYlOScZWe0fV58-_NJKm-ewaEoikt3zbJ-XqwYEhhc";

type AuthStep = "EMAIL" | "LICENSE_KEY" | "OTP";

export const AuthManager: React.FC<AuthManagerProps> = ({ onVerified }) => {
  const [step, setStep] = useState<AuthStep>("EMAIL");
  const [email, setEmail] = useState<string>("");
  const [licenseKeyInput, setLicenseKeyInput] = useState<string>("");
  const [otpInput, setOtpInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [detectedRow, setDetectedRow] = useState<any>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // 1. Check if email is active and whether it is a first-time or returning login
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your email address to continue.");
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      // Query 'license_keys' table for active key matching this email
      const keyUrl = `${SUPABASE_URL}/rest/v1/license_keys?user_email=eq.${encodeURIComponent(cleanEmail)}&is_active=eq.true`;
      const keyRes = await fetch(keyUrl, {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (!keyRes.ok) {
        throw new Error(`Database error: Status ${keyRes.status}`);
      }

      const keysList = await keyRes.json();
      if (!Array.isArray(keysList) || keysList.length === 0) {
        setError("No active license found for this email address. Please make sure you are using the email address used during purchase.");
        setLoading(false);
        return;
      }

      const matchedLicense = keysList[0];
      setDetectedRow(matchedLicense);

      // Check if user has logged in and completed onboarding form before
      const dataUrl = `${SUPABASE_URL}/rest/v1/funnel_data?key=eq.${encodeURIComponent(matchedLicense.key)}&select=data`;
      const dataRes = await fetch(dataUrl, {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      let hasOnboarding = false;
      if (dataRes.ok) {
        const rows = await dataRes.json();
        if (Array.isArray(rows) && rows.length > 0 && rows[0].data?.onboarding?.businessName) {
          hasOnboarding = true;
        }
      }

      if (!hasOnboarding) {
        // First-time Login: Require License Key sent via email
        setStep("LICENSE_KEY");
        setInfoMessage("Welcome! This is your first login. Please enter the License Key sent to your purchase email to activate your account.");
      } else {
        // Returning User: Send OTP via Supabase Auth
        setStep("OTP");
        setInfoMessage(`Returning user detected. We've sent an 8-digit login code (OTP) to ${cleanEmail}. Please check your inbox.`);
        incrementDailyLoginCount(cleanEmail);
        
        try {
          const { error: otpSendError } = await supabase.auth.signInWithOtp({
            email: cleanEmail,
            options: {
              shouldCreateUser: true
            }
          });
          if (otpSendError) {
            console.warn("Supabase OTP send warning:", otpSendError.message);
          }
        } catch (otpErr: any) {
          console.error("Exception sending OTP:", otpErr);
        }
      }
    } catch (err: any) {
      console.error("Email verification exception:", err);
      setError(`Verification request failed: ${err.message || "Please check your network connection and try again."}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle first-time verification with physical License Key activation
  const handleVerifyLicenseKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputKey = licenseKeyInput.trim();
    if (!inputKey) {
      setError("Please enter your License Key to proceed.");
      return;
    }

    if (!detectedRow) {
      setError("Session expired. Please restart by entering your email.");
      setStep("EMAIL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (inputKey !== detectedRow.key) {
        setError("The license key entered is incorrect for this email address. Please check your spelling and try again.");
        setLoading(false);
        return;
      }

      // Generate a unique user_id if not present
      const generatedUserId = detectedRow.user_id || `usr_${Math.random().toString(36).substring(2, 11)}`;

      // First-use Activation: Initialize license row
      const patchUrl = `${SUPABASE_URL}/rest/v1/license_keys?key=eq.${encodeURIComponent(detectedRow.key)}`;
      const patchRes = await fetch(patchUrl, {
        method: "PATCH",
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          tokens_left: 150000,
          days_left: 30,
          user_id: generatedUserId
        })
      });

      let finalRow = { ...detectedRow, user_id: generatedUserId, tokens_left: 150000, days_left: 30 };
      if (patchRes.ok) {
        const patchedRows = await patchRes.json();
        if (Array.isArray(patchedRows) && patchedRows.length > 0) {
          finalRow = patchedRows[0];
        }
      } else {
        console.warn("Failed to PATCH initial quota inside license_keys table, using memory state:", await patchRes.text());
      }

      // Successful verification! Authenticate user and store local tokens
      const userObj = { id: finalRow.user_id || finalRow.key, email: finalRow.user_email || email };
      const licenseObj: LicenseKeyRow = {
        id: finalRow.id || finalRow.key,
        key: finalRow.key,
        user_id: finalRow.user_id || generatedUserId,
        user_email: finalRow.user_email || email,
        is_active: true,
        tokens_left: 150000,
        days_left: 30,
        marketing_consent: finalRow.marketing_consent || false,
        device_ids: []
      };

      localStorage.setItem("fa_userEmail", finalRow.user_email || email);
      onVerified(userObj, licenseObj);
    } catch (err: any) {
      console.error("License activation exception:", err);
      setError(`Activation process failed: ${err.message || "Please check your network and try again."}`);
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle returning user verification via Supabase OTP code
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpInput.trim();
    if (!code) {
      setError("Please enter the verification code.");
      return;
    }

    if (!detectedRow) {
      setError("Session expired. Please restart by entering your email.");
      setStep("EMAIL");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const loginCount = getDailyLoginCount(cleanEmail);
    const isCaptchaRequired = loginCount >= 3;
    if (isCaptchaRequired && !captchaToken) {
      setError("Please complete the verification challenge first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: otpError } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: code,
        type: "email"
      });

      if (otpError) {
        throw new Error(otpError.message);
      }

      // Successful OTP validation! Log user in
      const finalUserId = detectedRow.user_id || `usr_${Math.random().toString(36).substring(2, 11)}`;
      const userObj = { id: finalUserId, email: detectedRow.user_email || cleanEmail };
      const licenseObj: LicenseKeyRow = {
        id: detectedRow.id || detectedRow.key,
        key: detectedRow.key,
        user_id: finalUserId,
        user_email: detectedRow.user_email || cleanEmail,
        is_active: true,
        tokens_left: detectedRow.tokens_left !== undefined ? Number(detectedRow.tokens_left) : 150000,
        days_left: detectedRow.days_left !== undefined ? Number(detectedRow.days_left) : 30,
        marketing_consent: detectedRow.marketing_consent || false,
        device_ids: []
      };

      localStorage.setItem("fa_userEmail", detectedRow.user_email || cleanEmail);
      onVerified(userObj, licenseObj);
    } catch (err: any) {
      console.error("OTP verification failed:", err);
      setError(`Invalid verification code: ${err.message || "Please double check the code sent to your email."}`);
    } finally {
      setLoading(false);
    }
  };

  // 4. Secondary Direct Bypass Fallback using License Key directly
  const handleLicenseBypass = () => {
    setError(null);
    setInfoMessage("Logging in via direct license key fallback. Please enter your license key below.");
    setStep("LICENSE_KEY");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center font-sans px-4 py-12 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-[-25%] left-[-25%] w-[70%] h-[70%] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-25%] w-[70%] h-[70%] bg-blue-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Core Gate Card */}
      <div className="w-full max-w-md space-y-8 relative z-10">
        
        {/* Elegant Top Branding Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500/20 to-emerald-400/5 border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/5 relative group">
            <Key className="w-8 h-8 text-emerald-400 group-hover:rotate-45 transition-transform duration-300" />
            <Sparkles className="w-4 h-4 text-emerald-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-transparent font-display">
              Funnel Architect Studio
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-[280px] mx-auto">
              Simulate, optimize, and forecast marketing pipelines with absolute visual precision.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-2xl p-6 relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-200">
              {step === "EMAIL" && "Secure Studio Access"}
              {step === "LICENSE_KEY" && "First-time Activation"}
              {step === "OTP" && "Two-Factor Verification"}
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {step === "EMAIL" && "Enter your registered purchase email address to retrieve your active workspace."}
              {step === "LICENSE_KEY" && "Your license key initiates a 150k credit pool valid for 30 days from first use."}
              {step === "OTP" && "Enter the verification code sent to your email inbox to restore your active workspace safely."}
            </p>
          </div>

          {infoMessage && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-xs text-emerald-400 leading-relaxed font-sans">
              {infoMessage}
            </div>
          )}

          {/* STEP 1: Email Form */}
          {step === "EMAIL" && (
            <form onSubmit={handleCheckEmail} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="user-email" className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  Purchase Email Address
                </label>
                <div className="relative">
                  <input
                    id="user-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-zinc-950 border border-zinc-800 focus:border-emerald-500/80 text-zinc-100 placeholder-zinc-650 rounded-xl text-xs font-semibold transition-all focus:ring-1 focus:ring-emerald-500/30 outline-none"
                    disabled={loading}
                  />
                  <Mail className="w-4 h-4 text-zinc-600 absolute left-3.5 top-3.5" />
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
                    <span>Locating Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: License Key (First Time Users) */}
          {step === "LICENSE_KEY" && (
            <form onSubmit={handleVerifyLicenseKey} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="license-key" className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  License Key
                </label>
                <div className="relative">
                  <input
                    id="license-key"
                    type="text"
                    required
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={licenseKeyInput}
                    onChange={(e) => setLicenseKeyInput(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-zinc-950 border border-zinc-800 focus:border-emerald-500/80 text-zinc-100 placeholder-zinc-650 rounded-xl text-xs font-mono font-bold tracking-wider transition-all focus:ring-1 focus:ring-emerald-500/30 outline-none"
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
                    <span>Activating Credits & Duration...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Activate Account & Load Studio</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("EMAIL");
                  setError(null);
                  setInfoMessage(null);
                }}
                className="w-full text-center text-[11px] text-zinc-500 hover:text-zinc-300 font-medium transition-colors pt-1"
              >
                ← Back to Email input
              </button>
            </form>
          )}

          {/* STEP 3: OTP Code (Returning Users) */}
          {step === "OTP" && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="otp-code" className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  Verification Code
                </label>
                <div className="relative">
                  <input
                    id="otp-code"
                    type="text"
                    required
                    placeholder="Enter code"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-zinc-950 border border-zinc-800 focus:border-emerald-500/80 text-zinc-100 placeholder-zinc-650 rounded-xl text-center text-sm font-extrabold tracking-wider transition-all focus:ring-1 focus:ring-emerald-500/30 outline-none font-mono"
                    disabled={loading}
                  />
                  <Lock className="w-4 h-4 text-zinc-600 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {getDailyLoginCount(email) >= 3 && (
                <div className="space-y-1">
                  <span className="text-[9px] text-amber-500 font-semibold uppercase tracking-wider block text-center animate-pulse">
                    Security Verification Required (3rd+ Login Attempt Today)
                  </span>
                  <ReCaptcha onChange={setCaptchaToken} />
                </div>
              )}

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
                    <span>Verifying Secure Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Code & Open Studio</span>
                  </>
                )}
              </button>

              <div className="flex flex-col gap-2 pt-2 text-center">
                <button
                  type="button"
                  onClick={handleLicenseBypass}
                  className="text-[11px] text-emerald-500 hover:text-emerald-400 hover:underline font-semibold transition-colors cursor-pointer"
                >
                  Forgot OTP? Verify with License Key instead
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("EMAIL");
                    setError(null);
                    setInfoMessage(null);
                  }}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 font-medium transition-colors cursor-pointer"
                >
                  ← Use a different email address
                </button>
              </div>
            </form>
          )}

          {/* Core Technical Specifications List */}
          <div className="pt-4 border-t border-zinc-800/60 grid grid-cols-3 gap-2.5">
            <div className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg flex flex-col items-center justify-center text-center">
              <Database className="w-4 h-4 text-zinc-600 mb-1" />
              <span className="text-[9px] font-bold text-zinc-400 block">Secure Database</span>
              <span className="text-[8px] text-zinc-600 block mt-0.5">so your data is safe</span>
            </div>
            <div className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg flex flex-col items-center justify-center text-center">
              <Cpu className="w-4 h-4 text-zinc-600 mb-1" />
              <span className="text-[9px] font-bold text-zinc-400 block">AI Modeling</span>
              <span className="text-[8px] text-zinc-600 block mt-0.5">trained on your own data</span>
            </div>
            <div className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg flex flex-col items-center justify-center text-center">
              <Zap className="w-4 h-4 text-zinc-600 mb-1" />
              <span className="text-[9px] font-bold text-zinc-400 block">Ultra Low</span>
              <span className="text-[8px] text-zinc-600 block mt-0.5">Latency Gate</span>
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
            Please consult the documentation inside your system console or reach out to support.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Are you sure you want to request permanent deletion of your business profile, simulation pipeline history, and registered identifiers? This action is irreversible. Click OK to proceed to support to complete data deletion.")) {
                  window.open("https://wa.link/2u1gmp", "_blank");
                }
              }}
              className="text-zinc-500 hover:text-red-400 underline transition-colors cursor-pointer focus:outline-none"
            >
              Delete My Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
