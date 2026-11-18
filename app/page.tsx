"use client";

import { useState, useEffect, FormEvent } from "react";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

export default function FinancialTracker() {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("my_transactions");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Gagal membaca data lokal:", e);
        }
      }
    }
    return [];
  });

  const [description, setDescription] = useState<string>("");
  const [amountInput, setAmountInput] = useState<string>("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState<string>("Makanan");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("my_transactions", JSON.stringify(transactions));
    }
  }, [transactions, isMounted]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue === "") {
      setAmountInput("");
      return;
    }
    const formatted = Number(rawValue).toLocaleString("id-ID");
    setAmountInput(formatted);
  };

  const totalIncome: number = transactions
    .filter((item) => item.type === "income")
    .reduce((acc, item) => acc + item.amount, 0);

  const totalExpense: number = transactions
    .filter((item) => item.type === "expense")
    .reduce((acc, item) => acc + item.amount, 0);

  const balance: number = totalIncome - totalExpense;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!description || !amountInput) return;

    const cleanAmount = Number(amountInput.replace(/\./g, ""));
    if (isNaN(cleanAmount) || cleanAmount <= 0) return;

    const newTransaction: Transaction = {
      id: Date.now(),
      description,
      amount: cleanAmount,
      type,
      category,
    };

    setTransactions([newTransaction, ...transactions]);
    setDescription("");
    setAmountInput("");
    setCategory(type === "expense" ? "Makanan" : "Gaji");
  };

  const handleDelete = (id: number) => {
    setTransactions(transactions.filter((item) => item.id !== id));
  };

  if (!isMounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold mb-6 tracking-wide text-cyan-400">
        Financial Tracker
      </h1>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl mb-6">
        <p className="text-sm text-slate-400">Current Balance</p>
        <h2
          className={`text-4xl font-bold mt-1 ${balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}
        >
          Rp {balance.toLocaleString("id-ID")}
        </h2>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-800">
          <div>
            <p className="text-xs text-slate-400">Total Income</p>
            <p className="text-lg font-semibold text-emerald-400">
              + Rp {totalIncome.toLocaleString("id-ID")}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Expense</p>
            <p className="text-lg font-semibold text-rose-400">
              - Rp {totalExpense.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col gap-4 mb-8"
      >
        <h3 className="text-lg font-semibold text-slate-200">
          Add New Transaction
        </h3>

        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setType("expense");
              setCategory("Makanan");
            }}
            className={`py-2 text-sm font-medium rounded-md transition-all ${
              type === "expense"
                ? "bg-rose-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Expense (-)
          </button>
          <button
            type="button"
            onClick={() => {
              setType("income");
              setCategory("Gaji");
            }}
            className={`py-2 text-sm font-medium rounded-md transition-all ${
              type === "income"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Income (+)
          </button>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-cyan-500 text-slate-200"
          >
            {type === "expense" ? (
              <>
                <option value="Makanan">🍔 Makanan & Minuman</option>
                <option value="Transport">🚗 Transportasi</option>
              </>
            ) : (
              <>
                <option value="Gaji">💰 Gaji / Pendapatan Utama</option>
                <option value="Freelance">💻 Freelance / Sampingan</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Description
          </label>
          <input
            type="text"
            placeholder="e.g., Nasi Padang / Project Web"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Amount (Rp)
          </label>
          <input
            type="text"
            placeholder="e.g., 2.000.000"
            value={amountInput}
            onChange={handleAmountChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          type="submit"
          className="mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 rounded-lg transition-all duration-200"
        >
          Save Transaction
        </button>
      </form>

      <div className="w-full max-w-md">
        <h3 className="text-lg font-semibold text-slate-200 mb-3">
          Recent History
        </h3>

        {transactions.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6 bg-slate-900/50 rounded-xl border border-slate-800/50">
            No transactions yet. Add one above!
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {transactions.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-medium">
                      {item.category}
                    </span>
                  </div>
                  <p className="font-medium text-slate-200 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`font-bold ${item.type === "income" ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {item.type === "income" ? "+" : "-"} Rp{" "}
                    {item.amount.toLocaleString("id-ID")}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-500 hover:text-rose-500 text-sm font-bold px-2 py-1 rounded transition-colors"
                    title="Delete transaction"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
