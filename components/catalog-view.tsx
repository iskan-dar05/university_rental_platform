
import { ArrowRight, Camera, Check, Search } from "lucide-react";

import { asc, eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { equipment } from "@/database/schema";
import { PortalShell } from "@/components/portal-shell";
import { CatalogBrowser } from "@/components/catalog-browser";

export async function CatalogView() {
  // Fetch active equipment from Neon
  const items = await db
    .select()
    .from(equipment)
    .where(eq(equipment.isActive, true))
    .orderBy(asc(equipment.name));

  return (
    <PortalShell>
      <main className="catalog-page" id="top">
        <div className="catalog-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              THE CAMPUS GEAR LIBRARY
            </div>
            <h1>Equip your projects.</h1>
            <p>Borrow the tools to bring your next idea to life.</p>
          </div>

          <div className="semester-note">
            <span className="semester-icon">
              <Check size={16} />
            </span>
            <span>
              <strong>Campus managed</strong>
              <small>Request after account approval</small>
            </span>
          </div>
        </div>

        <CatalogBrowser items={items} />

        <div className="collection-banner" id="all-gear">
              <div className="collection-art">
                <Camera size={30} />
                <Search size={24} />
                <Check size={26} />
              </div>

              <div>
                <span className="collection-kicker">
                  A LITTLE BIT OF EVERYTHING
                </span>
                <h3>Big ideas, meet your toolkit.</h3>
                <p>
                  Explore cameras, sound, lighting, and more from your
                  campus library.
                </p>
              </div>

              <a href="#catalog" aria-label="Explore all equipment">
                <ArrowRight size={18} />
              </a>
        </div>
      </main>
    </PortalShell>
  );
}
