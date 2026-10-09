
import { config } from "dotenv";
import { gear } from "../components/gear-data";

config({ path: ".env.local" });

async function seedGear() {
  // Import the database only after loading .env.local.
  const [{ db }, { equipment }] = await Promise.all([
    import("../database/drizzle"),
    import("../database/schema"),
  ]);

  console.log("Starting gear seed...");

  for (const item of gear) {
    await db
      .insert(equipment)
      .values({
        slug: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        dailyRateCents: Math.round(item.price * 100),
        availableCount: item.available,
        condition: item.condition,
        imageUrl: item.image,
        alt: item.alt,
        includes: item.includes,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: equipment.slug,
        set: {
          name: item.name,
          category: item.category,
          description: item.description,
          dailyRateCents: Math.round(item.price * 100),
          condition: item.condition,
          imageUrl: item.image,
          alt: item.alt,
          includes: item.includes,
          isActive: true,
          updatedAt: new Date(),
        },
      });

    console.log(`Seeded: ${item.name}`);
  }

  console.log(`Finished! Processed ${gear.length} items.`);
}

seedGear().catch((error) => {
  console.error("Gear seeding failed:", error);
  process.exitCode = 1;
});
