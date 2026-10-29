import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Target of the links in Supabase's emails (templates set in the Supabase dashboard):
//   sign-up: {{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
//   reset:   {{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
// RedirectTo is the site the form was sent from (live or localhost), if it's in Supabase's
// redirect URLs; otherwise Supabase uses the Site URL.
// verifyOtp logs the teacher in (session cookie), so the link works in any browser.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";
  // Only paths on this site, so the link can't send anyone elsewhere.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(safeNext, request.url));
  }
  return NextResponse.redirect(new URL("/link-expired", request.url));
}
