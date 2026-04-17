export interface Resident {
  id: number;
  care_home: number;
  first_name: string;
  last_name: string;
  full_name: string;
  age: number;
  date_of_birth: string;
  nhs_number?: string;
  room_number: string;
  admission_date: string;
  discharge_date?: string;
  photo?: string;
  next_of_kin_name?: string;
  next_of_kin_phone?: string;
  gp_name?: string;
  gp_phone?: string;
  fall_risk: string;
  pressure_ulcer_risk: string;
  ai_risk_score: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  conditions?: { id: number; name: string; icd_code?: string }[];
}

export interface Medication {
  id: number;
  resident: number;
  drug_name: string;
  dose: string;
  route: string;
  frequency: string;
  indication?: string;
  prescribed_by: string;
  start_date: string;
  end_date?: string;
  stock_count: number;
  reorder_threshold: number;
  is_controlled: boolean;
  is_low_stock: boolean;
  is_active: boolean;
  notes?: string;
  created_at: string;
}

export interface MAREntry {
  id: number;
  medication: number;
  scheduled_at: string;
  administered_at: string | null;
  administered_by: number | null;
  administered_by_name?: string;
  status: "given" | "refused" | "omitted" | "pending";
  notes?: string;
  created_at: string;
}

export interface CarePlan {
  id: number;
  resident: number;
  version: number;
  status: "draft" | "active" | "under_review" | "archived";
  next_review_date: string | null;
  ai_generated: boolean;
  ai_summary: string;
  created_at: string;
  updated_at: string;
  sections?: CarePlanSection[];
}

export interface Shift {
  id: number;
  care_home: number;
  staff_member: number;
  staff_member_name?: string;
  shift_type: "day" | "evening" | "night";
  date: string;
  start_time: string;
  end_time: string;
  is_agency: boolean;
  notes?: string;
}

export interface LeaveRequest {
  id: number;
  staff_member: number;
  staff_member_name?: string;
  leave_type: "annual" | "sick" | "training" | "other";
  start_date: string;
  end_date: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
}

export interface CarePlanSection {
  id: number;
  title: string;
  content: string;
  risk_level: string;
}

export interface ComplianceAudit {
  id: number;
  care_home: number;
  domain: "safe" | "effective" | "caring" | "responsive" | "well_led";
  score: number;
  rating: "outstanding" | "good" | "requires_improvement" | "inadequate";
  conducted_by: number | null;
  audit_date: string;
  next_audit_date: string | null;
  notes: string;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  phone?: string;
}
