"use client";

import { loginGoogleAction } from "@/app/actions/auth/handle-login-google";
import GoogleButton from "@/app/components/GoogleButton";

export default function GoogleLogin() {
  return (
    <button type="submit" onClick={() => loginGoogleAction()} className="reset">
      <GoogleButton />
    </button>
  );
}
