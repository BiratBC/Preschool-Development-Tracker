import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request, context) {

  const params = await context.params
  const studentId = params.id
  // 1. Fetch data from DB
  // Replace with your actual DB call

  const { data: milestones, error } = await supabase
    .from("student_milestones")
    .select(
      `
    id,
    student_id (
      full_name
    ),
    milestone_id (
      description,
      category_id (
        name
      )
    ),
    status
  `
    )
    .eq("student_id", studentId);
  // console.log(milestones);

  if (error) {
    console.error(error);
    return new NextResponse("Database error", { status: 500 });
  }

  if (!milestones || milestones.length === 0) {
    return new NextResponse("No milestones found", { status: 404 });
  }

  const studentName = milestones[0]?.student_id?.full_name ?? "Unknown Student";

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Growth Report");




  // 2. Title
  sheet.mergeCells("A1:C1");
  sheet.getCell("A1").value = "My Growth Adventure!";
  sheet.getCell("A1").font = { size: 16, bold: true };

  sheet.mergeCells("A2:C2");
  sheet.getCell("A2").value = `Student Name: ${studentName}`;

  // 3. Headers
  sheet.addRow([]);
  sheet.addRow(["Category", "Milestone", "Status"]);

  sheet.getRow(4).font = { bold: true };

  // 4. Data rows
  milestones?.forEach((item) => {
    const row = sheet.addRow([
      item?.milestone_id?.category_id?.name,
      item?.milestone_id?.description,
      item?.status,
    ]);

    // Color status
    if (item.status === "mastered") {
      row.getCell(3).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "C6EFCE" },
      };
    } else {
      row.getCell(3).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFC7CE" },
      };
    }
  });

  // 5. Auto width
  sheet.columns.forEach((col) => {
    col.width = 30;
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=Growth_Report_${studentName}.xlsx`,
    },
  });
}
