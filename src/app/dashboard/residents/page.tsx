import { serverApi } from "@/lib/server-api";
import ResidentsClient from "./ResidentsClient";
import type { Resident } from "@/types";

export default async function ResidentsPage() {
  let results: Resident[] = [];
  let count = 0;
  try {
    ({ results, count } = await serverApi.residents.list({ is_active: "true" }));
  } catch {}
  return <ResidentsClient initialList={results} initialTotal={count} />;
}
