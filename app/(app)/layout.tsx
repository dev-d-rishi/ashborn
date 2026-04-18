"use client";

import { ReactNode, createContext, useEffect, useState } from "react";
import FooterNav from "../components/system/FooterNav";
import Header from "../components/system/Header";
import StarfieldCanvas from "../components/StarFieldCanvas";
import { apiClient } from "@/lib/api/client";

export const SystemContext = createContext<any>(null);

export default function AppLayout({ children }: { children: ReactNode }) {
  const [systemData, setSystemData] = useState<any>(null);

  useEffect(() => {
    const loadSystem = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      try {
        const res = await apiClient(`/system/dashboard/${userId}`);

        if (res.tasks && res.tasks.length === 0) {
          await apiClient("/system/generate-protocol", {
            method: "POST",
            body: JSON.stringify({ user_id: Number(userId) })
          });
          const newRes = await apiClient(`/system/dashboard/${userId}`);
          setSystemData(newRes);
        } else {
          setSystemData(res);
        }
      } catch (err) {
        console.error("System load failed", err);
      }
    };

    loadSystem();
  }, []);

  return (
    <SystemContext.Provider value={systemData}>
      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* Header */}
        <Header />
        <StarfieldCanvas />

        {/* Main Content */}
        <main className="flex-1 px-8 py-12">{children}</main>

        {/* Footer Navigation */}
        <FooterNav />
      </div>
    </SystemContext.Provider>
  );
}
