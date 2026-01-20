import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const updates = body.milestones;

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const results = [];

    for (const milestone of updates) {
      const { data, error } = await supabase
        .from("student_milestones")
        .update({
          status: milestone.status,
          started_at: milestone.started_at,
          completed_at: milestone.completed_at,
          updated_at: new Date().toISOString(),
        })
        .eq("id", milestone.id)
        .select();

      if (error) {
        throw error;
      }

      results.push(data);
    }

    return NextResponse.json({
      success: true,
      updated: results.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
