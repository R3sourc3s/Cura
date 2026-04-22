import { serverApi } from "@/lib/server-api";
import ProfileClient from "./ProfileClient";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  try {
    const user = await serverApi.auth.me();
    return <ProfileClient initialUser={user} />;
  } catch {
    redirect("/dashboard");
  }
}
