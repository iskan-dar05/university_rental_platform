import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/database/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL must be set to connect to Neon Postgres.");
}

const sql = neon(connectionString);

export const db = drizzle({ client: sql, schema });

