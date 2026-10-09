"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button className="signout-button" onClick={() => signOut({ callbackUrl: "/" })} type="button">
      <LogOut size={14} /> Sign out
    </button>
  );
}