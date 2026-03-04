"use client";

import { ReactNode } from "react";
import FooterNav from "../components/system/FooterNav";
import Header from "../components/system/Header";
import StarfieldCanvas from "../components/StarFieldCanvas";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <Header />
      <StarfieldCanvas/>

      {/* Main Content */}
      <main className="flex-1 px-8 py-12">{children}</main>

      {/* Footer Navigation */}
      <FooterNav />
    </div>
  );
}
