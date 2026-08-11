import { serverApi } from "@/lib/server-api";
import TeamClient from "./TeamClient";
import type { User } from "@/types";

export default async function TeamPage() {
  let users: User[] = [];
  try {
    ({ results: users } = await serverApi.auth.users());
  } catch {}
  return <TeamClient initialUsers={users} />;
}
