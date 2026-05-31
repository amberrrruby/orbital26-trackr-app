"use client";
import { Button } from "@/app/components/Button";
import { LuLogOut } from "react-icons/lu";

export default function LogoutButton() {
  return (
    <form action="/actions/auth/logout" method="post">
      <Button type="submit" variant="danger">
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <LuLogOut /> Log out
        </span>
      </Button>
    </form>
  );
}
