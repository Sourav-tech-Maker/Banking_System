import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideBot, LucideSparkles, LucideLightbulb, LucideCheckCircle2 } from '@lucide/angular';

@Component({
  selector: 'app-ai-insights',
  standalone: true,
  imports: [CommonModule, LucideBot, LucideSparkles, LucideLightbulb, LucideCheckCircle2],
  template: `
    <section class="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
      <div class="space-y-4">
        <!-- Header -->
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <svg lucideBot class="size-5"></svg>
          </div>
          <div>
            <h2 class="text-base font-extrabold text-slate-900 dark:text-white sm:text-lg">AI Financial Insights</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Generated from your live banking activity</p>
          </div>
        </div>

        <!-- Hero Blue Tint Card -->
        <div class="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-indigo-50/20 p-5 dark:border-indigo-900/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-indigo-950/20">
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-1.5 max-w-sm">
              <h3 class="text-sm font-black text-indigo-950 dark:text-indigo-100 sm:text-base">
                {{ insights?.headline || 'Activity is now visible' }}
              </h3>
              <p class="text-xs font-medium text-slate-600 leading-relaxed dark:text-slate-300">
                {{ insights?.message || 'Your dashboard is using live transfers to show balances, spending, and rewards.' }}
              </p>
            </div>
            <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-indigo-400 shadow-md ring-4 ring-indigo-100 dark:ring-indigo-900">
              <svg lucideBot class="size-6"></svg>
            </div>
          </div>
        </div>

        <!-- Insights Items -->
        <div class="space-y-3 pt-1">
          <!-- Item 1: Transfer Visibility -->
          <div class="flex items-start gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/40">
            <div class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
              <svg lucideSparkles class="size-3.5"></svg>
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100">Transfer visibility</h4>
              <p class="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                Transaction rows now show sender and receiver names with account references.
              </p>
            </div>
          </div>

          <!-- Item 2: Spending Clarity -->
          <div class="flex items-start gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/40">
            <div class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
              <svg lucideLightbulb class="size-3.5"></svg>
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100">Spending clarity</h4>
              <p class="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                Outgoing transfers are grouped under Bank Transfers until detailed categories are added.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class AiInsightsComponent {
  @Input() insights: any = {};
}
