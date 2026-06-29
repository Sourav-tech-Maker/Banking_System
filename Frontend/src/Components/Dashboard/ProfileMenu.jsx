import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LogOut, Settings, User, ChevronRight } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getInitials(name) {
  return (
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "NX"
  );
}

export default function ProfileMenu({ user, onClose, onNavigate }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName =
    user?.username || user?.name || user?.email?.split("@")[0] || "Customer";

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose?.();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch {
      // Even if logout API fails, clear local state
    } finally {
      sessionStorage.removeItem("nexoraUser");
      navigate("/login", { replace: true });
    }
  };

  const menuItems = [
    {
      label: "View Profile",
      icon: User,
      action: () => {
        onNavigate?.("profile");
        onClose?.();
      },
    },
    {
      label: "Settings",
      icon: Settings,
      action: () => {
        onNavigate?.("settings");
        onClose?.();
      },
    },
  ];

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-2 z-50 w-72 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        {/* User Info Header */}
        <div className="border-b border-slate-100 bg-gradient-to-br from-indigo-50 to-slate-50 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-bold text-white shadow-md">
              {getInitials(displayName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">
                {displayName}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.email || "customer@nexora.com"}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-1.5">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <item.icon className="size-4 text-slate-400" />
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronRight className="size-3.5 text-slate-300" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="border-t border-slate-100 p-1.5">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
          >
            <LogOut className="size-4" />
            <span className="flex-1 text-left">
              {loggingOut ? "Logging out…" : "Logout"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
