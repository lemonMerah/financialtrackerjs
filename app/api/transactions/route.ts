import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/transactions
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ transactions: data });
}

// POST /api/transactions
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { description, amount, type, category, date } = body;

  if (
    !description ||
    typeof amount !== "number" ||
    amount <= 0 ||
    !type ||
    !category ||
    !date
  ) {
    return NextResponse.json(
      { error: "Invalid transaction payload" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      description: String(description).trim(),
      amount,
      type,
      category,
      date,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ transaction: data }, { status: 201 });
}

// DELETE /api/transactions
export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
