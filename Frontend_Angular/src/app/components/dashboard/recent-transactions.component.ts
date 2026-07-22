import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideArrowUpRight, LucideArrowDownLeft } from '@lucide/angular';

@Component({
  selector: 'app-recent-transactions',
  standalone: true,
  imports: [CommonModule, LucideArrowUpRight, LucideArrowDownLeft],
  template: `
    <section class="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
      <div>
        <!-- Header -->
        <div class="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 class="text-base font-extrabold text-slate-900 dark:text-white sm:text-lg">Recent Transactions</h2>
            <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Latest completed and pending movement</p>
          </div>
          <button
            type="button"
            (click)="onViewAll.emit()"
            class="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition hover:underline"
          >
            View All
          </button>
        </div>

        <!-- Transactions Feed -->
        <div class="space-y-3">
          <div
            *ngFor="let txn of (transactions || []).slice(0, 5)"
            class="group flex items-center justify-between gap-3 rounded-xl border border-transparent p-2.5 transition hover:border-slate-200 hover:bg-slate-50/70 dark:hover:border-slate-800 dark:hover:bg-slate-900/60"
          >
            <!-- Icon + Info -->
            <div class="flex items-center gap-3 min-w-0">
              <div
                [ngClass]="txn.direction === 'debit' ? 'bg-rose-100/70 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'bg-emerald-100/70 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'"
                class="flex size-10 shrink-0 items-center justify-center rounded-xl"
              >
                <svg *ngIf="txn.direction === 'debit'" lucideArrowUpRight class="size-5"></svg>
                <svg *ngIf="txn.direction !== 'debit'" lucideArrowDownLeft class="size-5"></svg>
              </div>

              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <p class="truncate text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                    {{ txn.title }}
                  </p>
                  <span
                    [ngClass]="{
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300': txn.status === 'completed',
                      'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300': txn.status === 'pending',
                      'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300': txn.status === 'failed'
                    }"
                    class="hidden sm:inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold capitalize"
                  >
                    {{ txn.status }}
                  </span>
                </div>
                <p class="mt-0.5 truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {{ txn.direction === 'debit' ? 'To ' : 'From ' }}{{ txn.otherAccount || txn.counterparty?.holderName || 'Account' }}
                </p>
              </div>
            </div>

            <!-- Amount + Date -->
            <div class="text-right shrink-0">
              <p
                [ngClass]="txn.direction === 'debit' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'"
                class="text-xs font-black sm:text-sm"
              >
                {{ txn.direction === 'debit' ? '-' : '+' }}₹{{ (txn.amount || 0) | number:'1.2-2' }}
              </p>
              <p class="mt-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                {{ txn.date | date:'dd MMM yyyy' }}
              </p>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!transactions || transactions.length === 0" class="py-10 text-center">
            <p class="text-xs font-medium text-slate-400 dark:text-slate-500">No recent transactions recorded yet.</p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class RecentTransactionsComponent {
  @Input() transactions: any[] = [];
  @Output() onViewAll = new EventEmitter<void>();
}
