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
  wing?: number | null;
  wing_name?: string;
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
  allergies?: Allergy[];
}

export interface Allergy {
  id: number;
  resident: number;
  allergen: string;
  allergy_type: "drug" | "food" | "environmental" | "other";
  severity: "mild" | "moderate" | "severe" | "anaphylaxis";
  reaction: string;
  recorded_by?: number | null;
  recorded_by_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface SafetyIssue {
  code: "allergy" | "duplicate_dose" | "prn_interval" | "prn_max_daily";
  message: string;
  overridable: boolean;
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
  is_psychotropic?: boolean;
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
  patch_site?: string;
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

/** An AI-proposed remediation action, not yet persisted — the user adds it to a tracked AuditAction. */
export interface SuggestedComplianceAction {
  domain: "safe" | "effective" | "caring" | "responsive" | "well_led";
  priority: "low" | "medium" | "high" | "critical";
  description: string;
  due_in_days: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: "admin" | "manager" | "nurse" | "carer" | "hr" | "family";
  phone?: string;
  avatar?: string;
  care_home: number | null;
  is_active: boolean;
  is_group_admin?: boolean;
}

export interface GroupOversightHome {
  id: number;
  name: string;
  bed_count: number;
  resident_count: number;
  occupancy_pct: number | null;
  high_risk_residents: number;
  staff_count: number;
  avg_compliance_score: number | null;
  incidents_last_30_days: number;
}

export interface GroupOversight {
  group: { id: number; name: string };
  care_homes: GroupOversightHome[];
  totals: {
    care_home_count: number;
    resident_count: number;
    bed_count: number;
    staff_count: number;
    incidents_last_30_days: number;
  };
  generated_at: string;
}

export interface IncidentFollowUp {
  id: number;
  incident: number;
  note: string;
  actioned_by: number | null;
  actioned_by_name?: string;
  created_at: string;
}

export interface Incident {
  id: number;
  care_home: number;
  resident: number | null;
  resident_name?: string;
  reported_by: number | null;
  reported_by_name?: string;
  incident_type: "fall" | "medication_error" | "near_miss" | "behaviour" | "injury" | "other";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "under_review" | "closed";
  incident_date: string;
  location: string;
  description: string;
  immediate_action: string;
  injury_sustained: boolean;
  injury_description: string;
  witnesses: string;
  reported_to_gp: boolean;
  reported_to_family: boolean;
  reported_to_cqc: boolean;
  created_at: string;
  updated_at: string;
  follow_ups?: IncidentFollowUp[];
}

export interface HandoverNote {
  id: number;
  care_home: number;
  author: number | null;
  author_name?: string;
  author_role?: string;
  shift: "day" | "evening" | "night";
  date: string;
  priority: "normal" | "urgent" | "critical";
  content: string;
  residents_mentioned: number[];
  read_by_ids: number[];
  created_at: string;
}

export interface Wing {
  id: number;
  care_home: number;
  name: string;
  floor?: string;
  bed_count: number;
  lead_staff: number | null;
  lead_staff_name?: string;
  notes?: string;
  is_active: boolean;
  resident_count?: number;
  created_at: string;
}

export interface PurchaseOrderItem {
  id: number;
  purchase_order: number;
  medication_stock: number | null;
  medication_name: string;
  quantity_ordered: string;
  unit: string;
  unit_cost: string | null;
  quantity_received: string;
}

export interface PurchaseOrder {
  id: number;
  care_home: number;
  supplier: number | null;
  supplier_name?: string;
  reference: string;
  status: "draft" | "submitted" | "confirmed" | "dispatched" | "delivered" | "cancelled";
  ordered_by: number | null;
  ordered_by_name?: string;
  ordered_at: string | null;
  expected_delivery: string | null;
  dispatched_at: string | null;
  delivered_at: string | null;
  tracking_reference?: string;
  notes?: string;
  items: PurchaseOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface PEGFeedRecord {
  id: number;
  peg_chart: number;
  recorded_by: number | null;
  recorded_by_name?: string;
  recorded_at: string;
  entry_type: "feed" | "flush" | "site_check" | "medication";
  volume_ml: number | null;
  site_condition?: string;
  tolerated_well: boolean;
  notes?: string;
}

export interface PEGChart {
  id: number;
  resident: number;
  resident_name?: string;
  tube_type: "peg" | "rig" | "ng" | "jejunostomy";
  tube_size_fr?: string;
  insertion_date: string | null;
  feed_regimen?: string;
  feed_rate_ml_per_hr: string | null;
  water_flush_ml: number;
  dietitian_name?: string;
  next_tube_change_due: string | null;
  is_active: boolean;
  notes?: string;
  recent_feeds?: PEGFeedRecord[];
  created_at: string;
  updated_at: string;
}

export interface Accreditation {
  id: number;
  care_home: number;
  name: string;
  category: "cqc" | "cyber" | "data_protection" | "fire_safety" | "health_safety" | "quality" | "other";
  issuing_body?: string;
  status: "certified" | "in_progress" | "expiring_soon" | "expired" | "not_applicable";
  reference_number?: string;
  valid_from: string | null;
  valid_until: string | null;
  certificate_url?: string;
  is_expiring_soon: boolean;
  notes?: string;
  created_at: string;
}

export type DeviceType = "wearable" | "fall_sensor" | "bed_sensor" | "motion_sensor" | "door_sensor" | "other";
export type DeviceReadingType = "fall_detected" | "vitals" | "motion" | "battery" | "other";

export interface DeviceReading {
  id: number;
  reading_type: DeviceReadingType;
  recorded_at: string;
  data: Record<string, unknown>;
  resulting_incident: number | null;
  resulting_vital_sign: number | null;
  created_at: string;
}

export interface Device {
  id: number;
  name: string;
  device_type: DeviceType;
  device_type_display: string;
  external_id: string;
  manufacturer?: string;
  resident: number | null;
  resident_name?: string | null;
  battery_level: number | null;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
  latest_reading: DeviceReading | null;
}

export interface VitalSign {
  id: number;
  resident: number;
  recorded_by: number | null;
  recorded_by_name?: string;
  recorded_at: string;
  bp_systolic: number | null;
  bp_diastolic: number | null;
  pulse: number | null;
  temperature: number | null;
  oxygen_saturation: number | null;
  weight: number | null;
  blood_glucose: number | null;
  notes: string;
  created_at: string;
}
