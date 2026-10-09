import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Fadmin");
  }

  const [account] = await db
    .select({ role: users.role, status: users.status })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (account?.role !== "admin" || account.status !== "active") {
    redirect("/my-rentals");
  }

  return session;
}