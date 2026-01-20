import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
import { supabase } from "./supabaseClient";

export async function createStudentWithMilestones(formData, userId) {
  try {
    let avatarUrl = null;

    // 1. Upload avatar (if provided)
    if (formData.avatarFile) {
      const ext = formData.avatarFile.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;

      console.log(formData.avatarFile);
      console.log(formData.avatarFile instanceof File);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, formData.avatarFile, {
          contentType: formData.avatarFile.type,      
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

      avatarUrl = data.publicUrl;
    }

    // 2. Create student
    const { data: student, error: studentError } = await supabase
      .from("students")
      .insert({
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender || null,
        avatar_url: avatarUrl,
        parent_name: formData.parentName,
        parent_email: formData.parentEmail || null,
        parent_phone: formData.parentPhone || null,
        address: formData.address || null,
        allergies: formData.allergies || null,
        medical_notes: formData.medicalNotes || null,
        created_by: userId,
        status: "active",
      })
      .select()
      .single();

    if (studentError) throw studentError;

    // 3. Fetch milestones
    const { data: milestones } = await supabase
      .from("milestones")
      .select("id")
      .eq("is_active", true);

    if (milestones?.length) {
      const rows = milestones.map((m) => ({
        student_id: student.id,
        milestone_id: m.id,
        status: "not-started",
      }));

      await supabase.from("student_milestones").insert(rows);
    }

    return { success: true, student };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

// ========================================
// HELPER FUNCTION: Validate Form Data
// ========================================
export function validateStudentForm(formData) {
  const errors = {};

  // Required fields
  if (!formData.fullName || formData.fullName.trim() === "") {
    errors.fullName = "Full name is required";
  }

  if (!formData.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required";
  } else {
    // Check if date is not in the future
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    if (birthDate > today) {
      errors.dateOfBirth = "Date of birth cannot be in the future";
    }
  }

  if (!formData.parentName || formData.parentName.trim() === "") {
    errors.parentName = "Parent/Guardian name is required";
  }

  // Optional field validation
  if (formData.parentEmail && !isValidEmail(formData.parentEmail)) {
    errors.parentEmail = "Please enter a valid email address";
  }

  if (formData.parentPhone && !isValidPhone(formData.parentPhone)) {
    errors.parentPhone = "Please enter a valid phone number";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Email validation helper
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation helper (basic)
function isValidPhone(phone) {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
}

// Grouping of milestone to category
export function groupByCategory(data) {
  const grouped = {};

  data.forEach((item) => {
    const category = item.milestone_id.category_id;

    if (!grouped[category.id]) {
      grouped[category.id] = {
        categoryName: category.name,
        icon: category.icon,
        milestones: [],
      };
    }

    grouped[category.id].milestones.push({
      milestoneId: item.milestone_id.id,
      title: item.milestone_id.description,
      status: item.status,
      studentMilestoneId: item.id,
    });
  });

  return grouped;
}
export const getStatusLabel = (status) => {
  switch (status) {
    case "mastered":
      return "Mastered";
    case "in-progress":
      return "In Progress";
    case "not-started":
      return "Not Started";
    default:
      return status;
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case "mastered":
      return "✓";
    case "not-started":
      return "☐";
    default:
      return "";
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case "mastered":
      return "bg-green-200 border-green-300 text-green-900";
    case "in-progress":
      return "bg-yellow-200 border-yellow-300 text-yellow-900";
    case "not-started":
      return "bg-red-200 border-red-300 text-red-900";
    default:
      return "bg-gray-200 border-gray-300 text-gray-900";
  }
};
