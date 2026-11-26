// Drizzle schema module. Table structure is based on Khaji Pakhsh DB V1.1.
import { pgTable, check, bigint, text, timestamp, foreignKey, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { adminUsers } from "./admin";

export const siteSettings = pgTable("site_settings", {
	settingKey: text("setting_key").primaryKey().notNull(),
	settingValue: jsonb("setting_value").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	updatedBy: bigint("updated_by", { mode: "number" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [adminUsers.id],
			name: "site_settings_updated_by_fkey"
		}).onDelete("restrict"),
	check("site_settings_key_ck", sql`setting_key ~ '^[a-z][a-z0-9_.]*$'::text`),
]);
