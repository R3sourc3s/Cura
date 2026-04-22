import { serverApi } from "@/lib/server-api";
import TeamClient from "./TeamClient";

export default async function TeamPage() {
  try {
    const { results: users } = await serverApi.auth.users();
    return <TeamClient initialUsers={users} />;
  } catch {
    return <TeamClient initialUsers={[]} />;
  }
}
