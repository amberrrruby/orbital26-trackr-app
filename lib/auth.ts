import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server-client";
import type { Result, AppAuthError, AppOwnershipError } from "./types";
import { User as AuthUser } from "@supabase/supabase-js";
import { Application } from "./generated/client";
import { prisma } from "@/lib/prisma";

export async function requireUser(): Promise<Result<string, AppAuthError>> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user
    ? { ok: true, value: user.id }
    : { ok: false, error: { type: "UNAUTHORIZED", message: "Unauthorized" } };
}

export async function requireUserObject(): Promise<
  Result<AuthUser, AppAuthError>
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user
    ? { ok: true, value: user }
    : { ok: false, error: { type: "UNAUTHORIZED", message: "Unauthorized" } };
}

export async function requireUserOrRedirectLogin(): Promise<string> {
  const res = await requireUser();
  if (!res.ok) {
    redirect("/login");
  }
  return res.value;
}

export async function requireUserObjectOrRedirectLogin(): Promise<AuthUser> {
  const res = await requireUserObject();
  if (!res.ok) {
    redirect("/login");
  }
  return res.value;
}

export async function redirectIfAuthenticated(
  redirectTo = "/dashboard",
): Promise<void> {
  const res = await requireUser();
  if (res.ok) {
    redirect(redirectTo);
  }
}

export async function requireApplicationOwnership(
  applicationId: string,
  userId: string,
): Promise<Result<Application, AppOwnershipError>> {
  try {
    const application = await prisma.application.findFirst({
      where: { id: applicationId, userId },
    });
    if (!application) {
      return {
        ok: false,
        error: { type: "NOT_FOUND", message: "Not found" },
      };
    }
    return {
      ok: true,
      value: application,
    };
  } catch {
    // also return NOT_FOUND to not leak internal state for enumeration protection
    return {
      ok: false,
      error: { type: "NOT_FOUND", message: "Not found" },
    };
  }
}

export async function requireResumeOwnership(
  resumeId: string,
  userId: string,
): Promise<Result<Resume, AppOwnershipError>> {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });
    if (!resume) {
      return {
        ok: false,
        error: { type: "NOT_FOUND", message: "Not found" },
      };
    }
    return {
      ok: true,
      value: resume,
    };
  } catch {
    // also return NOT_FOUND to not leak internal state for enumeration protection
    return {
      ok: false,
      error: { type: "NOT_FOUND", message: "Not found" },
    };
  }
}
