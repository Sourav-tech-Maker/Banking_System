import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AlertCircle, RefreshCw, Send, X } from "lucide-react";
import { useLocation } from "react-router-dom";

import AppSidebar from "../app-sidebar";
import AIInsights from "./AIInsights";
import Navbar from "./Navbar";
import RecentTransactions from "./RecentTransactions";
import SpendingChart from "./SpendingChart";
import StatsCards from "./StatsCards";
import TransactionHistory from "./TransactionHistory";
import OpenAccount from "./OpenAccount";
import KYCVerification from "./KYCVerification";
import AdminPanel from "./AdminPanel";
import ProfileView from "./ProfileView";
import SettingsView from "./SettingsView";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const emptyDashboard = {
  user: {},
  summary: {
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    nexoraCoins: 0,
    totalAccounts: 0,
    notificationCount: 0,
    balanceChange: 0,
    incomeChange: 0,
    expenseChange: 0,
    coinsChange: 0,
  },
  recentTransactions: [],
  analytics: {
    totalExpense: 0,
    categories: [],
  },
  aiInsights: {
    headline: "Your activity is ready to grow",
    message: "Live insights appear as your Nexora account activity grows.",
    savingsPotential: 0,
    items: [],
  },
};

function readStoredUser() {
  try {
    return JSON.parse(sessionStorage.getItem("nexoraUser")) || {};
  } catch {
    return {};
  }
}

function mergeDashboard(payload) {
  return {
    ...emptyDashboard,
    ...payload,
    summary: {
      ...emptyDashboard.summary,
      ...(payload?.summary || {}),
    },
    analytics: {
      ...emptyDashboard.analytics,
      ...(payload?.analytics || {}),
    },
    aiInsights: {
      ...emptyDashboard.aiInsights,
      ...(payload?.aiInsights || {}),
      items: payload?.aiInsights?.items || emptyDashboard.aiInsights.items,
    },
    recentTransactions: payload?.recentTransactions || [],
  };
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className="h-32 animate-pulse rounded-lg border border-slate-200 bg-white shadow-sm"
            key={index}
          />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <div className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white shadow-sm" />
        <div className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white shadow-sm" />
      </div>
    </div>
  );
}

const Home = () => {
  const location = useLocation();
  const storedUser = useMemo(() => readStoredUser(), []);
  const fallbackUser = useMemo(
    () => ({
      ...storedUser,
      email: storedUser.email || location.state?.email,
    }),
    [location.state?.email, storedUser],
  );

  const [dashboard, setDashboard] = useState(() => ({
    ...emptyDashboard,
    user: fallbackUser,
  }));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState("dashboard");

  // Send Money modal state
  const [showSendModal, setShowSendModal] = useState(false);
  const [userAccounts, setUserAccounts] = useState([]);
  const [sendForm, setSendForm] = useState({
    FromAccount: "",
    toAccount: "",
    amount: "",
  });
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  // Fetch user accounts for the FromAccount dropdown
  const fetchAccounts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/account`, {
        withCredentials: true,
      });
      const accounts = res.data?.accounts || [];
      setUserAccounts(accounts);
      if (accounts.length === 1) {
        setSendForm((prev) => ({ ...prev, FromAccount: accounts[0]._id }));
      }
    } catch {
      // Silently fail — accounts will show empty
    }
  }, []);

  const handleSendMoney = async (e) => {
    e.preventDefault();
    setSendLoading(true);
    setSendError("");
    setSendSuccess("");

    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await axios.post(
        `${API_BASE_URL}/api/transaction`,
        {
          FromAccount: sendForm.FromAccount,
          toAccount: sendForm.toAccount,
          amount: Number(sendForm.amount),
          idempotencyKey,
        },
        { withCredentials: true }
      );
      setSendSuccess(res.data?.message || "Transaction successful!");
      setSendForm({ FromAccount: userAccounts.length === 1 ? userAccounts[0]._id : "", toAccount: "", amount: "" });
      // Refresh dashboard after successful transaction
      fetchDashboard();
    } catch (err) {
      setSendError(err.response?.data?.message || "Transaction failed. Please try again.");
    } finally {
      setSendLoading(false);
    }
  };

  const openSendModal = () => {
    setSendError("");
    setSendSuccess("");
    setShowSendModal(true);
    fetchAccounts();
  };

  const fetchDashboard = useCallback(async () => {
    setError("");
    setRefreshing(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/dashboard`, {
        withCredentials: true,
      });
      setDashboard(mergeDashboard(response.data));
    } catch (requestError) {
      // Fallback: try to build dashboard from account data
      try {
        const accountsResponse = await axios.get(`${API_BASE_URL}/api/account`, {
          withCredentials: true,
        });
        const accounts = accountsResponse.data?.accounts || [];
        const accountsWithBalance = await Promise.all(
          accounts.map(async (account) => {
            try {
              const balanceResponse = await axios.get(
                `${API_BASE_URL}/api/account/balance/${account._id}`,
                { withCredentials: true },
              );
              return { ...account, balance: balanceResponse.data?.balance || 0 };
            } catch {
              return { ...account, balance: 0 };
            }
          }),
        );

        const totalBalance = accountsWithBalance.reduce(
          (total, acc) => total + Number(acc.balance || 0), 0
        );
        const activeAccounts = accountsWithBalance.filter(a => a.status === "Active").length;

        setDashboard(mergeDashboard({
          user: fallbackUser,
          summary: {
            totalBalance,
            totalAccounts: accounts.length,
            nexoraCoins: Math.floor(totalBalance / 1000) + activeAccounts * 50,
            notificationCount: accounts.length === 0 ? 1 : 0,
          },
          aiInsights: {
            headline: accounts.length ? "Accounts connected" : "Create your first account",
            message: accounts.length
              ? "Your balance and rewards are updating from live account data."
              : "Complete KYC and open an account to see personalized insights.",
            items: [],
          },
        }));
      } catch {
        setError(
          requestError.response?.status === 401
            ? "Please log in again to view your live dashboard."
            : "Live dashboard data is unavailable right now.",
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fallbackUser]);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchDashboard, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchDashboard]);

  const renderContent = () => {
    switch (activeView) {
      case "transactions":
        return <TransactionHistory />;
      case "open-account":
        return <OpenAccount />;
      case "kyc":
        return <KYCVerification />;
      case "admin":
        return <AdminPanel />;
      case "profile":
        return <ProfileView />;
      case "settings":
        return <SettingsView />;
      default:
        return (
          <>
            {error && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 font-semibold text-amber-900 shadow-sm ring-1 ring-amber-200 transition hover:bg-amber-100"
                  onClick={fetchDashboard}
                  type="button"
                >
                  <RefreshCw className="size-4" />
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <DashboardSkeleton />
            ) : (
              <>
                {/* Send Money Button */}
                <div className="flex items-center justify-between">
                  <div />
                  <button
                    type="button"
                    onClick={openSendModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:bg-indigo-800"
                  >
                    <Send className="size-4" />
                    Send Money
                  </button>
                </div>

                <StatsCards summary={dashboard.summary} />

                <section className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
                  <RecentTransactions
                    transactions={dashboard.recentTransactions}
                    onViewAll={() => setActiveView("transactions")}
                  />
                  <AIInsights insights={dashboard.aiInsights} />
                </section>

                <SpendingChart analytics={dashboard.analytics} />
              </>
            )}
          </>
        );
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar
        activeView={activeView}
        onNavigate={setActiveView}
        notificationCount={dashboard.summary.notificationCount}
      />

      <SidebarInset className="min-h-screen bg-[#F5F7FB]">
        <Navbar
          user={dashboard.user}
          notificationCount={dashboard.summary.notificationCount}
          onRefresh={fetchDashboard}
          refreshing={refreshing}
          onNavigate={setActiveView}
        />

        <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          {renderContent()}
        </main>
      </SidebarInset>

      {/* Send Money Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowSendModal(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="size-5" />
            </button>

            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <Send className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Send Money</h2>
                <p className="text-sm text-slate-500">Transfer funds to another account</p>
              </div>
            </div>

            {sendSuccess && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {sendSuccess}
              </div>
            )}
            {sendError && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {sendError}
              </div>
            )}

            <form onSubmit={handleSendMoney} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">From Account</label>
                {userAccounts.length === 0 ? (
                  <p className="text-sm text-slate-500">No accounts found. Please open an account first.</p>
                ) : userAccounts.length === 1 ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                    {userAccounts[0].accountType} — A/C {String(userAccounts[0]._id).slice(-6).toUpperCase()}
                  </div>
                ) : (
                  <select
                    value={sendForm.FromAccount}
                    onChange={(e) => setSendForm((prev) => ({ ...prev, FromAccount: e.target.value }))}
                    required
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Select account</option>
                    {userAccounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.accountType} — A/C {String(acc._id).slice(-6).toUpperCase()}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">To Account ID</label>
                <input
                  type="text"
                  value={sendForm.toAccount}
                  onChange={(e) => setSendForm((prev) => ({ ...prev, toAccount: e.target.value }))}
                  required
                  placeholder="Enter recipient account ID"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={sendForm.amount}
                  onChange={(e) => setSendForm((prev) => ({ ...prev, amount: e.target.value }))}
                  required
                  placeholder="Enter amount"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendLoading || userAccounts.length === 0 || !sendForm.FromAccount}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sendLoading ? "Processing..." : "Send Money"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
};

export default Home;
