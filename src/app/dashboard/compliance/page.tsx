import { serverApi } from "@/lib/server-api";
import ComplianceClient from "./ComplianceClient";

export default async function CompliancePage() {
  try {
    const { results: audits } = await serverApi.compliance.audits();
    return <ComplianceClient initialAudits={audits} />;
  } catch {
    return <ComplianceClient initialAudits={[]} />;
  }
}
