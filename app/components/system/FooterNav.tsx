"use client";

import { useRouter, usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Progress", path: "/progress" },
  { label: "Analysis", path: "/analysis" },
  { label: "System", path: "/system" },
];

export default function FooterNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <footer className="px-8 py-6 border-t border-white/5 bg-black z-50">
      <div className="flex justify-center gap-12 max-w-md mx-auto">
        {["Dashboard", "Progress", "Analysis", "System"].map((item, i) => {
          const path =
            item === "Dashboard"
              ? "/dashboard"
              : item === "Progress"
                ? "/progress"
                : item === "Analysis"
                  ? "/analysis"
                  : "/system";

          return (
            <button
              key={item}
              onClick={() => router.push(path)}
              className={`text-[10px] font-mono tracking-[0.3em] uppercase transition-colors ${i === 0 ? "text-white" : "text-white/35 hover:text-white/55"}`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </footer>
  );
}
