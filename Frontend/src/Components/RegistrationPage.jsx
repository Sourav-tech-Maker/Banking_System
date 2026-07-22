import { useState } from "react";
import axios from "axios";
import buildingBg from "../assets/login_building.png";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Shield,
  Zap,
  BarChart3,
  ChevronDown,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  Apple,
  Globe
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AUTH_API_BASE_URL } from "../config/api";

const RegistrationPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    dob: "",
    password: "",
    confirmPassword: "",
    role: "user",
    roleAccessKey: ""
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const needsRbac = formData.role === "admin" || formData.role === "systemUser";

  // Password requirements checks
  const isLengthValid = formData.password.length >= 8;
  const isNumberValid = /\d/.test(formData.password);
  const isSpecialValid = /[@$!%*?&]/.test(formData.password);
  const hasUppercase = /[A-Z]/.test(formData.password);

  // Strength calculation score
  let strengthScore = 0;
  if (formData.password.length > 0) {
    if (isLengthValid) strengthScore++;
    if (isNumberValid) strengthScore++;
    if (isSpecialValid) strengthScore++;
    if (hasUppercase) strengthScore++;
  }

  const getStrengthLabel = () => {
    if (formData.password.length === 0) return t("register.strength_empty");
    if (strengthScore <= 1) return t("register.strength_weak");
    if (strengthScore <= 3) return t("register.strength_medium");
    return t("register.strength_strong");
  };

  const getStrengthColorClass = () => {
    if (strengthScore <= 1) return "text-red-500";
    if (strengthScore <= 3) return "text-amber-500";
    return "text-emerald-500";
  };

  const getStrengthBarClass = (index) => {
    if (strengthScore === 0) return "bg-slate-100";
    if (index < strengthScore) {
      if (strengthScore <= 1) return "bg-red-500";
      if (strengthScore <= 3) return "bg-amber-500";
      return "bg-emerald-500";
    }
    return "bg-slate-100";
  };

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Helper mapping to display full language names in the selector button
  const languageNames = {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    hi: "हिन्दी"
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "role" && value === "user") {
        updated.roleAccessKey = "";
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (!termsAccepted) {
      setErrorMessage("You must agree to the Terms & Conditions");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${AUTH_API_BASE_URL}/api/auth/register`,
        {
          username: formData.fullName, // Mapping fullName to username expected by API
          email: formData.email,
          password: formData.password,
          role: formData.role,
          roleAccessKey: formData.roleAccessKey
        },
        {
          withCredentials: true
        }
      );
      setErrorMessage("");
      setSuccessMessage(response.data.message);

      setTimeout(() => {
        navigate("/verify-otp", {
          state: {
            email: formData.email,
          },
        });
      }, 2000);
    } catch (error) {
      setSuccessMessage("");
      setErrorMessage(
        error.response?.data?.message || "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-xs w-full text-center">
            <ThreeCircles
              visible={true}
              height="100"
              width="100"
              color="#4fa94d"
              ariaLabel="three-circles-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
            <p className="mt-5 text-lg font-bold text-slate-800 tracking-wide">
              {t("register.loading_creating")}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {t("register.loading_desc")}
            </p>
          </div>
        </div>
      )}

      <main className="flex min-h-screen w-full bg-slate-950 font-sans text-slate-900 overflow-hidden">

        <section className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden text-white bg-slate-950">

          <div className="absolute inset-0 z-0">
            
            <img src={buildingBg} alt="YONO Apping HQ" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/60" />
            <div className="absolute inset-0 bg-slate-950/30" />
          </div>

          {/* Top Branding Logo */}
          <div className="relative z-10 flex items-center">
            <div className="relative w-8 h-10 bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-600 rounded-lg flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-indigo-500/20">
              1
            </div>
            <div className="ml-3">
              <span className="block text-3xl font-extrabold tracking-widest text-white leading-none">YONO</span>
              <span className="block text-[12px] tracking-[0.25em] text-slate-400 font-bold uppercase">{t("brand.logo_sub")}</span>
            </div>
          </div>

          {/* Center Info Panel */}
          <div className="relative z-10 space-y-8 max-w-lg my-auto">
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="inline-block bg-gradient-to-r from-white via-slate-500 to-slate-300 bg-clip-text text-transparent">
                {t("brand.headline_white")}
              </span>
              <span className="inline-block bg-gradient-to-r from-white via-slate-500 to-slate-300 bg-clip-text text-transparent transition-transform duration-300 hover:scale-[1.3] cursor-default origin-left">
                {t("brand.headline_highlight")}
              </span>
            </h1>
            <p className="text-slate-300 text-base lg:text-lg leading-relaxed">
              {t("register_features.subtitle")}
            </p>

            {/* Feature Checkpoints */}
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-indigo-400 shadow-inner shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{t("register_features.security_title")}</h4>
                  <p className="text-sm text-slate-400 mt-1">{t("register_features.security_desc")}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-indigo-400 shadow-inner shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{t("register_features.onboarding_title")}</h4>
                  <p className="text-sm text-slate-400 mt-1">{t("register_features.onboarding_desc")}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-indigo-400 shadow-inner shrink-0">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{t("register_features.insights_title")}</h4>
                  <p className="text-sm text-slate-400 mt-1">{t("register_features.insights_desc")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Banner */}
          <div className="relative z-10">
            <div className="flex items-center gap-4 p-4 bg-slate-900/40 backdrop-blur-lg border border-white/10 rounded-2xl max-w-sm">
              <Lock className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-white">{t("brand.trust_title")}</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">{t("brand.trust_desc")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Registration Form */}
        <section className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">

          {/* Top Already Have an Account Link & Language Selector */}
          <div className="absolute top-6 right-8 flex items-center gap-4 text-xs text-slate-500 z-20">
            <div className="font-semibold">
              {t("register.login_prompt")}{" "}
              <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                {t("register.login_link")}
              </Link>
            </div>

            {/* Language dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer bg-white">
                <Globe className="w-3.5 h-3.5" />
                <span>{languageNames[i18n.language.split('-')[0]] || "English"}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsLangDropdownOpen(false)}
                  />

                  <div className="absolute right-0 mt-1.5 w-32 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-20 animate-fadeIn text-left">
                    {[
                      { code: "en", label: "English" },
                      { code: "hi", label: "हिन्दी" },
                      { code: "es", label: "Spain" },
                      { code: "fr", label: "France" },
                      { code: "de", label: "Germany" },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors ${i18n.language.startsWith(lang.code) ? "text-indigo-600 font-bold bg-indigo-50/50" : "text-slate-600 font-medium"
                          }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="w-full max-w-[480px] space-y-6 py-6">
            {/* Header Content */}
            <div className="space-y-1 pt-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {t("register.title").split(/YONO/).map((part, index, arr) => (
                  <span key={index}>
                    {part}
                    {index < arr.length - 1 && (
                      <span className="inline-block font-bold text-indigo-600 transition-transform duration-300 hover:scale-[1.2] cursor-default">YONO</span>
                    )}
                  </span>
                ))
                }
              </h2>
              <p className="text-slate-500 text-sm">
                {t("register.subtitle").split(/YONO/).map((part, index, arr) => (
                  <span key={index}>
                    {part}
                    {index < arr.length - 1 && (
                      <span className="font-bold text-indigo-600">YONO</span>
                    )}
                  </span>
                ))}
              </p>
            </div>

            {/* Alerts */}
            {successMessage && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <div className="flex-1">
                  <span className="font-bold">Success</span>
                  <p className="mt-0.5 text-slate-600">{successMessage}</p>
                </div>
                <button onClick={() => setSuccessMessage("")} className="text-slate-400 hover:text-slate-700 transition-colors">✕</button>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1">
                  <span className="font-bold">Error</span>
                  <p className="mt-0.5 text-slate-600">{errorMessage}</p>
                </div>
                <button onClick={() => setErrorMessage("")} className="text-slate-400 hover:text-slate-700 transition-colors">✕</button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name & Email Address Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t("register.name_label")}</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder={t("register.name_placeholder")}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm transition-all duration-150"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t("register.email_label")}</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder={t("register.email_placeholder")}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm transition-all duration-150"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Number & Date of Birth Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t("register.mobile_label")}</label>
                  <div className="flex rounded-xl border border-slate-200 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 bg-white overflow-hidden text-sm">
                    <div className="flex items-center gap-1 bg-slate-50 px-3 border-r border-slate-200 cursor-pointer">
                      <span className="text-base select-none">🇮🇳</span>
                      <span className="text-xs font-bold text-slate-700">+91</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder={t("register.mobile_placeholder")}
                      className="flex-1 px-3 py-2.5 outline-none bg-transparent text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t("register.dob_label")}</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Sign in Role & RBAC Keys */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-sans">{t("register.role_label")}</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm appearance-none cursor-pointer"
                    >
                      <option value="user">{t("login.role_user")}</option>
                      <option value="admin">{t("login.role_admin")}</option>
                      <option value="systemUser">{t("login.role_sys")}</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {needsRbac && (
                  <div className="space-y-1.5 animate-slideDown">
                    <label className="text-xs font-bold text-slate-700">{t("register.rbac_label")}</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        name="roleAccessKey"
                        value={formData.roleAccessKey}
                        onChange={handleChange}
                        required
                        placeholder={t("register.rbac_placeholder")}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm transition-all duration-150"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Password Fields */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{t("register.password_label")}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder={t("register.password_placeholder")}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm transition-all duration-150"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password.length > 0 && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-slate-500 font-semibold select-none">
                      {t("register.strength_label")} <span className={`font-bold ${getStrengthColorClass()}`}>{getStrengthLabel()}</span>
                    </span>
                    <div className="flex gap-1 flex-1 max-w-[120px] h-1 rounded-full overflow-hidden bg-slate-100">
                      {[0, 1, 2, 3].map((index) => (
                        <div key={index} className={`flex-1 h-full rounded-full transition-all duration-300 ${getStrengthBarClass(index)}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{t("register.confirm_password_label")}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder={t("register.confirm_password_placeholder")}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm transition-all duration-150"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password checklist card */}
              <div className="p-3.5 rounded-xl border border-indigo-500/10 bg-indigo-500/5 text-slate-600 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold select-none">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>Password must contain:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-semibold text-[10px] text-slate-500 select-none">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${isLengthValid ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>✓</div>
                    <span className={isLengthValid ? 'text-slate-800 font-bold' : ''}>{t("register.req_length")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${isNumberValid ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>✓</div>
                    <span className={isNumberValid ? 'text-slate-800 font-bold' : ''}>{t("register.req_number")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${isSpecialValid ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>✓</div>
                    <span className={isSpecialValid ? 'text-slate-800 font-bold' : ''}>{t("register.req_special")}</span>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 mt-0.5"
                />
                <label htmlFor="terms-checkbox" className="text-xs text-slate-500 hover:text-slate-800 select-none font-semibold leading-relaxed">
                  {t("register.terms_label")}
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#4f46e5] hover:bg-indigo-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-150 flex items-center justify-center gap-2 text-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? t("register.btn_registering") : t("register.btn_register")}</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="absolute w-full h-[1px] bg-slate-100" />
              <span className="relative px-3 text-xs tracking-wider text-slate-400 bg-white">
                or sign up with
              </span>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-3 gap-3">
              <button type="button" className="flex justify-center items-center py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC04" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
              </button>
              <button type="button" className="flex justify-center items-center py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-800">
                <Apple className="w-5 h-5" />
              </button>
              <button type="button" className="flex justify-center items-center py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-blue-600">
                <Shield className="w-5 h-5" />
              </button>
            </div>

          </div>
        </section>
      </main>
    </>
  );
};

export default RegistrationPage;



