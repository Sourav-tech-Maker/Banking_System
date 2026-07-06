import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Activity,
  AlertCircle,
  Bell,
  Bot,
  ChartNoAxesCombined,
  CheckCircle2,
  Coins,
  Download,
  Eye,
  FileText,
  Landmark,
  Loader2,
  LockKeyhole,
  ReceiptText,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-IN");

function getStatusStyle(status) {
  if (status === "Approve" || status === "Active" || status === "Live") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (status === "Pending" || status === "Partial") {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  if (status === "Rejected" || status === "Frozen" || status === "Closed") {
    return "bg-rose-50 text-rose-700 ring-rose-200";
  }

  return "bg-slate-100 text-slate-600 ring-slate-200";
}

function formatDate(dateValue) {
  if (!dateValue) return "Not available";

  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [kycApps, setKycApps] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const [rejectAppId, setRejectAppId] = useState(null);
  const [rejectUserId, setRejectUserId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submittingKyc, setSubmittingKyc] = useState(false);
  const [deletingKycId, setDeletingKycId] = useState(null);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [statsRes, kycRes, usersRes, txsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/stats`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/admin/kyc-applications`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/admin/users`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/admin/transactions`, { withCredentials: true }).catch(() => ({ data: { transactions: [] } })),
      ]);

      setStats(statsRes.data.stats);
      setKycApps(kycRes.data.applications);
      setUsers(usersRes.data.users);
      setTransactions(txsRes.data.transactions || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin panel data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateUserStatus = async (userId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/status`, { status }, { withCredentials: true });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user status.");
    }
  };

  const handleResetUserLogins = async (userId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/admin/users/${userId}/reset-attempts`, {}, { withCredentials: true });
      alert("Failed login attempts and lock reset successfully.");
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset login attempts.");
    }
  };

  const handleUpdateAccountStatus = async (accountId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/accounts/${accountId}/status`, { status }, { withCredentials: true });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update account status.");
    }
  };

  const handleReverseTransaction = async (transactionId) => {
    if (!window.confirm("Are you sure you want to reverse this transaction? This will debit the receiver and credit the sender.")) {
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/admin/transactions/${transactionId}/reverse`, {}, { withCredentials: true });
      alert("Transaction reversed successfully.");
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reverse transaction.");
    }
  };

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

  const handleDeleteKyc = async (kycId) => {
    if (!window.confirm("Are you sure you want to permanently delete this KYC application? This action cannot be undone.")) {
      return;
    }

    setDeletingKycId(kycId);

    try {
      await axios.delete(
        `${API_BASE_URL}/api/admin/kyc/${kycId}`,
        { withCredentials: true }
      );
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete KYC application.");
    } finally {
      setDeletingKycId(null);
    }
  };

  const totalUsers = stats?.totalUsers || users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const verifiedUsers = users.filter((u) => u.verified).length;
  const pendingKyc = stats?.kyc?.pending || kycApps.filter((app) => app.status === "Pending").length;
  const approvedKyc = stats?.kyc?.approved || kycApps.filter((app) => app.status === "Approve").length;
  const rejectedKyc = stats?.kyc?.rejected || kycApps.filter((app) => app.status === "Rejected").length;
  const totalAccounts = stats?.totalAccounts || users.reduce((sum, userItem) => sum + userItem.accounts.length, 0);
  const totalTransactions = stats?.totalTransactions || 0;
  const systemBalance = stats?.totalSystemBalance || 0;
  const totalUserBalance = users.reduce((total, userItem) => {
    const userBalance = userItem.accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
    return total + userBalance;
  }, 0);

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      String(u.kycStatus || "").toLowerCase().includes(query)
    );
  });

  const filteredKycApps = kycApps.filter((app) => {
    const query = searchQuery.toLowerCase();
    return (
      String(app.FullName || "").toLowerCase().includes(query) ||
      String(app.documentType || "").toLowerCase().includes(query) ||
      String(app.documentNumber || "").toLowerCase().includes(query) ||
      String(app.UserId?.email || "").toLowerCase().includes(query)
    );
  });

  const filteredModules = [
    {
      title: "Dashboard",
      status: "Live",
      icon: ChartNoAxesCombined,
      text: "Users, accounts, KYC, transactions, liquidity, and system health.",
      items: ["Total users", "Pending KYC", "Daily transactions", "System health"],
    },
    {
      title: "User Management",
      status: "Live",
      icon: Users,
      text: "Search users, review profiles, check accounts, and see KYC status.",
      items: ["User registry", "Account details", "KYC status", "Risk check"],
    },
    {
      title: "KYC Management",
      status: "Live",
      icon: ShieldCheck,
      text: "Review submitted documents, approve applications, or reject with reason.",
      items: ["View documents", "Approve KYC", "Reject KYC", "Submission details"],
    },
    {
      title: "Account Management",
      status: "Partial",
      icon: Landmark,
      text: "Account list and balances are visible. Freeze or close APIs are still needed.",
      items: ["Account balance", "Account status", "Freeze account", "Statement"],
    },
    {
      title: "Transaction Management",
      status: "Partial",
      icon: ReceiptText,
      text: "System transaction count is visible. Detail search and reversal APIs are still needed.",
      items: ["Search", "Filter", "Flag suspicious", "Export reports"],
    },
    {
      title: "AI Monitoring",
      status: "Planned",
      icon: Bot,
      text: "Fraud alerts, risk score, suspicious logins, and device change review.",
      items: ["Fraud alerts", "Risk score", "Suspicious login", "Investigation"],
    },
    {
      title: "NEXORA Coins",
      status: "Planned",
      icon: Coins,
      text: "Coin balances, redemption approvals, and reward history.",
      items: ["Earned coins", "Redeemed coins", "Redemption request", "Coin history"],
    },
    {
      title: "Notification Center",
      status: "Planned",
      icon: Bell,
      text: "Send maintenance, security, and promotional notifications.",
      items: ["All users", "Selected users", "Security alerts", "Promotions"],
    },
    {
      title: "Analytics",
      status: "Partial",
      icon: TrendingUp,
      text: "User growth, KYC rate, revenue, and transaction analytics.",
      items: ["Active users", "Revenue", "KYC rate", "Fraud stats"],
    },
    {
      title: "Audit Logs",
      status: "Planned",
      icon: FileText,
      text: "Admin actions, login history, IP tracking, and success or failure status.",
      items: ["Action history", "Device info", "Timestamp", "IP address"],
    },
    {
      title: "System Settings",
      status: "Planned",
      icon: Settings,
      text: "Configure KYC rules, transaction limits, and security settings.",
      items: ["KYC rules", "OTP expiry", "Transaction limits", "Maintenance mode"],
    },
    {
      title: "Fraud Center",
      status: "Planned",
      icon: LockKeyhole,
      text: "Investigate high-risk users, rapid transactions, and location mismatches.",
      items: ["High risk users", "Failed logins", "Freeze account", "Warnings"],
    },
    {
      title: "Reports",
      status: "Planned",
      icon: Download,
      text: "Generate daily, weekly, monthly, user, KYC, and revenue reports.",
      items: ["PDF", "Excel", "CSV", "Monthly report"],
    },
    {
      title: "Global Search",
      status: "Live",
      icon: Search,
      text: "Search users and KYC records from one admin search box.",
      items: ["Users", "Accounts", "Transactions", "KYC records"],
    },
    {
      title: "Admin Profile",
      status: "Planned",
      icon: User,
      text: "Admin profile, password change, two-factor auth, sessions, and logout.",
      items: ["Profile", "2FA", "Sessions", "Dark mode"],
    },
  ].filter((moduleItem) => moduleItem.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const summaryCards = [
    {
      label: "Total Users",
      value: numberFormatter.format(totalUsers),
      detail: `${numberFormatter.format(activeUsers)} active users`,
      icon: Users,
      iconClass: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Pending KYC",
      value: numberFormatter.format(pendingKyc),
      detail: `${numberFormatter.format(approvedKyc)} approved, ${numberFormatter.format(rejectedKyc)} rejected`,
      icon: ShieldCheck,
      iconClass: "bg-amber-50 text-amber-700",
    },
    {
      label: "Bank Accounts",
      value: numberFormatter.format(totalAccounts),
      detail: `${numberFormatter.format(verifiedUsers)} verified users`,
      icon: Landmark,
      iconClass: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Transactions",
      value: numberFormatter.format(totalTransactions),
      detail: "All time transaction records",
      icon: ReceiptText,
      iconClass: "bg-sky-50 text-sky-700",
    },
    {
      label: "System Liquidity",
      value: currencyFormatter.format(systemBalance),
      detail: "Total balance in all accounts",
      icon: Wallet,
      iconClass: "bg-violet-50 text-violet-700",
    },
    {
      label: "System Health",
      value: "Online",
      detail: "Admin services responding",
      icon: Activity,
      iconClass: "bg-emerald-50 text-emerald-700",
    },
  ];

  const chartCards = [
    {
      title: "Daily Transaction Volume",
      value: totalTransactions,
      percent: Math.min(100, totalTransactions * 8),
    },
    {
      title: "User Growth",
      value: totalUsers,
      percent: Math.min(100, totalUsers * 12),
    },
    {
      title: "KYC Approval Rate",
      value: approvedKyc,
      percent: kycApps.length ? Math.round((approvedKyc / kycApps.length) * 100) : 0,
    },
    {
      title: "Fraud Detection Trend",
      value: 0,
      percent: 0,
    },
  ];

  const quickActions = [
    {
      label: "Approve Pending KYC",
      icon: CheckCircle2,
      action: () => setActiveTab("kyc"),
      disabled: false,
    },
    {
      label: "Generate Reports",
      icon: Download,
      action: () => setActiveTab("reports"),
      disabled: false,
    },
    {
      label: "View Users",
      icon: Users,
      action: () => setActiveTab("users"),
      disabled: false,
    },
    {
      label: "View Transactions",
      icon: ReceiptText,
      action: () => setActiveTab("transactions"),
      disabled: false,
    },
  ];

  const reportCards = [
    "Daily Report",
    "Weekly Report",
    "Monthly Report",
    "Transaction Report",
    "User Report",
    "KYC Report",
    "Revenue Report",
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">NEXORA Back Office</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">Admin Control Panel</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            Manage users, verify KYC documents, monitor platform activity, and prepare the next admin modules.
          </p>
        </div>

        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          onClick={fetchAdminData}
          type="button"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={card.label}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <h3 className="mt-2 wrap-break-words text-2xl font-bold text-slate-950">{card.value}</h3>
                <p className="mt-1 text-xs text-slate-500">{card.detail}</p>
              </div>
              <div className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}>
                <card.icon className="size-6" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_.6fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Global Search</h3>
              <p className="text-sm text-slate-500">Search modules, users, KYC records, and document numbers.</p>
            </div>
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Search admin data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">Quick Actions</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {quickActions.map((item) => (
              <button
                className="inline-flex h-10 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={item.disabled}
                key={item.label}
                onClick={item.action}
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  <item.icon className="size-4" />
                  {item.label}
                </span>
                {item.disabled && <span className="text-xs text-slate-400">Soon</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {[
          { id: "overview", label: "Dashboard" },
          { id: "kyc", label: `KYC Management (${pendingKyc})` },
          { id: "users", label: `User Management (${users.length})` },
          { id: "transactions", label: "Transactions" },
          { id: "reports", label: "Reports & Settings" },
        ].map((tab) => (
          <button
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-5">
          <section className="grid gap-4 lg:grid-cols-4">
            {chartCards.map((item) => (
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={item.title}>
                <p className="text-sm font-bold text-slate-950">{item.title}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{numberFormatter.format(item.value)} records</span>
                  <span>{item.percent}%</span>
                </div>
              </div>
            ))}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-950">Admin Modules</h3>
                <p className="text-sm text-slate-500">All modules from the admin panel feature document.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {filteredModules.map((moduleItem) => (
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={moduleItem.title}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <moduleItem.icon className="size-5" />
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[11px] font-bold ring-1 ${getStatusStyle(moduleItem.status)}`}>
                      {moduleItem.status}
                    </span>
                  </div>
                  <h4 className="mt-4 font-bold text-slate-950">{moduleItem.title}</h4>
                  <p className="mt-2 text-sm leading-5 text-slate-500">{moduleItem.text}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {moduleItem.items.map((item) => (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === "kyc" && (
        <section className="space-y-4">
          {filteredKycApps.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
              No KYC applications found.
            </div>
          ) : (
            filteredKycApps.map((app) => (
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={app._id}>
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-700">
                        {app.FullName?.slice(0, 2).toUpperCase() || "KY"}
                      </span>
                      <div className="min-w-0">
                        <h4 className="truncate font-bold text-slate-950">{app.FullName}</h4>
                        <p className="truncate text-xs text-slate-500">
                          {app.UserId?.username || "Unknown user"} - {app.UserId?.email || "No email"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">DOB</p>
                        <p className="font-semibold text-slate-800">{app.dateOfBirth}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">Gender</p>
                        <p className="font-semibold text-slate-800">{app.gender}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">Status</p>
                        <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${getStatusStyle(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">Document Type</p>
                        <p className="font-semibold text-slate-800">{app.documentType}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">Document Number</p>
                        <p className="font-semibold text-slate-800">{app.documentNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">Submitted</p>
                        <p className="font-semibold text-slate-800">{formatDate(app.createdAt)}</p>
                      </div>
                      <div className="sm:col-span-2 xl:col-span-3">
                        <p className="text-xs font-semibold uppercase text-slate-400">Permanent Address</p>
                        <p className="font-semibold leading-6 text-slate-800">
                          {app.permanentAddress
                            ? `${app.permanentAddress.street}, ${app.permanentAddress.city}, ${app.permanentAddress.state}, ${app.permanentAddress.postalCode}, ${app.permanentAddress.country}`
                            : "Not available"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row xl:w-64 xl:flex-col">
                    {app.documentImg && (
                      <a
                        className="group relative block h-36 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 xl:h-44"
                        href={app.documentImg}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <img
                          alt="KYC document"
                          className="size-full object-cover transition group-hover:scale-105"
                          src={app.documentImg}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                          <Eye className="size-5 text-white" />
                        </div>
                      </a>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {app.documentImg && (
                        <a
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          href={app.documentImg}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <Eye className="size-3.5" />
                          View Document
                        </a>
                      )}

                      {app.status === "Pending" ? (
                        <>
                          <button
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                            disabled={submittingKyc}
                            onClick={() => handleApproveKyc(app.UserId?._id)}
                            type="button"
                          >
                            <CheckCircle2 className="size-3.5" />
                            Approve
                          </button>
                          <button
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-rose-600 px-3 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                            disabled={submittingKyc}
                            onClick={() => {
                              setRejectAppId(app._id);
                              setRejectUserId(app.UserId?._id);
                            }}
                            type="button"
                          >
                            <XCircle className="size-3.5" />
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <span className={`inline-flex h-9 items-center rounded-lg px-3 text-xs font-bold ring-1 ${getStatusStyle(app.status)}`}>
                            {app.status === "Approve" ? "Approved" : "Rejected"}
                          </span>
                          <button
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-600 px-3 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
                            disabled={deletingKycId === app._id}
                            onClick={() => handleDeleteKyc(app._id)}
                            type="button"
                          >
                            <Trash2 className="size-3.5" />
                            {deletingKycId === app._id ? "Deleting..." : "Delete"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === "users" && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">User Registry</h3>
              <p className="text-sm text-slate-500">View users, KYC status, accounts, balances, and risk check.</p>
            </div>
            <span className="text-sm font-semibold text-slate-500">
              Total balance: {currencyFormatter.format(totalUserBalance)}
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full `min-w-215` border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <th className="p-3">User</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">KYC</th>
                  <th className="p-3">Accounts</th>
                  <th className="p-3">Total Balance</th>
                  <th className="p-3">Risk Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td className="p-4 text-center text-slate-500" colSpan="6">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const totalBalance = u.accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
                    const riskText = u.kycStatus === "Approve" && u.status === "Active" ? "Low" : "Review";

                    return (
                      <tr className="hover:bg-slate-50/70" key={u.id}>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{u.username}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                          <p className="mt-1 text-xs text-slate-400">Joined {formatDate(u.createdAt)}</p>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1.5">
                            <select
                              value={u.status}
                              onChange={(e) => handleUpdateUserStatus(u.id, e.target.value)}
                              className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                            >
                              <option value="Active">Active</option>
                              <option value="Suspended">Suspended</option>
                              <option value="Locked">Locked</option>
                            </select>
                            <button
                              onClick={() => handleResetUserLogins(u.id)}
                              className="w-fit text-left text-[10px] font-semibold text-indigo-600 hover:text-indigo-800"
                              type="button"
                            >
                              Reset Lock
                            </button>
                            <span className="text-[10px] text-slate-500">
                              {u.verified ? "Email verified" : "Email pending"}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${getStatusStyle(u.kycStatus)}`}>
                            {u.kycStatus}
                          </span>
                        </td>
                        <td className="p-3">
                          {u.accounts.length === 0 ? (
                            <span className="text-xs text-slate-400">No account opened</span>
                          ) : (
                            <div className="space-y-3">
                              {u.accounts.map((a) => (
                                <div className="flex flex-col gap-1 text-xs border-b border-slate-100 pb-2 last:border-b-0 last:pb-0" key={a.id}>
                                  <div>
                                    <span className="font-semibold text-slate-700">{a.accountType}</span>
                                    <span className="text-slate-400"> - </span>
                                    <span>{currencyFormatter.format(a.balance)}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <select
                                      value={a.status}
                                      onChange={(e) => handleUpdateAccountStatus(a.id, e.target.value)}
                                      className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 focus:border-indigo-400 focus:outline-none"
                                    >
                                      <option value="Active">Active</option>
                                      <option value="Frozen">Frozen</option>
                                      <option value="Closed">Closed</option>
                                    </select>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-bold text-slate-950">
                          {currencyFormatter.format(totalBalance)}
                        </td>
                        <td className="p-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${riskText === "Low" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-amber-200"}`}>
                            {riskText}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "transactions" && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-950">System Transactions</h3>
            <p className="text-sm text-slate-500">Monitor all transactions and reverse completed transfers if necessary.</p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full `min-w-215` border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <th className="p-3">Date</th>
                  <th className="p-3">Sender</th>
                  <th className="p-3">Receiver</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td className="p-4 text-center text-slate-500" colSpan="6">
                      No transactions recorded in the system.
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => {
                    const fromUser = txn.FromAccount?.user?.username || "Unknown Sender";
                    const toUser = txn.toAccount?.user?.username || "Unknown Receiver";
                    return (
                      <tr className="hover:bg-slate-50/70" key={txn._id || txn.id}>
                        <td className="p-3 text-xs text-slate-500">
                          {formatDate(txn.createdAt)}
                          <p className="mt-0.5 text-[10px] text-slate-400 font-mono">{txn._id || txn.id}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{fromUser}</p>
                          <p className="text-[10px] text-slate-400 font-mono">A/C ...{String(txn.FromAccount?._id || "").slice(-6).toUpperCase()}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{toUser}</p>
                          <p className="text-[10px] text-slate-400 font-mono">A/C ...{String(txn.toAccount?._id || "").slice(-6).toUpperCase()}</p>
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {currencyFormatter.format(txn.amount)}
                        </td>
                        <td className="p-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
                            txn.status === "Completed" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" :
                            txn.status === "Pending" ? "bg-amber-50 text-amber-700 ring-amber-200" :
                            txn.status === "Reversed" ? "bg-violet-50 text-violet-700 ring-violet-200" :
                            "bg-rose-50 text-rose-700 ring-rose-200"
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {txn.status === "Completed" ? (
                            <button
                              onClick={() => handleReverseTransaction(txn._id || txn.id)}
                              className="rounded bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 cursor-pointer"
                              type="button"
                            >
                              Reverse
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "reports" && (
        <div className="space-y-5">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {reportCards.map((report) => (
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={report}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-950">{report}</h4>
                    <p className="mt-1 text-xs text-slate-500">PDF, Excel, CSV</p>
                  </div>
                  <FileText className="size-5 text-slate-400" />
                </div>
              </div>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-slate-950">Audit Logs</h3>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-slate-900">Admin opened control panel</p>
                  <p className="text-xs text-slate-500">Status: success - Timestamp: now</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-slate-900">KYC queue checked</p>
                  <p className="text-xs text-slate-500">{pendingKyc} pending requests</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-slate-900">User registry loaded</p>
                  <p className="text-xs text-slate-500">{users.length} users available</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-slate-950">System Settings</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "KYC verification rules",
                  "Coin conversion rate",
                  "Transaction limits",
                  "AI fraud threshold",
                  "Maintenance mode",
                  "OTP expiry time",
                  "Session timeout",
                ].map((setting) => (
                  <div className="rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-700" key={setting}>
                    {setting}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {rejectAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-950">Reject KYC Application</h3>
            <p className="mt-1 text-sm text-slate-500">
              Write the reason so the user knows what needs to be fixed.
            </p>

            <textarea  className="mt-4 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
             onChange={(e) => setRejectReason(e.target.value)} 
            placeholder="Example: Document name does not match account name."
              rows="3"
              value={rejectReason}
            />

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => {
                  setRejectAppId(null);
                  setRejectUserId(null);
                  setRejectReason("");
                }}
                type="button"
              >
                Cancel
              </button>
              <button
                className="h-9 rounded-lg bg-rose-600 px-4 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                disabled={submittingKyc || !rejectReason.trim()}
                onClick={handleRejectKyc}
                type="button"
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
