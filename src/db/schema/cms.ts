
// Drizzle schema module. Table structure is based on Khaji Pakhsh DB V1.1.
import {
	pgTable,
	uniqueIndex,
	check,
	bigint,
	text,
	boolean,
	timestamp,
	unique,
	index,
	foreignKey,
	integer,
	jsonb
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { adminUsers } from "./admin";
import { contentItems } from "./content";
import { mediaAssets } from "./media";

export const pages = pgTable("pages", {
	contentItemId: bigint("content_item_id", { mode: "number" }).primaryKey().notNull(),
	contentType: text("content_type").default("page").notNull(),
	pageType: text("page_type").default("static").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("pages_one_home_ix")
		.using("btree", table.pageType.asc().nullsLast())
		.where(sql`(page_type = 'home'::text)`),

	foreignKey({
		columns: [table.contentItemId, table.contentType],
		foreignColumns: [contentItems.id, contentItems.contentType],
		name: "pages_content_item_id_content_type_fkey"
	}).onDelete("restrict"),

	check("pages_content_type_check", sql`content_type = 'page'::text`),
	check("pages_type_ck", sql`page_type = ANY (ARRAY['home'::text, 'static'::text, 'landing'::text])`),
]);

export const pageRevisions = pgTable("page_revisions", {
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({
		name: "page_revisions_id_seq",
		startWith: 1,
		increment: 1,
		minValue: 1,
		cache: 1
	}),
	pageContentItemId: bigint("page_content_item_id", { mode: "number" }).notNull(),
	revisionNumber: integer("revision_number").notNull(),
	title: text().notNull(),
	h1Override: text("h1_override"),
	blocks: jsonb().default([]).notNull(),
	seoTitle: text("seo_title"),
	metaDescription: text("meta_description"),
	canonicalUrlOverride: text("canonical_url_override"),
	robotsIndex: boolean("robots_index").default(false).notNull(),
	robotsFollow: boolean("robots_follow").default(true).notNull(),
	ogTitle: text("og_title"),
	ogDescription: text("og_description"),
	ogImageMediaId: bigint("og_image_media_id", { mode: "number" }),
	ogImageAltText: text("og_image_alt_text"),
	revisionStatus: text("revision_status").default("draft").notNull(),
	createdBy: bigint("created_by", { mode: "number" }).notNull(),
	reviewedBy: bigint("reviewed_by", { mode: "number" }),
	publishedBy: bigint("published_by", { mode: "number" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: "string" }),
}, (table) => [
	uniqueIndex("page_one_published_revision_ix")
		.using("btree", table.pageContentItemId.asc().nullsLast())
		.where(sql`(revision_status = 'published'::text)`),

	index("page_revisions_history_ix")
		.using("btree", table.pageContentItemId.asc().nullsLast(), table.revisionNumber.desc().nullsFirst()),

	foreignKey({
		columns: [table.pageContentItemId],
		foreignColumns: [pages.contentItemId],
		name: "page_revisions_page_content_item_id_fkey"
	}).onDelete("restrict"),

	foreignKey({
		columns: [table.ogImageMediaId],
		foreignColumns: [mediaAssets.id],
		name: "page_revisions_og_image_media_id_fkey"
	}).onDelete("restrict"),

	foreignKey({
		columns: [table.createdBy],
		foreignColumns: [adminUsers.id],
		name: "page_revisions_created_by_fkey"
	}).onDelete("restrict"),

	foreignKey({
		columns: [table.reviewedBy],
		foreignColumns: [adminUsers.id],
		name: "page_revisions_reviewed_by_fkey"
	}).onDelete("restrict"),

	foreignKey({
		columns: [table.publishedBy],
		foreignColumns: [adminUsers.id],
		name: "page_revisions_published_by_fkey"
	}).onDelete("restrict"),

	unique("page_revisions_page_content_item_id_revision_number_key")
		.on(table.pageContentItemId, table.revisionNumber),

	check("page_revision_json_array_ck", sql`jsonb_typeof(blocks) = 'array'::text`),

	check("page_revision_status_ck", sql`revision_status = ANY (ARRAY['draft'::text, 'review'::text, 'published'::text, 'archived'::text])`),

	check("page_revision_published_date_ck", sql`(revision_status <> 'published'::text) OR (published_at IS NOT NULL)`),

	check("page_revision_canonical_ck", sql`(canonical_url_override IS NULL) OR (canonical_url_override ~* '^https://'::text)`),
]);

export const pageRevisionMedia = pgTable("page_revision_media", {
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({
		name: "page_revision_media_id_seq",
		startWith: 1,
		increment: 1,
		minValue: 1,
		cache: 1
	}),
	revisionId: bigint("revision_id", { mode: "number" }).notNull(),
	blockKey: text("block_key").notNull(),
	mediaId: bigint("media_id", { mode: "number" }).notNull(),
	altText: text("alt_text").default("").notNull(),
	isDecorative: boolean("is_decorative").default(false).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
}, (table) => [
	index("page_revision_media_revision_ix")
		.using("btree", table.revisionId.asc().nullsLast(), table.blockKey.asc().nullsLast(), table.sortOrder.asc().nullsLast()),

	foreignKey({
		columns: [table.revisionId],
		foreignColumns: [pageRevisions.id],
		name: "page_revision_media_revision_id_fkey"
	}).onDelete("restrict"),

	foreignKey({
		columns: [table.mediaId],
		foreignColumns: [mediaAssets.id],
		name: "page_revision_media_media_id_fkey"
	}).onDelete("restrict"),

	check("page_revision_media_block_key_ck", sql`length(btrim(block_key)) > 0`),

	check("page_revision_media_decorative_alt_ck", sql`(NOT is_decorative) OR (alt_text = ''::text)`),
]);

export const navigationMenus = pgTable("navigation_menus", {
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({
		name: "navigation_menus_id_seq",
		startWith: 1,
		increment: 1,
		minValue: 1,
		cache: 1
	}),
	code: text().notNull(),
	label: text().notNull(),
}, (table) => [
	unique("navigation_menus_code_key").on(table.code),
	check("nav_menu_code_ck", sql`code ~ '^[a-z][a-z0-9_]*$'::text`),
]);

export const navigationItems = pgTable("navigation_items", {
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({
		name: "navigation_items_id_seq",
		startWith: 1,
		increment: 1,
		minValue: 1,
		cache: 1
	}),
	menuId: bigint("menu_id", { mode: "number" }).notNull(),
	parentItemId: bigint("parent_item_id", { mode: "number" }),
	label: text().notNull(),
	targetContentItemId: bigint("target_content_item_id", { mode: "number" }),
	externalUrl: text("external_url"),
	sortOrder: integer("sort_order").default(0).notNull(),
	isVisible: boolean("is_visible").default(true).notNull(),
}, (table) => [
	index("nav_items_order_ix")
		.using("btree", table.menuId.asc().nullsLast(), table.parentItemId.asc().nullsLast(), table.sortOrder.asc().nullsLast()),

	foreignKey({
		columns: [table.menuId],
		foreignColumns: [navigationMenus.id],
		name: "navigation_items_menu_id_fkey"
	}).onDelete("restrict"),

	foreignKey({
		columns: [table.targetContentItemId],
		foreignColumns: [contentItems.id],
		name: "navigation_items_target_content_item_id_fkey"
	}).onDelete("restrict"),

	// Correct composite self-reference:
	// (menu_id, parent_item_id) -> (menu_id, id)
	foreignKey({
		columns: [table.menuId, table.parentItemId],
		foreignColumns: [table.menuId, table.id],
		name: "navigation_items_menu_id_parent_item_id_fkey"
	}).onDelete("restrict"),

	// Required referenced unique key:
	// UNIQUE (menu_id, id)
	unique("navigation_items_menu_id_id_key")
		.on(table.menuId, table.id),

	check("nav_item_target_one_ck", sql`num_nonnulls(target_content_item_id, external_url) = 1`),

	check("nav_item_external_https_ck", sql`(external_url IS NULL) OR (external_url ~* '^https://'::text)`),

	check("nav_item_not_own_parent_ck", sql`(parent_item_id IS NULL) OR (parent_item_id <> id)`),

	check("nav_item_label_not_blank_ck", sql`length(btrim(label)) > 0`),
]);
