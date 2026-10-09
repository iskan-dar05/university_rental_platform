
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock3,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { eq, and } from "drizzle-orm";

import { db } from "@/database/drizzle";
import { equipment } from "@/database/schema";
import { PortalShell } from "@/components/portal-shell";
import { BookingForm } from "@/components/booking-form";
import { createBooking } from "@/app/catalog/actions";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function GearDetailsPage({
  params,
}: PageProps<"/catalog/[id]">) {
  const { id } = await params;

  // Fetch the selected equipment directly from Neon
  const [item] = await db
    .select()
    .from(equipment)
    .where(
      and(
        eq(equipment.slug, id),
        eq(equipment.isActive, true)
      )
    )
    .limit(1);

  // Show the 404 page if the equipment doesn't exist
  if (!item) {
    notFound();
  }

  const session = await auth();
  const dailyPrice = item.dailyRateCents / 100;
  const bookingAction = createBooking.bind(null, item.id);

  return (
    <PortalShell>
      <main className="detail-page">
        <Link className="back-link" href="/catalog">
          <ArrowLeft size={15} /> Back to catalog
        </Link>

        <div className="detail-breadcrumb">
          <Link href="/catalog">Catalog</Link>
          <span>/</span>
          {item.category}
          <span>/</span>
          {item.name}
        </div>

        <div className="detail-layout">
          <section className="detail-content">
            <div className="detail-photo">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.alt || item.name}
                  fill
                  sizes="(max-width: 760px) 100vw, 60vw"
                  priority
                  unoptimized
                />
              ) : (
                <div className="detail-image-placeholder">
                  No image available
                </div>
              )}

              <span className="detail-photo-label">
                <Check size={13} /> Campus gear library
              </span>
            </div>

            <div className="detail-title-row">
              <div>
                <span className="detail-category">
                  {item.category}
                </span>
                <h1>{item.name}</h1>
              </div>

              <div className="detail-price">
                ${dailyPrice.toFixed(2)}
                <small> / day</small>
              </div>
            </div>

            <p className="detail-description">
              {item.description}
            </p>

            <div className="detail-meta">
              <span>
                <span className="availability-dot" />
                {item.availableCount} in library
              </span>

              <span>
                <ShieldCheck size={16} />
                {item.condition} condition
              </span>

              <span>
                <MapPin size={16} />
                Campus gear desk
              </span>
            </div>

            <section className="includes-section">
              <h2>What&apos;s included</h2>

              {item.includes.length > 0 ? (
                <ul>
                  {item.includes.map((entry) => (
                    <li key={entry}>
                      <Check size={15} /> {entry}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Included accessories will be confirmed at pickup.</p>
              )}
            </section>

            <div className="pickup-note">
              <Clock3 size={18} />
              <span>
                <strong>Pick up on campus</strong>
                <small>
                  Bring your student ID when collecting your gear.
                </small>
              </span>
            </div>
          </section>

          <aside className="booking-panel">
            {item.availableCount < 1 ? (
              <div className="booking-account-notice">
                <div className="booking-panel-heading">
                  <span>
                    <strong>Currently unavailable</strong>
                    <small>The gear desk has no units listed for this item</small>
                  </span>
                </div>
              </div>
            ) : session?.user?.status === "active" ? (
              <BookingForm action={bookingAction} dailyPrice={dailyPrice} />
            ) : session?.user ? (
              <div className="booking-account-notice">
                <div className="booking-panel-heading">
                  <span>
                    <strong>Account approval required</strong>
                    <small>Your account is awaiting campus review</small>
                  </span>
                </div>
                <p>You can request this equipment once your account is approved.</p>
              </div>
            ) : (
              <div className="booking-account-notice">
                <div className="booking-panel-heading">
                  <span>
                    <strong>Plan your rental</strong>
                    <small>Sign in to request campus equipment</small>
                  </span>
                </div>
                <Link
                  className="booking-submit"
                  href={`/login?callbackUrl=${encodeURIComponent(`/catalog/${item.slug}`)}`}
                >
                  Sign in to request booking
                </Link>
                <p className="booking-footnote">
                  Requests are reviewed by the campus gear desk.
                </p>
              </div>
            )}
          </aside>
        </div>
      </main>
    </PortalShell>
  );
}
