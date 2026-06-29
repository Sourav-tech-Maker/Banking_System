import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useLocation } from "react-router-dom";

import AppSidebar from "../app-sidebar";
import AIInsights from "./AIInsights";
import Navbar from "./Navbar";
import RecentTransactions from "./RecentTransactions";
import SpendingChart from "./SpendingChart";
import StatsCards from "./StatsCards";
import WeeklyQuiz from "./WeeklyQuiz";
import TransactionHistory from "./TransactionHistory";
import OpenAccount from "./OpenAccount";
import KYCVerification from "./KYCVerification";
import AdminPanel from "./AdminPanel";
import ProfileView from "./ProfileView";
import SettingsView from "./SettingsView";
import WeeklyTechQuiz from "./WeeklyTechQuiz";

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
  weeklyQuiz: {
    title: "Weekly Tech Quiz",
    entryFee: 5,
    prizePool: 100,
    participants: 0,
    status: "locked",
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
    weeklyQuiz: {
      ...emptyDashboard.weeklyQuiz,
      ...(payload?.weeklyQuiz || {}),
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
      case "quiz":
        return (
          <WeeklyTechQuiz
            quiz={dashboard.weeklyQuiz}
            onBack={() => setActiveView("dashboard")}
          />
        );
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
                <StatsCards summary={dashboard.summary} />

                <section className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
                  <RecentTransactions
                    transactions={dashboard.recentTransactions}
                    onViewAll={() => setActiveView("transactions")}
                  />
                  <AIInsights insights={dashboard.aiInsights} />
                </section>

                <section className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
                  <SpendingChart analytics={dashboard.analytics} />
                  <WeeklyQuiz
                    quiz={dashboard.weeklyQuiz}
                    onStart={() => setActiveView("quiz")}
                  />
                </section>
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
    </SidebarProvider>
  );
};

export default Home;
