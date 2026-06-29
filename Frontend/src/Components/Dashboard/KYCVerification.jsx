import { useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const steps = [
  { id: 1, label: "Personal Info", icon: User },
  { id: 2, label: "Address", icon: MapPin },
  { id: 3, label: "Documents", icon: FileText },
];

const documentTypes = [
  "Passport",
  "Aadhar-card",
  "Driver License",
  "Pan-Card",
];

const genderOptions = ["Male", "Female", "Other"];

export default function KYCVerification() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    FullName: "",
    dateOfBirth: "",
    gender: "",
    permanentAddress: {
      street: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
    },
    documentType: "",
    documentNumber: "",
    documentImg: "",
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddress = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      permanentAddress: { ...prev.permanentAddress, [field]: value },
    }));
  };

  const validateStep = () => {
    setError("");
    if (currentStep === 1) {
      if (!formData.FullName.trim()) return setError("Full name is required"), false;
      if (!formData.dateOfBirth) return setError("Date of birth is required"), false;
      if (!formData.gender) return setError("Gender is required"), false;
      return true;
    }
    if (currentStep === 2) {
      const addr = formData.permanentAddress;
      if (!addr.street.trim()) return setError("Street address is required"), false;
      if (!addr.city.trim()) return setError("City is required"), false;
      if (!addr.state.trim()) return setError("State is required"), false;
      if (!addr.country.trim()) return setError("Country is required"), false;
      if (!addr.postalCode.trim()) return setError("Postal code is required"), false;
      return true;
    }
    if (currentStep === 3) {
      if (!formData.documentType) return setError("Document type is required"), false;
      if (!formData.documentNumber.trim()) return setError("Document number is required"), false;
      if (!formData.documentImg.trim()) return setError("Document image URL is required"), false;
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_BASE_URL}/api/Kyc/register-kyc`, formData, {
        withCredentials: true,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit KYC. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Success State
  if (success) {
    return (
      <div className="mx-auto max-w-lg pt-8">
        <div className="rounded-xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-950">
            KYC Submitted Successfully!
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your KYC application is now under review. Our team will verify your
            documents and approve your application. This typically takes 24-48
            hours.
          </p>
          <div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            <strong>Status:</strong> Pending Admin Approval
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-950">KYC Verification</h2>
        <p className="mt-1 text-sm text-slate-500">
          Complete your identity verification to unlock all banking features.
        </p>
      </div>

      {/* Step Progress */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`flex size-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    currentStep > step.id
                      ? "bg-emerald-500 text-white"
                      : currentStep === step.id
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="size-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`hidden text-sm font-medium sm:block ${
                    currentStep >= step.id ? "text-slate-950" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 rounded-full transition-all ${
                    currentStep > step.id ? "bg-emerald-400" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <User className="size-5" />
              <h3 className="text-base font-bold text-slate-950">
                Personal Information
              </h3>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                value={formData.FullName}
                onChange={(e) => updateField("FullName", e.target.value)}
                placeholder="Enter your full legal name"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateField("dateOfBirth", e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Gender
              </label>
              <div className="flex gap-3">
                {genderOptions.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => updateField("gender", g)}
                    className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                      formData.gender === g
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Address */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <MapPin className="size-5" />
              <h3 className="text-base font-bold text-slate-950">
                Permanent Address
              </h3>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Street Address
              </label>
              <input
                type="text"
                value={formData.permanentAddress.street}
                onChange={(e) => updateAddress("street", e.target.value)}
                placeholder="House no, Street name"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  City
                </label>
                <input
                  type="text"
                  value={formData.permanentAddress.city}
                  onChange={(e) => updateAddress("city", e.target.value)}
                  placeholder="City"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  State
                </label>
                <input
                  type="text"
                  value={formData.permanentAddress.state}
                  onChange={(e) => updateAddress("state", e.target.value)}
                  placeholder="State"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.permanentAddress.country}
                  onChange={(e) => updateAddress("country", e.target.value)}
                  placeholder="Country"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.permanentAddress.postalCode}
                  onChange={(e) => updateAddress("postalCode", e.target.value)}
                  placeholder="PIN Code"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Documents */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <FileText className="size-5" />
              <h3 className="text-base font-bold text-slate-950">
                Document Verification
              </h3>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Document Type
              </label>
              <select
                value={formData.documentType}
                onChange={(e) => updateField("documentType", e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select document type</option>
                {documentTypes.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Document Number
              </label>
              <input
                type="text"
                value={formData.documentNumber}
                onChange={(e) => updateField("documentNumber", e.target.value)}
                placeholder="Enter document number"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Document Image URL
              </label>
              <input
                type="url"
                value={formData.documentImg}
                onChange={(e) => updateField("documentImg", e.target.value)}
                placeholder="https://example.com/document.jpg"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <p className="mt-1 text-xs text-slate-400">
                Upload your document image to a hosting service and paste the URL here.
              </p>
            </div>

            <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> After submission, your KYC will be
                reviewed by our team. Approval typically takes 24-48 hours.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-500"
            >
              Next
              <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" />
                  Submit KYC
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
