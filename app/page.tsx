"use client";

import { useState, useEffect, useRef, FormEvent, useCallback } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

type Timeframe = "today" | "monthly" | "yearly";
type ThemeMode = "light" | "dark";

const DONUT_COLORS = ["#e08a6d", "#eab06b", "#6ba38e", "#7c96b8", "#c99b7c"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDateObjToString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRpInput(rawDigits: string): string {
  const digitsOnly = rawDigits.replace(/\D/g, "");
  if (!digitsOnly) return "";
  return Number(digitsOnly).toLocaleString("id-ID");
}

function parseRpInput(formatted: string): number {
  return Number(formatted.replace(/\./g, ""));
}

// === FRIENDLY CATEGORY ICONS ===
function CategoryIcon({
  category,
  className = "w-3.5 h-3.5",
}: {
  category: string;
  className?: string;
}) {
  switch (category) {
    case "Rent":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z"
          />
        </svg>
      );
    case "Food":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 11h16M5 11a7 7 0 0014 0M9 5v2m3-3v3m3-2v2M7 20h10"
          />
        </svg>
      );
    case "Transport":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 16V9a2 2 0 012-2h10a2 2 0 012 2v7M4 16h16v2a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H7v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zm3-4h.01M17 12h.01"
          />
        </svg>
      );
    case "Laundry":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <rect x="4" y="3" width="16" height="18" rx="3" />
          <circle cx="12" cy="13" r="4" />
          <path strokeLinecap="round" d="M8 7h.01M11 7h.01" />
        </svg>
      );
    case "Salary":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <rect x="3" y="6" width="18" height="12" rx="2.5" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case "Freelance":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <rect x="3" y="5" width="18" height="12" rx="2" />
          <path strokeLinecap="round" d="M2 19h20" />
        </svg>
      );
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3l2.2 5.3L20 9l-4.3 3.8L17 18.5 12 15.5l-5 3 1.3-5.7L4 9l5.8-.7L12 3z"
          />
        </svg>
      );
  }
}

// === SIMPLE APP LOGO ===
function AppLogo() {
  return (
    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#eab06b] to-[#d9886c] text-white flex items-center justify-center shadow-sm shrink-0">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 7.5A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v9a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 16.5v-9z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12h5m-3 0a1 1 0 100 .01"
        />
      </svg>
    </div>
  );
}

export default function FinancialTracker() {
  const supabase = createClient();

  // === AUTH & CORE STATE ===
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [authSubmitting, setAuthSubmitting] = useState<boolean>(false);

  const [theme, setTheme] = useState<ThemeMode>("light");
  const [todayStr, setTodayStr] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // === FORM & FILTER STATE ===
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState<string>("Rent");
  const [description, setDescription] = useState<string>("");
  const [amountInput, setAmountInput] = useState<string>("");
  const [timeframe, setTimeframe] = useState<Timeframe>("today");

  // === EDIT STATE ===
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState<string>("");
  const [editAmountInput, setEditAmountInput] = useState<string>("");

  const nativeDateInputRef = useRef<HTMLInputElement | null>(null);

  // === FETCH TRANSACTIONS FROM REST API (GET /api/transactions) ===
  const fetchTransactions = useCallback(async () => {
    setDataLoading(true);
    try {
      const res = await fetch("/api/transactions");
      if (res.ok) {
        const json = await res.json();
        setTransactions(json.transactions || []);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    const nowDateStr = formatDateObjToString(new Date());
    setTodayStr(nowDateStr);
    setSelectedDate(nowDateStr);
    setIsMounted(true);

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthLoading(false);
      if (data.user) {
        fetchTransactions();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchTransactions();
      } else {
        setTransactions([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchTransactions]);

  // === AUTH HANDLERS ===
  const handleAuthSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);

    try {
      if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: unknown) {
      setAuthError(
        err instanceof Error ? err.message : "Authentication failed.",
      );
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setTransactions([]);
  };

  const openCalendarDirectly = () => {
    const inputEl = nativeDateInputRef.current;
    if (!inputEl) return;
    if (typeof inputEl.showPicker === "function") {
      inputEl.showPicker();
    } else {
      inputEl.focus();
      inputEl.click();
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountInput(formatRpInput(e.target.value));
  };

  // === SUMMARY CALCULATIONS ===
  const totalIncome: number = transactions
    .filter((item) => item.type === "income")
    .reduce((acc, item) => acc + item.amount, 0);

  const totalExpense: number = transactions
    .filter((item) => item.type === "expense")
    .reduce((acc, item) => acc + item.amount, 0);

  const balance: number = totalIncome - totalExpense;

  const activeDate = selectedDate || todayStr;
  const transactionsForSelectedDate = transactions.filter(
    (item) => item.date === activeDate,
  );

  // === DONUT CHART DATA ===
  const expenseSource =
    timeframe === "today"
      ? transactionsForSelectedDate.filter((item) => item.type === "expense")
      : transactions.filter((item) => item.type === "expense");

  const expenseByCategory = expenseSource.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    },
    {},
  );

  const donutData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // === TIMEFRAME BAR CHART DATA ===
  const [selYearStr, selMonthStr] = activeDate.split("-");
  const activeMonthPrefix = `${selYearStr}-${selMonthStr}`;
  const activeYearPrefix = selYearStr;

  const timeframeChartData = (() => {
    if (timeframe === "today") {
      const dayIncome = transactionsForSelectedDate
        .filter((i) => i.type === "income")
        .reduce((acc, i) => acc + i.amount, 0);
      const dayExpense = transactionsForSelectedDate
        .filter((i) => i.type === "expense")
        .reduce((acc, i) => acc + i.amount, 0);

      return [
        {
          label: formatDisplayDate(activeDate),
          Income: dayIncome,
          Expense: dayExpense,
        },
      ];
    }

    if (timeframe === "monthly") {
      const weeks = [
        { label: "Week 1", Income: 0, Expense: 0 },
        { label: "Week 2", Income: 0, Expense: 0 },
        { label: "Week 3", Income: 0, Expense: 0 },
        { label: "Week 4", Income: 0, Expense: 0 },
      ];

      transactions
        .filter((item) => item.date.startsWith(activeMonthPrefix))
        .forEach((item) => {
          const dayNum = Number(item.date.split("-")[2] || "1");
          const weekIndex = Math.min(
            3,
            Math.max(0, Math.floor((dayNum - 1) / 7)),
          );
          if (item.type === "income") {
            weeks[weekIndex].Income += item.amount;
          } else {
            weeks[weekIndex].Expense += item.amount;
          }
        });

      return weeks;
    }

    const months = MONTH_NAMES.map((mName) => ({
      label: mName,
      Income: 0,
      Expense: 0,
    }));

    transactions
      .filter((item) => item.date.startsWith(activeYearPrefix))
      .forEach((item) => {
        const monthIndex = Number(item.date.split("-")[1] || "1") - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          if (item.type === "income") {
            months[monthIndex].Income += item.amount;
          } else {
            months[monthIndex].Expense += item.amount;
          }
        }
      });

    return months;
  })();

  const historyItems =
    activeDate === todayStr ? transactions : transactionsForSelectedDate;

  // === REST API CRUD HANDLERS ===
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!description.trim() || !amountInput || isSaving) return;

    const cleanAmount = parseRpInput(amountInput);
    if (isNaN(cleanAmount) || cleanAmount <= 0) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          amount: cleanAmount,
          type,
          category,
          date: activeDate,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setTransactions((prev) => [json.transaction, ...prev]);
        setDescription("");
        setAmountInput("");
        setCategory(type === "expense" ? "Rent" : "Salary");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (item: Transaction) => {
    setEditingId(item.id);
    setEditDescription(item.description);
    setEditAmountInput(item.amount.toLocaleString("id-ID"));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDescription("");
    setEditAmountInput("");
  };

  const saveEdit = async (id: number) => {
    const cleanAmount = parseRpInput(editAmountInput);
    if (!editDescription.trim() || isNaN(cleanAmount) || cleanAmount <= 0) {
      return;
    }

    const res = await fetch(`/api/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: editDescription.trim(),
        amount: cleanAmount,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      setTransactions((prev) =>
        prev.map((item) => (item.id === id ? json.transaction : item)),
      );
      cancelEditing();
    }
  };

  const handleDelete = async (id: number) => {
    if (editingId === id) {
      cancelEditing();
    }
    const res = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setTransactions((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleClearAll = async () => {
    cancelEditing();
    const res = await fetch("/api/transactions", {
      method: "DELETE",
    });
    if (res.ok) {
      setTransactions([]);
    }
  };

  if (!isMounted || authLoading) {
    return null;
  }

  // === THEME TOKENS ===
  const isLight = theme === "light";

  const pageBg = isLight
    ? "bg-[#f8f9fa] text-[#3a3632]"
    : "bg-[#1e1b18] text-[#f3ede4]";
  const cardBg = isLight
    ? "bg-white/95 border-[#e5e7eb] shadow-[0_8px_28px_-10px_rgba(30,41,59,0.08)]"
    : "bg-[#282420]/95 border-[#3d3630] shadow-lg";
  const innerSurface = isLight
    ? "bg-[#f3f4f6] border-[#e5e7eb] text-[#3a3632]"
    : "bg-[#1e1b18] border-[#3d3630] text-[#f3ede4]";
  const mutedText = isLight ? "text-[#6b7280]" : "text-[#a89f94]";
  const headingText = isLight ? "text-[#2f2b28]" : "text-[#f3ede4]";
  const titleAccent = isLight ? "text-[#3a3632]" : "text-[#f3ede4]";
  const dividerBorder = isLight ? "border-[#ebeef2]" : "border-[#3d3630]";

  const positiveMoney = isLight ? "text-emerald-600" : "text-emerald-400";
  const negativeMoney = isLight ? "text-red-600" : "text-rose-400";

  const softOrangeBadge = isLight
    ? "bg-[#fdf3ea] text-[#b86b43]"
    : "bg-[#362c24] text-[#eab06b]";
  const softOrangeBtn = "bg-[#d9886c] hover:bg-[#c9795d] text-white";

  const gridBackgroundStyle = isLight
    ? {
        backgroundImage:
          "linear-gradient(to right, rgba(156, 163, 175, 0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(156, 163, 175, 0.16) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }
    : {
        backgroundImage:
          "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      };

  // === LOGIN / SIGN UP VIEW ===
  if (!user) {
    return (
      <main
        style={gridBackgroundStyle}
        className={`${jakarta.className} min-h-screen w-full ${pageBg} flex items-center justify-center p-4`}
      >
        <div
          className={`${cardBg} border w-full max-w-md p-7 sm:p-9 rounded-[28px]`}
        >
          <div className="flex items-center gap-3.5 mb-6">
            <AppLogo />
            <div>
              <h1 className={`text-2xl font-extrabold ${headingText}`}>
                Personal Finance Tracker
              </h1>
              <p className={`text-sm ${mutedText}`}>
                Sign in to sync your daily money journal
              </p>
            </div>
          </div>

          {/* Login / Sign Up toggle */}
          <div
            className={`grid grid-cols-2 gap-2 p-1.5 rounded-2xl border mb-5 ${innerSurface}`}
          >
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setAuthError("");
              }}
              className={`py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                authMode === "login" ? softOrangeBtn : mutedText
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setAuthError("");
              }}
              className={`py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                authMode === "signup" ? softOrangeBtn : mutedText
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            <div>
              <label
                className={`block text-xs sm:text-sm font-medium mb-1.5 ${mutedText}`}
              >
                Email
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full border rounded-2xl p-3.5 text-sm focus:outline-none ${innerSurface}`}
              />
            </div>

            <div>
              <label
                className={`block text-xs sm:text-sm font-medium mb-1.5 ${mutedText}`}
              >
                Password (min. 6 characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border rounded-2xl p-3.5 text-sm focus:outline-none ${innerSurface}`}
              />
            </div>

            {authError && (
              <p className="text-xs sm:text-sm text-red-600 font-medium">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authSubmitting}
              className={`mt-2 font-bold text-sm sm:text-base py-3.5 rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-60 ${softOrangeBtn}`}
            >
              {authSubmitting
                ? "Please wait..."
                : authMode === "login"
                  ? "Sign In to Dashboard"
                  : "Create Account & Enter"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // === AUTHENTICATED DASHBOARD VIEW ===
  return (
    <main
      style={gridBackgroundStyle}
      className={`${jakarta.className} min-h-screen w-full ${pageBg} py-5 px-4 sm:px-6 lg:px-8 xl:px-10 transition-colors`}
    >
      <style jsx global>{`
        .soft-orange-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .soft-orange-scroll::-webkit-scrollbar-track {
          background: ${isLight ? "#f4efe9" : "#221e1b"};
          border-radius: 9999px;
        }
        .soft-orange-scroll::-webkit-scrollbar-thumb {
          background: ${isLight ? "#e5a98c" : "#7c523c"};
          border-radius: 9999px;
        }
        .soft-orange-scroll::-webkit-scrollbar-thumb:hover {
          background: ${isLight ? "#d9886c" : "#9a664b"};
        }
      `}</style>

      <div className="w-full max-w-[1800px] mx-auto">
        {/* === TOP HEADER: LOGO + TITLE, DATE PICKER, THEME RADIO, USER LOGOUT === */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div className="flex items-center gap-3.5">
            <AppLogo />
            <div>
              <h1
                className={`text-2xl sm:text-3xl xl:text-4xl font-extrabold tracking-tight ${titleAccent}`}
              >
                Personal Finance Tracker
              </h1>
              <p
                className={`text-sm sm:text-base font-medium mt-0.5 ${mutedText}`}
              >
                Simple daily money journal
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Single-click native calendar trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={openCalendarDirectly}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-sm sm:text-base font-semibold transition-all cursor-pointer ${cardBg} ${headingText}`}
              >
                <span>{formatDisplayDate(activeDate)}</span>
                <span className={`text-xs ${mutedText}`}>▾</span>
              </button>

              <input
                ref={nativeDateInputRef}
                type="date"
                value={activeDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                  }
                }}
                aria-label="Pick transaction date"
                className="sr-only"
              />
            </div>

            {/* Light / Dark theme radio switch */}
            <div
              role="radiogroup"
              aria-label="Theme mode"
              className={`flex items-center gap-4 px-4 py-2.5 rounded-2xl border text-sm font-semibold ${cardBg}`}
            >
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="theme-mode"
                  value="light"
                  checked={theme === "light"}
                  onChange={() => setTheme("light")}
                  className="w-4 h-4 accent-[#d9886c] cursor-pointer"
                />
                <span className={theme === "light" ? headingText : mutedText}>
                  Light
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="theme-mode"
                  value="dark"
                  checked={theme === "dark"}
                  onChange={() => setTheme("dark")}
                  className="w-4 h-4 accent-[#eab06b] cursor-pointer"
                />
                <span className={theme === "dark" ? headingText : mutedText}>
                  Dark
                </span>
              </label>
            </div>

            {/* Logged-in user pill & Log Out */}
            <div
              className={`flex items-center gap-3 px-4 py-2 rounded-2xl border text-xs sm:text-sm ${cardBg}`}
            >
              <span
                className={`font-medium truncate max-w-[160px] ${mutedText}`}
              >
                {user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="font-bold text-red-600 hover:underline cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>

        {/* === MAIN RESPONSIVE 3-COLUMN GRID === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 items-stretch">
          {/* === COLUMN 1: BALANCE + TRANSACTION FORM === */}
          <div className="flex flex-col gap-6 xl:gap-8">
            <div
              className={`${cardBg} border p-6 sm:p-7 xl:p-8 rounded-[28px]`}
            >
              <div>
                <span
                  className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-2 ${softOrangeBadge}`}
                >
                  Wallet Overview
                </span>
                <p className={`text-sm sm:text-base ${mutedText}`}>
                  Current Balance
                </p>
                <h2
                  className={`text-3xl sm:text-4xl xl:text-5xl font-extrabold mt-1.5 break-words ${
                    balance >= 0 ? positiveMoney : negativeMoney
                  }`}
                >
                  Rp {balance.toLocaleString("id-ID")}
                </h2>
              </div>

              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-6 pt-5 border-t ${dividerBorder}`}
              >
                <div className={`p-3.5 rounded-2xl border ${innerSurface}`}>
                  <p className={`text-xs sm:text-sm font-medium ${mutedText}`}>
                    Total Income
                  </p>
                  <p
                    className={`text-lg sm:text-xl xl:text-2xl font-extrabold mt-1 break-words ${positiveMoney}`}
                  >
                    + Rp {totalIncome.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className={`p-3.5 rounded-2xl border ${innerSurface}`}>
                  <p className={`text-xs sm:text-sm font-medium ${mutedText}`}>
                    Total Expense
                  </p>
                  <p
                    className={`text-lg sm:text-xl xl:text-2xl font-extrabold mt-1 break-words ${negativeMoney}`}
                  >
                    - Rp {totalExpense.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className={`${cardBg} border p-6 sm:p-7 xl:p-8 rounded-[28px] flex flex-col gap-5 flex-1 min-h-[480px]`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className={`text-xl xl:text-2xl font-bold ${headingText}`}>
                  Add New Entry
                </h3>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${softOrangeBadge}`}
                >
                  {formatDisplayDate(activeDate)}
                </span>
              </div>

              <div
                className={`grid grid-cols-2 gap-2 p-1.5 rounded-2xl border ${innerSurface}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setType("expense");
                    setCategory("Rent");
                  }}
                  className={`py-2.5 text-sm sm:text-base font-semibold rounded-xl transition-all cursor-pointer ${
                    type === "expense"
                      ? "bg-red-600 text-white shadow-sm"
                      : `${mutedText} hover:${headingText}`
                  }`}
                >
                  Expense (-)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType("income");
                    setCategory("Salary");
                  }}
                  className={`py-2.5 text-sm sm:text-base font-semibold rounded-xl transition-all cursor-pointer ${
                    type === "income"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : `${mutedText} hover:${headingText}`
                  }`}
                >
                  Income (+)
                </button>
              </div>

              <div>
                <label
                  className={`block text-xs sm:text-sm font-medium mb-1.5 ${mutedText}`}
                >
                  Category
                </label>
                <div
                  className={`flex items-center gap-2.5 border rounded-2xl px-3.5 ${innerSurface}`}
                >
                  <span className="text-[#c9795d] shrink-0">
                    <CategoryIcon category={category} className="w-4 h-4" />
                  </span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-transparent py-3.5 text-sm sm:text-base font-medium focus:outline-none cursor-pointer"
                  >
                    {type === "expense" ? (
                      <>
                        <option value="Rent">Rent</option>
                        <option value="Food">Food & Drink</option>
                        <option value="Transport">Transportation</option>
                        <option value="Laundry">Laundry</option>
                        <option value="Custom">Custom</option>
                      </>
                    ) : (
                      <>
                        <option value="Salary">Salary / Income</option>
                        <option value="Freelance">Freelance / Side Gig</option>
                        <option value="Custom">Custom</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs sm:text-sm font-medium mb-1.5 ${mutedText}`}
                >
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g., Apartment Rent / January Salary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full border rounded-2xl p-3.5 text-sm sm:text-base focus:outline-none ${innerSurface}`}
                />
              </div>

              <div>
                <label
                  className={`block text-xs sm:text-sm font-medium mb-1.5 ${mutedText}`}
                >
                  Amount (Rp)
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2.000.000"
                  value={amountInput}
                  onChange={handleAmountChange}
                  className={`w-full border rounded-2xl p-3.5 text-sm sm:text-base focus:outline-none ${innerSurface}`}
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className={`mt-auto font-bold text-sm sm:text-base py-3.5 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60 ${softOrangeBtn}`}
              >
                {isSaving ? "Saving..." : "Save Transaction"}
              </button>
            </form>
          </div>

          {/* === COLUMN 2: DONUT CHART & TIMEFRAME BAR CHART === */}
          <div className="flex flex-col gap-6 xl:gap-8">
            <div
              className={`${cardBg} border p-6 sm:p-7 xl:p-8 rounded-[28px] flex flex-col min-h-[410px]`}
            >
              <div className="flex items-center gap-2.5 mb-1">
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${softOrangeBadge}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                    />
                  </svg>
                </span>
                <h3 className={`text-xl xl:text-2xl font-bold ${headingText}`}>
                  Expense by Category
                </h3>
              </div>

              <p className={`text-xs sm:text-sm ${mutedText} mb-4`}>
                {timeframe === "today"
                  ? `Spending on ${formatDisplayDate(activeDate)}`
                  : "All spending categories"}
              </p>

              {donutData.length === 0 ? (
                <div
                  className={`h-64 flex items-center justify-center text-sm sm:text-base rounded-2xl border ${innerSurface} ${mutedText}`}
                >
                  No expense data yet.
                </div>
              ) : (
                <>
                  <div className="h-60 xl:h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={92}
                          paddingAngle={4}
                        >
                          {donutData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val) =>
                            `Rp ${Number(val ?? 0).toLocaleString("id-ID")}`
                          }
                          contentStyle={{
                            backgroundColor: isLight ? "#ffffff" : "#282420",
                            borderColor: isLight ? "#e5e7eb" : "#3d3630",
                            borderRadius: "1rem",
                            color: isLight ? "#2f2b28" : "#f3ede4",
                            fontSize: "13px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex flex-wrap gap-2.5 mt-3 justify-center">
                    {donutData.map((entry, index) => {
                      const badgeColor =
                        DONUT_COLORS[index % DONUT_COLORS.length];
                      return (
                        <div
                          key={entry.name}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs sm:text-sm font-medium ${innerSurface} ${headingText}`}
                        >
                          <span style={{ color: badgeColor }}>
                            <CategoryIcon
                              category={entry.name}
                              className="w-3.5 h-3.5"
                            />
                          </span>
                          <span>{entry.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div
              className={`${cardBg} border p-6 sm:p-7 xl:p-8 rounded-[28px] flex flex-col flex-1 min-h-[410px]`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                  <h3
                    className={`text-xl xl:text-2xl font-bold ${headingText}`}
                  >
                    Income vs Expense
                  </h3>
                  <p className={`text-xs sm:text-sm ${mutedText}`}>
                    {timeframe === "monthly"
                      ? `Weekly breakdown (${activeMonthPrefix})`
                      : timeframe === "yearly"
                        ? `Monthly breakdown (${activeYearPrefix})`
                        : `Daily summary (${formatDisplayDate(activeDate)})`}
                  </p>
                </div>

                <div className={`flex p-1 rounded-2xl border ${innerSurface}`}>
                  {(["today", "monthly", "yearly"] as Timeframe[]).map(
                    (tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setTimeframe(tab)}
                        className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl capitalize transition-all cursor-pointer ${
                          timeframe === tab
                            ? softOrangeBtn
                            : `${mutedText} hover:${headingText}`
                        }`}
                      >
                        {tab}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="h-64 xl:h-72 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeframeChartData}
                    barGap={4}
                    barCategoryGap="24%"
                  >
                    <XAxis
                      dataKey="label"
                      stroke={isLight ? "#6b7280" : "#a89f94"}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      interval={timeframe === "yearly" ? 1 : 0}
                    />
                    <YAxis
                      stroke={isLight ? "#6b7280" : "#a89f94"}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={48}
                      tickFormatter={(v: number) =>
                        v >= 1000000
                          ? `${(v / 1000000).toFixed(1)}jt`
                          : v >= 1000
                            ? `${(v / 1000).toFixed(0)}k`
                            : `${v}`
                      }
                    />
                    <Tooltip
                      formatter={(val) =>
                        `Rp ${Number(val ?? 0).toLocaleString("id-ID")}`
                      }
                      contentStyle={{
                        backgroundColor: isLight ? "#ffffff" : "#282420",
                        borderColor: isLight ? "#e5e7eb" : "#3d3630",
                        borderRadius: "1rem",
                        color: isLight ? "#2f2b28" : "#f3ede4",
                        fontSize: "13px",
                      }}
                    />
                    <Bar
                      dataKey="Income"
                      fill="#16a34a"
                      barSize={timeframe === "yearly" ? 10 : 16}
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="Expense"
                      fill="#dc2626"
                      barSize={timeframe === "yearly" ? 10 : 16}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* === COLUMN 3: FULL TRANSACTION HISTORY === */}
          <div
            className={`${cardBg} border p-6 sm:p-7 xl:p-8 rounded-[28px] flex flex-col md:col-span-2 lg:col-span-1 min-h-[600px] lg:min-h-[844px]`}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className={`text-xl xl:text-2xl font-bold ${headingText}`}>
                  Transaction History
                </h3>
                {activeDate !== todayStr && (
                  <p className={`text-xs sm:text-sm mt-0.5 ${mutedText}`}>
                    Showing {formatDisplayDate(activeDate)}
                  </p>
                )}
              </div>

              {transactions.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className={`text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${mutedText} hover:text-red-600`}
                >
                  Clear All
                </button>
              )}
            </div>

            {dataLoading ? (
              <div
                className={`text-sm sm:text-base text-center py-14 px-5 my-auto rounded-2xl border ${innerSurface} ${mutedText}`}
              >
                Loading your transactions...
              </div>
            ) : historyItems.length === 0 ? (
              <div
                className={`text-sm sm:text-base text-center py-14 px-5 my-auto rounded-2xl border ${innerSurface} ${mutedText}`}
              >
                {activeDate === todayStr
                  ? "No transactions yet. Add one on the left!"
                  : `No transactions recorded on ${formatDisplayDate(
                      activeDate,
                    )}.`}
              </div>
            ) : (
              <ul className="soft-orange-scroll flex flex-col gap-3.5 overflow-y-auto max-h-[820px] pr-3 mr-1">
                {historyItems.map((item) => {
                  const isEditingThis = editingId === item.id;

                  return (
                    <li
                      key={item.id}
                      className={`border p-4 rounded-2xl ${innerSurface}`}
                    >
                      {isEditingThis ? (
                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-center justify-between">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${softOrangeBadge}`}
                            >
                              <CategoryIcon
                                category={item.category}
                                className="w-3.5 h-3.5"
                              />
                              Editing {item.category}
                            </span>
                            <span className={`text-xs ${mutedText}`}>
                              {item.date}
                            </span>
                          </div>

                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveEdit(item.id);
                              } else if (e.key === "Escape") {
                                cancelEditing();
                              }
                            }}
                            placeholder="Description"
                            className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none ${cardBg}`}
                          />

                          <input
                            type="text"
                            value={editAmountInput}
                            onChange={(e) =>
                              setEditAmountInput(formatRpInput(e.target.value))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveEdit(item.id);
                              } else if (e.key === "Escape") {
                                cancelEditing();
                              }
                            }}
                            placeholder="Amount (Rp)"
                            className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none ${cardBg}`}
                          />
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${cardBg} ${mutedText}`}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => saveEdit(item.id)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${softOrangeBtn}`}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 pr-1">
                            <div
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                item.type === "income"
                                  ? isLight
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-emerald-950/60 text-emerald-400"
                                  : isLight
                                    ? "bg-red-50 text-red-600"
                                    : "bg-rose-950/60 text-rose-400"
                              }`}
                            >
                              <CategoryIcon
                                category={item.category}
                                className="w-5 h-5"
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${softOrangeBadge}`}
                                >
                                  {item.category}
                                </span>
                                <span className={`text-xs ${mutedText}`}>
                                  {item.date}
                                </span>
                              </div>
                              <p
                                className={`font-semibold text-sm sm:text-base mt-1 truncate ${headingText}`}
                              >
                                {item.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <span
                              className={`font-extrabold text-sm sm:text-base ${
                                item.type === "income"
                                  ? positiveMoney
                                  : negativeMoney
                              }`}
                            >
                              {item.type === "income" ? "+" : "-"} Rp{" "}
                              {item.amount.toLocaleString("id-ID")}
                            </span>

                            <button
                              type="button"
                              onClick={() => startEditing(item)}
                              className={`${mutedText} hover:text-[#c9795d] text-xs sm:text-sm font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer`}
                              title="Edit transaction"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className={`${mutedText} hover:text-red-600 text-sm font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer`}
                              title="Delete transaction"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
