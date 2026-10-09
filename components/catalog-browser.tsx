"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowRight,
  ChevronDown,
  Search,
} from "lucide-react";

import type { equipment } from "@/database/schema";

type EquipmentItem = typeof equipment.$inferSelect;
type SortMode = "name" | "price-low" | "price-high" | "stock";

export function CatalogBrowser({ items }: { items: EquipmentItem[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All gear");
  const [sort, setSort] = useState<SortMode>("name");

  const categories = ["All gear", ...new Set(items.map((item) => item.category))];
  const counts = items.reduce<Record<string, number>>((result, item) => {
    result[item.category] = (result[item.category] ?? 0) + 1;
    return result;
  }, {});

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesCategory = category === "All gear" || item.category === category;
      const searchable = [item.name, item.category, item.description, ...item.includes]
        .join(" ")
        .toLowerCase();
      return matchesCategory && (!query || searchable.includes(query));
    });

    return filtered.sort((left, right) => {
      if (sort === "price-low") return left.dailyRateCents - right.dailyRateCents;
      if (sort === "price-high") return right.dailyRateCents - left.dailyRateCents;
      if (sort === "stock") return right.availableCount - left.availableCount;
      return left.name.localeCompare(right.name);
    });
  }, [category, items, search, sort]);

  return (
    <>
      <div className="catalog-toolbar" id="catalog">
        <label className="search-box">
          <Search size={18} aria-hidden="true" />
          <input
            aria-label="Search equipment"
            placeholder="Search cameras, audio, and more"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label className="sort-button">
          <ArrowDownWideNarrow size={16} aria-hidden="true" />
          <span>Sort</span>
          <select
            aria-label="Sort equipment"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortMode)}
          >
            <option value="name">Name</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="stock">Most in stock</option>
          </select>
          <ChevronDown size={15} aria-hidden="true" />
        </label>
      </div>

      <div className="catalog-body">
        <aside className="category-rail" aria-label="Equipment categories">
          <div className="rail-label">Browse by category</div>
          {categories.map((entry) => (
            <button
              aria-pressed={category === entry}
              className={`category-link${category === entry ? " category-selected" : ""}`}
              key={entry}
              onClick={() => setCategory(entry)}
              type="button"
            >
              <span>{entry}</span>
              <span className="category-count">
                {entry === "All gear" ? items.length : counts[entry] ?? 0}
              </span>
            </button>
          ))}

          <div className="help-note" id="how-it-works">
            <span className="help-icon"><ArrowRight size={16} /></span>
            <strong>Have a project in mind?</strong>
            <p>Our gear desk can help you find the right kit.</p>
            <a href="mailto:gearlibrary@campus.edu">Talk to the team <ArrowRight size={13} /></a>
          </div>
        </aside>

        <section className="equipment-section" id="equipment" aria-labelledby="results-title">
          <div className="results-header">
            <div>
              <h2 id="results-title">Campus equipment</h2>
              <p>Browse available gear <span className="results-total">/ {visibleItems.length} items</span></p>
            </div>
            <button className="view-all" onClick={() => { setCategory("All gear"); setSearch(""); }} type="button">
              Clear filters <ArrowRight size={15} />
            </button>
          </div>

          {visibleItems.length === 0 ? (
            <div className="empty-state">
              <h3>{items.length === 0 ? "No equipment available yet" : "No matching equipment"}</h3>
              <p>{items.length === 0 ? "Equipment added to the database will appear here." : "Try a different search or category."}</p>
            </div>
          ) : (
            <div className="equipment-grid">
              {visibleItems.map((item, index) => (
                <article className="equipment-card" key={item.id}>
                  <Link aria-label={`View ${item.name}`} className={`product-visual product-tone-${index % 4}`} href={`/catalog/${item.slug}`}>
                    {item.imageUrl && (
                      <Image
                        alt={item.alt || item.name}
                        className="product-image"
                        fill
                        priority={index < 2}
                        sizes="(max-width: 680px) 46vw, (max-width: 1100px) 30vw, 18vw"
                        src={item.imageUrl}
                        unoptimized
                      />
                    )}
                    <span className="image-category">{item.category}</span>
                  </Link>

                  <div className="product-details">
                    <div className="product-title-row">
                      <Link href={`/catalog/${item.slug}`}><h3>{item.name}</h3></Link>
                      <span className="daily-price">${(item.dailyRateCents / 100).toFixed(2)}<small> / day</small></span>
                    </div>
                    <p className="product-description">{item.includes.slice(0, 2).join(" / ") || item.description}</p>
                    <div className="product-footer">
                      <span className={`availability${item.availableCount === 0 ? " availability-empty" : ""}`}>
                        <span />{item.availableCount} in library
                      </span>
                      {item.availableCount > 0 ? (
                        <Link className="request-button" href={`/catalog/${item.slug}`}>Request <ArrowRight size={13} /></Link>
                      ) : <span className="request-unavailable">Unavailable</span>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}