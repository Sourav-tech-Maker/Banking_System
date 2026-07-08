import { useState } from "react";
import axios from "axios";
import {
  CheckCircle2,
  CreditCard,
  Landmark,
  Loader2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Bank-Grade Security",
    description: "256-bit encryption and multi-factor authentication protect every transaction.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Analytics",
    description: "Track your spending, income and net worth with live dashboard insights.",
  },
  {
    icon: Sparkles,
    title: "ONEO Bank Rewards",
    description: "Earn ONEO Bank Coins on every transaction and redeem exclusive perks.",
  },
  {
    icon: CreditCard,
    title: "Instant Transfers",
    description: "Send and receive money in seconds with zero hidden fees.",
  },
];

export default function OpenAccount() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const handleOpen = async () => {
    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/account`,
        {},
        { withCredentials: true },
      );
      setSuccess(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ─── Success state ─── */
  if (success) {
    const account = success.account || success;
    return (
      <div className="mx-auto max-w-lg space-y-6 pt-6">
        <div className="rounded-xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-950">Account Created!</h2>
          <p className="mt-2 text-sm text-slate-500">
            Your new savings account is ready to use.
          </p>

          <div className="mt-6 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left text-sm">
            {account.accountNumber && (
              <div className="flex justify-between">
                <span className="font-medium text-slate-500">Account No.</span>
                <span className="font-bold text-slate-900">{account.accountNumber}</span>
              </div>
            )}
            {account._id && (
              <div className="flex justify-between">
                <span className="font-medium text-slate-500">Account ID</span>
                <span className="font-mono text-xs font-bold text-slate-900">{account._id}</span>
              </div>
            )}
            {account.accountType && (
              <div className="flex justify-between">
                <span className="font-medium text-slate-500">Type</span>
                <span className="font-bold text-slate-900">{account.accountType}</span>
              </div>
            )}
            {account.status && (
              <div className="flex justify-between">
                <span className="font-medium text-slate-500">Status</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  {account.status}
                </span>
              </div>
            )}
          </div>

          <button
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            onClick={() => setSuccess(null)}
            type="button"
          >
            Open Another
          </button>
        </div>
      </div>
    );
  }

  /* ─── Main CTA ─── */
  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-2">
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Gradient accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500" />

        <div className="flex flex-col items-center px-8 pb-8 pt-10 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-200">
            <Landmark className="size-8 text-white" />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-950">Open a Savings Account</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Start your banking journey with ONEO Bank. One click is all it takes — no paperwork, no
            waiting. Your KYC must be approved before opening an account.
          </p>

          {error && (
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <XCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-7 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            onClick={handleOpen}
            type="button"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating Account…
              </>
            ) : (
              <>
                <Landmark className="size-4" />
                Open Account Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Benefits grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {benefits.map((b) => (
          <div
            className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            key={b.title}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <b.icon className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-950">{b.title}</h3>
              <p className="mt-1 text-sm leading-5 text-slate-500">{b.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
