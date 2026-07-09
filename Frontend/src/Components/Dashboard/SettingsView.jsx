import { Bell, LockKeyhole, Moon, ShieldCheck, Smartphone } from "lucide-react";
import { useState } from "react";

const settings = [
  {
    key: "notifications",
    title: "Transaction Notifications",
    description: "Receive alerts for credits, debits, and KYC updates.",
    icon: Bell,
    defaultValue: true,
  },
  {
    key: "security",
    title: "Security Alerts",
    description: "Warn me about new devices, failed logins and sensitive account changes.",
    icon: ShieldCheck,
    defaultValue: true,
  },
  {
    key: "biometric",
    title: "Biometric Login",
    description: "Prepare this device for biometric login when mobile support is added.",
    icon: Smartphone,
    defaultValue: false,
  },
  {
    key: "darkMode",
    title: "Dark Mode Preference",
    description: "Save and persist your dark mode preference on this device.",
    icon: Moon,
    defaultValue: false,
  },
];

export default function SettingsView() {
  const [values, setValues] = useState(() => {
    const saved = localStorage.getItem("yono_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return settings.reduce((acc, item) => {
          acc[item.key] = parsed[item.key] !== undefined ? parsed[item.key] : item.defaultValue;
          return acc;
        }, {});
      } catch (e) {
        // ignore
      }
    }
    return settings.reduce((acc, item) => {
      acc[item.key] = item.defaultValue;
      return acc;
    }, {});
  });

  const toggle = (key) => {
    setValues((current) => {
      const updated = {
        ...current,
        [key]: !current[key],
      };
      localStorage.setItem("yono_settings", JSON.stringify(updated));

      // Handle dark mode side effects
      if (key === "darkMode") {
        if (updated.darkMode) {
          // If enabled, save the current theme class on the document
          const isDark = document.documentElement.classList.contains("dark");
          localStorage.setItem("yono_theme", isDark ? "dark" : "light");
        } else {
          // If disabled, remove the saved theme preference
          localStorage.removeItem("yono_theme");
        }
      }
      return updated;
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-950">Settings</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage preferences for your YONO App banking experience.
        </p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
            <LockKeyhole className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-950">Account Controls</h3>
            <p className="text-sm text-slate-500">Frontend preferences are ready for backend persistence.</p>
          </div>
        </div>

        <div className="mt-5 divide-y divide-slate-100">
          {settings.map((item) => (
            <div className="flex items-center justify-between gap-4 py-4" key={item.key}>
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <item.icon className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-950">{item.title}</h4>
                  <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">{item.description}</p>
                </div>
              </div>

              <button
                aria-pressed={values[item.key]}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${values[item.key] ? "bg-indigo-600" : "bg-slate-300"
                  }`}
                onClick={() => toggle(item.key)}
                type="button"
              >
                <span
                  className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${values[item.key] ? "left-6" : "left-1"
                    }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
