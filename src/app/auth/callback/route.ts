import { NextResponse } from "next/server";

import {
  PASSWORD_RECOVERY_COOKIE,
  PASSWORD_RECOVERY_PATH,
} from "@/features/auth/constants";
import { getSafeRedirectPath } from "@/features/auth/services/redirects";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const redirectType = (
        data as typeof data & { redirectType?: string | null }
      ).redirectType;

      if (next === PASSWORD_RECOVERY_PATH && redirectType !== "recovery") {
        const loginUrl = new URL("/login", requestUrl.origin);
        loginUrl.searchParams.set("confirmation", "error");
        return NextResponse.redirect(loginUrl);
      }

      const destination =
        redirectType === "recovery" ? PASSWORD_RECOVERY_PATH : next;
      const response = NextResponse.redirect(
        new URL(destination, requestUrl.origin),
      );
      if (redirectType === "recovery") {
        response.cookies.set(PASSWORD_RECOVERY_COOKIE, "active", {
          httpOnly: true,
          maxAge: 10 * 60,
          path: "/",
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        });
      }
      return response;
    }
  }

  if (next === PASSWORD_RECOVERY_PATH) {
    const recoveryUrl = new URL("/recuperar-senha", requestUrl.origin);
    recoveryUrl.searchParams.set("feedback", "invalid");
    return NextResponse.redirect(recoveryUrl);
  }

  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set("confirmation", "error");
  return NextResponse.redirect(loginUrl);
}
