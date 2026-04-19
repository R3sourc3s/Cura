import { serverApi } from "@/lib/server-api";
import TeamClient from "./TeamClient";

export default async function TeamPage() {
  const { results: users } = await serverApi.auth.users();
  return <TeamClient initialUsers={users} />;
}
