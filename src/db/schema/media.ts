// Drizzle schema module. Table structure is based on Khaji Pakhsh DB V1.1.
import { pgTable, check, bigint, text, timestamp, unique, index, foreignKey, char, integer, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { adminUsers } from "./admin";

export const mediaAssets = pgTable("media_assets", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "media_assets_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	storageKey: text("storage_key").notNull(),
	originalFilename: text("original_filename"),
	mimeType: text("mime_type").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	byteSize: bigint("byte_size", { mode: "number" }).notNull(),
	sha256Hex: char("sha256_hex", { length: 64 }),
	widthPx: integer("width_px"),
	heightPx: integer("height_px"),
	defaultAltText: text("default_alt_text"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	uploadedBy: bigint("uploaded_by", { mode: "number" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("media_assets_sha_ix").using("btree", table.sha256Hex.asc().nullsLast()).where(sql`(sha256_hex IS NOT NULL)`),
	foreignKey({
			columns: [table.uploadedBy],
			foreignColumns: [adminUsers.id],
			name: "media_assets_uploaded_by_fkey"
		}).onDelete("restrict"),
	unique("media_assets_storage_key_key").on(table.storageKey),
	check("media_storage_key_not_blank_ck", sql`length(btrim(storage_key)) > 0`),
	check("media_mime_not_blank_ck", sql`length(btrim(mime_type)) > 0`),
	check("media_byte_size_ck", sql`byte_size > 0`),
	check("media_width_ck", sql`(width_px IS NULL) OR (width_px > 0)`),
	check("media_height_ck", sql`(height_px IS NULL) OR (height_px > 0)`),
	check("media_sha_format_ck", sql`(sha256_hex IS NULL) OR (sha256_hex ~ '^[0-9a-f]{64}$'::text)`),
]);
