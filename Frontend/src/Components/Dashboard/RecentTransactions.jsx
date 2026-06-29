import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  ReceiptText,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function formatDate(value) {
  if (!value) return "Pending date";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getTransactionStyle(direction) {
  if (direction === "credit") {
    return {
      Icon: ArrowDownLeft,
      iconClass: "bg-emerald-100 text-emerald-700",
      amountClass: "text-emerald-600",
      sign: "+",
    };
  }

  if (direction === "internal") {
    return {
      Icon: ArrowRightLeft,
      iconClass: "bg-sky-100 text-sky-700",
      amountClass: "text-sky-700",
      sign: "",
    };
  }

  return {
    Icon: ArrowUpRight,
    iconClass: "bg-rose-100 text-rose-700",
    amountClass: "text-rose-600",
    sign: "-",
  };
}

function getCounterparty(transaction) {
  if (transaction.counterparty?.holderName) {
    return `${transaction.counterparty.holderName} · ${transaction.counterparty.shortAccountId}`;
  }

  if (transaction.otherAccount) {
    return transaction.otherAccount;
  }

  return "Nexora account";
}

export default function RecentTransactions({ transactions = [], onViewAll }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Recent Transactions</h2>
          <p className="mt-1 text-sm text-slate-500">Latest completed and pending movement</p>
        </div>
        <button
          className="rounded-md px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 cursor-pointer"
          type="button"
          onClick={onViewAll}
        >
          View All
        </button>
      </div>

      {transactions.length ? (
        <div className="divide-y divide-slate-100">
          {transactions.map((transaction) => {
            const style = getTransactionStyle(transaction.direction);
            const Icon = style.Icon;

            return (
              <div className="flex items-center gap-4 py-4" key={transaction.id}>
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${style.iconClass}`}>
                  <Icon className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-bold text-slate-950">
                      {transaction.title}
                    </h3>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      {transaction.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {transaction.direction === "credit" ? "From" : "To"} {getCounterparty(transaction)}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className={`text-sm font-bold ${style.amountClass}`}>
                    {style.sign}{currencyFormatter.format(transaction.amount || 0)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(transaction.date)}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
            <ReceiptText className="size-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-950">No transactions yet</h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Recent transfers will appear here as soon as transaction history is available from the backend.
          </p>
        </div>
      )}
    </section>
  );
}
