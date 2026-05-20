"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function POST(req: Request) {
  // could use helper, but we do need this `supabase` instance down here though...
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({
      success: false,
      message: "No user is currently logged in.",
    });
  }

  await supabase.auth.signOut();
  const url = new URL(req.url);
  return Response.redirect(new URL("/login", url.origin));
}
