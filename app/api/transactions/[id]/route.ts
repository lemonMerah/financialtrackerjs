import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/transactions/[id]
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const transactionId = Number(id);

  if (!Number.isInteger(transactionId) || transactionId <= 0) {
    return NextResponse.json(
      { error: "Invalid transaction ID" },
      { status: 400 },
    );
  }

  const body = await request.json();
  const { description, amount } = body;

  if (!description || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json(
      { error: "Invalid update payload" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("transactions")
    .update({
      description: String(description).trim(),
      amount,
    })
    .eq("id", transactionId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ transaction: data });
}

// DELETE /api/transactions/[id]
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const transactionId = Number(id);

  if (!Number.isInteger(transactionId) || transactionId <= 0) {
    return NextResponse.json(
      { error: "Invalid transaction ID" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
