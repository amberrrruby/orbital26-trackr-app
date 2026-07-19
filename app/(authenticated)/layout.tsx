import Sidebar from "@/app/components/Sidebar";
import { requireUserOrRedirectLogin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await requireUserOrRedirectLogin();
  const userProfile = await prisma.user.findUnique({ where: { id: userId } });
  const cookieStore = await cookies();
  const collapsed = cookieStore.get("sidebar:collapsed")?.value === "true";

  return (
    <>
      <Sidebar user={userProfile!} defaultCollapsed={collapsed}>
        {children}
      </Sidebar>
    </>
  );
}
