import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Pill,
  ClipboardList,
  Users,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Map,
  HandHelping,
  Activity,
  Calendar,
  GraduationCap,
  Clock,
  Wrench,
  UserCheck,
  FolderOpen,
  Music,
  Salad,
  Lock,
  Package,
  UserPlus,
  CalendarOff,
  CheckSquare,
  MessageSquare,
  CreditCard,
  Stethoscope,
  Heart,
  Star,
  ArrowRight,
} from "lucide-react";

const modules = [
  { icon: Pill,          title: "Medications / eMAR",   desc: "Full electronic medicines administration record with barcode verification and pharmacy sync." },
  { icon: ClipboardList, title: "Care Plans",            desc: "Person-centred, risk-aware care plans that update automatically as resident needs change." },
  { icon: Users,         title: "Staff & HR",            desc: "Employee records, contracts, DBS tracking, appraisals and disciplinary management in one place." },
  { icon: ShieldCheck,   title: "Compliance",            desc: "Real-time CQC compliance dashboard with automated audit trails and evidence collection." },
  { icon: AlertTriangle, title: "Incidents",             desc: "Log, investigate and report incidents with root-cause analysis and RIDDOR integration." },
  { icon: FileText,      title: "Care Notes",            desc: "Quick-entry shift notes, voice-to-text support, and automatic linking to care plans." },
  { icon: Map,           title: "Body Map",              desc: "Interactive visual body map for wound, pressure area, and skin integrity monitoring." },
  { icon: HandHelping,   title: "Handover",              desc: "Structured digital handover summaries that ensure nothing falls through the cracks between shifts." },
  { icon: Activity,      title: "Vitals",                desc: "Track blood pressure, weight, temperature, oxygen saturation and more with trend alerts." },
  { icon: Calendar,      title: "Appointments",          desc: "Book, track and document resident appointments across GP, hospital and allied health services." },
  { icon: GraduationCap, title: "Training",              desc: "Mandatory training matrix with automated reminders, e-learning integration and cert storage." },
  { icon: Clock,         title: "Rota",                  desc: "Drag-and-drop rota builder with skills-matching, minimum staffing rules and agency escalation." },
  { icon: Wrench,        title: "Maintenance",           desc: "Raise, assign and track maintenance jobs with priority levels and contractor access." },
  { icon: UserCheck,     title: "Visitors",              desc: "Digital visitor sign-in with photo ID capture, health screening and pre-registration." },
  { icon: FolderOpen,    title: "Documents",             desc: "Secure document library with version control, access permissions and e-signature support." },
  { icon: Music,         title: "Activities",            desc: "Plan, record and evidence resident activities for meaningful engagement and wellbeing reports." },
  { icon: Salad,         title: "Nutrition",             desc: "Dietary profiles, MUST screening, mealtime monitoring and fluid balance tracking." },
  { icon: Lock,          title: "Safeguarding",          desc: "Structured safeguarding workflows compliant with Care Act 2014 and local authority requirements." },
  { icon: Package,       title: "Pharmacy",              desc: "Direct integration with Lloyds, Boots and Well Pharmacy for seamless medication ordering and delivery tracking." },
  { icon: UserPlus,      title: "Recruitment",           desc: "End-to-end applicant tracking, interview scheduling, reference checking and onboarding automation." },
  { icon: CalendarOff,   title: "Leave Management",      desc: "Holiday requests, sickness tracking, Bradford Factor scoring and absence pattern analysis." },
  { icon: CheckSquare,   title: "Task Management",       desc: "Shift task boards, repeating task templates, delegation and completion audit trails." },
  { icon: MessageSquare, title: "Enquiries",             desc: "Capture and nurture bed enquiries with lead scoring, viewing management and conversion reporting." },
  { icon: CreditCard,    title: "Billing",               desc: "Automated fee collection, invoice generation, council invoicing and occupancy reporting." },
  { icon: Stethoscope,   title: "GP Integration",        desc: "Two-way data exchange with EMIS, SystmOne and Vision to eliminate duplicate data entry." },
  { icon: Heart,         title: "Family Portal",         desc: "Secure portal for families to view care updates, photos, activity logs and invoices." },
  { icon: Star,          title: "Skills Matrix",         desc: "Visual competency mapping across all staff roles with gap analysis and development planning." },
];

export default function FeaturesPage() {
  return (
    <main style={{ background: "#050914", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,58,237,0.15), transparent)",
          }}
        />
        <div className="dot-grid absolute inset-0 pointer-events-none opacity-30" />

        <div className="max-w-5xl mx-auto px-6 text-center relative">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(124,58,237,0.3)",
              color: "#a78bfa",
            }}
          >
            30+ Modules Included
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Everything your
            <br />
            <span className="gradient-text">care home needs</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            One platform. 30+ modules. Zero compromise.
            <br />
            Built for the realities of UK care — from CQC inspections to midnight medication rounds.
          </p>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="pb-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={i}
                className="glass glass-hover rounded-2xl p-6 flex gap-4"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(59,130,246,0.15))",
                    border: "1px solid rgba(124,58,237,0.2)",
                  }}
                >
                  <Icon size={18} style={{ color: "#a78bfa" }} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          <div
            className="relative rounded-3xl overflow-hidden p-12 text-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(59,130,246,0.15) 100%)",
              border: "1px solid rgba(124,58,237,0.25)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.15), transparent)",
              }}
            />
            <div className="relative">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
                Start your free trial today
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                30 days. No credit card. Full access to every module. Cancel anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:info@cura.com"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white glow-button"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
                >
                  Start Free Trial <ArrowRight size={16} />
                </a>
                <a
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-white transition-all hover:bg-white/10"
                  style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  View Pricing
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
