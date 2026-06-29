import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Users,
  Landmark,
  ReceiptText,
  Wallet,
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [kycApps, setKycApps] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("kyc"); // kyc | users
  const [searchQuery, setSearchQuery] = useState("");

  // Reject Modal State
  const [rejectAppId, setRejectAppId] = useState(null);
  const [rejectUserId, setRejectUserId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submittingKyc, setSubmittingKyc] = useState(false);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, kycRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/stats`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/admin/kyc-applications`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/admin/users`, { withCredentials: true }),
      ]);

      setStats(statsRes.data.stats);
      setKycApps(kycRes.data.applications);
      setUsers(usersRes.data.users);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load admin panel data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchAdminData, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchAdminData]);

  const handleApproveKyc = async (userId) => {
    setSubmittingKyc(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/Kyc/verify-kyc`,
        { UserId: userId, status: "Approve" },
        { withCredentials: true }
      );
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve KYC.");
    } finally {
      setSubmittingKyc(false);
    }
  };

  const handleRejectKyc = async () => {
    if (!rejectReason.trim()) {
      alert("A rejection reason is required.");
      return;
    }
    setSubmittingKyc(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/Kyc/verify-kyc`,
        { UserId: rejectUserId, status: "Rejected", rejectReason },
        { withCredentials: true }
      );
      setRejectAppId(null);
      setRejectUserId(null);
      setRejectReason("");
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject KYC.");
    } finally {
      setSubmittingKyc(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-950">Admin Control Panel</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage system users, approve/reject KYC verifications, and monitor bank status.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Section */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Users</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">
                  {stats.totalUsers}
                </h3>
              </div>
              <div className="flex size-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Users className="size-6" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Accounts</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">
                  {stats.totalAccounts}
                </h3>
              </div>
              <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Landmark className="size-6" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Transactions</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">
                  {stats.totalTransactions}
                </h3>
              </div>
              <div className="flex size-12 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <ReceiptText className="size-6" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">System Liquidity</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">
                  {currencyFormatter.format(stats.totalSystemBalance)}
                </h3>
              </div>
              <div className="flex size-12 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <Wallet className="size-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("kyc")}
          className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-[2px] ${
            activeTab === "kyc"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          KYC Applications ({kycApps.filter((app) => app.status === "Pending").length} Pending)
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-[2px] ${
            activeTab === "users"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          User Registry ({users.length})
        </button>
      </div>

      {/* Content Area */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {activeTab === "kyc" && (
          <div className="divide-y divide-slate-100">
            {kycApps.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No KYC applications found in the system.
              </div>
            ) : (
              kycApps.map((app) => (
                <div key={app._id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    {/* User Profile / Form Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                          {app.FullName?.slice(0, 2).toUpperCase() || "US"}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-950">{app.FullName}</h4>
                          <p className="text-xs text-slate-500">
                            Username: {app.UserId?.username || "Unknown"} &middot; Email: {app.UserId?.email || "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-x-6 gap-y-1.5 text-xs text-slate-600 sm:grid-cols-2">
                        <div>
                          <strong className="text-slate-700">DOB:</strong> {app.dateOfBirth}
                        </div>
                        <div>
                          <strong className="text-slate-700">Gender:</strong> {app.gender}
                        </div>
                        <div className="sm:col-span-2">
                          <strong className="text-slate-700">Address:</strong>{" "}
                          {app.permanentAddress
                            ? `${app.permanentAddress.street}, ${app.permanentAddress.city}, ${app.permanentAddress.state}, ${app.permanentAddress.postalCode}, ${app.permanentAddress.country}`
                            : "—"}
                        </div>
                        <div>
                          <strong className="text-slate-700">Document Type:</strong> {app.documentType}
                        </div>
                        <div>
                          <strong className="text-slate-700">Doc Number:</strong> {app.documentNumber}
                        </div>
                      </div>
                    </div>

                    {/* Doc Image Thumbnail & Actions */}
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center md:flex-col md:items-end">
                      {app.documentImg && (
                        <a
                          href={app.documentImg}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block size-20 overflow-hidden rounded-lg border border-slate-200"
                        >
                          <img
                            src={app.documentImg}
                            alt="Document"
                            className="size-full object-cover transition group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                            <Eye className="size-4 text-white" />
                          </div>
                        </a>
                      )}

                      <div className="flex gap-2">
                        {app.status === "Pending" ? (
                          <>
                            <button
                              onClick={() => handleApproveKyc(app.UserId?._id)}
                              disabled={submittingKyc}
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                            >
                              <CheckCircle2 className="size-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setRejectAppId(app._id);
                                setRejectUserId(app.UserId?._id);
                              }}
                              disabled={submittingKyc}
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-rose-600 px-4 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60 cursor-pointer"
                            >
                              <XCircle className="size-3.5" />
                              Reject
                            </button>
                          </>
                        ) : (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              app.status === "Approve"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {app.status === "Approve" ? "Approved" : "Rejected"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="p-6 space-y-4">
            {/* Search Input */}
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Search users by name/email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                    <th className="p-3">User</th>
                    <th className="p-3">KYC Status</th>
                    <th className="p-3">Accounts</th>
                    <th className="p-3">Total Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-slate-500">
                        No users found matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const totalBalance = u.accounts.reduce((s, a) => s + a.balance, 0);
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{u.username}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </td>
                          <td className="p-3">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                u.kycStatus === "Approve"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : u.kycStatus === "Pending"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {u.kycStatus}
                            </span>
                          </td>
                          <td className="p-3">
                            {u.accounts.length === 0 ? (
                              <span className="text-xs text-slate-400">No account opened</span>
                            ) : (
                              <div className="space-y-1">
                                {u.accounts.map((a) => (
                                  <div key={a.id} className="text-xs">
                                    <span className="font-semibold text-slate-700">
                                      {a.accountType}:
                                    </span>{" "}
                                    {currencyFormatter.format(a.balance)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-bold text-slate-950">
                            {currencyFormatter.format(totalBalance)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-950">Reject KYC Application</h3>
            <p className="mt-1 text-sm text-slate-500">
              Provide a clear reason why this user's KYC verification is being rejected.
            </p>

            <textarea
              className="mt-4 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              rows="3"
              placeholder="e.g. Identity document name does not match user account name."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectAppId(null);
                  setRejectUserId(null);
                  setRejectReason("");
                }}
                className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectKyc}
                disabled={submittingKyc || !rejectReason.trim()}
                className="h-9 rounded-lg bg-rose-600 px-4 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60 cursor-pointer"
              >
                {submittingKyc ? "Rejecting..." : "Reject KYC"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
