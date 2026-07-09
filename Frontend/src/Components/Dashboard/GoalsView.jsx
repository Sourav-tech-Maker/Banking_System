import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  PiggyBank,
  Target,
  Calendar,
  Plus,
  Trash2,
  Check,
  X,
  History,
  AlertCircle,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function GoalsView() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Create Goal Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "savings",
    targetAmount: "",
    currentAmount: "0",
    targetDate: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Add Funds State
  const [activeFundGoalId, setActiveFundGoalId] = useState(null);
  const [fundAmount, setFundAmount] = useState("");
  const [fundLoading, setFundLoading] = useState(false);

  // Goal History State
  const [activeHistoryGoal, setActiveHistoryGoal] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Categories helper
  const categories = [
    { value: "savings", label: "General Savings" },
    { value: "vacation", label: "Vacation" },
    { value: "emergency", label: "Emergency Fund" },
    { value: "education", label: "Education" },
    { value: "vehicle", label: "Vehicle" },
    { value: "home", label: "Home / Property" },
    { value: "electronics", label: "Gadgets / Electronics" },
  ];

  // Fetch Goals
  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/goals`, {
        withCredentials: true,
      });
      setGoals(res.data?.goals || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load savings goals."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Create Goal
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateLoading(true);

    try {
      await axios.post(
        `${API_BASE_URL}/api/goals`,
        {
          ...form,
          targetAmount: Number(form.targetAmount),
          currentAmount: Number(form.currentAmount || 0),
        },
        { withCredentials: true }
      );
      
      // Reset form and reload list
      setForm({
        title: "",
        category: "savings",
        targetAmount: "",
        currentAmount: "0",
        targetDate: "",
      });
      setShowCreateForm(false);
      fetchGoals();
    } catch (err) {
      setCreateError(
        err.response?.data?.message || "Failed to create savings goal."
      );
    } finally {
      setCreateLoading(false);
    }
  };

  // Delete Goal
  const handleDelete = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this savings goal?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/goals/${goalId}`, {
        withCredentials: true,
      });
      fetchGoals();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete goal.");
    }
  };

  // Add Funds (Contribute)
  const handleAddFunds = async (goalId) => {
    if (!fundAmount || Number(fundAmount) <= 0) return;
    setFundLoading(true);

    try {
      await axios.post(
        `${API_BASE_URL}/api/goals/add-amount`,
        {
          goalId,
          amount: Number(fundAmount),
          type: "manual",
        },
        { withCredentials: true }
      );
      
      setFundAmount("");
      setActiveFundGoalId(null);
      fetchGoals();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add funds.");
    } finally {
      setFundLoading(false);
    }
  };

  // Fetch Contribution History
  const handleViewHistory = async (goal) => {
    setActiveHistoryGoal(goal);
    setHistoryLoading(true);
    setHistoryLogs([]);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/goals/history/${goal._id}`,
        { withCredentials: true }
      );
      setHistoryLogs(res.data?.history || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load savings history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Savings Goals</h2>
          <p className="mt-1 text-sm text-slate-500">
            Plan, track, and secure your financial milestones.
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:bg-indigo-800"
          type="button"
        >
          {showCreateForm ? (
            <>
              <X className="size-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="size-4" />
              Create Goal
            </>
          )}
        </button>
      </div>

      {/* Main Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchGoals} className="ml-auto flex items-center gap-1 font-bold underline">
            <RefreshCw className="size-3" /> Retry
          </button>
        </div>
      )}

      {/* Goal Creation Form Card */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-md transition-all">
          <h3 className="text-lg font-bold text-slate-950 mb-4 flex items-center gap-2">
            <Target className="size-5 text-indigo-600" />
            Set a New Saving Goal
          </h3>

          {createError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
              <AlertCircle className="size-4 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Goal Title
              </label>
              <input
                type="text"
                placeholder="e.g., Summer Trip, Dream Car, Emergency Fund"
                required
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Category
                </label>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 bg-white"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  required
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500"
                  value={form.targetDate}
                  onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Target Amount
                </label>
                <input
                  type="number"
                  placeholder="₹ Target amount"
                  required
                  min="1"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500"
                  value={form.targetAmount}
                  onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Initial Saving (Optional)
                </label>
                <input
                  type="number"
                  placeholder="₹ Starting amount"
                  min="0"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500"
                  value={form.currentAmount}
                  onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={createLoading}
              className="w-full h-10 rounded-lg bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {createLoading ? "Creating Goal..." : "Set Goal"}
            </button>
          </div>
        </form>
      )}

      {/* Loading list state */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="size-8 animate-spin text-indigo-600" />
        </div>
      ) : goals.length === 0 ? (
        /* Empty State */
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 text-center shadow-sm">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
            <PiggyBank className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-950">No Savings Goals Set</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            You haven't defined any savings goals yet. Create one to lock in targets for travel, investments, or purchases!
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow transition hover:bg-indigo-700"
          >
            <Plus className="size-4" /> Set Your First Goal
          </button>
        </div>
      ) : (
        /* Goals list grid */
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const isFinished = goal.status === "completed";
            const percent = goal.progressPercentage || 0;
            const categoryLabel = categories.find((c) => c.value === goal.category)?.label || "Savings";

            return (
              <div
                key={goal._id}
                className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition duration-200"
              >
                {/* Visual completion top bar */}
                <div
                  className={`absolute inset-x-0 top-0 h-1 transition-all ${
                    isFinished ? "bg-emerald-500" : "bg-indigo-600"
                  }`}
                  style={{ width: `${percent}%` }}
                />

                {/* Card header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-950 truncate max-w-[180px]">{goal.title}</h4>
                    <span className="inline-block mt-0.5 text-xs text-slate-400 font-medium capitalize">
                      {categoryLabel}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(goal._id)}
                    className="p-1 rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete goal"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {/* Progress indicators */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-end text-xs">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {percent}% Completed
                    </span>
                    {isFinished && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        Achieved!
                      </span>
                    )}
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFinished
                          ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                          : "bg-gradient-to-r from-indigo-500 to-cyan-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 text-xs mb-4">
                  <div>
                    <p className="text-slate-400 font-medium">Saved Balance</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {currencyFormatter.format(goal.currentAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Target Amount</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {currencyFormatter.format(goal.targetAmount)}
                    </p>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-5">
                  <Calendar className="size-3.5" />
                  <span>Target Date: {new Date(goal.targetDate).toLocaleDateString()}</span>
                </div>

                {/* Contribution field toggles */}
                {activeFundGoalId === goal._id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="₹ Amount to add"
                      min="1"
                      className="h-9 flex-1 rounded-md border border-slate-200 px-2 text-xs outline-none focus:border-indigo-500 bg-white text-slate-900"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                    />
                    <button
                      onClick={() => handleAddFunds(goal._id)}
                      disabled={fundLoading || !fundAmount}
                      className="flex size-9 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      <Check className="size-4" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveFundGoalId(null);
                        setFundAmount("");
                      }}
                      className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveFundGoalId(goal._id)}
                      className="flex-1 h-9 rounded-md border border-indigo-200 text-indigo-600 font-semibold text-xs transition hover:bg-indigo-50/50 flex items-center justify-center gap-1.5"
                    >
                      <Plus className="size-3.5" /> Add Funds
                    </button>
                    <button
                      onClick={() => handleViewHistory(goal)}
                      className="h-9 w-10 shrink-0 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 transition flex items-center justify-center"
                      title="View saving logs"
                    >
                      <History className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* History Log Drawer Modal */}
      {activeHistoryGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              onClick={() => setActiveHistoryGoal(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition"
            >
              <X className="size-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-950 mb-2 flex items-center gap-2">
              <History className="size-5 text-indigo-600" />
              Saving Logs
            </h3>
            <p className="text-xs text-slate-400 mb-4 truncate font-semibold">
              Goal: {activeHistoryGoal.title}
            </p>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1">
              {historyLoading ? (
                <div className="flex h-24 items-center justify-center">
                  <RefreshCw className="size-6 animate-spin text-indigo-600" />
                </div>
              ) : historyLogs.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No deposit logs registered yet.</p>
              ) : (
                historyLogs.map((log) => (
                  <div key={log._id} className="flex justify-between items-center py-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">
                        +{currencyFormatter.format(log.amountAdded)}
                      </p>
                      <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                        Source: {log.type}
                      </p>
                    </div>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setActiveHistoryGoal(null)}
              className="w-full mt-5 h-9 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
