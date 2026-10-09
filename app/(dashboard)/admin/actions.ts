"use server";

import { and, eq, gt, inArray, lt, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/database/drizzle";
import { bookings, equipment, users } from "@/database/schema";
import { requireAdmin } from "@/lib/authorization";

const equipmentFormSchema = z.object({
  name: z.string().trim().min(2).max(255),
  category: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10),
  dailyRate: z
    .string()
    .trim()
    .min(1)
    .regex(/^\d+(\.\d{1,2})?$/)
    .transform(Number)
    .pipe(z.number().finite().min(0).max(100000)),
  availableCount: z
    .string()
    .trim()
    .min(1)
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(0).max(10000)),
  condition: z.string().trim().min(1).max(80),
  imageUrl: z.union([z.literal(""), z.string().url()]),
  alt: z.string().trim().max(500),
  includes: z.string().max(2000),
});

function readEquipmentForm(formData: FormData) {
  return equipmentFormSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    description: formData.get("description"),
    dailyRate: formData.get("dailyRate"),
    availableCount: formData.get("availableCount"),
    condition: formData.get("condition"),
    imageUrl: formData.get("imageUrl") || "",
    alt: formData.get("alt") || "",
    includes: formData.get("includes") || "",
  });
}

function makeSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "equipment";
}

async function uniqueSlug(name: string, exceptId?: string) {
  const base = makeSlug(name);
  let candidate = base;
  let suffix = 2;

  while (true) {
    const [existing] = await db
      .select({ id: equipment.id })
      .from(equipment)
      .where(eq(equipment.slug, candidate))
      .limit(1);

    if (!existing || existing.id === exceptId) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}

function equipmentValues(data: z.infer<typeof equipmentFormSchema>, slug: string) {
  return {
    slug,
    name: data.name,
    category: data.category,
    description: data.description,
    dailyRateCents: Math.round(data.dailyRate * 100),
    availableCount: data.availableCount,
    condition: data.condition,
    imageUrl: data.imageUrl || null,
    alt: data.alt,
    includes: data.includes
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean),
    updatedAt: new Date(),
  };
}

export async function createEquipment(formData: FormData) {
  await requireAdmin();
  const parsed = readEquipmentForm(formData);
  if (!parsed.success) redirect("/admin/equipment?error=invalid");

  const slug = await uniqueSlug(parsed.data.name);
  await db.insert(equipment).values({
    ...equipmentValues(parsed.data, slug),
    isActive: true,
  });

  revalidatePath("/admin/equipment");
  revalidatePath("/admin");
  revalidatePath("/catalog");
  redirect("/admin/equipment?notice=created");
}

export async function updateEquipment(equipmentId: string, formData: FormData) {
  await requireAdmin();
  const parsed = readEquipmentForm(formData);
  if (!parsed.success) redirect("/admin/equipment?error=invalid");

  const slug = await uniqueSlug(parsed.data.name, equipmentId);
  await db
    .update(equipment)
    .set(equipmentValues(parsed.data, slug))
    .where(eq(equipment.id, equipmentId));

  revalidatePath("/admin/equipment");
  revalidatePath("/admin");
  revalidatePath("/catalog");
  revalidatePath(`/catalog/${slug}`);
  redirect("/admin/equipment?notice=updated");
}

export async function setEquipmentActive(equipmentId: string, isActive: boolean) {
  await requireAdmin();
  await db
    .update(equipment)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(equipment.id, equipmentId));

  revalidatePath("/admin/equipment");
  revalidatePath("/admin");
  revalidatePath("/catalog");
  redirect(`/admin/equipment?notice=${isActive ? "restored" : "archived"}`);
}

async function setUserStatus(userId: string, status: "active" | "inactive") {
  await requireAdmin();
  await db
    .update(users)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(users.id, userId), ne(users.role, "admin")));

  revalidatePath("/admin");
  redirect(`/admin?notice=user-${status}`);
}

export async function approveUser(userId: string) {
  await setUserStatus(userId, "active");
}

export async function rejectUser(userId: string) {
  await setUserStatus(userId, "inactive");
}

async function setBookingStatus(
  bookingId: string,
  nextStatus: "approved" | "rejected" | "borrowed" | "returned" | "overdue",
) {
  await requireAdmin();

  const [booking] = await db
    .select({
      id: bookings.id,
      equipmentId: bookings.equipmentId,
      startAt: bookings.startAt,
      returnAt: bookings.returnAt,
      status: bookings.status,
    })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking) redirect("/admin?notice=booking-missing");

  const allowedTransitions: Record<string, string[]> = {
    pending: ["approved", "rejected"],
    approved: ["borrowed", "rejected"],
    borrowed: ["returned", "overdue"],
    overdue: ["returned"],
  };

  if (!allowedTransitions[booking.status]?.includes(nextStatus)) {
    redirect("/admin?notice=invalid-transition");
  }

  if (nextStatus === "approved") {
    const [item] = await db
      .select({ availableCount: equipment.availableCount })
      .from(equipment)
      .where(and(eq(equipment.id, booking.equipmentId), eq(equipment.isActive, true)))
      .limit(1);

    const overlappingBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.equipmentId, booking.equipmentId),
          ne(bookings.id, booking.id),
          lt(bookings.startAt, booking.returnAt),
          gt(bookings.returnAt, booking.startAt),
          inArray(bookings.status, ["approved", "borrowed", "overdue"]),
        ),
      );

    if (!item || overlappingBookings.length >= item.availableCount) {
      redirect("/admin?notice=capacity-conflict");
    }
  }

  await db
    .update(bookings)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(and(eq(bookings.id, booking.id), eq(bookings.status, booking.status)));

  revalidatePath("/admin");
  revalidatePath("/my-rentals");
  revalidatePath("/catalog");
  redirect(`/admin?notice=booking-${nextStatus}`);
}

export async function approveBooking(bookingId: string) {
  await setBookingStatus(bookingId, "approved");
}

export async function rejectBooking(bookingId: string) {
  await setBookingStatus(bookingId, "rejected");
}

export async function markBorrowed(bookingId: string) {
  await setBookingStatus(bookingId, "borrowed");
}

export async function markReturned(bookingId: string) {
  await setBookingStatus(bookingId, "returned");
}

export async function markOverdue(bookingId: string) {
  await setBookingStatus(bookingId, "overdue");
}