import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
import { supabase } from "./supabaseClient";

export async function createStudentWithMilestones(formData, userId) {
  try {
    // ========================================
    // STEP 1: Generate unique session ID
    // ========================================
    const { data: sessionIdData, error: sessionError } = await supabase
      .rpc('generate_session_id');

    if (sessionError) {
      console.error('Session ID generation error:', sessionError);
      throw new Error('Failed to generate session ID');
    }

    // ========================================
    // STEP 2: Upload avatar if provided
    // ========================================
    let avatarUrl = null;
    
    if (formData.avatarFile) {
      // Generate unique filename
      const fileExt = formData.avatarFile.name.split('.').pop();
      const fileName = `${sessionIdData}-${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')  // Make sure this bucket exists in Supabase
        .upload(fileName, formData.avatarFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Avatar upload error:', uploadError);
        // Don't throw - continue without avatar
      } else {
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrl;
      }
    }

    // ========================================
    // STEP 3: Create student record
    // ========================================
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert({
        session_id: sessionIdData,
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
        status: 'active',
        created_by: userId
      })
      .select()
      .single();

    if (studentError) {
      console.error('Student creation error:', studentError);
      throw new Error('Failed to create student: ' + studentError.message);
    }

    // ========================================
    // STEP 4: Get all active milestone templates
    // ========================================
    const { data: templates, error: templatesError } = await supabase
      .from('milestone_templates')
      .select('id, category_id')
      .eq('is_active', true)
      .order('display_order');

    if (templatesError) {
      console.error('Templates fetch error:', templatesError);
      throw new Error('Failed to fetch milestone templates');
    }

    if (!templates || templates.length === 0) {
      console.warn('No milestone templates found. Please seed the database first.');
    }

    // ========================================
    // STEP 5: Initialize all milestones for student
    // ========================================
    const studentMilestones = templates.map(template => ({
      student_id: student.id,
      milestone_template_id: template.id,
      status: 'not-started',
      updated_by: userId
    }));

    const { error: milestonesError } = await supabase
      .from('student_milestones')
      .insert(studentMilestones);

    if (milestonesError) {
      console.error('Milestones initialization error:', milestonesError);
      
      // Rollback: Delete the student since milestones failed
      await supabase
        .from('students')
        .delete()
        .eq('id', student.id);
      
      throw new Error('Failed to initialize milestones: ' + milestonesError.message);
    }

    // ========================================
    // STEP 6: Create initial activity log entry
    // ========================================
    await supabase
      .from('activity_log')
      .insert({
        student_id: student.id,
        user_id: userId,
        action_type: 'student_created',
        description: `Student profile created for ${formData.fullName}`,
        metadata: {
          session_id: sessionIdData,
          milestone_count: templates.length
        }
      });

    // ========================================
    // STEP 7: Return success with student data
    // ========================================
    return {
      success: true,
      student: {
        id: student.id,
        sessionId: student.session_id,
        fullName: student.full_name,
        dateOfBirth: student.date_of_birth,
        avatarUrl: student.avatar_url,
        milestoneCount: templates.length
      },
      message: `Successfully created student with ${templates.length} milestones`
    };

  } catch (error) {
    console.error('Error in createStudentWithMilestones:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      details: error
    };
  }
}

// ========================================
// HELPER FUNCTION: Validate Form Data
// ========================================
export function validateStudentForm(formData) {
  const errors = {};

  // Required fields
  if (!formData.fullName || formData.fullName.trim() === '') {
    errors.fullName = 'Full name is required';
  }

  if (!formData.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  } else {
    // Check if date is not in the future
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    if (birthDate > today) {
      errors.dateOfBirth = 'Date of birth cannot be in the future';
    }
  }

  if (!formData.parentName || formData.parentName.trim() === '') {
    errors.parentName = 'Parent/Guardian name is required';
  }

  // Optional field validation
  if (formData.parentEmail && !isValidEmail(formData.parentEmail)) {
    errors.parentEmail = 'Please enter a valid email address';
  }

  if (formData.parentPhone && !isValidPhone(formData.parentPhone)) {
    errors.parentPhone = 'Please enter a valid phone number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
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
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}