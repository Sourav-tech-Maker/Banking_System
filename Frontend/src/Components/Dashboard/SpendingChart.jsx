import { ChartNoAxesCombined } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function getConicGradient(categories) {
  const total = categories.reduce((sum, category) => sum + Number(category.amount || 0), 0);
  let current = 0;

  if (!total) return "#E2E8F0 0deg 360deg";

  return categories
    .map((category) => {
      const start = current;
      const angle = (Number(category.amount || 0) / total) * 360;
      current += angle;

      return `${category.color} ${start}deg ${current}deg`;
    })
    .join(", ");
}

export default function SpendingChart({ analytics }) {
  const categories = analytics?.categories || [];
  const totalExpense = analytics?.totalExpense || 0;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Spending Analytics</h2>
          <p className="mt-1 text-sm text-slate-500">Category-wise outgoing money</p>
        </div>
        <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
          This Month
        </span>
      </div>

      <div className="grid items-center gap-6 md:grid-cols-[240px_1fr]">
        <div className="relative mx-auto size-56">
          <div
            className="size-full rounded-full"
            style={{ background: `conic-gradient(${getConicGradient(categories)})` }}
          />
          <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
            <p className="text-2xl font-bold text-slate-950">
              {currencyFormatter.format(totalExpense)}
            </p>
            <p className="mt-1 text-sm text-slate-500">Total Expense</p>
          </div>
        </div>

        {categories.length ? (
          <div className="space-y-4">
            {categories.map((category) => (
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4" key={category.name}>
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="truncate text-sm font-medium text-slate-700">
                    {category.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-950">
                  {currencyFormatter.format(category.amount || 0)}
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  {category.percentage || 0}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
              <ChartNoAxesCombined className="size-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-950">No spending data yet</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Expense categories will populate from your completed outgoing transfers.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
