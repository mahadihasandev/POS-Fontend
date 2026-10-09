"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Package,
  BarChart3,
  ShoppingBag,
} from "lucide-react";
import { useLoginMutation } from "@/redux/api/authApi";
import { saveSession } from "@/lib/session";
import { errorMessage } from "@/lib/pos";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [login, { isLoading }] = useLoginMutation();
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    try {
      const response = await login({ email: email.trim(), password }).unwrap();
      saveSession(response.data, rememberMe);
      toast.success(`Welcome back, ${response.data.user.name}.`);
      router.replace("/");
    } catch (error) {
      toast.error(
        errorMessage(error, "Please verify your email and password."),
      );
    }
  };
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.08fr_1fr] bg-white">
      <section className="login-brand relative flex flex-col justify-between overflow-hidden px-7 py-8 text-white sm:px-12 lg:p-16">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl border border-teal-300/30 bg-teal-400/10 text-teal-200">
            <Layers size={25} />
          </span>
          <div>
            <p className="text-lg font-semibold tracking-tight">
              Smart Account
            </p>
            <p className="text-[10px] uppercase tracking-[.22em] text-slate-300">
              Business workspace
            </p>
          </div>
        </div>
        <div className="hidden max-w-lg py-10 lg:block lg:py-16">
          <p className="mb-5 text-xs font-medium uppercase tracking-[.2em] text-teal-300">
            Retail & wholesale operations
          </p>
          <h1 className="text-3xl font-semibold leading-[1.15] tracking-[-.04em] sm:text-4xl lg:text-5xl">
            Your business.
            <br />
            <span className="text-teal-200">Working together.</span>
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-7 text-slate-300">
            Bring your checkout, inventory, and accounts into one organized
            workspace.
          </p>
          <div className="mt-10 hidden space-y-5 sm:block">
            {[
              {
                icon: ShoppingBag,
                title: "Keep your counter moving",
                text: "Barcode checkout, held orders, and receipts.",
              },
              {
                icon: Package,
                title: "Stay on top of inventory",
                text: "Product records, stock counts, and replenishment.",
              },
              {
                icon: BarChart3,
                title: "See the business clearly",
                text: "Sales reporting, customer dues, and account balances.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-600 bg-slate-800/60 text-teal-200">
                  <Icon size={18} />
                </span>
                <div>
                  <h2 className="text-sm font-medium">{title}</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="hidden text-xs text-slate-400 lg:block">
          Smart Account · Point of sale & business management
        </p>
      </section>
      <section className="flex flex-col justify-center px-7 py-12 sm:px-14 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-7 grid size-12 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-teal-700">
            <LockKeyhole size={22} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-teal-700">
            Staff sign in
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Welcome back
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Sign in to continue to your business workspace.
          </p>
          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="pos-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                autoComplete="username"
                type="email"
                required
                maxLength={255}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="pos-field !min-h-12"
              />
            </div>
            <div>
              <label htmlFor="password" className="pos-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="pos-field !min-h-12 !pr-12"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-500 hover:text-slate-900"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2.5 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="size-4 accent-teal-700"
              />
              Keep me signed in on this device
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className="pos-button !min-h-12 w-full"
            >
              {isLoading ? "Signing in…" : "Sign in to workspace"}
              <ArrowRight size={17} />
            </button>
          </form>
          {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="mb-3 text-xs font-medium text-slate-600">
                Explore with a demonstration account
              </p>
              <div className="flex gap-2">
                {["admin", "manager", "cashier"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    className="pos-button-secondary capitalize"
                    onClick={() => {
                      setEmail(`${role}@smartpos.com`);
                      setPassword("password123");
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-8 flex items-start gap-3 border-t border-slate-200 pt-6 text-xs leading-6 text-slate-500">
            <ShieldCheck size={17} className="mt-1 shrink-0 text-teal-700" />
            <p>
              Access is managed by your administrator. Contact them if you need
              an account or help signing in.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
