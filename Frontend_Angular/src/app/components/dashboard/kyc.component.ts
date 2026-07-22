import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-kyc-verification-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mx-auto max-w-3xl space-y-6 pt-2">
      <!-- Section Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight dark:text-white">KYC Verification</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage identity verification & check live KYC application status</p>
        </div>

        <!-- Navigation Sub-tabs -->
        <div class="flex rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <button
            type="button"
            (click)="activeTab.set('status')"
            [ngClass]="activeTab() === 'status' ? 'bg-indigo-600 text-white font-extrabold shadow-sm' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'"
            class="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition"
          >
            <span>🔍 Check KYC Status</span>
          </button>

          <button
            type="button"
            (click)="activeTab.set('form')"
            [ngClass]="activeTab() === 'form' ? 'bg-indigo-600 text-white font-extrabold shadow-sm' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'"
            class="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition"
          >
            <span>📝 Submit / Update KYC</span>
          </button>
        </div>
      </div>

      <!-- Loading Initial State -->
      <div *ngIf="fetchingInitial()" class="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div class="flex items-center justify-center gap-3 text-slate-600 font-semibold dark:text-slate-400">
          <svg class="animate-spin h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Fetching live KYC verification status...
        </div>
      </div>

      <!-- TAB 1: CHECK KYC STATUS SECTION -->
      <div *ngIf="!fetchingInitial() && activeTab() === 'status'" class="space-y-6">
        <!-- Status Card -->
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800/80">
            <div class="flex items-center gap-3">
              <div class="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                🛡️
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">KYC Verification Overview</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Current status of your compliance application</p>
              </div>
            </div>

            <button
              type="button"
              (click)="fetchStatus()"
              class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              🔄 Refresh
            </button>
          </div>

          <!-- Status Badge Banner -->
          <div class="mt-5">
            <!-- APPROVED STATUS -->
            <div *ngIf="isApproved()" class="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold">
                    ✓
                  </div>
                  <div>
                    <span class="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      APPROVED & VERIFIED
                    </span>
                    <h4 class="mt-1 text-sm font-bold text-slate-900 dark:text-white">Full Banking Features Unlocked</h4>
                  </div>
                </div>
              </div>
              <p class="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-300">
                Your identity documents have been verified by compliance. You are cleared for unlimited transfers, high-yield accounts, and international payments.
              </p>
            </div>

            <!-- PENDING STATUS -->
            <div *ngIf="isPending()" class="rounded-xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/50 dark:bg-amber-950/30">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white font-bold">
                    ⏳
                  </div>
                  <div>
                    <span class="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      UNDER ADMIN REVIEW
                    </span>
                    <h4 class="mt-1 text-sm font-bold text-slate-900 dark:text-white">Application Processing</h4>
                  </div>
                </div>
              </div>
              <p class="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-300">
                Your KYC application has been received and is in queue for manual verification. Review typically completes within 24 to 48 hours.
              </p>
            </div>

            <!-- REJECTED STATUS -->
            <div *ngIf="isRejected()" class="rounded-xl border border-rose-200 bg-rose-50/60 p-5 dark:border-rose-900/50 dark:bg-rose-950/30">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white font-bold">
                    ✕
                  </div>
                  <div>
                    <span class="inline-flex items-center rounded-md bg-rose-100 px-2 py-0.5 text-xs font-extrabold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      VERIFICATION REJECTED
                    </span>
                    <h4 class="mt-1 text-sm font-bold text-slate-900 dark:text-white">Action Required</h4>
                  </div>
                </div>
                <button
                  type="button"
                  (click)="activeTab.set('form')"
                  class="rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition"
                >
                  Re-submit Details
                </button>
              </div>
              <p class="mt-3 text-xs leading-5 text-rose-700 dark:text-rose-300 font-medium">
                Reason: {{ existingKyc()?.rejectionReason || 'Document details could not be verified by compliance' }}
              </p>
            </div>

            <!-- NOT SUBMITTED STATUS -->
            <div *ngIf="!existingKyc()" class="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
              <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">No KYC Application Found</p>
              <h4 class="mt-1 text-sm font-bold text-slate-900 dark:text-white">Complete your verification to unlock full features</h4>
              <button
                type="button"
                (click)="activeTab.set('form')"
                class="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition"
              >
                Submit KYC Now
              </button>
            </div>
          </div>

          <!-- Application Details Grid (If Submitted) -->
          <div *ngIf="existingKyc()" class="mt-6 border-t border-slate-100 pt-6 space-y-6 dark:border-slate-800">
            <div>
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted Information</h4>
              <div class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/40">
                  <span class="block text-[11px] font-medium text-slate-500 dark:text-slate-400">Full Name</span>
                  <span class="block mt-0.5 text-xs font-bold text-slate-900 dark:text-white">{{ existingKyc()?.fullName || 'N/A' }}</span>
                </div>

                <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/40">
                  <span class="block text-[11px] font-medium text-slate-500 dark:text-slate-400">Date of Birth</span>
                  <span class="block mt-0.5 text-xs font-bold text-slate-900 dark:text-white">{{ (existingKyc()?.dateOfBirth | date:'mediumDate') || 'N/A' }}</span>
                </div>

                <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/40">
                  <span class="block text-[11px] font-medium text-slate-500 dark:text-slate-400">Gender</span>
                  <span class="block mt-0.5 text-xs font-bold text-slate-900 dark:text-white">{{ existingKyc()?.gender || 'N/A' }}</span>
                </div>

                <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/40 sm:col-span-2 lg:col-span-3">
                  <span class="block text-[11px] font-medium text-slate-500 dark:text-slate-400">Permanent Address</span>
                  <span class="block mt-0.5 text-xs font-bold text-slate-900 dark:text-white">
                    {{ existingKyc()?.address?.street }}, {{ existingKyc()?.address?.city }}, {{ existingKyc()?.address?.state }}, {{ existingKyc()?.address?.country }} - {{ existingKyc()?.address?.postalCode }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Documents Section -->
            <div *ngIf="existingKyc()?.documents && existingKyc()?.documents.length > 0">
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted Document</h4>
              <div class="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div class="flex items-center gap-3">
                  <div class="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold dark:bg-indigo-950 dark:text-indigo-400">
                    📄
                  </div>
                  <div>
                    <h5 class="text-xs font-bold text-slate-900 dark:text-white">{{ existingKyc()?.documents[0]?.documentType }}</h5>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">ID Number: {{ existingKyc()?.documents[0]?.documentNumber }}</p>
                  </div>
                </div>

                <a
                  *ngIf="existingKyc()?.documents[0]?.documentImageUrl"
                  [href]="existingKyc()?.documents[0]?.documentImageUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition dark:border-slate-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                >
                  <span>👁️ View Copy</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: SUBMIT / UPDATE FORM SECTION -->
      <div *ngIf="!fetchingInitial() && activeTab() === 'form'" class="space-y-6">
        <!-- Success Banner -->
        <div *ngIf="success()" class="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-3xl dark:bg-emerald-950 dark:text-emerald-400">
            ✓
          </div>
          <h2 class="mt-5 text-xl font-bold text-slate-950 dark:text-white">KYC Application Submitted!</h2>
          <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Your verification details have been updated and sent to our admin compliance team for review.
          </p>
          <div class="mt-6 flex justify-center gap-3">
            <button
              type="button"
              (click)="activeTab.set('status')"
              class="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
            >
              View KYC Status
            </button>
          </div>
        </div>

        <!-- Registration / Re-submission Form -->
        <div *ngIf="!success()" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div>
            <h2 class="text-xl font-bold text-slate-950 dark:text-white">Submit Identification Details</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload verified identity document to activate your account for transactions.</p>
          </div>

          <div *ngIf="error()" class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            {{ error() }}
          </div>

          <form (submit)="handleSubmit($event)" class="mt-6 space-y-5">
            <!-- Full Name -->
            <div>
              <label for="fullName" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name (as in Document)</label>
              <input
                id="fullName"
                type="text"
                name="FullName"
                required
                [(ngModel)]="formData.FullName"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                placeholder="John Doe"
              />
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <!-- Date of Birth -->
              <div>
                <label for="dob" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth</label>
                <input
                  id="dob"
                  type="date"
                  name="dateOfBirth"
                  required
                  [(ngModel)]="formData.dateOfBirth"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <!-- Gender -->
              <div>
                <label for="gender" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  required
                  [(ngModel)]="formData.gender"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <!-- Address -->
            <div class="border-t border-slate-100 pt-4 space-y-4 dark:border-slate-800">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">Permanent Address</h3>
              
              <div>
                <label for="street" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Street Address</label>
                <input
                  id="street"
                  type="text"
                  name="street"
                  required
                  [(ngModel)]="formData.permanentAddress.street"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  placeholder="123 Main St"
                />
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label for="city" class="block text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    required
                    [(ngModel)]="formData.permanentAddress.city"
                    class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    placeholder="Mumbai"
                  />
                </div>

                <div>
                  <label for="state" class="block text-sm font-medium text-slate-700 dark:text-slate-300">State / Province</label>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    required
                    [(ngModel)]="formData.permanentAddress.state"
                    class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    placeholder="Maharashtra"
                  />
                </div>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label for="country" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Country</label>
                  <input
                    id="country"
                    type="text"
                    name="country"
                    required
                    [(ngModel)]="formData.permanentAddress.country"
                    class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    placeholder="India"
                  />
                </div>

                <div>
                  <label for="postalCode" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Postal / Zip Code</label>
                  <input
                    id="postalCode"
                    type="text"
                    name="postalCode"
                    required
                    [(ngModel)]="formData.permanentAddress.postalCode"
                    class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    placeholder="400001"
                  />
                </div>
              </div>
            </div>

            <!-- Document Upload -->
            <div class="border-t border-slate-100 pt-4 space-y-4 dark:border-slate-800">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">Identification Document</h3>

              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label for="docType" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Document Type</label>
                  <select
                    id="docType"
                    name="documentType"
                    required
                    [(ngModel)]="formData.documentType"
                    class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="Passport">Passport</option>
                    <option value="Aadhar-card">Aadhaar Card</option>
                    <option value="Driver License">Driver's License</option>
                    <option value="Pan-Card">PAN Card</option>
                  </select>
                </div>

                <div>
                  <label for="docNumber" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Document Number</label>
                  <input
                    id="docNumber"
                    type="text"
                    name="documentNumber"
                    required
                    [(ngModel)]="formData.documentNumber"
                    class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    placeholder="Enter unique ID number"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Upload Document Copy (JPG/PNG, max 5MB)</label>
                <input
                  type="file"
                  (change)="onFileSelected($event)"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  class="mt-1.5 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            </div>

            <div class="pt-2">
              <button
                type="submit"
                [disabled]="loading() || !documentFile"
                class="w-full rounded-lg bg-indigo-600 py-3 text-white font-semibold shadow-sm transition hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg *ngIf="loading()" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading() ? 'Submitting KYC...' : 'Submit Verification' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class KycVerificationViewComponent implements OnInit {
  private readonly apiService = inject(ApiService);

  protected activeTab = signal<'status' | 'form'>('status');
  protected fetchingInitial = signal(true);
  protected loading = signal(false);
  protected success = signal(false);
  protected error = signal('');
  protected documentFile: File | null = null;
  protected existingKyc = signal<any>(null);

  protected formData = {
    FullName: '',
    dateOfBirth: '',
    gender: 'Male',
    permanentAddress: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    },
    documentType: 'Aadhar-card',
    documentNumber: ''
  };

  ngOnInit() {
    this.fetchStatus();
  }

  protected fetchStatus() {
    this.fetchingInitial.set(true);
    this.apiService.getMyKyc().subscribe({
      next: (res) => {
        this.fetchingInitial.set(false);
        this.existingKyc.set(res);
        if (res) {
          if (res.fullName) this.formData.FullName = res.fullName;
          if (res.gender) this.formData.gender = res.gender;
          if (res.dateOfBirth) {
            this.formData.dateOfBirth = new Date(res.dateOfBirth).toISOString().split('T')[0];
          }
          if (res.address) {
            this.formData.permanentAddress = {
              street: res.address.street || '',
              city: res.address.city || '',
              state: res.address.state || '',
              country: res.address.country || '',
              postalCode: res.address.postalCode || ''
            };
          }
          if (res.documents && res.documents.length > 0) {
            this.formData.documentType = res.documents[0].documentType || 'Aadhar-card';
            this.formData.documentNumber = res.documents[0].documentNumber || '';
          }
        } else {
          this.activeTab.set('form');
        }
      },
      error: () => {
        this.fetchingInitial.set(false);
        this.activeTab.set('form');
      }
    });
  }

  protected isApproved(): boolean {
    const k = this.existingKyc();
    if (!k) return false;
    const status = (k.kycStatus || k.status || '').toUpperCase();
    return status === 'APPROVED' || status === 'APPROVE';
  }

  protected isPending(): boolean {
    const k = this.existingKyc();
    if (!k) return false;
    const status = (k.kycStatus || k.status || '').toUpperCase();
    return status === 'PENDING';
  }

  protected isRejected(): boolean {
    const k = this.existingKyc();
    if (!k) return false;
    const status = (k.kycStatus || k.status || '').toUpperCase();
    return status === 'REJECTED';
  }

  protected onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.documentFile = file;
    }
  }

  protected handleSubmit(event: Event) {
    event.preventDefault();
    if (!this.documentFile) {
      this.error.set('Please upload a document image copy');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set(false);

    const payload = new FormData();
    payload.append('fullName', this.formData.FullName);
    payload.append('dateOfBirth', this.formData.dateOfBirth);
    payload.append('gender', this.formData.gender);
    payload.append('permanentAddress', JSON.stringify(this.formData.permanentAddress));
    payload.append('documentType', this.formData.documentType);
    payload.append('documentNumber', this.formData.documentNumber);
    payload.append('documentImg', this.documentFile);

    this.apiService.registerKyc(payload).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
        this.fetchStatus();
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.error.set(err.error?.message || 'A KYC application has already been submitted for this account.');
        } else {
          this.error.set(err.error?.message || 'Failed to submit KYC. Please check your inputs and try again.');
        }
      }
    });
  }
}
