"use client"; // Penanda bahwa halaman ini interaktif di sisi browser

import { useState } from "react";

export default function FinancialTracker() {
  // 1. State: Tempat "menyimpan data sementara" di memori browser (seperti variabel biasa di JS)
  const [balance, setBalance] = useState(0);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  // 2. Fungsi saat tombol "Tambah" ditekan
  const handleSubmit = (e) => {
    e.preventDefault(); // Mencegah halaman refresh otomatis khas form HTML
    if (!description || !amount) return; // Kalau kosong, jangan diproses

    const numAmount = Number(amount);
    setBalance((prev) => prev + numAmount); // Tambah saldo total

    // Reset input form jadi kosong lagi
    setDescription("");
    setAmount("");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center">
      {/* Judul Aplikasi */}
      <h1 className="text-3xl font-extrabold mb-6 tracking-wide text-cyan-400">
        Financial Tracker App
      </h1>

      {/* Kartu Ringkasan Saldo */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl mb-6">
        <p className="text-sm text-slate-400">Total Saldo Saat Ini</p>
        <h2 className="text-4xl font-bold mt-1 text-emerald-400">
          Rp {balance.toLocaleString("id-ID")}
        </h2>
      </div>

      {/* Form Input Transaksi */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col gap-4"
      >
        <h3 className="text-lg font-semibold text-slate-200">
          Tambah Transaksi Baru
        </h3>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Keterangan
          </label>
          <input
            type="text"
            placeholder="Contoh: Jual Asset / Makan"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Nominal (Rupiah)
          </label>
          <input
            type="number"
            placeholder="Contoh: 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          type="submit"
          className="mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 rounded-lg transition-all duration-200"
        >
          Simpan Transaksi
        </button>
      </form>
    </main>
  );
}
