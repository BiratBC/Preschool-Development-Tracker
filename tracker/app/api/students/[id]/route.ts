import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}