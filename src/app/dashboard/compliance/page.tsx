import { serverApi } from "@/lib/server-api";
import ComplianceClient from "./ComplianceClient";
import type { ComplianceAudit } from "@/types";

export default async function CompliancePage() {
  let audits: ComplianceAudit[] = [];
  try {
    ({ results: audits } = await serverApi.compliance.audits());
  } catch {}
  return <ComplianceClient initialAudits={audits} />;
}
