import Link from "next/link";
import { ArrowRight, Box, CalendarCheck2, Users } from "lucide-react";
import { and, count, desc, eq, inArray, ne } from "drizzle-orm";

import { db } from "@/database/drizzle";
import { bookings, equipment, users } from "@/database/schema";
import { requireAdmin } from "@/lib/authorization";
import { PortalShell } from "@/components/portal-shell";
import {
  approveBooking,
  approveUser,
  markBorrowed,
  markOverdue,
  markReturned,
  rejectBooking,
  rejectUser,
} from "@/app/(dashboard)/admin/actions";

const dateTime = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

export async function AdminDashboardView({
  searchParams,
}: PageProps<"/admin">) {
  await requireAdmin();
  const query = await searchParams;
  const noticeKey = Array.isArray(query.notice) ? query.notice[0] : query.notice;

  const [pendingUsers, managedUsers, recentBookings, equipmentCount, activeEquipmentCount, userCount, bookingCount, pendingBookingCount, activeRentals] = await Promise.all([
    db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        universityId: users.universityId,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.status, "pending"))
      .orderBy(desc(users.createdAt)),
    db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        universityId: users.universityId,
        status: users.status,
        role: users.role,
      })
      .from(users)
      .where(and(ne(users.status, "pending"), ne(users.role, "admin")))
      .orderBy(desc(users.updatedAt))
      .limit(50),
    db
      .select({
        id: bookings.id,
        status: bookings.status,
        startAt: bookings.startAt,
        returnAt: bookings.returnAt,
        estimatedTotalCents: bookings.estimatedTotalCents,
        projectNote: bookings.projectNote,
        createdAt: bookings.createdAt,
        userName: users.fullName,
        userEmail: users.email,
        equipmentName: equipment.name,
        equipmentCategory: equipment.category,
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.userId, users.id))
      .innerJoin(equipment, eq(bookings.equipmentId, equipment.id))
      .orderBy(desc(bookings.createdAt))
      .limit(50),
    db.select({ value: count() }).from(equipment),
    db.select({ value: count() }).from(equipment).where(eq(equipment.isActive, true)),
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(bookings),
    db.select({ value: count() }).from(bookings).where(eq(bookings.status, "pending")),
    db.select({ value: count() }).from(bookings).where(inArray(bookings.status, ["borrowed", "overdue"])),
  ]);

  const notice = {
    "user-active": "Account approved.",
    "user-inactive": "Account declined.",
    "booking-missing": "That booking could not be found.",
    "invalid-transition": "That booking status change is not allowed.",
    "capacity-conflict": "This item has no available inventory for the requested dates.",
    "booking-approved": "Booking approved.",
    "booking-rejected": "Booking declined.",
    "booking-borrowed": "Pickup recorded.",
    "booking-returned": "Return recorded.",
    "booking-overdue": "Booking marked overdue.",
  }[noticeKey ?? ""];

  return (
    <PortalShell active="admin">
      <main className="admin-page">
        <header className="admin-header">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot" /> ADMIN DASHBOARD</div>
            <h1>Operations overview</h1>
            <p>Review accounts, manage requests, and keep campus inventory current.</p>
          </div>
          <div className="admin-actions">
            <Link className="admin-secondary" href="/catalog">View catalog</Link>
            <Link className="admin-primary" href="/admin/equipment">Manage equipment <ArrowRight size={15} /></Link>
          </div>
        </header>

        {notice && <p className="rental-confirmation" role="status">{notice}</p>}

        <section className="summary-strip" aria-label="Quick summary">
          <div className="summary-card">
            <span>Accounts awaiting review</span>
            <strong>{pendingUsers.length}</strong>
            <small>New campus registrations</small>
          </div>
          <div className="summary-card accent">
            <span>Booking requests</span>
            <strong>{pendingBookingCount[0]?.value ?? 0}</strong>
            <small>Awaiting a staff decision</small>
          </div>
          <div className="summary-card success">
            <span>Equipment currently out</span>
            <strong>{activeRentals[0]?.value ?? 0}</strong>
            <small>Checked out and not yet returned</small>
          </div>
        </section>

        <section className="admin-metrics" aria-label="Dashboard metrics">
          <article className="metric-card"><div className="metric-top"><div className="metric-icon blue"><Box size={18} /></div></div><div className="metric-label">Active listings</div><div className="metric-value">{activeEquipmentCount[0]?.value ?? 0}</div></article>
          <article className="metric-card"><div className="metric-top"><div className="metric-icon green"><CalendarCheck2 size={18} /></div></div><div className="metric-label">All bookings</div><div className="metric-value">{bookingCount[0]?.value ?? 0}</div></article>
          <article className="metric-card"><div className="metric-top"><div className="metric-icon orange"><Users size={18} /></div></div><div className="metric-label">Registered accounts</div><div className="metric-value">{userCount[0]?.value ?? 0}</div></article>
          <article className="metric-card"><div className="metric-top"><div className="metric-icon purple"><Box size={18} /></div></div><div className="metric-label">All equipment</div><div className="metric-value">{equipmentCount[0]?.value ?? 0}</div></article>
        </section>

        <section className="panel listings-panel">
          <div className="panel-header">
            <h2>Account access</h2>
            <span>Latest {managedUsers.length}</span>
          </div>
          {managedUsers.length === 0 ? (
            <p className="admin-empty">Approved and suspended accounts will appear here.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="list-table" aria-label="Manage account access">
                <thead><tr><th>Name</th><th>Email</th><th>Campus ID</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>{managedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.fullName}</td><td>{user.email}</td><td>{user.universityId}</td><td>{user.role}</td>
                    <td><span className={`status-tag status-${user.status}`}>{user.status}</span></td>
                    <td>
                      {user.status === "active" ? (
                        <form action={rejectUser.bind(null, user.id)}><button className="admin-row-reject" type="submit">Suspend</button></form>
                      ) : (
                        <form action={approveUser.bind(null, user.id)}><button className="admin-row-approve" type="submit">Restore</button></form>
                      )}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel listings-panel">
          <div className="panel-header">
            <h2>Account approvals</h2>
            <span>{pendingUsers.length} pending</span>
          </div>
          {pendingUsers.length === 0 ? (
            <p className="admin-empty">No accounts are waiting for approval.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="list-table" aria-label="Pending account approvals">
                <thead><tr><th>Name</th><th>Campus email</th><th>ID</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>{pendingUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.fullName}<small>Registered {dateTime(user.createdAt)}</small></td>
                    <td>{user.email}</td><td>{user.universityId}</td><td>{user.role}</td>
                    <td><div className="admin-row-actions">
                      <form action={approveUser.bind(null, user.id)}><button className="admin-row-approve" type="submit">Approve</button></form>
                      <form action={rejectUser.bind(null, user.id)}><button className="admin-row-reject" type="submit">Decline</button></form>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel listings-panel">
          <div className="panel-header">
            <h2>Rental requests</h2>
            <span>Latest {recentBookings.length}</span>
          </div>
          {recentBookings.length === 0 ? (
            <p className="admin-empty">Rental requests will appear here.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="list-table" aria-label="Recent rental requests">
                <thead><tr><th>Equipment</th><th>Borrower</th><th>Dates</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{recentBookings.map((booking) => {
                  const actions = booking.status === "pending"
                    ? <><form action={approveBooking.bind(null, booking.id)}><button className="admin-row-approve" type="submit">Approve</button></form><form action={rejectBooking.bind(null, booking.id)}><button className="admin-row-reject" type="submit">Decline</button></form></>
                    : booking.status === "approved"
                      ? <form action={markBorrowed.bind(null, booking.id)}><button className="admin-row-approve" type="submit">Record pickup</button></form>
                      : booking.status === "borrowed"
                        ? <><form action={markReturned.bind(null, booking.id)}><button className="admin-row-approve" type="submit">Record return</button></form><form action={markOverdue.bind(null, booking.id)}><button className="admin-row-reject" type="submit">Mark overdue</button></form></>
                        : booking.status === "overdue"
                          ? <form action={markReturned.bind(null, booking.id)}><button className="admin-row-approve" type="submit">Record return</button></form>
                          : null;

                  return (
                    <tr key={booking.id}>
                      <td>{booking.equipmentName}<small>{booking.equipmentCategory}{booking.projectNote ? ` · ${booking.projectNote}` : ""}</small></td>
                      <td>{booking.userName}<small>{booking.userEmail}</small></td>
                      <td>{dateTime(booking.startAt)}<small>to {dateTime(booking.returnAt)}</small></td>
                      <td><span className={`status-tag status-${booking.status}`}>{booking.status}</span></td>
                      <td><div className="admin-row-actions">{actions}</div></td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </PortalShell>
  );
}
