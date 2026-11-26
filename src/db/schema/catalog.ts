// Drizzle schema module. Table structure is based on Khaji Pakhsh DB V1.1.
import { pgTable, uniqueIndex, check, bigint, text, boolean, timestamp, unique, index, foreignKey, integer, primaryKey, numeric } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { contentItems } from "./content";
import { mediaAssets } from "./media";

export const categories = pgTable("categories", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "categories_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	contentItemId: bigint("content_item_id", { mode: "number" }).notNull(),
	contentType: text("content_type").default('category').notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	parentId: bigint("parent_id", { mode: "number" }),
	title: text().notNull(),
	description: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	heroMediaId: bigint("hero_media_id", { mode: "number" }),
	heroAltText: text("hero_alt_text").default("").notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("categories_parent_ix").using("btree", table.parentId.asc().nullsLast()),
	index("categories_sort_ix").using("btree", table.sortOrder.asc().nullsLast()),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "categories_parent_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.heroMediaId],
			foreignColumns: [mediaAssets.id],
			name: "categories_hero_media_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.contentItemId, table.contentType],
			foreignColumns: [contentItems.id, contentItems.contentType],
			name: "categories_content_item_id_content_type_fkey"
		}).onDelete("restrict"),
	unique("categories_content_item_id_key").on(table.contentItemId),
	check("categories_content_type_check", sql`content_type = 'category'::text`),
	check("categories_title_not_blank_ck", sql`length(btrim(title)) > 0`),
	check("categories_parent_self_ck", sql`(parent_id IS NULL) OR (parent_id <> id)`),
]);

export const brands = pgTable("brands", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "brands_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	contentItemId: bigint("content_item_id", { mode: "number" }).notNull(),
	contentType: text("content_type").default('brand').notNull(),
	nameFa: text("name_fa").notNull(),
	nameEn: text("name_en"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	logoMediaId: bigint("logo_media_id", { mode: "number" }),
	logoAltText: text("logo_alt_text").default("").notNull(),
	description: text(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("brands_sort_ix").using("btree", table.sortOrder.asc().nullsLast()),
	foreignKey({
			columns: [table.logoMediaId],
			foreignColumns: [mediaAssets.id],
			name: "brands_logo_media_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.contentItemId, table.contentType],
			foreignColumns: [contentItems.id, contentItems.contentType],
			name: "brands_content_item_id_content_type_fkey"
		}).onDelete("restrict"),
	unique("brands_content_item_id_key").on(table.contentItemId),
	check("brands_content_type_check", sql`content_type = 'brand'::text`),
	check("brands_name_not_blank_ck", sql`length(btrim(name_fa)) > 0`),
]);

export const products = pgTable("products", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "products_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	contentItemId: bigint("content_item_id", { mode: "number" }).notNull(),
	contentType: text("content_type").default('product').notNull(),
	productCode: text("product_code").generatedAlwaysAs(sql`('KHJ-'::text || (id)::text)`),
	name: text().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	brandId: bigint("brand_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	primaryCategoryId: bigint("primary_category_id", { mode: "number" }).notNull(),
	saleUnit: text("sale_unit").default('عدد').notNull(),
	shortDescription: text("short_description"),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("products_brand_ix").using("btree", table.brandId.asc().nullsLast()),
	index("products_primary_category_ix").using("btree", table.primaryCategoryId.asc().nullsLast()),
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "products_brand_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.primaryCategoryId],
			foreignColumns: [categories.id],
			name: "products_primary_category_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.contentItemId, table.contentType],
			foreignColumns: [contentItems.id, contentItems.contentType],
			name: "products_content_item_id_content_type_fkey"
		}).onDelete("restrict"),
	unique("products_content_item_id_key").on(table.contentItemId),
	unique("products_product_code_key").on(table.productCode),
	check("products_content_type_check", sql`content_type = 'product'::text`),
	check("products_name_not_blank_ck", sql`length(btrim(name)) > 0`),
	check("products_sale_unit_not_blank_ck", sql`length(btrim(sale_unit)) > 0`),
]);

export const attributes = pgTable("attributes", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "attributes_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	code: text().notNull(),
	labelFa: text("label_fa").notNull(),
	dataType: text("data_type").notNull(),
	unitLabel: text("unit_label"),
}, (table) => [
	unique("attributes_code_key").on(table.code),
	check("attributes_code_ck", sql`code ~ '^[a-z][a-z0-9_]*$'::text`),
	check("attributes_type_ck", sql`data_type = ANY (ARRAY['text'::text, 'number'::text, 'boolean'::text])`),
]);

export const productMedia = pgTable("product_media", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "product_media_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	productId: bigint("product_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	mediaId: bigint("media_id", { mode: "number" }).notNull(),
	altText: text("alt_text").default("").notNull(),
	isDecorative: boolean("is_decorative").default(false).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	isPrimary: boolean("is_primary").default(false).notNull(),
}, (table) => [
	index("product_media_media_ix").using("btree", table.mediaId.asc().nullsLast()),
	uniqueIndex("product_media_one_primary_ix").using("btree", table.productId.asc().nullsLast()).where(sql`(is_primary = true)`),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_media_product_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.mediaId],
			foreignColumns: [mediaAssets.id],
			name: "product_media_media_id_fkey"
		}).onDelete("restrict"),
	check("product_media_decorative_alt_ck", sql`(NOT is_decorative) OR (alt_text = ''::text)`),
]);

export const productCategories = pgTable("product_categories", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	productId: bigint("product_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	categoryId: bigint("category_id", { mode: "number" }).notNull(),
}, (table) => [
	index("product_categories_category_ix").using("btree", table.categoryId.asc().nullsLast()),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_categories_product_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "product_categories_category_id_fkey"
		}).onDelete("restrict"),
	primaryKey({ columns: [table.productId, table.categoryId], name: "product_categories_pkey"}),
]);

export const categoryAttributes = pgTable("category_attributes", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	categoryId: bigint("category_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	attributeId: bigint("attribute_id", { mode: "number" }).notNull(),
	isRequiredForPublication: boolean("is_required_for_publication").default(false).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "category_attributes_category_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.attributeId],
			foreignColumns: [attributes.id],
			name: "category_attributes_attribute_id_fkey"
		}).onDelete("restrict"),
	primaryKey({ columns: [table.categoryId, table.attributeId], name: "category_attributes_pkey"}),
]);

export const productAttributeValues = pgTable("product_attribute_values", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	productId: bigint("product_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	attributeId: bigint("attribute_id", { mode: "number" }).notNull(),
	textValue: text("text_value"),
	numberValue: numeric("number_value", { precision: 20, scale:  4 }),
	booleanValue: boolean("boolean_value"),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_attribute_values_product_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.attributeId],
			foreignColumns: [attributes.id],
			name: "product_attribute_values_attribute_id_fkey"
		}).onDelete("restrict"),
	primaryKey({ columns: [table.productId, table.attributeId], name: "product_attribute_values_pkey"}),
	check("product_attribute_one_value_ck", sql`num_nonnulls(text_value, number_value, boolean_value) = 1`),
]);
