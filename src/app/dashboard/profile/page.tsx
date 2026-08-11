import { serverApi } from "@/lib/server-api";
import ProfileClient from "./ProfileClient";
import { redirect } from "next/navigation";
import type { User } from "@/types";

export default async function ProfilePage() {
  let user: User;
  try {
    user = await serverApi.auth.me();
  } catch {
    redirect("/dashboard");
  }
  return <ProfileClient initialUser={user} />;
}
