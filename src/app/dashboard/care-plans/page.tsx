import { serverApi } from "@/lib/server-api";
import CarePlansClient from "./CarePlansClient";

export default async function CarePlansPage() {
  const [plans, residents] = await Promise.allSettled([
    serverApi.carePlans.list(),
    serverApi.residents.list({ is_active: "true" }),
  ]);
  return (
    <CarePlansClient
      initialPlans={plans.status     === "fulfilled" ? plans.value.results     : []}
      initialResidents={residents.status === "fulfilled" ? residents.value.results : []}
    />
  );
}
