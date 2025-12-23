"use client";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { groupByCategory } from "@/lib/utils";
import CategoryCard from "./CategoryCard";

export default function GoalsComponent() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  const [studentData, setStudentData] = useState<null | any>(null);
  const [grouped, setGrouped] = useState<any>({});

  const getCategories = async () => {
    const { data, error } = await supabase
      .from("student_milestones")
      .select(
        `
    id,
    student_id (
    full_name,
    status
    ),
    milestone_id (
      id,
      category_id (
      id,
      name,
      icon
      ),
      description,
      display_order
    )
    ,
    status,
    started_at,
    completed_at,
    updated_by
  `
      )
      .eq("student_id", studentId);

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.log("data", data[0]);

    setStudentData(data[0]);
    const groupedData = groupByCategory(data);
    setGrouped(groupedData);
    return Response.json({ success: true, data });
  };

  const goBack = () => {
    router.push("/dashboard");
  };
  const updateMilestones = async () => {};

  // const check = async () => {
  //   console.log(grouped);
  // }

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-blue-600 mb-3">
            My Growth Adventure!
          </h1>
          <p className="text-xl text-gray-600">
            Tracking 6 Key Developmental Milestones
          </p>
          <p className="text-xl text-gray-600">
            Student Name : {studentData?.student_id?.full_name}
          </p>
        </div>
        {/* Completed */}
        {/* Milestone Categories Grid */}
        <div className="grid grid-cols-3 gap-6">
          {Object.values(grouped).map((category: any) => (
            <CategoryCard
              key={category.categoryName}
              name={category.categoryName}
              icon={category.icon}
              milestones={category.milestones}
            />
          ))}
        </div>

        <div className="flex gap-10 py-5 items-center justify-center">
          <div className="">
            <Button onClick={goBack} className="items-center mx-0 my-auto">
              Go Back
            </Button>
          </div>
          <div className="">
            <Button
              onClick={updateMilestones}
              className="items-center mx-0 my-auto bg-green-600"
            >
              Update
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Click on any milestone to update its status
          </p>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-200 border-2 border-red-300 rounded"></div>
              <span className="text-sm text-gray-600">Not Started</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-300 rounded"></div>
              <span className="text-sm text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-200 border-2 border-green-300 rounded"></div>
              <span className="text-sm text-gray-600">Mastered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
