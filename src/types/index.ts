export interface Condition {
  id: number;
  resident: number;
  name: string;
  icd_code?: string;
  diagnosed_date?: string;
  notes?: string;
  is_active: boolean;
}

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
  fall_risk: "low" | "medium" | "high" | "critical";
  pressure_ulcer_risk: "low" | "medium" | "high" | "critical";
  ai_risk_score: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  conditions?: Condition[];
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
  recent_mar?: MAREntry[];
}

export interface MAREntry {
  id: number;
  medication: number;
  scheduled_at: string;
  administered_at: string | null;
  administered_by: number | null;
  administered_by_name?: string;
  drug_name?: string;
  resident_name?: string;
  resident_id?: number;
  status: "given" | "refused" | "omitted" | "pending";
  notes?: string;
  created_at: string;
}

export interface CarePlanSection {
  id: number;
  care_plan: number;
  title: string;
  content: string;
  risk_level: "low" | "medium" | "high";
  order: number;
}

export interface CarePlanNote {
  id: number;
  care_plan: number;
  author: number | null;
  author_name?: string;
  body: string;
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
  created_by_name?: string;
  sections?: CarePlanSection[];
  notes?: CarePlanNote[];
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

export interface Training {
  id: number;
  staff_member: number;
  staff_member_name?: string;
  course_name: string;
  completed_date: string | null;
  expiry_date: string | null;
  status: "pending" | "completed" | "expired";
  certificate_url?: string;
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
  actions?: AuditAction[];
}

export interface AuditAction {
  id: number;
  audit: number;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  assigned_to: number | null;
  due_date: string;
  status: "open" | "in_progress" | "complete";
  completed_at: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: "admin" | "manager" | "nurse" | "carer" | "hr";
  phone?: string;
  avatar?: string;
  care_home: number | null;
  is_active: boolean;
}
