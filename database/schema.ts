import { relations, sql } from "drizzle-orm";
import {
    boolean,
    index,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
    jsonb,
} from "drizzle-orm/pg-core";

export const STATUS_ENUM = pgEnum("status_enum", ["active", "inactive", "pending"]);
export const ROLE_ENUM = pgEnum("role_enum", ["admin", "user", "guest", "student", "faculty"]);
export const BORROW_STATUS_ENUM = pgEnum("borrow_status_enum", [
    "pending",
    "approved",
    "rejected",
    "borrowed",
    "returned",
    "overdue",
    "cancelled",
]);

export const users = pgTable(
    "users",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        fullName: varchar("fullName", { length: 255 }).notNull(),
        email: varchar("email", { length: 255 }).notNull(),
        universityId: varchar("universityId", { length: 255 }).notNull(),
        passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
        status: STATUS_ENUM("status").notNull().default("pending"),
        role: ROLE_ENUM("role").notNull().default("student"),
        createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("users_email_unique").on(table.email),
        uniqueIndex("users_university_id_unique").on(table.universityId),
    ],
);

export const equipment = pgTable(
    "equipment",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        slug: varchar("slug", { length: 120 }).notNull(),
        name: varchar("name", { length: 255 }).notNull(),
        category: varchar("category", { length: 120 }).notNull(),
        description: text("description").notNull(),
        dailyRateCents: integer("dailyRateCents").notNull(),
        availableCount: integer("availableCount").notNull().default(0),
        condition: varchar("condition", { length: 80 }).notNull().default("good"),
        imageUrl: text("imageUrl"),
        alt: text("alt").notNull().default(""),
        includes: jsonb("includes")
        .$type<string[]>()
        .notNull()
        .default(sql`'[]'::jsonb`),
        isActive: boolean("isActive").notNull().default(true),
        createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("equipment_slug_unique").on(table.slug),
        index("equipment_category_index").on(table.category),
    ],
);

export const bookings = pgTable(
    "bookings",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        equipmentId: uuid("equipmentId").notNull().references(() => equipment.id, { onDelete: "restrict" }),
        startAt: timestamp("startAt", { withTimezone: true }).notNull(),
        returnAt: timestamp("returnAt", { withTimezone: true }).notNull(),
        status: BORROW_STATUS_ENUM("status").notNull().default("pending"),
        projectNote: text("projectNote"),
        estimatedTotalCents: integer("estimatedTotalCents").notNull(),
        createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
        index("bookings_user_index").on(table.userId),
        index("bookings_equipment_dates_index").on(table.equipmentId, table.startAt, table.returnAt),
    ],
);

export const usersRelations = relations(users, ({ many }) => ({
    bookings: many(bookings),
}));

export const equipmentRelations = relations(equipment, ({ many }) => ({
    bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
    user: one(users, { fields: [bookings.userId], references: [users.id] }),
    equipment: one(equipment, { fields: [bookings.equipmentId], references: [equipment.id] }),
}));

export type UserRole = (typeof ROLE_ENUM.enumValues)[number];
export type UserStatus = (typeof STATUS_ENUM.enumValues)[number];