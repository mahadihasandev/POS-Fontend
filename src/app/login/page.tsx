"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  UserCheck,
  Zap,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useLoginMutation } from "@/redux/api/authApi";
import { saveSession } from "@/lib/session";
import { errorMessage } from "@/lib/pos";
import toast from "react-hot-toast";
import { sounds } from "@/lib/sound";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();

      saveSession(res.data, rememberMe);

      sounds.playSuccessChime();
      toast.success(res.message || `Welcome back, ${res.data.user.name}!`);
      router.push("/");
    } catch (err: unknown) {
      const msg = errorMessage(err, "Please verify your email and password.");
      toast.error(msg);
    }
  };

  const handleDemoFill = (demoEmail: string, demoRole: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    toast.success(`Loaded demo credentials for ${demoRole}!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col justify-center items-center p-3 sm:p-6 relative overflow-hidden select-none">
      {/* Decorative background glows with light violet and cyan accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Container */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Top Header Banner in Blue 500 theme */}
        <div className="bg-teal-700 px-6 py-6 text-white text-center relative overflow-hidden">
          {/* Subtle gradient pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900 to-teal-700 opacity-90" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner mb-3 border border-white/30">
              <Layers className="w-7 h-7 text-white stroke-[2.5]" />
            </div>
            <h1 className="font-serif italic font-extrabold text-2xl tracking-tight text-white drop-shadow-xs">
              Smart Account
            </h1>
            <p className="text-xs font-semibold text-blue-100 uppercase tracking-widest mt-0.5">
              Datta & Brothers Electrics
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-medium backdrop-blur-xs border border-white/25">
              <Sparkles className="w-3 h-3 text-violet-200" />
              <span>Enterprise Cloud POS & Wholesale ERP</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Sign in to your terminal
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Enter your authorized staff credentials to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Staff Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@smartpos.com"
                  required
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  required
                  className="w-full h-10 pl-9 pr-10 rounded-lg bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-400 accent-blue-500"
                />
                <span>Keep session active</span>
              </label>

              <span className="text-[11px] text-slate-400 font-mono">
                Staff access
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-teal-700 hover:bg-teal-800 active:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to POS Counter</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher Section (With light violet styling) */}
          {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block text-center">
                Quick 1-Click Demo Accounts
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill("admin@smartpos.com", "Admin")}
                  className="p-2 rounded-lg border border-violet-200 bg-violet-50 hover:bg-violet-100 hover:border-violet-300 text-violet-900 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-violet-700" />
                  <span className="text-[11px] font-bold">Admin</span>
                  <span className="text-[9px] text-violet-700 font-mono">
                    Full Access
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDemoFill("manager@smartpos.com", "Manager")
                  }
                  className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-800 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span className="text-[11px] font-bold">Manager</span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    Operations
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDemoFill("cashier@smartpos.com", "Cashier")
                  }
                  className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-800 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-teal-600" />
                  <span className="text-[11px] font-bold">Cashier</span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    Sales Desk
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Registration Policy Notice */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2 text-[11px] text-slate-600">
            <Lock className="w-3.5 h-3.5 text-violet-600 shrink-0 mt-0.5" />
            <p>
              <strong className="font-semibold text-slate-800">
                Restricted Access:
              </strong>{" "}
              Staff and cashier accounts cannot self-register publicly. New
              accounts are provisioned exclusively from inside the web
              application by authenticated administrators.
            </p>
          </div>
        </div>

        {/* Bottom Footer Info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Smart Account POS</span>
          </div>
          <span className="font-mono text-slate-400">Staff workspace</span>
        </div>
      </div>
    </div>
  );
}
