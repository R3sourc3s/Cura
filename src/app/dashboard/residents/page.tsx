import { serverApi } from "@/lib/server-api";
import ResidentsClient from "./ResidentsClient";

export default async function ResidentsPage() {
  const { results, count } = await serverApi.residents.list({ is_active: "true" });
  return <ResidentsClient initialList={results} initialTotal={count} />;
}
