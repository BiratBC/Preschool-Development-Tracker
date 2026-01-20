// /api/students/[id]/milestones/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const {id : studentId} = await context.params;

  const { data, error } = await supabase
    .from("student_milestones")
    .select(`
      id,
      student_id (
        full_name,
        status
      ),
      milestone_id (
        id,
        description,
        display_order,
        category_id (
          id,
          name,
          icon
        )
      ),
      status,
      started_at,
      completed_at,
      updated_by
    `)
    .eq("student_id", studentId);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
