import { useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  RefreshCw,
  Search,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ProfileMenu from "./ProfileMenu";

function getDisplayName(user) {
  return user?.username || user?.name || user?.email?.split("@")[0] || "Customer";
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "NX";
}

const Navbar = ({ user, notificationCount = 0, onRefresh, refreshing, onNavigate }) => {
  const displayName = getDisplayName(user);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileRef = useRef(null);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      onNavigate?.("transactions");
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <SidebarTrigger className="size-9 rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50" />

          {/* Welcome message */}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-slate-950 sm:text-2xl">
              Welcome Back, {displayName}
            </h1>
            <p className="mt-1 hidden text-sm text-slate-500 sm:block">
              Your secure Nexora banking overview is live.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh button */}
          <button
            aria-label="Refresh dashboard"
            className="inline-flex size-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            disabled={refreshing}
            onClick={onRefresh}
            title="Refresh dashboard"
            type="button"
          >
            <RefreshCw className={`size-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          {/* Search Bar */}
          <div className="relative hidden w-48 md:block lg:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-600" />
            <Input
              className="h-10 rounded-2xl bg-white pl-9 text-sm shadow-sm"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          {/* Notification */}
          <button
            aria-label="Notifications"
            className="relative inline-flex size-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            title="Notifications"
            type="button"
          >
            <Bell className="size-5" />
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-bold text-white ring-2 ring-white">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-white py-1.5 pl-1.5 pr-2 shadow-sm transition hover:bg-slate-50"
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <span className="flex size-9 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-bold text-white">
                {getInitials(displayName)}
              </span>
              <ChevronDown className={`hidden size-4 text-slate-500 transition-transform sm:block ${showProfileMenu ? "rotate-180" : ""}`} />
            </button>

            {showProfileMenu && (
              <ProfileMenu
                user={user}
                onClose={() => setShowProfileMenu(false)}
                onNavigate={(view) => {
                  onNavigate?.(view);
                  setShowProfileMenu(false);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
