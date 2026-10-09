"use server";

import { and, eq, gt, inArray, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { bookings, equipment, users } from "@/database/schema";

const bookingSchema = z.object({
  startAt: z.string().min(1, "Choose a pickup date and time."),
  returnAt: z.string().min(1, "Choose a return date and time."),
  projectNote: z.string().trim().max(1000, "Keep your note under 1,000 characters."),
});

export type BookingFormState = {
  message?: string;
};

export async function createBooking(
  equipmentId: string,
  _previousState: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/catalog`)}`);
  }

  const [account] = await db
    .select({ status: users.status })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (account?.status !== "active") {
    return { message: "Your account must be approved before you can request equipment." };
  }

  const parsed = bookingSchema.safeParse({
    startAt: formData.get("startAt"),
    returnAt: formData.get("returnAt"),
    projectNote: formData.get("projectNote") ?? "",
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Check the booking details." };
  }

  const startAt = new Date(parsed.data.startAt);
  const returnAt = new Date(parsed.data.returnAt);
  const now = new Date();

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(returnAt.getTime())) {
    return { message: "Enter valid pickup and return dates." };
  }

  if (startAt <= now || returnAt <= startAt) {
    return { message: "Pickup must be in the future and return must follow pickup." };
  }

  const [item] = await db
    .select()
    .from(equipment)
    .where(and(eq(equipment.id, equipmentId), eq(equipment.isActive, true)))
    .limit(1);

  if (!item) {
    return { message: "This equipment is no longer available for booking." };
  }

  const overlappingBookings = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.equipmentId, item.id),
        lt(bookings.startAt, returnAt),
        gt(bookings.returnAt, startAt),
        inArray(bookings.status, ["approved", "borrowed", "overdue"]),
      ),
    );

  if (overlappingBookings.length >= item.availableCount) {
    return { message: "There is no inventory available for those dates. Try another date range." };
  }

  const rentalDays = Math.max(
    1,
    Math.ceil((returnAt.getTime() - startAt.getTime()) / 86_400_000),
  );

  await db.insert(bookings).values({
    userId: session.user.id,
    equipmentId: item.id,
    startAt,
    returnAt,
    projectNote: parsed.data.projectNote || null,
    estimatedTotalCents: item.dailyRateCents * rentalDays,
    status: "pending",
  });

  revalidatePath("/catalog");
  revalidatePath(`/catalog/${item.slug}`);
  revalidatePath("/my-rentals");
  redirect("/my-rentals?requested=1");
}