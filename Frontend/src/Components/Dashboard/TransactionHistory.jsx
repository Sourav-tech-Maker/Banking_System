import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  ReceiptText,
  Search,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function formatAccountParty(account, fallbackId) {
  if (!account || typeof account === "string") {
    const id = account || fallbackId || "";
    return {
      holderName: "Unknown account holder",
      shortAccountId: id ? `A/C ${String(id).slice(-6).toUpperCase()}` : "Unknown account",
      email: "",
    };
  }

  return {
    holderName: account.holderName || "Account holder",
    shortAccountId: account.shortAccountId || (account.id ? `A/C ${String(account.id).slice(-6).toUpperCase()}` : "Account"),
    email: account.email || "",
  };
}

function getStatusClass(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "completed") return "bg-emerald-50 text-emerald-700";
  if (normalized === "failed") return "bg-rose-50 text-rose-700";

  return "bg-amber-50 text-amber-700";
}

/* ─── Skeleton ─── */
function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          className="flex items-center gap-4 rounded-lg border border-slate-100 bg-white px-4 py-4"
          key={i}
        >
          <div className="size-10 animate-pulse rounded-lg bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="space-y-2 text-right">
            <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-200" />
            <div className="ml-auto h-3 w-16 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Component ─── */
export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* Filters */
  const [type, setType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  /* Client-side search */
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        type,
      });
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const response = await axios.get(
        `${API_BASE_URL}/api/transaction/history?${params.toString()}`,
        { withCredentials: true },
      );

      setTransactions(response.data?.transactions || []);
      setPagination(response.data?.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Session expired — please log in again."
          : err.response?.data?.message || "Failed to load transactions.",
      );
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [page, type, startDate, endDate]);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchTransactions, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchTransactions]);

  /* Reset to page 1 when filters change */
  const applyFilters = () => setPage(1);

  /* Client-side filtering by search query */
  const displayed = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (t) => {
        const fromParty = formatAccountParty(t.fromAccount || t.FromAccount, t.fromAccountId);
        const toParty = formatAccountParty(t.toAccount, t.toAccountId);

        return (
          (t.idempotencyKey && t.idempotencyKey.toLowerCase().includes(q)) ||
          String(t.amount).includes(q) ||
          fromParty.holderName.toLowerCase().includes(q) ||
          toParty.holderName.toLowerCase().includes(q) ||
          fromParty.shortAccountId.toLowerCase().includes(q) ||
          toParty.shortAccountId.toLowerCase().includes(q)
        );
      },
    );
  }, [transactions, searchQuery]);

  /* Summary stats for current page */
  const stats = useMemo(() => {
    const credits = displayed
      .filter((t) => t.type === "credit" || t.direction === "credit")
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const debits = displayed
      .filter((t) => t.type === "debit" || t.direction === "debit")
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    return { credits, debits, net: credits - debits };
  }, [displayed]);

  return (
    <div className="space-y-5">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Transaction History</h2>
          <p className="mt-1 text-sm text-slate-500">
            Browse, filter and search all your banking activity.
          </p>
        </div>
        {pagination.total > 0 && (
          <span className="text-sm font-medium text-slate-500">
            {pagination.total} transaction{pagination.total !== 1 && "s"} total
          </span>
        )}
      </div>

      {/* ─── Summary Stats ─── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Credits</p>
            <p className="text-lg font-bold text-emerald-600">{currencyFormatter.format(stats.credits)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
            <TrendingDown className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Debits</p>
            <p className="text-lg font-bold text-rose-600">{currencyFormatter.format(stats.debits)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
            <Wallet className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Net Amount</p>
            <p className={`text-lg font-bold ${stats.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {currencyFormatter.format(stats.net)}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Filter Bar ─── */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="size-4" />
          Filters
        </div>

        <div className="flex flex-1 flex-wrap items-end gap-3">
          {/* Type */}
          <div className="min-w-[120px]">
            <label className="mb-1 block text-xs font-medium text-slate-500">Type</label>
            <select
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              value={type}
              onChange={(e) => { setType(e.target.value); applyFilters(); }}
            >
              <option value="all">All</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="min-w-[150px]">
            <label className="mb-1 block text-xs font-medium text-slate-500">From</label>
            <input
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); applyFilters(); }}
            />
          </div>

          {/* End Date */}
          <div className="min-w-[150px]">
            <label className="mb-1 block text-xs font-medium text-slate-500">To</label>
            <input
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); applyFilters(); }}
            />
          </div>

          {/* Search */}
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Search by ID, name, account or amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Error ─── */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* ─── Transaction List ─── */}
      {loading ? (
        <TableSkeleton />
      ) : displayed.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white px-6 text-center shadow-sm">
          <div className="flex size-14 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
            <ReceiptText className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-950">No transactions found</h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {searchQuery
              ? "No results match your search. Try adjusting your filters."
              : "Transactions will appear here once activity is recorded on your accounts."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((txn, idx) => {
            const isCredit = txn.type === "credit" || txn.direction === "credit";
            const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;
            const iconBg = isCredit ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700";
            const amountColor = isCredit ? "text-emerald-600" : "text-rose-600";
            const sign = isCredit ? "+" : "-";
            const fromParty = formatAccountParty(txn.fromAccount || txn.FromAccount, txn.fromAccountId);
            const toParty = formatAccountParty(txn.toAccount, txn.toAccountId);
            const counterparty = isCredit ? fromParty : toParty;

            return (
              <div
                className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:shadow-md"
                key={txn._id || txn.id || idx}
              >
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                  <Icon className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-slate-950">
                    {txn.title || txn.description || (isCredit ? "Incoming Transfer" : "Outgoing Transfer")}
                  </h3>
                  <p className="mt-1 truncate text-xs font-medium text-slate-600">
                    {isCredit ? "Received from" : "Sent to"} {counterparty.holderName} · {counterparty.shortAccountId}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    From: {fromParty.holderName} · {fromParty.shortAccountId} | To: {toParty.holderName} · {toParty.shortAccountId}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    {txn.idempotencyKey ? `ID: ${txn.idempotencyKey}` : `Transaction: ${txn.id || txn._id || "—"}`}
                    {txn.category ? ` · ${txn.category}` : ""}
                  </p>
                </div>

                <div className="hidden shrink-0 sm:block">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(txn.status)}`}>
                    {txn.status || "Processed"}
                  </span>
                </div>

                <div className="shrink-0 text-right">
                  <p className={`text-sm font-bold ${amountColor}`}>
                    {sign}{currencyFormatter.format(txn.amount || 0)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatDate(txn.date || txn.createdAt)} {formatTime(txn.date || txn.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Pagination ─── */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-slate-500">
            Page <span className="font-semibold text-slate-700">{pagination.page}</span> of{" "}
            <span className="font-semibold text-slate-700">{pagination.totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              type="button"
            >
              <ChevronLeft className="size-4" />
              Previous
            </button>
            <button
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              type="button"
            >
              Next
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
