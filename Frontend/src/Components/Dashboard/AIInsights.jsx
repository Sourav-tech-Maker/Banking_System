import { Bot, Lightbulb, Sparkles, TrendingUp } from "lucide-react";

const iconMap = {
  tip: Lightbulb,
  insight: TrendingUp,
};

export default function AIInsights({ insights }) {
  const items = insights?.items || [];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
          <Sparkles className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-950">AI Financial Insights</h2>
          <p className="mt-1 text-sm text-slate-500">Generated from your live banking activity</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-md bg-[linear-gradient(120deg,#EEF6FF_0%,#F5F0FF_58%,#FFF7ED_100%)] p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_132px] md:items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-950">{insights?.headline}</h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-700">
              {insights?.message}
            </p>
          </div>

          <div className="mx-auto flex size-28 items-center justify-center rounded-full bg-white/80 shadow-xl ring-1 ring-white">
            <div className="flex size-20 items-center justify-center rounded-full bg-slate-950 text-cyan-300 shadow-inner">
              <Bot className="size-10" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {items.length ? (
          items.map((item) => {
            const Icon = iconMap[item.type] || Sparkles;

            return (
              <div
                className="flex gap-3 rounded-md border border-slate-100 bg-slate-50 px-4 py-3"
                key={`${item.title}-${item.message}`}
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200">
                  <Icon className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-950">{item.title}</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
            Insights will appear after your first live account activity.
          </div>
        )}
      </div>
    </section>
  );
}
