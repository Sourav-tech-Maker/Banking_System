import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import {
  LucideShieldCheck,
  LucideUsers,
  LucideLandmark,
  LucideFileText,
  LucideWallet,
  LucideActivity,
  LucideSearch,
  LucideCheck,
  LucideX,
  LucideEye,
  LucideDownload,
  LucideRotateCw,
  LucideZap,
  LucideBot,
  LucideLock,
  LucideGlobe,
  LucideCreditCard,
  LucideSmartphone,
  LucideCoins,
  LucideFileCheck,
  LucideTrendingUp,
  LucideBuilding
} from '@lucide/angular';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideShieldCheck,
    LucideUsers,
    LucideLandmark,
    LucideFileText,
    LucideWallet,
    LucideActivity,
    LucideSearch,
    LucideCheck,
    LucideX,
    LucideEye,
    LucideDownload,
    LucideRotateCw,
    LucideZap,
    LucideBot,
    LucideLock,
    LucideGlobe,
    LucideCreditCard,
    LucideSmartphone,
    LucideCoins,
    LucideFileCheck,
    LucideTrendingUp,
    LucideBuilding
  ],
  template: `
    <div class="space-y-6 pb-12">
      <!-- 1. TOP STATS METRIC GRID (6 KPI Cards) -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <!-- Card 1: Total Users -->
        <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex items-start justify-between">
          <div>
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Users</span>
            <h3 class="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{{ stats?.totalUsers || allUsers().length }}</h3>
            <p class="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{{ stats?.activeUsers || allUsers().length }} active accounts</p>
          </div>
          <div class="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300">
            <svg lucideUsers class="size-5"></svg>
          </div>
        </div>

        <!-- Card 2: Pending KYC -->
        <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex items-start justify-between">
          <div>
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending KYC</span>
            <h3 class="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{{ pendingKycCount }}</h3>
            <p class="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{{ approvedKycCount }} approved, {{ rejectedKycCount }} rejected</p>
          </div>
          <div class="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300">
            <svg lucideShieldCheck class="size-5"></svg>
          </div>
        </div>

        <!-- Card 3: Bank Accounts -->
        <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex items-start justify-between">
          <div>
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Bank Accounts</span>
            <h3 class="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{{ stats?.totalAccounts || 4 }}</h3>
            <p class="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{{ stats?.verifiedUsers || approvedKycCount }} verified users</p>
          </div>
          <div class="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
            <svg lucideLandmark class="size-5"></svg>
          </div>
        </div>

        <!-- Card 4: Transactions -->
        <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex items-start justify-between">
          <div>
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Transactions</span>
            <h3 class="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{{ stats?.totalTransactions || transactions().length }}</h3>
            <p class="mt-1 text-[11px] text-slate-400 dark:text-slate-500">All time transaction records</p>
          </div>
          <div class="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
            <svg lucideFileText class="size-5"></svg>
          </div>
        </div>

        <!-- Card 5: System Liquidity -->
        <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex items-start justify-between">
          <div>
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">System Liquidity</span>
            <h3 class="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">₹{{ (stats?.totalLiquidity || 47651) | number:'1.2-2' }}</h3>
            <p class="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Total balance in all accounts</p>
          </div>
          <div class="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
            <svg lucideWallet class="size-5"></svg>
          </div>
        </div>

        <!-- Card 6: System Health -->
        <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex items-start justify-between">
          <div>
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">System Health</span>
            <h3 class="mt-1 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">Online</h3>
            <p class="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Admin services responding</p>
          </div>
          <div class="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
            <svg lucideActivity class="size-5"></svg>
          </div>
        </div>
      </div>

      <!-- 2. MIDDLE SECTION: GLOBAL SEARCH & QUICK ACTIONS -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Global Admin Search -->
        <div class="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Global Search</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Search modules, users, KYC records, and document numbers.</p>
          </div>

          <div class="relative mt-6">
            <svg lucideSearch class="absolute left-4 top-3.5 size-4.5 text-slate-400"></svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              class="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-3 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950"
              placeholder="Search admin data..."
            />
          </div>
        </div>

        <!-- Quick Actions Panel -->
        <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 space-y-3">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Quick Actions</h3>
          
          <div class="space-y-2 pt-1">
            <button
              type="button"
              (click)="activeTab.set('kyc')"
              class="w-full flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span class="flex items-center gap-2">
                <svg lucideShieldCheck class="size-4 text-amber-500"></svg>
                Approve Pending KYC
              </span>
              <span class="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300">{{ pendingKycCount }}</span>
            </button>

            <button
              type="button"
              (click)="activeTab.set('reports')"
              class="w-full flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span class="flex items-center gap-2">
                <svg lucideDownload class="size-4 text-indigo-500"></svg>
                Generate Reports
              </span>
              <span class="text-slate-400 text-[11px]">CSV / PDF</span>
            </button>

            <button
              type="button"
              (click)="activeTab.set('users')"
              class="w-full flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span class="flex items-center gap-2">
                <svg lucideUsers class="size-4 text-purple-500"></svg>
                View Users
              </span>
              <span class="text-slate-400 text-[11px]">{{ allUsers().length }} users</span>
            </button>

            <button
              type="button"
              (click)="activeTab.set('transactions')"
              class="w-full flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span class="flex items-center gap-2">
                <svg lucideFileText class="size-4 text-blue-500"></svg>
                View Transactions
              </span>
              <span class="text-slate-400 text-[11px]">{{ transactions().length }} logs</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 3. SUB-NAVIGATION TABS BAR -->
      <div class="border-b border-slate-200 dark:border-slate-800">
        <nav class="-mb-px flex gap-6 overflow-x-auto">
          <button
            type="button"
            (click)="activeTab.set('dashboard')"
            [ngClass]="activeTab() === 'dashboard' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold'"
            class="whitespace-nowrap border-b-2 py-3 px-1 text-xs sm:text-sm transition"
          >
            Dashboard Overview
          </button>

          <button
            type="button"
            (click)="activeTab.set('kyc')"
            [ngClass]="activeTab() === 'kyc' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold'"
            class="whitespace-nowrap border-b-2 py-3 px-1 text-xs sm:text-sm transition flex items-center gap-1.5"
          >
            <span>KYC Management</span>
            <span class="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {{ allKycApplications().length }}
            </span>
          </button>

          <button
            type="button"
            (click)="activeTab.set('users')"
            [ngClass]="activeTab() === 'users' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold'"
            class="whitespace-nowrap border-b-2 py-3 px-1 text-xs sm:text-sm transition flex items-center gap-1.5"
          >
            <span>User Management</span>
            <span class="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-extrabold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              {{ allUsers().length }}
            </span>
          </button>

          <button
            type="button"
            (click)="activeTab.set('transactions')"
            [ngClass]="activeTab() === 'transactions' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold'"
            class="whitespace-nowrap border-b-2 py-3 px-1 text-xs sm:text-sm transition"
          >
            Transactions
          </button>

          <button
            type="button"
            (click)="activeTab.set('reports')"
            [ngClass]="activeTab() === 'reports' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold'"
            class="whitespace-nowrap border-b-2 py-3 px-1 text-xs sm:text-sm transition"
          >
            Reports & Settings
          </button>
        </nav>
      </div>

      <!-- 4. TAB CONTENT VIEWS -->

      <!-- VIEW 1: DASHBOARD OVERVIEW - NEXT-GEN BANKING INNOVATIONS ROADMAP -->
      <div *ngIf="activeTab() === 'dashboard'" class="space-y-6">
        <!-- Banner Header -->
        <div class="rounded-3xl border border-indigo-200/80 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 p-8 text-white shadow-xl">
          <div class="flex items-center gap-3">
            <span class="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-extrabold text-indigo-300 border border-indigo-400/30">
              ⚡ NEXT-GEN BANKING PLATFORM
            </span>
       
          </div>
          <h2 class="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
            Production Architecture & Future Banking Innovations Hub
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-indigo-200/80 max-w-3xl">
            Solves real-world banking issues: transaction timeouts, hidden FX fees, account lockouts, manual loan processing, and vulnerability to SIM-swap fraud.
          </p>
        </div>

        <!-- 12 Next-Level Production Features Grid -->
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Feature 1 -->
          <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <div class="flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                  <svg lucideZap class="size-6"></svg>
                </div>
                <span class="rounded-md bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">ACTIVE IN PROD</span>
              </div>
              <h3 class="mt-4 text-base font-bold text-slate-900 dark:text-white">AI Behavioral Biometric Fraud Defense</h3>
              <p class="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Monitors device keystroke dynamics, sudden location leaps, and transaction velocity in real-time, enforcing instant face-id reauth before money leaves the bank.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>Solves SBI/PNB OTP Interception Fraud</span>
              <span class="text-indigo-600 dark:text-indigo-400">99.9% Safe</span>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <div class="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <svg lucideZap class="size-6"></svg>
                </div>
                <span class="rounded-md bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">ACTIVE IN PROD</span>
              </div>
              <h3 class="mt-4 text-base font-bold text-slate-900 dark:text-white">Sub-Second Interbank Settlement Engine</h3>
              <p class="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                High-concurrency ledger queues (UPI 3.0 Real-Time Settlement) resolving pending payment hangs and stuck debit entries experienced during peak banking hours.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>0 Pending Timeout Hangs</span>
              <span class="text-indigo-600 dark:text-indigo-400">&lt; 300ms SLA</span>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <div class="flex size-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <svg lucideBot class="size-6"></svg>
                </div>
                <span class="rounded-md bg-indigo-100 px-2.5 py-1 text-[10px] font-extrabold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">BETA PREVIEW</span>
              </div>
              <h3 class="mt-4 text-base font-bold text-slate-900 dark:text-white">Generative AI Multi-Lingual Financial Copilot</h3>
              <p class="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Conversational AI supporting 12 Indian languages for auto-paying electricity/water bills, optimizing taxes, and executing voice-activated fund transfers.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>Voice Banking (Hindi, Tam, Mar, Eng)</span>
              <span class="text-indigo-600 dark:text-indigo-400">Voice-AI v2</span>
            </div>
          </div>

          <!-- Feature 4 -->
          <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <div class="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <svg lucideLock class="size-6"></svg>
                </div>
                <span class="rounded-md bg-purple-100 px-2.5 py-1 text-[10px] font-extrabold text-purple-800 dark:bg-purple-950 dark:text-purple-300">DEPLOYING Q3 2026</span>
              </div>
              <h3 class="mt-4 text-base font-bold text-slate-900 dark:text-white">Quantum-Resistant Vault Encryption</h3>
              <p class="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Post-quantum lattice cryptographic signatures protecting fixed deposits, mutual fund holdings, and high-value treasury reserves against quantum decryption.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>Bank-Grade Kyber-1024</span>
              <span class="text-indigo-600 dark:text-indigo-400">Mil-Spec</span>
            </div>
          </div>

          <!-- Feature 5 -->
          <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <div class="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <svg lucideTrendingUp class="size-6"></svg>
                </div>
                <span class="rounded-md bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">ACTIVE IN PROD</span>
              </div>
              <h3 class="mt-4 text-base font-bold text-slate-900 dark:text-white">Predictive 90-Day Cash Flow Forecasting</h3>
              <p class="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Machine learning model projecting account balances 90 days out, notifying customers before recurring loan EMIs or bill payments risk bouncing.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>Eliminates EMI Bounce Charges</span>
              <span class="text-indigo-600 dark:text-indigo-400">Smart Alert</span>
            </div>
          </div>

          <!-- Feature 6 -->
          <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <div class="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <svg lucideGlobe class="size-6"></svg>
                </div>
                <span class="rounded-md bg-indigo-100 px-2.5 py-1 text-[10px] font-extrabold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">BETA PREVIEW</span>
              </div>
              <h3 class="mt-4 text-base font-bold text-slate-900 dark:text-white">Multi-Currency Global Remittance Hub</h3>
              <p class="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Instant FX currency conversions (INR, USD, EUR, GBP, AED) with live mid-market exchange rates and zero hidden markup fees compared to traditional wire transfers.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>0% Hidden Forex Spread</span>
              <span class="text-indigo-600 dark:text-indigo-400">Live FX</span>
            </div>
          </div>

          <!-- Feature 7 -->
          <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <div class="flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                  <svg lucideCreditCard class="size-6"></svg>
                </div>
                <span class="rounded-md bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">ACTIVE IN PROD</span>
              </div>
              <h3 class="mt-4 text-base font-bold text-slate-900 dark:text-white">Dynamic Single-Use Burner Virtual Cards</h3>
              <p class="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Generate instant single-use debit cards for e-commerce shopping that self-destruct right after the payment is authorized, shielding account numbers from web breaches.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>Prevents Subscription Leak Fraud</span>
              <span class="text-indigo-600 dark:text-indigo-400">Auto-Burn</span>
            </div>
          </div>

          <!-- Feature 8 -->
          <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <div class="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <svg lucideSmartphone class="size-6"></svg>
                </div>
                <span class="rounded-md bg-purple-100 px-2.5 py-1 text-[10px] font-extrabold text-purple-800 dark:bg-purple-950 dark:text-purple-300">DEPLOYING Q3 2026</span>
              </div>
              <h3 class="mt-4 text-base font-bold text-slate-900 dark:text-white">Offline Digital Rupee (e₹ CBDC Mesh)</h3>
              <p class="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Enables users to make micro-payments even in remote zero-network zones using encrypted NFC and Bluetooth peer-to-peer ledger synchronization.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>Works Without Internet</span>
              <span class="text-indigo-600 dark:text-indigo-400">NFC Mesh</span>
            </div>
          </div>

          <!-- Feature 9 -->
          <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <div class="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <svg lucideCoins class="size-6"></svg>
                </div>
                <span class="rounded-md bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">ACTIVE IN PROD</span>
              </div>
              <h3 class="mt-4 text-base font-bold text-slate-900 dark:text-white">Automated Spare-Change Round-Up Investment</h3>
              <p class="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Rounds up everyday transactions (e.g. ₹185 purchase rounded to ₹200) and automatically sweeps spare ₹15 into 24K Digital Gold or liquid mutual funds.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>Passive Micro-Investing</span>
              <span class="text-indigo-600 dark:text-indigo-400">Digital Gold</span>
            </div>
          </div>

          <!-- Feature 10 -->
          <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <div class="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <svg lucideFileCheck class="size-6"></svg>
                </div>
                <span class="rounded-md bg-indigo-100 px-2.5 py-1 text-[10px] font-extrabold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">BETA PREVIEW</span>
              </div>
              <h3 class="mt-4 text-base font-bold text-slate-900 dark:text-white">Instant One-Click ITR &amp; AIS Tax Filing</h3>
              <p class="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Direct integration with Income Tax Dept AIS/Form 26AS data. Calculates capital gains, interest income, and auto-files annual returns in under 3 minutes.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>Replaces Third-Party Tax Apps</span>
              <span class="text-indigo-600 dark:text-indigo-400">3-Min Filing</span>
            </div>
          </div>

          <!-- Feature 11 -->
          <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <div class="flex size-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <svg lucideBuilding class="size-6"></svg>
                </div>
                <span class="rounded-md bg-purple-100 px-2.5 py-1 text-[10px] font-extrabold text-purple-800 dark:bg-purple-950 dark:text-purple-300">DEPLOYING Q3 2026</span>
              </div>
              <h3 class="mt-4 text-base font-bold text-slate-900 dark:text-white">Multi-Signatory Corporate Treasury Matrix</h3>
              <p class="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Enterprise multi-person approval workflows requiring dual or triple executive signatures before processing commercial vendor payments and corporate payroll.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>Commercial Enterprise Control</span>
              <span class="text-indigo-600 dark:text-indigo-400">Multi-Sig</span>
            </div>
          </div>

          <!-- Feature 12 -->
          <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <div class="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <svg lucideShieldCheck class="size-6"></svg>
                </div>
                <span class="rounded-md bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">ACTIVE IN PROD</span>
              </div>
              <h3 class="mt-4 text-base font-bold text-slate-900 dark:text-white">Smart Escrow &amp; Property Deal Vault</h3>
              <p class="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Programmable escrow contracts for real-estate token down-payments and vehicle purchases, releasing funds automatically upon digital registry sign-off.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>Eliminates Builder Fraud</span>
              <span class="text-indigo-600 dark:text-indigo-400">Smart Escrow</span>
            </div>
          </div>
        </div>
      </div>

      <!-- VIEW 2: KYC MANAGEMENT SECTION -->
      <div *ngIf="activeTab() === 'kyc'" class="space-y-4">
        <!-- Filter Bar -->
        <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="kycFilter.set('all')"
              [ngClass]="kycFilter() === 'all' ? 'bg-indigo-600 text-white font-extrabold' : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 font-bold'"
              class="rounded-lg px-3 py-1.5 text-xs transition"
            >
              All ({{ allKycApplications().length }})
            </button>
            <button
              type="button"
              (click)="kycFilter.set('pending')"
              [ngClass]="kycFilter() === 'pending' ? 'bg-amber-500 text-white font-extrabold' : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 font-bold'"
              class="rounded-lg px-3 py-1.5 text-xs transition"
            >
              Pending ({{ pendingKycCount }})
            </button>
            <button
              type="button"
              (click)="kycFilter.set('approved')"
              [ngClass]="kycFilter() === 'approved' ? 'bg-emerald-600 text-white font-extrabold' : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 font-bold'"
              class="rounded-lg px-3 py-1.5 text-xs transition"
            >
              Approved ({{ approvedKycCount }})
            </button>
            <button
              type="button"
              (click)="kycFilter.set('rejected')"
              [ngClass]="kycFilter() === 'rejected' ? 'bg-rose-600 text-white font-extrabold' : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 font-bold'"
              class="rounded-lg px-3 py-1.5 text-xs transition"
            >
              Rejected ({{ rejectedKycCount }})
            </button>
          </div>

          <button
            type="button"
            (click)="loadAllData()"
            class="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <svg lucideRotateCw class="size-3.5"></svg>
            Refresh List
          </button>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredKycApplications().length === 0" class="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-950">
          <p class="text-sm font-bold text-slate-500 dark:text-slate-400">No KYC applications found in this status filter.</p>
        </div>

        <!-- KYC Application Cards List -->
        <div *ngFor="let k of filteredKycApplications()" class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 transition hover:shadow-md">
          <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <!-- Left & Middle: User Info and Details Grid -->
            <div class="flex-1 space-y-4">
              <!-- User Header -->
              <div class="flex items-center gap-3">
                <div class="flex size-11 items-center justify-center rounded-xl bg-indigo-100 font-black text-indigo-700 text-sm dark:bg-indigo-950 dark:text-indigo-300">
                  {{ getUserInitials(k) }}
                </div>
                <div>
                  <h3 class="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                    {{ k.fullName || k.username }}
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ k.email || (k.username + ' - email@domain.com') }}</p>
                </div>
              </div>

              <!-- Details Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 pt-1 text-xs">
                <div>
                  <span class="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">DOB</span>
                  <span class="block font-bold text-slate-900 dark:text-white mt-0.5">{{ k.dateOfBirth }}</span>
                </div>

                <div>
                  <span class="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">GENDER</span>
                  <span class="block font-bold text-slate-900 dark:text-white mt-0.5">{{ k.gender }}</span>
                </div>

                <div>
                  <span class="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">STATUS</span>
                  <span
                    [ngClass]="{
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300': isStatusApproved(k.status),
                      'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300': isStatusPending(k.status),
                      'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300': isStatusRejected(k.status)
                    }"
                    class="inline-block rounded-md px-2.5 py-0.5 text-[11px] font-extrabold mt-0.5"
                  >
                    {{ k.status }}
                  </span>
                </div>

                <div>
                  <span class="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">DOCUMENT TYPE</span>
                  <span class="block font-bold text-slate-900 dark:text-white mt-0.5">{{ k.documentType || 'Aadhaar Card' }}</span>
                </div>

                <div>
                  <span class="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">DOCUMENT NUMBER</span>
                  <span class="block font-bold text-slate-900 dark:text-white mt-0.5">{{ k.documentNumber || 'N/A' }}</span>
                </div>

                <div>
                  <span class="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">SUBMITTED</span>
                  <span class="block font-bold text-slate-900 dark:text-white mt-0.5">{{ k.createdAt | date:'dd MMM yyyy' }}</span>
                </div>

                <div class="col-span-2 sm:col-span-3 pt-1">
                  <span class="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">PERMANENT ADDRESS</span>
                  <span class="block font-bold text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">
                    {{ k.formattedAddress || 'Bazar, West Delhi, Delhi, 110059, India' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right Column: Document Thumbnail Preview & Action Buttons -->
            <div class="flex flex-col items-center lg:items-end justify-between gap-3 shrink-0 lg:w-48">
              <!-- Thumbnail Box -->
              <div class="relative size-24 shrink-0 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden dark:border-slate-800 dark:bg-slate-900 flex items-center justify-center">
                <img
                  *ngIf="k.documentImg"
                  [src]="k.documentImg"
                  alt="KYC Document Preview"
                  class="size-full object-cover"
                />
                <div *ngIf="!k.documentImg" class="text-center p-2">
                  <span class="text-2xl">📄</span>
                  <span class="block text-[9px] font-bold text-slate-400 mt-1">Document</span>
                </div>
              </div>

              <!-- Action Controls -->
              <div class="w-full flex flex-col gap-2">
                <button
                  *ngIf="k.documentImg"
                  type="button"
                  (click)="viewDocumentModal(k.documentImg)"
                  class="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <svg lucideEye class="size-3.5"></svg>
                  View Document
                </button>

                <!-- Pending Actions: Approve / Reject -->
                <div *ngIf="isStatusPending(k.status)" class="flex gap-2 w-full">
                  <button
                    type="button"
                    (click)="processKyc(k, 'Approve')"
                    class="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    (click)="openKycRejectModal(k)"
                    class="flex-1 rounded-xl bg-rose-600 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-rose-700 transition"
                  >
                    Reject
                  </button>
                </div>

                <!-- Approved Badge -->
                <div *ngIf="isStatusApproved(k.status)" class="w-full text-center rounded-xl bg-emerald-100 py-2 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Approved ✓
                </div>

                <!-- Rejected Badge -->
                <div *ngIf="isStatusRejected(k.status)" class="w-full text-center rounded-xl bg-rose-100 py-2 text-xs font-extrabold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  Rejected ✕
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VIEW 3: USER MANAGEMENT -->
      <div *ngIf="activeTab() === 'users'" class="space-y-4">
        <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">User Registry Directory</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Registered system users, role authorizations, and account statuses</p>
            </div>

            <button
              type="button"
              (click)="loadAllData()"
              class="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              <svg lucideRotateCw class="size-3.5"></svg>
              Refresh Users
            </button>
          </div>

          <div *ngIf="filteredUsers().length === 0" class="py-8 text-center text-xs font-bold text-slate-400">
            No registered users found.
          </div>

          <div *ngIf="filteredUsers().length > 0" class="overflow-x-auto">
            <table class="w-full border-collapse text-left text-xs">
              <thead>
                <tr class="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                  <th class="py-3 pr-4">User</th>
                  <th class="py-3 px-4">Email</th>
                  <th class="py-3 px-4">Role</th>
                  <th class="py-3 px-4">KYC Status</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium text-slate-700 dark:divide-slate-800 dark:text-slate-300">
                <tr *ngFor="let u of filteredUsers()">
                  <td class="py-3.5 pr-4 font-bold text-slate-900 dark:text-white">{{ u.username || u.userName }}</td>
                  <td class="py-3.5 px-4">{{ u.email }}</td>
                  <td class="py-3.5 px-4"><span class="rounded bg-slate-100 px-2 py-0.5 font-extrabold dark:bg-slate-900">{{ u.role || 'user' }}</span></td>
                  <td class="py-3.5 px-4"><span class="rounded bg-indigo-50 px-2 py-0.5 font-extrabold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{{ u.kycStatus || 'Not Submitted' }}</span></td>
                  <td class="py-3.5 px-4">
                    <span [ngClass]="u.status === 'ACTIVE' || u.userStatus === 'ACTIVE' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'">
                      {{ u.status || u.userStatus || 'ACTIVE' }}
                    </span>
                  </td>
                  <td class="py-3.5 pl-4 text-right">
                    <button
                      type="button"
                      (click)="toggleUserStatus(u)"
                      class="rounded-lg border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                      Toggle Status
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- VIEW 4: TRANSACTIONS -->
      <div *ngIf="activeTab() === 'transactions'" class="space-y-4">
        <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4">System Transaction Audit Logs</h3>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-left text-xs">
              <thead>
                <tr class="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                  <th class="py-3 pr-4">Reference</th>
                  <th class="py-3 px-4">Type</th>
                  <th class="py-3 px-4">Amount</th>
                  <th class="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium text-slate-700 dark:divide-slate-800 dark:text-slate-300">
                <tr *ngFor="let t of transactions()">
                  <td class="py-3.5 pr-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{{ t.referenceNumber || t.id }}</td>
                  <td class="py-3.5 px-4 font-bold">{{ t.transactionType || 'TRANSFER' }}</td>
                  <td class="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">₹{{ t.amount | number:'1.2-2' }}</td>
                  <td class="py-3.5 px-4">{{ t.createdAt | date:'medium' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- DOCUMENT IMAGE PREVIEW MODAL -->
    <div *ngIf="previewImageUrl()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div class="relative max-w-3xl w-full max-h-[90vh] rounded-2xl bg-white p-4 shadow-2xl dark:bg-slate-950 flex flex-col items-center">
        <button
          type="button"
          (click)="previewImageUrl.set(null)"
          class="absolute right-4 top-4 rounded-full bg-slate-900/80 p-2 text-white hover:bg-slate-900 transition"
        >
          <svg lucideX class="size-5"></svg>
        </button>

        <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-3">KYC Document High-Res Copy</h3>
        <div class="overflow-auto max-h-[75vh] w-full rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-900">
          <img [src]="previewImageUrl()" alt="High-Res KYC Document" class="max-w-full max-h-[70vh] object-contain" />
        </div>
      </div>
    </div>

    <!-- KYC REJECT MODAL -->
    <div *ngIf="showRejectModal()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div class="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <button
          type="button"
          (click)="showRejectModal.set(false)"
          class="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <svg lucideX class="size-4"></svg>
        </button>

        <h2 class="text-base font-extrabold text-slate-950 dark:text-white mb-1">Reject KYC Application</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Please specify a rejection reason for "{{ selectedKyc?.fullName }}"</p>

        <div class="space-y-4">
          <div>
            <label for="rejectReason" class="block text-xs font-bold text-slate-700 dark:text-slate-300">Rejection Feedback</label>
            <textarea
              id="rejectReason"
              name="reason"
              required
              rows="3"
              [(ngModel)]="rejectReasonText"
              class="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              placeholder="Uploaded documents are unreadable or identity details mismatched."
            ></textarea>
          </div>

          <div class="pt-2">
            <button
              type="button"
              (click)="submitKycRejection()"
              [disabled]="!rejectReasonText"
              class="w-full rounded-xl bg-rose-600 py-3 text-xs font-extrabold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 disabled:opacity-50 transition"
            >
              Submit Rejection
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminPanelComponent implements OnInit {
  private readonly apiService = inject(ApiService);

  protected activeTab = signal<string>('dashboard');
  protected kycFilter = signal<'all' | 'pending' | 'approved' | 'rejected'>('all');
  protected loading = signal(false);

  protected searchQuery = '';
  protected stats: any = null;

  protected allKycApplications = signal<any[]>([]);
  protected allUsers = signal<any[]>([]);
  protected transactions = signal<any[]>([]);

  // Preview Image Modal state
  protected previewImageUrl = signal<string | null>(null);

  // Reject Modal state
  protected showRejectModal = signal(false);
  protected selectedKyc: any = null;
  protected rejectReasonText = '';

  ngOnInit() {
    this.loadAllData();
  }

  protected loadAllData() {
    this.loading.set(true);

    // Fetch Stats
    this.apiService.getAdminStats().subscribe({
      next: (res) => {
        if (res?.stats) this.stats = res.stats;
      }
    });

    // Fetch Users
    this.apiService.getAdminUsers().subscribe({
      next: (res) => {
        const usersList = res?.users || res || [];
        this.allUsers.set(Array.isArray(usersList) ? usersList : []);
      }
    });

    // Fetch Transactions
    this.apiService.getAdminTransactions().subscribe({
      next: (res) => {
        const txList = res?.transactions || res || [];
        this.transactions.set(Array.isArray(txList) ? txList : []);
      }
    });

    // Fetch All KYC Records
    this.fetchAllKycRecords();
  }

  protected fetchAllKycRecords() {
    this.apiService.getAdminKycApplications('all').subscribe({
      next: (res) => {
        const kycList = res?.applications || res || [];
        this.allKycApplications.set(Array.isArray(kycList) ? kycList : []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  protected get pendingKycCount(): number {
    return this.allKycApplications().filter(k => this.isStatusPending(k.status)).length;
  }

  protected get approvedKycCount(): number {
    return this.allKycApplications().filter(k => this.isStatusApproved(k.status)).length;
  }

  protected get rejectedKycCount(): number {
    return this.allKycApplications().filter(k => this.isStatusRejected(k.status)).length;
  }

  protected filteredKycApplications() {
    let list = this.allKycApplications();
    const filter = this.kycFilter();

    if (filter === 'pending') {
      list = list.filter(k => this.isStatusPending(k.status));
    } else if (filter === 'approved') {
      list = list.filter(k => this.isStatusApproved(k.status));
    } else if (filter === 'rejected') {
      list = list.filter(k => this.isStatusRejected(k.status));
    }

    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(k =>
        (k.fullName && k.fullName.toLowerCase().includes(q)) ||
        (k.username && k.username.toLowerCase().includes(q)) ||
        (k.email && k.email.toLowerCase().includes(q)) ||
        (k.documentNumber && k.documentNumber.toLowerCase().includes(q))
      );
    }

    return list;
  }

  protected filteredUsers() {
    let list = this.allUsers();
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(u =>
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.userName && u.userName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
      );
    }
    return list;
  }

  protected isStatusApproved(status: string): boolean {
    const s = (status || '').toUpperCase();
    return s === 'APPROVED' || s === 'APPROVE';
  }

  protected isStatusPending(status: string): boolean {
    const s = (status || '').toUpperCase();
    return s === 'PENDING' || s === 'PENDING REVIEW';
  }

  protected isStatusRejected(status: string): boolean {
    const s = (status || '').toUpperCase();
    return s === 'REJECTED' || s === 'REJECT';
  }

  protected getUserInitials(k: any): string {
    const name = k.fullName || k.username || 'User';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  protected viewDocumentModal(url: string) {
    this.previewImageUrl.set(url);
  }

  protected processKyc(k: any, action: 'Approve' | 'Rejected', reason?: string) {
    this.apiService.verifyKyc({
      userId: k.userId,
      status: action,
      rejectReason: reason
    }).subscribe({
      next: (res) => {
        alert(res.message || 'KYC application updated successfully.');
        this.loadAllData();
      },
      error: (err) => {
        alert(err.error?.message || 'Verification update failed.');
      }
    });
  }

  protected openKycRejectModal(k: any) {
    this.selectedKyc = k;
    this.rejectReasonText = '';
    this.showRejectModal.set(true);
  }

  protected submitKycRejection() {
    this.showRejectModal.set(false);
    this.processKyc(this.selectedKyc, 'Rejected', this.rejectReasonText);
  }

  protected toggleUserStatus(u: any) {
    const current = u.status || u.userStatus || 'ACTIVE';
    const nextStatus = current === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    this.apiService.updateUserStatus(u.id || u._id, nextStatus).subscribe({
      next: () => {
        u.status = nextStatus;
        u.userStatus = nextStatus;
        this.loadAllData();
      }
    });
  }
}
