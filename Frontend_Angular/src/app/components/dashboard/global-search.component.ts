import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import {
  LucideArrowUpRight,
  LucideArrowDownLeft,
  LucideCheckCircle2,
  LucideLayout,
  LucideSearch,
  LucideTarget,
  LucideUser,
  LucideX
} from '@lucide/angular';

export interface SearchItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  badgeText: string;
  value: string;
  actionViewId: string;
  iconType: string;
}

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideArrowUpRight,
    LucideArrowDownLeft,
    LucideCheckCircle2,
    LucideLayout,
    LucideSearch,
    LucideTarget,
    LucideUser,
    LucideX
  ],
  template: `
    <div class="relative w-full max-w-md lg:max-w-lg" #searchContainer>
      <!-- Search Input Container -->
      <div class="relative flex items-center">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
          <svg lucideSearch class="size-4"></svg>
        </div>
        <input
          #searchInput
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onInputChange($event)"
          (focus)="onInputFocus()"
          (keydown)="handleKeyDown($event)"
          placeholder="Search transactions, beneficiaries, savings goals, or settings..."
          class="w-full rounded-xl border border-slate-200 bg-slate-100/70 pl-10 pr-9 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-950 sm:text-sm"
        />
        <button
          *ngIf="searchQuery"
          type="button"
          (click)="clearSearch()"
          class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <svg lucideX class="size-4"></svg>
        </button>
      </div>

      <!-- Predictive Dropdown Modal -->
      <div
        *ngIf="isOpen() && (loading() || flatResults().length > 0 || (searchQuery.trim().length > 0 && totalMatches() === 0))"
        class="absolute left-0 right-0 top-full z-50 mt-2 max-h-[75vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 sm:p-4"
      >
        <!-- Loading Spinner -->
        <div *ngIf="loading()" class="flex items-center justify-center py-6 text-slate-400">
          <div class="flex items-center gap-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <svg class="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Searching YONO platform...</span>
          </div>
        </div>

        <!-- No Results Found -->
        <div *ngIf="!loading() && flatResults().length === 0 && searchQuery.trim().length > 0" class="py-8 text-center">
          <p class="text-sm font-bold text-slate-700 dark:text-slate-300">No results found</p>
          <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">
            No matches for "<span class="font-medium text-slate-600 dark:text-slate-400">{{ searchQuery }}</span>". Try searching for "transfer", "kyc", or "password".
          </p>
        </div>

        <!-- Categorized Results Sections -->
        <div *ngIf="!loading() && flatResults().length > 0" class="space-y-4">
          <!-- Quick Header Stats -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-2 px-1 text-[11px] font-bold text-slate-400 dark:border-slate-800">
            <span>RESULTS ({{ totalMatches() }})</span>
            <span class="text-[10px] text-slate-400 font-normal">Use ↑ ↓ to navigate, Enter to select</span>
          </div>

          <!-- Section: Pages & Actions -->
          <div *ngIf="categorizedResults().pages.length > 0">
            <h4 class="mb-1.5 px-1.5 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Pages &amp; Navigation
            </h4>
            <div class="space-y-1">
              <button
                *ngFor="let item of categorizedResults().pages"
                type="button"
                (click)="selectItem(item)"
                [ngClass]="{ 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-950 dark:text-white': focusedIndex() === getItemIndex(item) }"
                class="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                    <svg lucideLayout class="size-4"></svg>
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold truncate text-slate-900 dark:text-slate-100">{{ item.title }}</p>
                    <p class="truncate text-[11px] text-slate-500 dark:text-slate-400">{{ item.subtitle }}</p>
                  </div>
                </div>
                <span class="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  Page
                </span>
              </button>
            </div>
          </div>

          <!-- Section: Transactions -->
          <div *ngIf="categorizedResults().transactions.length > 0">
            <h4 class="mb-1.5 px-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Transactions
            </h4>
            <div class="space-y-1">
              <button
                *ngFor="let item of categorizedResults().transactions"
                type="button"
                (click)="selectItem(item)"
                [ngClass]="{ 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-white': focusedIndex() === getItemIndex(item) }"
                class="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    [ngClass]="item.iconType === 'arrow-up-right' ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60'"
                    class="flex size-8 shrink-0 items-center justify-center rounded-lg"
                  >
                    <svg *ngIf="item.iconType === 'arrow-up-right'" lucideArrowUpRight class="size-4"></svg>
                    <svg *ngIf="item.iconType !== 'arrow-up-right'" lucideArrowDownLeft class="size-4"></svg>
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold truncate text-slate-900 dark:text-slate-100">{{ item.title }}</p>
                    <p class="truncate text-[11px] text-slate-500 dark:text-slate-400">{{ item.subtitle }}</p>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <span class="block font-extrabold text-slate-900 dark:text-slate-100 text-xs">{{ item.value }}</span>
                  <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">{{ item.badgeText }}</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Section: Beneficiaries -->
          <div *ngIf="categorizedResults().beneficiaries.length > 0">
            <h4 class="mb-1.5 px-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Beneficiaries
            </h4>
            <div class="space-y-1">
              <button
                *ngFor="let item of categorizedResults().beneficiaries"
                type="button"
                (click)="selectItem(item)"
                [ngClass]="{ 'bg-amber-50 dark:bg-amber-950/60 text-amber-950 dark:text-white': focusedIndex() === getItemIndex(item) }"
                class="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                    <svg lucideUser class="size-4"></svg>
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold truncate text-slate-900 dark:text-slate-100">{{ item.title }}</p>
                    <p class="truncate text-[11px] text-slate-500 dark:text-slate-400">{{ item.subtitle }}</p>
                  </div>
                </div>
                <span class="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  Payee
                </span>
              </button>
            </div>
          </div>

          <!-- Section: Savings Goals -->
          <div *ngIf="categorizedResults().goals.length > 0">
            <h4 class="mb-1.5 px-1.5 text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Savings Goals
            </h4>
            <div class="space-y-1">
              <button
                *ngFor="let item of categorizedResults().goals"
                type="button"
                (click)="selectItem(item)"
                [ngClass]="{ 'bg-purple-50 dark:bg-purple-950/60 text-purple-950 dark:text-white': focusedIndex() === getItemIndex(item) }"
                class="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                    <svg lucideTarget class="size-4"></svg>
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold truncate text-slate-900 dark:text-slate-100">{{ item.title }}</p>
                    <p class="truncate text-[11px] text-slate-500 dark:text-slate-400">{{ item.subtitle }}</p>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <span class="block font-extrabold text-purple-700 dark:text-purple-300 text-xs">{{ item.value }}</span>
                  <span class="text-[10px] text-slate-400 uppercase">Target</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GlobalSearchComponent implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);

  @Output() onSelectResult = new EventEmitter<string>();
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('searchContainer') searchContainer!: ElementRef<HTMLDivElement>;

  protected searchQuery = '';
  protected isOpen = signal(false);
  protected loading = signal(false);
  protected totalMatches = signal(0);
  protected focusedIndex = signal(-1);

  protected categorizedResults = signal<{
    pages: SearchItem[];
    transactions: SearchItem[];
    beneficiaries: SearchItem[];
    goals: SearchItem[];
  }>({
    pages: [],
    transactions: [],
    beneficiaries: [],
    goals: []
  });

  protected flatResults = signal<SearchItem[]>([]);

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  ngOnInit() {
    this.searchSub = this.searchSubject
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query.trim()) {
            this.loading.set(false);
            this.clearResults();
            return [];
          }
          this.loading.set(true);
          return this.apiService.globalSearch(query);
        })
      )
      .subscribe({
        next: (res: any) => {
          this.loading.set(false);
          if (res && res.results) {
            const pages = res.results.pages || [];
            const transactions = res.results.transactions || [];
            const beneficiaries = res.results.beneficiaries || [];
            const goals = res.results.goals || [];

            this.categorizedResults.set({ pages, transactions, beneficiaries, goals });
            const flattened = [...pages, ...transactions, ...beneficiaries, ...goals];
            this.flatResults.set(flattened);
            this.totalMatches.set(res.totalMatches || flattened.length);
            this.focusedIndex.set(flattened.length > 0 ? 0 : -1);
          } else {
            this.clearResults();
          }
        },
        error: () => {
          this.loading.set(false);
          this.clearResults();
        }
      });
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }

  protected onInputChange(val: string) {
    if (val.trim().length > 0) {
      this.isOpen.set(true);
      this.searchSubject.next(val);
    } else {
      this.clearResults();
      this.isOpen.set(false);
    }
  }

  protected onInputFocus() {
    if (this.searchQuery.trim().length > 0) {
      this.isOpen.set(true);
    }
  }

  protected clearSearch() {
    this.searchQuery = '';
    this.clearResults();
    this.isOpen.set(false);
  }

  private clearResults() {
    this.categorizedResults.set({ pages: [], transactions: [], beneficiaries: [], goals: [] });
    this.flatResults.set([]);
    this.totalMatches.set(0);
    this.focusedIndex.set(-1);
  }

  protected getItemIndex(item: SearchItem): number {
    return this.flatResults().findIndex((x) => x.id === item.id);
  }

  protected selectItem(item: SearchItem) {
    this.isOpen.set(false);
    this.onSelectResult.emit(item.actionViewId);
  }

  protected handleKeyDown(event: KeyboardEvent) {
    const total = this.flatResults().length;
    if (!this.isOpen() || total === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusedIndex.update((i) => (i + 1) % total);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusedIndex.update((i) => (i - 1 + total) % total);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const currentIdx = this.focusedIndex();
      if (currentIdx >= 0 && currentIdx < total) {
        this.selectItem(this.flatResults()[currentIdx]);
      }
    } else if (event.key === 'Escape') {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.searchContainer && !this.searchContainer.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  }
}
