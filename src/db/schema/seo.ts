// Drizzle schema module. Table structure is based on Khaji Pakhsh DB V1.1.
import { pgTable, uniqueIndex, check, bigint, text, timestamp, foreignKey, smallint, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { adminUsers } from "./admin";

export const seoRedirects = pgTable("seo_redirects", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "seo_redirects_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	sourcePath: text("source_path").notNull(),
	targetPath: text("target_path").notNull(),
	statusCode: smallint("status_code").default(301).notNull(),
	reason: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	createdBy: bigint("created_by", { mode: "number" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("seo_redirects_source_ci_uq").using("btree", sql`lower(source_path)`),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [adminUsers.id],
			name: "seo_redirects_created_by_fkey"
		}).onDelete("restrict"),
	check("seo_redirect_source_path_ck", sql`("left"(source_path, 1) = '/'::text) AND (POSITION(('?'::text) IN (source_path)) = 0) AND (POSITION(('#'::text) IN (source_path)) = 0)`),
	check("seo_redirect_target_path_ck", sql`("left"(target_path, 1) = '/'::text) AND (POSITION(('?'::text) IN (target_path)) = 0) AND (POSITION(('#'::text) IN (target_path)) = 0)`),
	check("seo_redirect_no_self_ck", sql`source_path <> target_path`),
	check("seo_redirect_code_ck", sql`status_code = ANY (ARRAY[301, 308])`),
]);
