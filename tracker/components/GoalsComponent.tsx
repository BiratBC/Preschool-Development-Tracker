"use client";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Share2, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { NextRequest } from "next/server";
type Category = {
  id: number;
  name: string;
  description : string;
};

export default function GoalsComponent() {
  const [milestone_categories, setmilestone_categories] = useState<Category[]>([]);
  const [milestones, setMilestones] = useState({
    fineMotor: [
      {
        id: 1,
        text: "Holds a crayon with thumb and two fingers",
        status: "mastered",
      },
      {
        id: 2,
        text: "Uses child-safe scissors to cut a line",
        status: "not-started",
      },
      {
        id: 3,
        text: "Draws simple shapes (circle, square)",
        status: "not-started",
      },
      { id: 4, text: "Stacks 10 or more blocks", status: "not-started" },
    ],
    grossMotor: [
      {
        id: 5,
        text: "Runs easily and jumps over small objects",
        status: "not-started",
      },
      {
        id: 6,
        text: "Balances on one foot for 5 seconds",
        status: "not-started",
      },
      {
        id: 7,
        text: "Throws a ball overhand and catches a bounced ball",
        status: "not-started",
      },
      {
        id: 8,
        text: "Climbs stairs without holding the rail",
        status: "not-started",
      },
    ],
    language: [
      { id: 9, text: "Speaks in sentences of 5+ words", status: "not-started" },
      {
        id: 10,
        text: 'Follows 2-3 step instructions (e.g., "Get your shoes and put them by the door")',
        status: "not-started",
      },
      {
        id: 11,
        text: "Retells a simple story or event",
        status: "not-started",
      },
      {
        id: 12,
        text: "Uses pronouns correctly (I, you, me, we, they)",
        status: "not-started",
      },
    ],
    cognitive: [
      { id: 13, text: "Counts to 10 or higher", status: "not-started" },
      { id: 14, text: "Names at least 4 colors", status: "not-started" },
      {
        id: 15,
        text: 'Understands concepts like "same" and "different"',
        status: "not-started",
      },
      { id: 16, text: "Completes 4-5 piece puzzles", status: "not-started" },
    ],
    social: [
      { id: 17, text: "Takes turns in games", status: "not-started" },
      {
        id: 18,
        text: "Shows concern when others are upset",
        status: "not-started",
      },
      {
        id: 19,
        text: "Plays cooperatively with other children",
        status: "not-started",
      },
      {
        id: 20,
        text: "Follows rules in group settings",
        status: "not-started",
      },
    ],
    selfCare: [
      { id: 21, text: "Uses the toilet independently", status: "not-started" },
      {
        id: 22,
        text: "Washes and dries hands without help",
        status: "not-started",
      },
      {
        id: 23,
        text: "Puts on shoes (may need help with laces)",
        status: "not-started",
      },
      { id: 24, text: "Uses fork and spoon properly", status: "not-started" },
    ],
  });

  type CategoryKey = keyof typeof milestones;

  const toggleStatus = (category: CategoryKey, id: number) => {
    setMilestones((prev) => ({
      ...prev,
      [category]: prev[category].map((milestone) =>
        milestone.id === id
          ? {
              ...milestone,
              status:
                milestone.status === "not-started"
                  ? "in-progress"
                  : milestone.status === "in-progress"
                  ? "mastered"
                  : "not-started",
            }
          : milestone
      ),
    }));
  };

  const categories = [
    {
      key: "fineMotor",
      title: "1. Fine Motor Skills",
      icon: "✏️",
      data: milestones.fineMotor,
    },
    {
      key: "grossMotor",
      title: "2. Gross Motor Skills",
      icon: "🤸",
      data: milestones.grossMotor,
    },
    {
      key: "language",
      title: "3. Language & Communication",
      icon: "💬",
      data: milestones.language,
    },
    {
      key: "cognitive",
      title: "4. Cognitive Development",
      icon: "🧠",
      data: milestones.cognitive,
    },
    {
      key: "social",
      title: "5. Social & Emotional",
      icon: "🤝",
      data: milestones.social,
    },
    {
      key: "selfCare",
      title: "6. Self-Care Skills",
      icon: "🧼",
      data: milestones.selfCare,
    },
  ];

  const getStatusColor = (status: any) => {
    if (status === "mastered") return "bg-green-200 border-green-300";
    if (status === "in-progress") return "bg-yellow-200 border-yellow-300";
    return "bg-red-200 border-red-300";
  };

  const getStatusText = (status: any) => {
    if (status === "mastered") return "Mastered!";
    if (status === "in-progress") return "In Progress";
    return "Not Started";
  };

  const getStatusTextColor = (status: any) => {
    if (status === "mastered") return "text-green-800";
    if (status === "in-progress") return "text-yellow-800";
    return "text-red-800";
  };

  const getCategories = async() => {
    const { data, error } = await supabase
      .from("milestone_categories")
      .select("*");

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.log("data", data);
    
    setmilestone_categories(data);
    return Response.json({ success: true, data });
  }  


  return (
    
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <Button onClick={getCategories}>Fetch Categories</Button>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-blue-600 mb-3">
            My Growth Adventure!
          </h1>
          <p className="text-xl text-gray-600">
            Tracking 6 Key Developmental Milestones
          </p>
        </div>

        {/* Milestone Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.key}
              className="bg-white rounded-2xl shadow-md overflow-hidden border-2 border-gray-200"
            >
              {/* Category Header */}
              <div className="bg-white p-6 border-b-2 border-gray-200">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{category.icon}</span>
                  <h2 className="text-xl font-bold text-gray-800">
                    {category.title}
                  </h2>
                </div>
              </div>

              {/* Milestones List */}
              <div className="p-4 space-y-3">
                {category.data.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={`${getStatusColor(
                      milestone.status
                    )} border-2 rounded-xl p-4 transition-all hover:shadow-md cursor-pointer`}
                    onClick={() =>
                      toggleStatus(category.key as CategoryKey, milestone.id)
                    }
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-gray-800 font-medium flex-1 pr-3">
                        {milestone.text}
                      </p>
                      <div className="flex items-center space-x-2 shrink-0">
                        <div className="bg-white rounded-full p-1.5 shadow-sm">
                          {milestone.status === "mastered" ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : milestone.status === "in-progress" ? (
                            <div className="w-4 h-4 border-2 border-yellow-600 rounded-full" />
                          ) : (
                            <X className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <span
                          className={`${getStatusTextColor(
                            milestone.status
                          )} font-semibold text-sm whitespace-nowrap`}
                        >
                          {getStatusText(milestone.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          here is the 
           {milestone_categories.map((cat) => (
      <p key={cat.id}>{cat.name} {cat.description}</p>
    ))}
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
