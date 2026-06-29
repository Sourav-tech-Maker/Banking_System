import {
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-IN");

const cardStyles = {
  balance: {
    icon: WalletCards,
    iconClass: "bg-violet-100 text-violet-700 ring-violet-200",
    glowClass: "from-violet-500/10",
  },
  income: {
    icon: TrendingUp,
    iconClass: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    glowClass: "from-emerald-500/10",
  },
  expense: {
    icon: TrendingDown,
    iconClass: "bg-rose-100 text-rose-700 ring-rose-200",
    glowClass: "from-rose-500/10",
  },
  coins: {
    icon: Coins,
    iconClass: "bg-amber-100 text-amber-700 ring-amber-200",
    glowClass: "from-amber-500/10",
  },
};

function formatTrend(value, mode) {
  const safeValue = Number(value || 0);
  const positiveTrend = safeValue >= 0;
  const goodTrend = mode === "expense" ? safeValue <= 0 : safeValue >= 0;
  const Icon = positiveTrend ? ArrowUpRight : ArrowDownRight;

  return {
    Icon,
    label: `${Math.abs(safeValue).toLocaleString("en-IN", {
      maximumFractionDigits: 1,
    })}% from last month`,
    className: goodTrend ? "text-emerald-600" : "text-rose-600",
  };
}

export default function StatsCards({ summary }) {
  const cards = [
    {
      key: "balance",
      title: "Total Balance",
      value: currencyFormatter.format(summary.totalBalance || 0),
      detail: `${summary.totalAccounts || 0} connected account${summary.totalAccounts === 1 ? "" : "s"}`,
      change: summary.balanceChange,
    },
    {
      key: "income",
      title: "Total Income",
      value: currencyFormatter.format(summary.totalIncome || 0),
      detail: "Completed credits",
      change: summary.incomeChange,
    },
    {
      key: "expense",
      title: "Total Expense",
      value: currencyFormatter.format(summary.totalExpense || 0),
      detail: "Completed debits",
      change: summary.expenseChange,
    },
    {
      key: "coins",
      title: "Nexora Coins",
      value: numberFormatter.format(summary.nexoraCoins || 0),
      detail: `${numberFormatter.format(summary.coinsChange || 0)} earned this week`,
      change: summary.coinsChange ? 100 : 0,
      isCoinCard: true,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const style = cardStyles[card.key];
        const Icon = style.icon;
        const trend = formatTrend(card.change, card.key);

        return (
          <article
            className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            key={card.key}
          >
            <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${style.glowClass} to-transparent`} />
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <h2 className="mt-2 break-words text-2xl font-bold tracking-normal text-slate-950">
                  {card.value}
                </h2>
              </div>

              <div className={`flex size-12 shrink-0 items-center justify-center rounded-lg ring-1 ${style.iconClass}`}>
                <Icon className="size-6" />
              </div>
            </div>

            <div className="relative mt-5 flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-slate-500">{card.detail}</span>
              <span className={`inline-flex shrink-0 items-center gap-1 font-semibold ${card.isCoinCard ? "text-emerald-600" : trend.className}`}>
                {card.isCoinCard ? <ArrowUpRight className="size-4" /> : <trend.Icon className="size-4" />}
                {card.isCoinCard ? `+${numberFormatter.format(summary.coinsChange || 0)}` : trend.label}
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
