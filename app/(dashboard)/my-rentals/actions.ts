"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { bookings } from "@/database/schema";

export async function cancelBooking(bookingId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await db
    .update(bookings)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(
      and(
        eq(bookings.id, bookingId),
        eq(bookings.userId, session.user.id),
        eq(bookings.status, "pending"),
      ),
    );

  revalidatePath("/my-rentals");
  revalidatePath("/admin");
}