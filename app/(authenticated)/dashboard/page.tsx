import { requireUserOrRedirectLogin } from "@/lib/auth";
import LogoutButton from "../LogoutButton";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const userId = await requireUserOrRedirectLogin();
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error(
      `Invariant error: Authenticated user ID ${userId} does NOT have a User record in the public User DB.`,
    );
  }

  // TODO: add className / identifier (for screen readers?) for LogoutButton div
  return (
    <>
      <div>
        We&apos;re in the dashboard page. Username:{" "}
        {user.name ?? "(no display name)"} | Email: {user.email ?? "(no email)"}
      </div>
      <div>
        <LogoutButton />
      </div>
    </>
  );
}
