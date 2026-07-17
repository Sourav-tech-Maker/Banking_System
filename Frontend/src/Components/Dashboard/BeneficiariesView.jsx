import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle2,
  Landmark,
  Loader2,
  MailCheck,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRoundCheck,
  UsersRound,
  X,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const emptyForm = {
  fullName: "",
  nickName: "",
  accountId: "",
};

function readStoredUser() {
  try {
    return JSON.parse(sessionStorage.getItem("YONO AppUser")) || {};
  } catch {
    return {};
  }
}

function getAccount(beneficiary) {
  return beneficiary?.accountId && typeof beneficiary.accountId === "object"
    ? beneficiary.accountId
    : {};
}

function getAccountId(beneficiary) {
  const account = getAccount(beneficiary);
  return account._id || beneficiary?.accountId || "";
}

function getInitials(name) {
  return String(name || "Beneficiary")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function maskEmail(email) {
  const [localPart, domain] = String(email || "").split("@");
  if (!localPart || !domain) return email || "your registered email";

  const visible = localPart.slice(0, Math.min(2, localPart.length));
  return `${visible}${"•".repeat(Math.max(3, localPart.length - visible.length))}@${domain}`;
}

function formatDate(value) {
  if (!value) return "Recently added";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function BeneficiarySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="h-52 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm" key={index} />
      ))}
    </div>
  );
}

export default function BeneficiariesView() {
  const storedUser = useMemo(() => readStoredUser(), []);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [step, setStep] = useState("details");
  const [form, setForm] = useState(emptyForm);
  const [pendingBeneficiary, setPendingBeneficiary] = useState(null);
  const [otp, setOtp] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBeneficiaries = useCallback(async ({ showRefresh = false } = {}) => {
    if (showRefresh) setRefreshing(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/beneficiary/get-beneficiary`,
        { withCredentials: true },
      );
      setBeneficiaries(response.data?.data?.beneficiaries || []);
    } catch (requestError) {
      setBeneficiaries([]);
      setError(
        requestError.response?.status === 401
          ? "Your session has expired. Please log in again."
          : requestError.response?.data?.message || "Failed to load beneficiaries.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchBeneficiaries, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchBeneficiaries]);

  const filteredBeneficiaries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return beneficiaries;

    return beneficiaries.filter((beneficiary) => {
      const account = getAccount(beneficiary);
      const accountId = getAccountId(beneficiary);
      return [
        beneficiary.fullName,
        beneficiary.nickName,
        beneficiary.bankName,
        account.accountType,
        account.currency,
        accountId,
      ].some((value) => String(value || "").toLowerCase().includes(query));
    });
  }, [beneficiaries, searchQuery]);

  const openAddModal = () => {
    setForm(emptyForm);
    setOtp("");
    setStep("details");
    setPendingBeneficiary(null);
    setFormError("");
    setSuccess("");
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (submitting || verifying) return;
    setShowAddModal(false);
    setFormError("");
  };

  const handleAddBeneficiary = async (event) => {
    event.preventDefault();
    setFormError("");

    const accountId = form.accountId.trim();
    if (!/^[a-f\d]{24}$/i.test(accountId)) {
      setFormError("Enter a valid 24-character beneficiary account ID.");
      return;
    }

    if (form.fullName.trim().length < 2) {
      setFormError("Enter the beneficiary's full name.");
      return;
    }

    if (!form.nickName.trim() || form.nickName.trim().length > 20) {
      setFormError("Nickname is required and must be 20 characters or fewer.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/beneficiary/add-beneficiary`,
        {
          fullName: form.fullName.trim(),
          nickName: form.nickName.trim(),
          accountId,
        },
        { withCredentials: true },
      );

      const beneficiaryId = response.data?.data?.beneficiaryId;
      if (!beneficiaryId) {
        throw new Error("Beneficiary verification ID was not returned.");
      }

      setPendingBeneficiary({
        id: beneficiaryId,
        fullName: form.fullName.trim(),
        email: storedUser.email,
      });
      setStep("otp");
    } catch (requestError) {
      setFormError(
        requestError.response?.data?.message ||
        requestError.message ||
        "Unable to add this beneficiary.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyBeneficiary = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!/^\d{6}$/.test(otp)) {
      setFormError("Enter the 6-digit verification code from your email.");
      return;
    }

    setVerifying(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/beneficiary/verify`,
        {
          beneficiaryId: pendingBeneficiary?.id,
          otp,
        },
        { withCredentials: true },
      );

      setShowAddModal(false);
      setSuccess(response.data?.message || "Beneficiary verified and ready for transfers.");
      await fetchBeneficiaries();
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || "Verification failed. Please check the code.");
    } finally {
      setVerifying(false);
    }
  };

  const handleDeleteBeneficiary = async () => {
    if (!deleteTarget?._id) return;

    setDeleting(true);
    setError("");
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/beneficiary/${deleteTarget._id}`,
        { withCredentials: true },
      );

      setBeneficiaries((current) => (
        current.filter((beneficiary) => beneficiary._id !== deleteTarget._id)
      ));
      setSuccess(response.data?.message || "Beneficiary removed successfully.");
      setDeleteTarget(null);
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? "Your session has expired. Please log in again."
          : requestError.response?.data?.message || "Failed to remove beneficiary.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <UsersRound className="size-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-950">Beneficiaries</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Add and verify trusted recipients before sending money.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            disabled={refreshing}
            onClick={() => fetchBeneficiaries({ showRefresh: true })}
            type="button"
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            onClick={openAddModal}
            type="button"
          >
            <Plus className="size-4" />
            Add Beneficiary
          </button>
        </div>
      </div>

      {success && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            {success}
          </span>
          <button aria-label="Dismiss message" onClick={() => setSuccess("")} type="button">
            <X className="size-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </span>
          <button className="font-semibold" onClick={() => fetchBeneficiaries({ showRefresh: true })} type="button">
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Verified recipients</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{beneficiaries.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Transfer status</p>
          <p className="mt-2 flex items-center gap-2 text-sm font-bold text-emerald-700">
            <ShieldCheck className="size-4" /> OTP protected
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="beneficiary-search">
            Find beneficiary
          </label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              id="beneficiary-search"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Name or account ID"
              value={searchQuery}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <BeneficiarySkeleton />
      ) : filteredBeneficiaries.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 text-center shadow-sm">
          <div className="flex size-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <UserRoundCheck className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-950">
            {searchQuery ? "No matching beneficiaries" : "No beneficiaries yet"}
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {searchQuery
              ? "Try another name, nickname, or account ID."
              : "Add a trusted recipient and complete email verification to use them for transfers."}
          </p>
          {!searchQuery && (
            <button
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white"
              onClick={openAddModal}
              type="button"
            >
              <Plus className="size-4" /> Add your first beneficiary
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredBeneficiaries.map((beneficiary) => {
            const account = getAccount(beneficiary);
            const accountId = getAccountId(beneficiary);
            const displayName = beneficiary.nickName || beneficiary.fullName;

            return (
              <article
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                key={beneficiary._id}
              >
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700">
                        {getInitials(displayName)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-slate-950">{displayName}</h3>
                        <p className="truncate text-xs text-slate-500">{beneficiary.fullName}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="size-3.5" /> Verified
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Bank</span>
                      <span className="font-semibold text-slate-900">{beneficiary.bankName || "YONO App"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Account</span>
                      <span className="font-semibold text-slate-900">
                        {account.accountType || beneficiary.accountType || "Savings"} · {account.currency || "INR"}
                      </span>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                      <p className="text-xs text-slate-500">Account ID</p>
                      <p className="mt-1 break-all font-mono text-xs font-bold text-slate-900">{accountId}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Landmark className="size-3.5" /> {account.status || "Active"}
                    </span>
                    <div className="flex items-center gap-3">
                      <span>Added {formatDate(beneficiary.createdAt)}</span>
                      <button
                        aria-label={`Remove ${displayName}`}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => {
                          setSuccess("");
                          setDeleteTarget(beneficiary);
                        }}
                        type="button"
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              aria-label="Close beneficiary form"
              className="absolute right-4 top-4 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              onClick={closeAddModal}
              type="button"
            >
              <X className="size-5" />
            </button>

            <div className="pr-10">
              <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                {step === "details" ? <UserRoundCheck className="size-5" /> : <MailCheck className="size-5" />}
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-950">
                {step === "details" ? "Add a beneficiary" : "Verify beneficiary"}
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {step === "details"
                  ? "Enter the recipient's bank details. We will email you a one-time verification code."
                  : `Enter the code sent to ${maskEmail(pendingBeneficiary?.email)} to activate ${pendingBeneficiary?.fullName}.`}
              </p>
            </div>

            <div className="mt-5 flex gap-2" aria-label="Beneficiary setup progress">
              <div className="h-1.5 flex-1 rounded-full bg-indigo-600" />
              <div className={`h-1.5 flex-1 rounded-full ${step === "otp" ? "bg-indigo-600" : "bg-slate-200"}`} />
            </div>

            {formError && (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {formError}
              </div>
            )}

            {step === "details" ? (
              <form className="mt-5 space-y-4" onSubmit={handleAddBeneficiary}>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="beneficiary-full-name">
                    Full name
                  </label>
                  <input
                    autoComplete="name"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    id="beneficiary-full-name"
                    maxLength={80}
                    onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                    placeholder="Recipient's legal name"
                    required
                    value={form.fullName}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="beneficiary-nickname">
                    Nickname
                  </label>
                  <input
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    id="beneficiary-nickname"
                    maxLength={20}
                    onChange={(event) => setForm((current) => ({ ...current, nickName: event.target.value }))}
                    placeholder="For example, Rent or Mom"
                    required
                    value={form.nickName}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="beneficiary-account-id">
                    Account ID
                  </label>
                  <input
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    id="beneficiary-account-id"
                    maxLength={24}
                    onChange={(event) => setForm((current) => ({ ...current, accountId: event.target.value.trim() }))}
                    placeholder="24-character account ID"
                    required
                    value={form.accountId}
                  />
                  <p className="mt-1.5 text-xs text-slate-500">Only active, KYC-verified YONO App accounts can be added.</p>
                </div>

                <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs leading-5 text-indigo-700">
                  The verification code will be sent to {maskEmail(storedUser.email)}.
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={closeAddModal}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                    disabled={submitting}
                    type="submit"
                  >
                    {submitting ? <Loader2 className="size-4 animate-spin" /> : <MailCheck className="size-4" />}
                    {submitting ? "Sending code..." : "Send verification code"}
                  </button>
                </div>
              </form>
            ) : (
              <form className="mt-5 space-y-5" onSubmit={handleVerifyBeneficiary}>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="beneficiary-otp">
                    6-digit verification code
                  </label>
                  <input
                    autoComplete="one-time-code"
                    autoFocus
                    className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-center font-mono text-2xl font-bold tracking-[0.45em] text-slate-950 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    id="beneficiary-otp"
                    inputMode="numeric"
                    maxLength={6}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    required
                    value={otp}
                  />
                  <p className="mt-2 text-center text-xs text-slate-500">The code is valid for ten minutes.</p>
                </div>

                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  disabled={verifying || otp.length !== 6}
                  type="submit"
                >
                  {verifying ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                  {verifying ? "Verifying..." : "Verify and activate"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            aria-describedby="delete-beneficiary-description"
            aria-labelledby="delete-beneficiary-title"
            aria-modal="true"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
            role="dialog"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <Trash2 className="size-6" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-950" id="delete-beneficiary-title">
              Remove beneficiary?
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500" id="delete-beneficiary-description">
              {deleteTarget.nickName || deleteTarget.fullName} will be removed from your saved beneficiaries.
              You will need to complete OTP verification again to add this recipient later.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                type="button"
              >
                Keep beneficiary
              </button>
              <button
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                disabled={deleting}
                onClick={handleDeleteBeneficiary}
                type="button"
              >
                {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                {deleting ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
