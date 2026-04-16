// API Types
export interface Resident {
  id: number;
  care_home: number;
  first_name: string;
  last_name: string;
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
  full_name: string;
  age: number;
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  stock_level: number;
  reorder_point: number;
}

export interface MAREntry {
  id: number;
  resident: number;
  medication: number;
  scheduled_time: string;
  administered_time?: string;
  administered_by?: number;
  status: "scheduled" | "administered" | "missed";
  notes?: string;
}

export interface CarePlan {
  id: number;
  resident: number;
  title: string;
  description: string;
  goals: string[];
  interventions: string[];
  review_date: string;
  status: "active" | "completed" | "cancelled";
}

export interface Staff {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  email: string;
  phone: string;
  care_home: number;
}

export interface ComplianceRecord {
  id: number;
  resident: number;
  check_type: string;
  status: "passed" | "failed" | "pending";
  notes: string;
  checked_by: number;
  checked_at: string;
}