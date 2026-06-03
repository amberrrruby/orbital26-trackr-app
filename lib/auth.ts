import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server-client";
import type { Result, AppAuthError } from "./types";
import { User as AuthUser } from "@supabase/supabase-js";

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

export async function sessionHasEmailLoginMethod(): Promise<boolean> {
  const user = await requireUserObjectOrRedirectLogin();
  const providers = user.identities?.map((i) => i.provider) ?? [];
  return providers.includes("email");
}
