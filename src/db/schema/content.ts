// Drizzle schema module. Table structure is based on Khaji Pakhsh DB V1.1.
import { pgTable, uniqueIndex, check, bigint, text, boolean, timestamp, unique, index, foreignKey, smallint, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { mediaAssets } from "./media";

export const contentItems = pgTable("content_items", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "content_items_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	contentType: text("content_type").notNull(),
	slug: text().notNull(),
	canonicalPath: text("canonical_path").notNull(),
	h1Override: text("h1_override"),
	seoTitle: text("seo_title"),
	metaDescription: text("meta_description"),
	canonicalUrlOverride: text("canonical_url_override"),
	robotsIndex: boolean("robots_index").default(false).notNull(),
	robotsFollow: boolean("robots_follow").default(true).notNull(),
	ogTitle: text("og_title"),
	ogDescription: text("og_description"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	ogImageMediaId: bigint("og_image_media_id", { mode: "number" }),
	ogImageAltText: text("og_image_alt_text"),
	status: text().default('draft').notNull(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	contentUpdatedAt: timestamp("content_updated_at", { withTimezone: true, mode: 'string' }),
	removedHttpStatus: smallint("removed_http_status").default(404).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("content_items_path_ci_uq").using("btree", sql`lower(canonical_path)`),
	index("content_items_sitemap_ix").using("btree", table.status.asc().nullsLast(), table.robotsIndex.asc().nullsLast(), table.contentUpdatedAt.asc().nullsLast()).where(sql`((status = 'published'::text) AND (robots_index = true))`),
	index("content_items_type_status_ix").using("btree", table.contentType.asc().nullsLast(), table.status.asc().nullsLast()),
	foreignKey({
			columns: [table.ogImageMediaId],
			foreignColumns: [mediaAssets.id],
			name: "content_items_og_image_media_id_fkey"
		}).onDelete("restrict"),
	unique("content_items_type_pair_uq").on(table.id, table.contentType),
	check("content_items_type_ck", sql`content_type = ANY (ARRAY['page'::text, 'category'::text, 'brand'::text, 'product'::text, 'price_list'::text])`),
	check("content_items_status_ck", sql`status = ANY (ARRAY['draft'::text, 'review'::text, 'published'::text, 'unpublished'::text, 'deleted'::text, 'redirected'::text])`),
	check("content_items_slug_not_blank_ck", sql`(length(btrim(slug)) > 0) AND (slug = btrim(slug)) AND (POSITION(('/'::text) IN (slug)) = 0) AND (POSITION(('?'::text) IN (slug)) = 0) AND (POSITION(('#'::text) IN (slug)) = 0) AND (POSITION((' '::text) IN (slug)) = 0)`),
	check("content_items_path_ck", sql`("left"(canonical_path, 1) = '/'::text) AND (POSITION(('?'::text) IN (canonical_path)) = 0) AND (POSITION(('#'::text) IN (canonical_path)) = 0) AND (POSITION(('//'::text) IN (canonical_path)) = 0)`),
	check("content_items_canonical_override_ck", sql`(canonical_url_override IS NULL) OR (canonical_url_override ~* '^https://'::text)`),
	check("content_items_published_date_ck", sql`(status <> 'published'::text) OR (published_at IS NOT NULL)`),
	check("content_items_nonpublished_noindex_ck", sql`(status = 'published'::text) OR (robots_index = false)`),
	check("content_items_removed_status_ck", sql`removed_http_status = ANY (ARRAY[404, 410])`),
]);
