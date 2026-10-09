import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { asc } from "drizzle-orm";

import { PortalShell } from "@/components/portal-shell";
import { db } from "@/database/drizzle";
import { equipment } from "@/database/schema";
import { requireAdmin } from "@/lib/authorization";
import {
  createEquipment,
  setEquipmentActive,
  updateEquipment,
} from "@/app/(dashboard)/admin/actions";

function EquipmentFields({
  item,
}: {
  item?: typeof equipment.$inferSelect;
}) {
  return (
    <div className="equipment-editor-grid">
      <label className="field-label">
        Name
        <input name="name" defaultValue={item?.name ?? ""} required minLength={2} />
      </label>
      <label className="field-label">
        Category
        <input name="category" defaultValue={item?.category ?? ""} required />
      </label>
      <label className="field-label">
        Daily rate (USD)
        <input
          name="dailyRate"
          type="number"
          min="0"
          step="0.01"
          defaultValue={item ? (item.dailyRateCents / 100).toFixed(2) : "0.00"}
          required
        />
      </label>
      <label className="field-label">
        Quantity
        <input
          name="availableCount"
          type="number"
          min="0"
          step="1"
          defaultValue={item?.availableCount ?? 0}
          required
        />
      </label>
      <label className="field-label">
        Condition
        <input name="condition" defaultValue={item?.condition ?? "Good"} required />
      </label>
      <label className="field-label">
        Image URL
        <input name="imageUrl" type="url" defaultValue={item?.imageUrl ?? ""} />
      </label>
      <label className="field-label equipment-editor-wide">
        Description
        <textarea name="description" defaultValue={item?.description ?? ""} required minLength={10} rows={3} />
      </label>
      <label className="field-label equipment-editor-wide">
        Image description
        <input name="alt" defaultValue={item?.alt ?? ""} />
      </label>
      <label className="field-label equipment-editor-wide">
        Included items, one per line
        <textarea name="includes" defaultValue={item?.includes.join("\n") ?? ""} rows={3} />
      </label>
    </div>
  );
}

export default async function AdminEquipmentPage({
  searchParams,
}: PageProps<"/admin/equipment">) {
  await requireAdmin();
  const query = await searchParams;
  const noticeKey = Array.isArray(query.notice) ? query.notice[0] : query.notice;
  const errorKey = Array.isArray(query.error) ? query.error[0] : query.error;
  const items = await db.select().from(equipment).orderBy(asc(equipment.name));
  const notice = {
    created: "Equipment listing created.",
    updated: "Equipment listing updated.",
    archived: "Equipment listing archived.",
    restored: "Equipment listing restored.",
  }[noticeKey ?? ""];

  return (
    <PortalShell active="admin">
      <main className="admin-page equipment-admin-page">
        <Link className="back-link" href="/admin"><ArrowLeft size={15} /> Operations overview</Link>
        <header className="admin-header">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot" /> INVENTORY</div>
            <h1>Manage equipment</h1>
            <p>Create listings, update stock, and archive unavailable equipment.</p>
          </div>
        </header>

        {notice && <p className="rental-confirmation" role="status">{notice}</p>}
        {errorKey === "invalid" && (
          <p className="auth-message" role="alert">Check the listing fields and try again. Rates and quantities must be valid, and image URLs must be complete.</p>
        )}

        <section className="panel equipment-create-panel">
          <div className="panel-header"><h2>Add equipment</h2></div>
          <form action={createEquipment} className="equipment-editor-form">
            <EquipmentFields />
            <button className="admin-primary" type="submit">Create listing</button>
          </form>
        </section>

        <section className="equipment-admin-list" aria-label="Equipment listings">
          <div className="panel-header equipment-list-heading">
            <h2>Existing listings</h2>
            <span>{items.length} total</span>
          </div>
          {items.length === 0 ? (
            <p className="admin-empty">No equipment listings have been created.</p>
          ) : items.map((item) => (
            <article className={`equipment-admin-item${item.isActive ? "" : " is-archived"}`} key={item.id}>
              <div className="equipment-admin-item-heading">
                <div>
                  <span className="detail-category">{item.category} · {item.condition}</span>
                  <h3>{item.name}</h3>
                  <p>{item.availableCount} units · ${(item.dailyRateCents / 100).toFixed(2)} per day · {item.isActive ? "Active" : "Archived"}</p>
                </div>
                <form action={setEquipmentActive.bind(null, item.id, !item.isActive)}>
                  <button className="admin-secondary" type="submit">{item.isActive ? "Archive" : "Restore"}</button>
                </form>
              </div>
              <details>
                <summary>Edit listing</summary>
                <form action={updateEquipment.bind(null, item.id)} className="equipment-editor-form">
                  <EquipmentFields item={item} />
                  <button className="admin-primary" type="submit">Save changes</button>
                </form>
              </details>
            </article>
          ))}
        </section>
      </main>
    </PortalShell>
  );
}