# 📒 Personal Finance Tracker

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/d9394893-a571-466a-bcf7-a69681f7b3c3" width="420" alt="Dashboard Light Mode" /><br />
      <sub><b>🔐 Sign In & Sign Up</b></sub>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/1db0f147-7dca-46f2-afc5-da0c338cb4ba" width="420" alt="Dashboard Dark Mode" /><br />
      <sub><b>☀️ Light Mode</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/0d791b46-9e61-40dd-982c-aed766d3732f" width="420" alt="Calendar Date Picker" /><br />
      <sub><b>📅 Calendar Date Picker</b></sub>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/978541f2-1569-48c8-b6b0-5cc742b5b1d3" width="420" alt="Sign In & Sign Up" /><br />
      <sub><b>🌙 Dark Mode</b></sub>
    </td>
  </tr>
</table>



🔗 **Live Demo:** [financialtrackerjs.vercel.app](https://financialtrackerjs.vercel.app/)

A clean, daily money journal built with **Next.js**, **TypeScript**, and **Supabase**. Track daily income and expenses, visualize spending habits, and keep your financial records synced across devices.

---

## ✨ Features

- 🔐 **Account Sync** — Secure email and password authentication powered by Supabase Auth.
- 🛡️ **Private Data** — Row Level Security (RLS) ensures each user can only view and edit their own records.
- 💸 **Quick Entry & Editing** — Log income or expenses in Rupiah (`Rp`), edit inline with `Enter` to save or `Esc` to cancel, and manage history effortlessly.
- 📊 **Visual Insights** — Real-time balance overview, category breakdown donut chart, and **Today / Monthly / Yearly** bar comparisons.
- 🎨 **Light & Dark Mode** — Switch themes anytime and filter transactions by date with the built-in calendar.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js (App Router), React, TypeScript, Tailwind CSS |
| **Backend** | Next.js REST API Routes |
| **Database & Auth** | Supabase (PostgreSQL, Auth, Row Level Security) |
| **Hosting** | Vercel |

---

## 📁 Files Description

```text
financialtrackerjs/
├── app/
│   ├── api/
│   │   └── transactions/
│   │       ├── [id]/route.ts   <-- Update (PATCH) and delete (DELETE) a single transaction
│   │       └── route.ts        <-- Fetch (GET), create (POST), and clear (DELETE) transactions
│   └── page.tsx                <-- Main dashboard, charts, calendar filter, and auth screen
├── lib/
│   └── supabase/               <-- Supabase browser and server client helpers
└── README.md                   <-- Project documentation
```

---

## 🚀 Local Setup

1. Clone the repository and install dependencies (`git clone`, `cd financialtrackerjs`, `npm install`).
2. Create a `.env.local` file with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Create a `transactions` table in Supabase with Row Level Security enabled for authenticated users.
4. Run `npm run dev` and open `http://localhost:3000`.
