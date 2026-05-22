import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return Response.redirect(
      `${origin}/login/forgot-password?error=missing-code`,
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return Response.redirect(
      `${origin}/login/forgot-password?error=invalid-code`,
    );
  }

  // Session is now set in cookies — redirect to the form
  return Response.redirect(`${origin}/reset-password`);
}
