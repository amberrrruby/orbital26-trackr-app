import { requireUserOrRedirectLogin } from "@/lib/auth";
import LogoutButton from "../LogoutButton";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const userId = await requireUserOrRedirectLogin();
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // TODO: add className / identifier (for screen readers?) for LogoutButton div
  return (
    <>
      <div>
        We&apos;re in the dashboard page. Username:{" "}
        {user ? (user.name ?? "(no username)") : "(no user?)"}
      </div>
      <div>
        <LogoutButton />
      </div>
    </>
  );
}
