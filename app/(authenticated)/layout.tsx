import Sidebar from "@/app/components/Sidebar";
import { requireUserOrRedirectLogin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await requireUserOrRedirectLogin();
  const userProfile = await prisma.user.findUnique({ where: { id: userId } });
  return (
    <>
      <Sidebar user={userProfile!}>{children}</Sidebar>
    </>
  );
}
