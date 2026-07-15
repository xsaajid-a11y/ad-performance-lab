import React, { useState, useEffect, useRef } from "react";
import { Check, ShieldCheck, HelpCircle } from "lucide-react";

interface ReCaptchaProps {
  onChange: (token: string | null) => void;
}

export const ReCaptcha: React.FC<ReCaptchaProps> = ({ onChange }) => {
  const [verified, setVerified] = useState<boolean>(false);
  const [dragProgress, setDragProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    if (verified) return;
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current || verified) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const width = rect.width - 44; // Subtract thumb size
      const clientX = e.clientX;
      let offset = clientX - rect.left - 22; // Center thumb on cursor
      if (offset < 0) offset = 0;
      if (offset > width) offset = width;
      const percent = (offset / width) * 100;
      setDragProgress(percent);

      if (percent >= 98) {
        setVerified(true);
        setIsDragging(false);
        setDragProgress(100);
        onChange("custom_captcha_verified_token_success");
      }
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      if (dragProgress < 98) {
        setDragProgress(0);
        onChange(null);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !sliderRef.current || verified) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const width = rect.width - 44;
      const clientX = e.touches[0].clientX;
      let offset = clientX - rect.left - 22;
      if (offset < 0) offset = 0;
      if (offset > width) offset = width;
      const percent = (offset / width) * 100;
      setDragProgress(percent);

      if (percent >= 98) {
        setVerified(true);
        setIsDragging(false);
        setDragProgress(100);
        onChange("custom_captcha_verified_token_success");
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, dragProgress, verified, onChange]);

  return (
    <div 
      ref={sliderRef}
      className={`relative h-11 w-full bg-zinc-950 border rounded-xl overflow-hidden select-none transition-all duration-300 ${
        verified ? "border-emerald-500/50 bg-emerald-950/10" : "border-zinc-800 focus-within:border-zinc-700"
      }`}
    >
      {/* Background Track Fill */}
      <div 
        className="absolute top-0 left-0 bottom-0 bg-emerald-500/10 transition-all duration-100 ease-out"
        style={{ width: `${dragProgress}%` }}
      />

      {/* Track Label text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] uppercase tracking-wider font-bold text-zinc-500">
        {verified ? (
          <span className="text-emerald-400 flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Verification Passed
          </span>
        ) : (
          <span className="font-mono">Slide right to verify</span>
        )}
      </div>

      {/* Slider Thumb */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        style={{ left: `calc(${dragProgress}% - ${dragProgress * 0.44}px)` }}
        className={`absolute top-1 bottom-1 w-9 rounded-lg flex items-center justify-center transition-shadow duration-200 shadow-md ${
          verified 
            ? "bg-emerald-500 text-white cursor-default" 
            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-grab active:cursor-grabbing"
        }`}
      >
        {verified ? <Check className="w-4 h-4" /> : <div className="w-1.5 h-4 bg-zinc-500 rounded-full" />}
      </div>
    </div>
  );
};
