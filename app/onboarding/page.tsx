"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StarfieldCanvas from "../components/StarFieldCanvas";
import { useRouter } from "next/navigation";
import { initUser } from "@/lib/api/auth.api";
import { apiClient } from "@/lib/api/client";
type Step =
  | "INITIALIZE"
  | "PROCESSING_1"
  | "EVALUATION"
  | "PROCESSING_2"
  | "COMPLETE";

export default function Onboarding() {
  const [step, setStep] = useState<Step>("INITIALIZE");
  const [target, setTarget] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);

  useEffect(() => {
    const checkExistingUser = async () => {
      const userId = localStorage.getItem("user_id");

      if (!userId) return;

      try {
        const res = await apiClient(`/auth/users/${userId}`);

        // if onboarding already completed → go dashboard
        if (res.onboarding_completed) {
          router.push("/dashboard");
          return;
        }

        // user exists but onboarding not finished
        if (res.goal) {
          setTarget(res.goal);
        }

        // continue onboarding questions
        setStep("PROCESSING_1");
      } catch (err: any) {
        // user not found or invalid local storage
        console.log("Invalid stored user, restarting onboarding");

        localStorage.removeItem("user_id");
        localStorage.removeItem("evaluation_questions");
        localStorage.removeItem("user_goal");
        localStorage.removeItem("system_initialized");

        setStep("INITIALIZE");
      }
    };

    checkExistingUser();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) return;

        // check cache first
        const cached = localStorage.getItem("evaluation_questions");
        if (cached) {
          setQuestions(JSON.parse(cached));
          setStep("EVALUATION");
          return;
        }

        setLoadingQuestions(true);

        const res = await apiClient(
          `/ai/evaluation-questions?user_id=${userId}`,
        );

        const merged = [
          ...(res.static_questions || []),
          ...(res.dynamic_questions || []),
        ];

        setQuestions(merged);

        // cache questions
        localStorage.setItem("evaluation_questions", JSON.stringify(merged));

        setStep("EVALUATION");
      } catch (err) {
        console.log("Failed to fetch evaluation questions", err);
      } finally {
        setLoadingQuestions(false);
      }
    };

    if (step === "PROCESSING_1") {
      fetchQuestions();
    }

    if (step === "PROCESSING_2") {
      setTimeout(() => setStep("COMPLETE"), 4500);
    }
  }, [step]);

  const nextQuestion = async (value?: any) => {
    const q = questions[currentQuestion];

    // save answer
    if (q) {
      setAnswers((prev) => [
        ...prev,
        {
          question_id: q.id || currentQuestion + 1,
          question: q.question,
          answer: value ?? "skipped",
        },
      ]);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // all questions done → submit to backend
      try {
        const userId = localStorage.getItem("user_id");
        if (userId) {
          await apiClient("/ai/submit-evaluation", {
            method: "POST",
            body: JSON.stringify({
              user_id: Number(userId),
              answers: [
                ...answers,
                {
                  question_id: q.id || currentQuestion + 1,
                  question: q.question,
                  answer: value ?? "skipped",
                },
              ],
            }),
          });
        }
      } catch (err) {
        console.log("Evaluation submit failed", err);
      }

      setStep("PROCESSING_2");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20 flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Subtle Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      {/* Scanning line */}
      {/* <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: "100%" }}
        transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-30"
      /> */}

      <StarfieldCanvas />
      <AnimatePresence mode="wait">
        {/* STATE 1: INITIALIZATION */}
        {step === "INITIALIZE" && (
          <motion.div
            key="init"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="z-10 w-full max-w-2xl text-center"
          >
            <p className="text-[10px] font-mono tracking-[0.4em] text-white/60 uppercase mb-8">
              // TARGET INITIALIZATION
            </p>
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter mb-12">
              DEFINE YOUR <span className="font-bold">TARGET</span>
            </h1>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              type="email"
              className="bg-transparent border-b border-white/10 py-4 text-lg md:text-xl text-center focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/50 font-light mb-8"
            />
            <input
              autoFocus
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Who do you intend to become?"
              className="w-full bg-transparent border-b border-white/10 py-4 text-xl md:text-2xl text-center focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/50 font-light mb-12"
            />
            {target && (
              <p className="mt-6 text-white/60 font-mono text-[11px] tracking-widest uppercase py-3">
                TARGET LOCKING: {target}
              </p>
            )}
            <button
              onClick={async () => {
                try {
                  if (!email) {
                    alert("User email not found. Restart system.");
                    return;
                  }

                  const res = await initUser({
                    email,
                    goal: target,
                  });

                  // store recognition for future visits
                  localStorage.setItem("user_id", res.user_id);
                  localStorage.setItem("system_initialized", "true");
                  localStorage.setItem("user_goal", target);

                  setStep("PROCESSING_1");
                } catch (err: any) {
                  console.log(err.message);
                  alert(err.message || "Initialization failed");
                }
              }}
              disabled={!target || !email}
              className="px-12 py-4 border border-white/20 hover:bg-white/5 text-[11px] font-mono tracking-[0.3em] uppercase transition-all disabled:opacity-20"
            >
              Confirm Target
            </button>
          </motion.div>
        )}

        {/* STATE 2: PROCESSING (CINEMATIC) */}
        {step === "PROCESSING_1" && (
          <motion.div
            key="proc1"
            className="z-10 text-center font-mono text-[11px] tracking-[0.3em] text-white/80 uppercase"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Target accepted
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-4"
            >
              Analyzing intent...
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              className="mt-4 text-white"
            >
              {loadingQuestions
                ? "Generating evaluation questions..."
                : "Evaluation ready"}
            </motion.p>
          </motion.div>
        )}

        {/* STATE 3: EVALUATION */}
        {step === "EVALUATION" && (
          <motion.div
            key="eval"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="z-10 w-full max-w-xl"
          >
            {target && (
              <div className="text-center mb-10">
                <p className="text-[10px] font-mono tracking-[0.3em] text-white/40 uppercase mb-2">
                  CURRENT TARGET
                </p>
                <p className="text-white/80 text-lg font-light">{target}</p>
              </div>
            )}
            <div className="flex justify-between items-end mb-12 border-b border-white/5 pb-4">
              <div>
                <p className="text-[10px] font-mono tracking-[0.3em] text-white/60 uppercase mb-1">
                  INITIAL ANALYSIS
                </p>
                <p className="text-[10px] font-mono text-white/60">
                  STEP 0{currentQuestion + 1} / 0{questions.length}
                </p>
              </div>
              <div className="w-32 h-px bg-white/10 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  }}
                  className="absolute inset-0 bg-white/40"
                />
              </div>
            </div>
            <p className="text-[10px] font-mono text-white/50 mt-2">
              ALIGNMENT SCAN:{" "}
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </p>

            <motion.h2
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-2xl md:text-3xl font-light tracking-tight mb-16 h-20 text-center"
            >
              {questions[currentQuestion].question}
            </motion.h2>

            <div className="mb-20 flex justify-center">
              {questions[currentQuestion].type === "number" && (
                <input
                  type="number"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      nextQuestion((e.target as HTMLInputElement).value);
                    }
                  }}
                  className="bg-transparent border-b border-white/20 text-4xl text-center w-32 focus:outline-none focus:border-white font-light"
                  placeholder="0"
                />
              )}

              {questions[currentQuestion].type === "text" && (
                <input
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      nextQuestion((e.target as HTMLInputElement).value);
                    }
                  }}
                  placeholder="Type your answer and press Enter"
                  className="w-full bg-transparent border-b border-white/20 py-4 text-xl md:text-2xl text-center focus:outline-none focus:border-white transition-colors placeholder:text-white/40 font-light"
                />
              )}

              {questions[currentQuestion].type === "choice" && (
                <div className="flex gap-4">
                  {questions[currentQuestion].options?.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => nextQuestion(opt)}
                      className="px-8 py-3 border border-white/10 hover:border-white/40 text-[10px] font-mono tracking-widest uppercase transition-all"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {questions[currentQuestion].type === "slider" && (
                <input
                  type="range"
                  onMouseUp={(e) =>
                    nextQuestion((e.target as HTMLInputElement).value)
                  }
                  className="w-full accent-white opacity-40 hover:opacity-100 transition-opacity"
                />
              )}
            </div>

            {questions[currentQuestion].type !== "choice" && (
              <div className="flex justify-center">
                <button
                  onClick={() => nextQuestion("next")}
                  className="group flex items-center gap-4 text-[11px] font-mono tracking-[0.3em] uppercase text-white/40 hover:text-white transition-colors"
                >
                  Next Phase{" "}
                  <span className="group-hover:translate-x-2 transition-transform">
                    →
                  </span>
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* STATE 4: FINAL PROCESSING */}
        {step === "PROCESSING_2" && (
          <motion.div
            key="proc2"
            className="z-10 text-center font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Evaluating current form...
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-4"
            >
              Measuring discipline...
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.0 }}
              className="mt-4 text-white"
            >
              Constructing evolution protocol...
            </motion.p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 200 }}
              transition={{ duration: 4 }}
              className="h-px bg-white mt-12 mx-auto"
            />
          </motion.div>
        )}

        {/* FINAL STATE */}
        {step === "COMPLETE" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-[0.5em] mb-4">
              PROTOCOL READY
            </h1>
            <p className="text-white/80 font-mono text-xs uppercase tracking-widest mb-12">
              Your evolution begins now.
            </p>
            <button
              onClick={() => router.push("/evaluation")}
              className="px-12 py-4 bg-white text-black text-[11px] font-mono tracking-[.3em] uppercase hover:bg-white/90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.35)]"
            >
              Access Core
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
