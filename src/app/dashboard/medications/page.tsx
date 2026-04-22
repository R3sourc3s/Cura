import { serverApi } from "@/lib/server-api";
import MedicationsClient from "./MedicationsClient";

export default async function MedicationsPage() {
  const [meds, mar, residents] = await Promise.allSettled([
    serverApi.medications.list(),
    serverApi.medications.marList(),
    serverApi.residents.list({ is_active: "true" }),
  ]);
  return (
    <MedicationsClient
      initialMeds={meds.status      === "fulfilled" ? meds.value.results      : []}
      initialMar={mar.status        === "fulfilled" ? mar.value.results        : []}
      initialResidents={residents.status === "fulfilled" ? residents.value.results : []}
    />
  );
}
