"use client";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { groupByCategory } from "@/lib/utils";
import CategoryCard from "./CategoryCard";
import {toast} from 'react-toastify';
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
  const statusCycle = ['not-started', 'in-progress', 'mastered'];
  const [progress, setProgress] = useState(0);

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
      console.error("Error fetching data:", error);
      return;
    }
    
    // console.log("data", data[0]);
    setStudentData(data[0]);
    setAllMilestones(data);
    const groupedData = groupByCategory(data);
    setGrouped(groupedData);
  };

  const handleStatusChange = (studentMilestoneId: number) => {
    console.log("=== Changing status for milestone ID:", studentMilestoneId);
    
    // Update in allMilestones array (THIS IS CRITICAL - this is what gets saved to DB)
    setAllMilestones(prevMilestones => {
      const updated = prevMilestones.map(milestone => {
        if (milestone.milestone_id.id === studentMilestoneId) {
          const currentIndex = statusCycle.indexOf(milestone.status);
          const nextIndex = (currentIndex + 1) % statusCycle.length;
          const newStatus = statusCycle[nextIndex];
          
          console.log(`Found milestone: ${milestone.milestone_id.description}`);
          console.log(`Changing from ${milestone.status} to ${newStatus}`);
          
          return {
            ...milestone,
            status: newStatus,
            started_at: newStatus === 'in-progress' && !milestone.started_at 
              ? new Date().toISOString() 
              : milestone.started_at,
            completed_at: newStatus === 'mastered' 
              ? new Date().toISOString() 
              : null
          };
        }
        // console.log("milestone.id",milestone.milestone_id.id);
        // console.log("studentMilestoneId", studentMilestoneId);
        
        return milestone;
      });

      
      
      console.log("Updated allMilestones:", updated);
      return updated;
    });

    // Update in grouped state for immediate UI update
    setGrouped((prevGrouped: any) => {
      const newGrouped = { ...prevGrouped };
      
      Object.keys(newGrouped).forEach(categoryKey => {
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
                started_at: newStatus === 'in-progress' && !m.started_at 
                  ? new Date().toISOString() 
                  : m.started_at,
                completed_at: newStatus === 'mastered' 
                  ? new Date().toISOString() 
                  : null
              };
            }
            return m;
          })
        };
      });
      
      return newGrouped;
    });
  };

  const goBack = () => {
    router.push("/dashboard");
  };

  const updateMilestones = async () => {
    setLoading(true);
    setProgress(progress + 10);

    try {
      // Prepare updates
      const updates = allMilestones.map(milestone => ({
        id: milestone.id,
        status: milestone.status,
        started_at: milestone.started_at,
        completed_at: milestone.completed_at,
        updated_at: new Date().toISOString()
      }));

      setProgress(progress + 20)

      // Update each milestone
      let updateCount = 0
      for (const update of updates) {
        console.log(`Updating milestone ID ${update.id} with status: ${update.status}`);
        const {data, error } = await supabase
          .from("student_milestones")
          .update({
            status: update.status,
            started_at: update.started_at,
            completed_at: update.completed_at,
            updated_at: update.updated_at
          })
          .eq("id", update.id)
          .select();

        if (error) {
          throw error;
        }
        console.log("Update result:", data);
        updateCount++;
        setProgress(30 + (updateCount / updates.length) * 60);
      }
      setProgress(100)
      toast.success("Milestones updated successfully!")
      await getCategories();
    } catch (error) {
      setProgress(100)
      toast.error("Error updating milestones")
      console.error("Error updating milestones:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
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
          {Object.values(grouped).map((category: any, index : any) => (
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