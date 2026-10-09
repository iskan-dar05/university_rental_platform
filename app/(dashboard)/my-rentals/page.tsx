import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
  Flag,
  RotateCcw,
} from "lucide-react";
import { desc, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { bookings, equipment } from "@/database/schema";
import { PortalShell } from "@/components/portal-shell";
import { SignOutButton } from "@/components/sign-out-button";
import { cancelBooking } from "./actions";

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

export default async function MyRentalsPage({
  searchParams,
}: PageProps<"/my-rentals">) {
  const session = await auth();
  const query = await searchParams;

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Fmy-rentals");
  }

  // Fetch only this user's bookings and their associated equipment.
  const rentalRecords = await db
    .select({
      id: bookings.id,
      startAt: bookings.startAt,
      returnAt: bookings.returnAt,
      status: bookings.status,
      projectNote: bookings.projectNote,
      estimatedTotalCents: bookings.estimatedTotalCents,
      createdAt: bookings.createdAt,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      equipmentCategory: equipment.category,
      equipmentImage: equipment.imageUrl,
    })
    .from(bookings)
    .innerJoin(equipment, eq(bookings.equipmentId, equipment.id))
    .where(eq(bookings.userId, session.user.id))
    .orderBy(desc(bookings.createdAt));

  const activeRentals = rentalRecords.filter((rental) =>
    ["approved", "borrowed", "overdue"].includes(rental.status)
  );

  const pendingRentals = rentalRecords.filter(
    (rental) => rental.status === "pending"
  );

  const pastRentals = rentalRecords.filter((rental) =>
    ["returned", "rejected", "cancelled"].includes(rental.status)
  );

  return (
    <PortalShell active="rentals">
      <main className="rentals-page">
        <div className="rentals-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              YOUR GEAR, ALL IN ONE PLACE
            </div>

            <h1>My rentals</h1>
            <p>
              Welcome back,{" "}
              {session.user.name ?? session.user.email ?? "Student"}.
            </p>
          </div>

          <div className="rentals-heading-actions">
            <SignOutButton />
            <Link className="browse-button" href="/catalog">
              Browse gear <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {session.user.status === "pending" && (
          <p className="rental-confirmation" role="status">
            Your campus account is awaiting approval. You can browse equipment while you wait.
          </p>
        )}

        {query.requested === "1" && (
          <p className="rental-confirmation" role="status">
            Your request has been sent to the campus gear desk for review.
          </p>
        )}

        <nav className="rental-tabs" aria-label="Rental status">
          <a className="rental-tab-active" href="#active">
            Active rentals <span>{activeRentals.length}</span>
          </a>
          <a href="#pending">
            Pending requests <span>{pendingRentals.length}</span>
          </a>
          <a href="#past">Past rentals</a>
        </nav>

        {/* Active and approved rentals */}
        <section
          className="rental-section"
          id="active"
          aria-labelledby="active-title"
        >
          <div className="rental-section-heading">
            <div>
              <h2 id="active-title">Active & upcoming rentals</h2>
              <p>Your approved bookings and equipment currently borrowed.</p>
            </div>
          </div>

          {activeRentals.length === 0 ? (
            <p className="empty-state">
              You don&apos;t have any active or upcoming rentals yet.
              <Link href="/catalog"> Browse available gear</Link>
            </p>
          ) : (
            activeRentals.map((rental) => (
              <article className="active-rental-card" key={rental.id}>
                <div className="rental-item-summary">
                  <div className="rental-image">
                    {rental.equipmentImage ? (
                      <Image
                        src={rental.equipmentImage}
                        alt={rental.equipmentName}
                        fill
                        sizes="120px"
                        unoptimized
                      />
                    ) : (
                      <FileText size={30} />
                    )}
                  </div>

                  <div>
                    <span className="detail-category">
                      {rental.equipmentCategory}
                    </span>
                    <h3>{rental.equipmentName}</h3>
                    <p>
                      Booking ID{" "}
                      <strong>{rental.id.slice(0, 8).toUpperCase()}</strong>
                    </p>
                    <span
                      className={`status-pill ${
                        rental.status === "overdue"
                          ? "status-pending"
                          : "status-active"
                      }`}
                    >
                      {rental.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="rental-countdown">
                  <div className="countdown-title">
                    {rental.status === "approved" ? (
                      <CalendarDays size={15} />
                    ) : (
                      <Clock3 size={15} />
                    )}
                    <span>
                      {rental.status === "approved"
                          ? "Rental starts"
                        : "Return date"}
                      </span>
                      <strong>
                        {formatDate(
                          rental.status === "approved" ? rental.startAt : rental.returnAt,
                        )}
                      </strong>
                  </div>

                  <div className="rental-dates">
                    <span>Start: {formatDateTime(rental.startAt)}</span>
                    <strong>Due: {formatDateTime(rental.returnAt)}</strong>
                  </div>
                </div>

                <div className="rental-card-actions">
                  <span>
                    Total: <strong>{money(rental.estimatedTotalCents)}</strong>
                  </span>

                  {rental.status === "borrowed" && (
                    <a
                      className="outline-action"
                      href={`mailto:gearlibrary@campus.edu?subject=${encodeURIComponent(`Issue with booking ${rental.id.slice(0, 8)}`)}&body=${encodeURIComponent(`Hello campus gear desk,\n\nI need help with booking ${rental.id}.\nEquipment: ${rental.equipmentName}\n`)}`}
                    >
                      <Flag size={14} /> Report an issue
                    </a>
                  )}

                  {rental.status === "borrowed" && (
                    <a
                      className="primary-action"
                      href={`mailto:gearlibrary@campus.edu?subject=${encodeURIComponent(`Return question for booking ${rental.id.slice(0, 8)}`)}&body=${encodeURIComponent(`Hello campus gear desk,\n\nI have a question about returning booking ${rental.id}.\nEquipment: ${rental.equipmentName}\nDue: ${formatDateTime(rental.returnAt)}\n`)}`}
                    >
                      <RotateCcw size={14} /> Return details
                    </a>
                  )}
                </div>
              </article>
            ))
          )}
        </section>

        {/* Pending bookings */}
        <section
          className="rental-section pending-section"
          id="pending"
          aria-labelledby="pending-title"
        >
          <div className="rental-section-heading">
            <div>
              <h2 id="pending-title">Pending requests</h2>
              <p>Your requests waiting for approval.</p>
            </div>
          </div>

          {pendingRentals.length === 0 ? (
            <p className="empty-state">You have no pending requests.</p>
          ) : (
            pendingRentals.map((rental) => (
              <article className="pending-rental-row" key={rental.id}>
                <span className="pending-icon">
                  <CalendarDays size={18} />
                </span>

                <div>
                  <h3>{rental.equipmentName}</h3>
                  <p>
                    {formatDate(rental.startAt)} – {formatDate(rental.returnAt)}
                    <span> / </span>
                    Requested {formatDate(rental.createdAt)}
                  </p>
                </div>

                <strong>
                  {money(rental.estimatedTotalCents)}
                  <small> estimated</small>
                </strong>
                <form action={cancelBooking.bind(null, rental.id)}>
                  <button className="outline-action" type="submit">
                    Cancel request
                  </button>
                </form>
              </article>
            ))
          )}
        </section>

        {/* Completed and cancelled bookings */}
        <section
          className="rental-section past-section"
          id="past"
          aria-labelledby="past-title"
        >
          <div className="rental-section-heading">
            <div>
              <h2 id="past-title">Past rentals</h2>
              <p>Your completed and cancelled booking history.</p>
            </div>
          </div>

          {pastRentals.length === 0 ? (
            <p className="empty-state">Your rental history will appear here.</p>
          ) : (
            <div className="past-rental-list">
              {pastRentals.map((rental) => (
                <article className="past-rental-row" key={rental.id}>
                  <div className="past-item-icon">
                    <FileText size={17} />
                  </div>

                  <div className="past-item-name">
                    <h3>{rental.equipmentName}</h3>
                    <p>
                      {formatDate(rental.startAt)} –{" "}
                      {formatDate(rental.returnAt)}
                    </p>
                  </div>

                  <span className="status-pill status-returned">
                    {rental.status}
                  </span>

                  <strong className="past-price">
                    {money(rental.estimatedTotalCents)}
                  </strong>

                  {rental.status === "returned" && (
                    <a
                      className="receipt-button"
                      download={`rental-record-${rental.id.slice(0, 8)}.txt`}
                      href={`data:text/plain;charset=utf-8,${encodeURIComponent(`Campus Gear Library rental record\n\nBooking ID: ${rental.id}\nEquipment: ${rental.equipmentName}\nCategory: ${rental.equipmentCategory}\nPickup: ${formatDateTime(rental.startAt)}\nReturn: ${formatDateTime(rental.returnAt)}\nStatus: ${rental.status}\nEstimated total: ${money(rental.estimatedTotalCents)}\n\nPayment was not collected by this portal.\n`)}`}
                    >
                      <ArrowDownToLine size={14} /> Rental record
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </PortalShell>
  );
}
