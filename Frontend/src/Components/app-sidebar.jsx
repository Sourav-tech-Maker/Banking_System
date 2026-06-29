import {
  Landmark,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  ShieldCheck,
  Settings,
  Trophy,
  User,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import logo from "@/assets/logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function readStoredUser() {
  try {
    return JSON.parse(sessionStorage.getItem("nexoraUser")) || {};
  } catch {
    return {};
  }
}

export default function AppSidebar({ activeView = "dashboard", onNavigate }) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  
  const user = readStoredUser();

  const navItems = [
    { title: "Dashboard", icon: LayoutDashboard, view: "dashboard" },
    { title: "Transactions", icon: ReceiptText, view: "transactions" },
    { title: "Open Account", icon: Landmark, view: "open-account" },
    { title: "KYC Verification", icon: ShieldCheck, view: "kyc" },
    { title: "Weekly Tech Quiz", icon: Trophy, view: "quiz" },
    { title: "Profile", icon: User, view: "profile" },
    { title: "Settings", icon: Settings, view: "settings" },
  ];

  if (user?.role === "admin") {
    navItems.push({ title: "Admin Panel", icon: ShieldCheck, view: "admin" });
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
        withCredentials: true,
      });
      sessionStorage.removeItem("nexoraUser");
      navigate("/login", { replace: true });
    } catch (error) {
      const status = error.response?.status;

      if (status === 400 || status === 401) {
        sessionStorage.removeItem("nexoraUser");
        navigate("/login", { replace: true });
        return;
      }

      setLogoutError(error.response?.data?.message || "Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Sidebar className="border-r border-slate-800 bg-[#081120]" collapsible="offcanvas">
      <SidebarHeader className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
            <img alt="Nexora" className="size-8 object-contain" src={logo} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-normal text-white">NEXORA</h1>
            <p className="text-sm font-medium text-slate-400">Secure Banking</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#081120]">
        <SidebarMenu className="gap-1 px-4 py-5">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                className="h-11 rounded-md px-3 text-slate-300 transition hover:bg-indigo-500/15 hover:text-white data-[active=true]:bg-indigo-500/20 data-[active=true]:text-indigo-100 data-[active=true]:ring-1 data-[active=true]:ring-indigo-400/30"
                isActive={activeView === item.view}
                onClick={() => onNavigate?.(item.view)}
                size="lg"
                tooltip={item.title}
              >
                <item.icon className="size-5" />
                <span className="font-semibold">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 bg-[#081120] p-4">
        <div className="mb-3 flex items-center gap-3 rounded-md bg-white/5 px-3 py-3 ring-1 ring-white/10">
          <ShieldCheck className="size-5 shrink-0 text-emerald-300" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">Protected Session</p>
            <p className="truncate text-xs text-slate-400">Bank-grade controls active</p>
          </div>
        </div>
        {logoutError && (
          <p className="mb-3 rounded-md bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-100 ring-1 ring-rose-400/20">
            {logoutError}
          </p>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-11 rounded-md px-3 text-rose-200 transition hover:bg-rose-500/15 hover:text-white disabled:pointer-events-none disabled:opacity-60"
              disabled={isLoggingOut}
              onClick={handleLogout}
            >
              <LogOut className="size-5" />
              <span className="font-semibold">{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
