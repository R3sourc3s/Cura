import { serverApi } from "@/lib/server-api";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const user = await serverApi.auth.me();
  return <ProfileClient initialUser={user} />;
}
