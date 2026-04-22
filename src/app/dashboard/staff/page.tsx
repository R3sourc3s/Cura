import { serverApi } from "@/lib/server-api";
import StaffClient from "./StaffClient";

export default async function StaffPage() {
  const [shifts, leave, training, users] = await Promise.allSettled([
    serverApi.staff.shifts({ date_gte: new Date().toISOString().slice(0, 10), ordering: "date,start_time", page_size: "100" }),
    serverApi.staff.leave(),
    serverApi.staff.training(),
    serverApi.auth.users(),
  ]);
  return (
    <StaffClient
      initialShifts={shifts.status  === "fulfilled" ? shifts.value.results  : []}
      initialLeave={leave.status    === "fulfilled" ? leave.value.results    : []}
      initialTraining={training.status === "fulfilled" ? training.value.results : []}
      initialUsers={users.status    === "fulfilled" ? users.value.results    : []}
    />
  );
}
