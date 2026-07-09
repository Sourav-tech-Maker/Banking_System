import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  CheckCircle2,
  IdCard,
  Landmark,
  Loader2,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { ThreeCircles } from "react-loader-spinner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function getInitials(name) {
  return name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "NX";
}

export default function ProfileView() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/profile`, {
        withCredentials: true,
      });
      setProfile(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchProfile, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <ThreeCircles
          visible={true}
          height="100"
          width="100"
          color="#4fa94d"
          ariaLabel="three-circles-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  const user = profile?.user || {};
  const kyc = profile?.kyc;
  const accounts = profile?.accounts || [];
  const displayName = user.username || user.email?.split("@")[0] || "Customer";

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 px-6 py-8 text-white">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-20 items-center justify-center rounded-lg bg-white/15 text-2xl font-bold ring-1 ring-white/25">
              {getInitials(displayName)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{displayName}</h2>
              <p className="mt-1 text-sm text-white/80">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-3">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <User className="size-4" />
              Account Status
            </div>
            <p className="mt-2 text-lg font-bold text-slate-950">{user.status || "Active"}</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Mail className="size-4" />
              Email Verified
            </div>
            <p className="mt-2 text-lg font-bold text-slate-950">
              {user.verified ? "Verified" : "Pending"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <ShieldCheck className="size-4" />
              KYC Status
            </div>
            <p className="mt-2 text-lg font-bold text-slate-950">{kyc?.status || "Not Submitted"}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <IdCard className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-950">KYC Details</h3>
              <p className="text-sm text-slate-500">Identity information submitted for review</p>
            </div>
          </div>

          {kyc ? (
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Full Name</span>
                <span className="font-semibold text-slate-900">{kyc.FullName || "—"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Document</span>
                <span className="font-semibold text-slate-900">{kyc.documentType || "—"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Document No.</span>
                <span className="font-semibold text-slate-900">{kyc.documentNumber || "—"}</span>
              </div>
              {kyc.rejectReason && (
                <div className="rounded-md bg-rose-50 px-3 py-2 text-rose-700">
                  {kyc.rejectReason}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-5 rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              KYC has not been submitted yet.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Landmark className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-950">Accounts</h3>
              <p className="text-sm text-slate-500">Linked YONO App bank accounts</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {accounts.length ? (
              accounts.map((account) => (
                <div
                  className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                  key={account.accountId}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-950">{account.accountType}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        A/C {String(account.accountId).slice(-6).toUpperCase()}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {account.status}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="text-sm text-slate-500">Balance</span>
                    <span className="font-bold text-slate-950">
                      {currencyFormatter.format(account.balance || 0)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                No bank accounts are linked yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {user.verified && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="size-4" />
          Your profile is connected to the live banking APIs.
        </div>
      )}
    </div>
  );
}
