import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideWallet,
  LucideTrendingUp,
  LucideTrendingDown,
  LucideCoins
} from '@lucide/angular';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [
    CommonModule,
    LucideWallet,
    LucideTrendingUp,
    LucideTrendingDown,
    LucideCoins,
    TranslatePipe
  ],
  template: `
    <div class="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
      <!-- Card 1: Total Balance -->
      <div class="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
        <div class="flex items-start justify-between gap-3">
          <div>
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ 'stats.totalBalance' | translate }}</span>
            <h3 class="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              ₹{{ (summary?.totalBalance || 0) | number:'1.2-2' }}
            </h3>
          </div>
          <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300">
            <svg lucideWallet class="size-5"></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800/80">
          <span class="truncate text-slate-400 dark:text-slate-500">{{ summary?.totalAccounts || 1 }} {{ 'stats.activeAccounts' | translate | lowercase }}</span>
          <span class="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
            <svg lucideTrendingUp class="size-3.5"></svg>
            0%
          </span>
        </div>
      </div>

      <!-- Card 2: Total Income -->
      <div class="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
        <div class="flex items-start justify-between gap-3">
          <div>
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ 'stats.monthlyIncome' | translate }}</span>
            <h3 class="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              ₹{{ (summary?.totalIncome || 0) | number:'1.2-2' }}
            </h3>
          </div>
          <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
            <svg lucideTrendingUp class="size-5"></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800/80">
          <span class="truncate text-slate-400 dark:text-slate-500">{{ 'common.completed' | translate }}</span>
          <span class="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
            <svg lucideTrendingUp class="size-3.5"></svg>
            0%
          </span>
        </div>
      </div>

      <!-- Card 3: Total Expense -->
      <div class="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
        <div class="flex items-start justify-between gap-3">
          <div>
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ 'stats.monthlyExpenses' | translate }}</span>
            <h3 class="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              ₹{{ (summary?.totalExpense || 0) | number:'1.2-2' }}
            </h3>
          </div>
          <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
            <svg lucideTrendingDown class="size-5"></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800/80">
          <span class="truncate text-slate-400 dark:text-slate-500">{{ 'common.completed' | translate }}</span>
          <span class="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
            <svg lucideTrendingUp class="size-3.5"></svg>
            0%
          </span>
        </div>
      </div>

      <!-- Card 4: YONO Coins -->
      <div class="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
        <div class="flex items-start justify-between gap-3">
          <div>
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">YONO Coins</span>
            <h3 class="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {{ summary?.oneo_BankCoins || summary?.oNEO_BankCoins || 0 }}
            </h3>
          </div>
          <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300">
            <svg lucideCoins class="size-5"></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800/80">
          <span class="truncate text-slate-400 dark:text-slate-500">0 earned</span>
          <span class="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
            <svg lucideTrendingUp class="size-3.5"></svg>
            +0
          </span>
        </div>
      </div>
    </div>
  `
})
export class StatsCardsComponent {
  @Input() summary: any = {};
}
