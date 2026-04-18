"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface UserContextType {
  userId: number | null;
  userGoal: string | null;
  setUserId: (id: number) => void;
  setUserGoal: (goal: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  userId: null,
  userGoal: null,
  setUserId: () => {},
  setUserGoal: () => {},
  logout: () => {},
});

export const useUser = () => useContext(UserContext);

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdState] = useState<number | null>(null);
  const [userGoal, setUserGoalState] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const rawId = localStorage.getItem("user_id");
    const rawGoal = localStorage.getItem("user_goal");

    if (rawId) {
      setUserIdState(Number(rawId));
    }
    if (rawGoal) {
      setUserGoalState(rawGoal);
    }

    // Route Protection / Persistent Session Auto-Login
    if (!rawId && pathname !== "/" && !pathname.startsWith("/onboarding")) {
      router.push("/onboarding");
    } else if (rawId && pathname === "/") {
      router.push("/dashboard");
    }
  }, [pathname, router]);

  const setUserId = (id: number) => {
    localStorage.setItem("user_id", id.toString());
    setUserIdState(id);
  };

  const setUserGoal = (goal: string) => {
    localStorage.setItem("user_goal", goal);
    setUserGoalState(goal);
  };

  const logout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_goal");
    localStorage.removeItem("system_initialized");
    localStorage.removeItem("eval_result");
    localStorage.removeItem("local_eval_answers");
    localStorage.removeItem("evaluation_questions");
    setUserIdState(null);
    setUserGoalState(null);
    router.push("/onboarding");
  };

  return (
    <UserContext.Provider value={{ userId, userGoal, setUserId, setUserGoal, logout }}>
      {children}
    </UserContext.Provider>
  );
}
