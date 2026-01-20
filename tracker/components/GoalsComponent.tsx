"use client";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { groupByCategory } from "@/lib/utils";
import CategoryCard from "./CategoryCard";
import { toast } from "react-toastify";
import LoadingBar from "react-top-loading-bar";
export default function GoalsComponent() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  const [studentData, setStudentData] = useState<null | any>(null);
  const [grouped, setGrouped] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [allMilestones, setAllMilestones] = useState<any[]>([]);

  // Status cycle: Not Started -> In Progress -> Mastered -> Not Started
  const statusCycle = ["not-started", "in-progress", "mastered"];
  const [progress, setProgress] = useState(0);

  const getCategories = async () => {
    const res = await fetch(`/api/students/${studentId}/milestones`);
    const json = await res.json();

    if (!res.ok) {
      toast.error("Failed to load milestones");
      return;
    }

    const data = json.data;

    setStudentData(data[0]);
    setAllMilestones(data);

    const groupedData = groupByCategory(data);
    setGrouped(groupedData);
  };

  const handleStatusChange = (studentMilestoneId: number) => {
    console.log("=== Changing status for milestone ID:", studentMilestoneId);

    // Update in allMilestones array (THIS IS CRITICAL - this is what gets saved to DB)
    setAllMilestones((prevMilestones) => {
      const updated = prevMilestones.map((milestone) => {
        if (milestone.milestone_id.id === studentMilestoneId) {
          const currentIndex = statusCycle.indexOf(milestone.status);
          const nextIndex = (currentIndex + 1) % statusCycle.length;
          const newStatus = statusCycle[nextIndex];

          console.log(`Found milestone: ${milestone.milestone_id.description}`);
          console.log(`Changing from ${milestone.status} to ${newStatus}`);

          return {
            ...milestone,
            status: newStatus,
            started_at:
              newStatus === "in-progress" && !milestone.started_at
                ? new Date().toISOString()
                : milestone.started_at,
            completed_at:
              newStatus === "mastered" ? new Date().toISOString() : null,
          };
        }
        return milestone;
      });

      console.log("Updated allMilestones:", updated);
      return updated;
    });

    // Update in grouped state for immediate UI update
    setGrouped((prevGrouped: any) => {
      const newGrouped = { ...prevGrouped };

      Object.keys(newGrouped).forEach((categoryKey) => {
        newGrouped[categoryKey] = {
          ...newGrouped[categoryKey],
          milestones: newGrouped[categoryKey].milestones.map((m: any) => {
            if (m.milestoneId === studentMilestoneId) {
              const currentIndex = statusCycle.indexOf(m.status);
              const nextIndex = (currentIndex + 1) % statusCycle.length;
              const newStatus = statusCycle[nextIndex];

              return {
                ...m,
                status: newStatus,
                started_at:
                  newStatus === "in-progress" && !m.started_at
                    ? new Date().toISOString()
                    : m.started_at,
                completed_at:
                  newStatus === "mastered" ? new Date().toISOString() : null,
              };
            }
            return m;
          }),
        };
      });

      return newGrouped;
    });
  };

  const goBack = () => {
    router.push("/dashboard");
  };

  // Update Milestones
  const updateMilestones = async () => {
    setLoading(true);
    setProgress(20);

    try {
      const res = await fetch(`/api/students/${studentId}/milestones/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestones: allMilestones.map((m) => ({
            id: m.id,
            status: m.status,
            started_at: m.started_at,
            completed_at: m.completed_at,
          })),
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error);

      setProgress(100);
      toast.success("Milestones updated successfully!");
      await getCategories();
    } catch (err) {
      toast.error("Error updating milestones");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const exportReport = () => {
    setLoading(true);
    setProgress(20);
    window.open(`/api/export-report/${studentId}`, "_blank");
    setLoading(false);
    setProgress(100);
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <LoadingBar
        color="#f11946"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
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

        {/* Milestone Categories Grid */}
        <div className="grid grid-cols-3 gap-6">
          {Object.values(grouped).map((category: any, index: any) => (
            <CategoryCard
              key={index}
              name={category.categoryName}
              icon={category.icon}
              milestones={category.milestones}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>

        <div className="flex gap-10 py-5 items-center justify-center">
          <div className="">
            <Button onClick={goBack} className="items-center mx-0 my-auto">
              Go Back
              {/* {console.log('Test', allMilestones)} */}
            </Button>
          </div>
          <div className="">
            <Button
              onClick={updateMilestones}
              disabled={loading}
              className="items-center mx-0 my-auto bg-green-600 hover:bg-green-700 disabled:bg-green-400"
            >
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
          <div>
            <Button
              onClick={exportReport}
              disabled={loading}
              className="items-center mx-0 my-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? "Exporting..." : "Export"}
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
