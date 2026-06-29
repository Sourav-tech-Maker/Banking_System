import { ArrowRight, Coins, Lock, Timer, Trophy } from "lucide-react";

const numberFormatter = new Intl.NumberFormat("en-IN");

export default function WeeklyQuiz({ quiz, onStart }) {
  const isReady = quiz?.status === "ready";
  const entryFee = numberFormatter.format(quiz?.entryFee || 10);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 ring-1 ring-violet-200">
            <Trophy className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950">Weekly Tech Quiz</h2>
            <p className="mt-1 text-sm text-slate-500">{quiz?.title}</p>
          </div>
        </div>

        <button
          className="rounded-md px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
          onClick={onStart}
          type="button"
        >
          View Quiz
        </button>
      </div>

      <div className="relative overflow-hidden rounded-lg bg-[linear-gradient(135deg,#6D5DFB_0%,#3527A8_100%)] p-5 text-white">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_45%,rgba(255,255,255,0.28),transparent_34%)]" />
        <div className="relative grid gap-5 md:grid-cols-[1fr_160px] md:items-center">
          <div>
            <h3 className="text-2xl font-bold">Ready for the challenge?</h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
              Pay the weekly entry fee, answer timed tech questions, and earn Nexora Coins from your score.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-white/12 px-4 py-3 ring-1 ring-white/15">
                <div className="flex items-center gap-2 text-sm text-white/75">
                  <Coins className="size-4" />
                  Entry Fee
                </div>
                <p className="mt-1 text-lg font-bold">₹{entryFee}</p>
              </div>
              <div className="rounded-md bg-white/12 px-4 py-3 ring-1 ring-white/15">
                <div className="flex items-center gap-2 text-sm text-white/75">
                  <Trophy className="size-4" />
                  Prize Pool
                </div>
                <p className="mt-1 text-lg font-bold">{numberFormatter.format(quiz?.prizePool || 0)} Coins</p>
              </div>
              <div className="rounded-md bg-white/12 px-4 py-3 ring-1 ring-white/15">
                <div className="flex items-center gap-2 text-sm text-white/75">
                  <Timer className="size-4" />
                  Players
                </div>
                <p className="mt-1 text-lg font-bold">{numberFormatter.format(quiz?.participants || 0)}</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto flex size-36 items-center justify-center rounded-full bg-amber-300 text-amber-950 shadow-2xl ring-8 ring-white/10">
            <Trophy className="size-20" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={!isReady}
          onClick={onStart}
          type="button"
        >
          {isReady ? "Start Quiz Now" : "Earn More Coins"}
          {isReady ? <ArrowRight className="size-4" /> : <Lock className="size-4" />}
        </button>
      </div>
    </section>
  );
}
