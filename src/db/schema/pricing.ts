// Drizzle schema module. Table structure is based on Khaji Pakhsh DB V1.1.
import { pgTable, check, bigint, text, boolean, timestamp, unique, index, foreignKey, integer, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { adminUsers } from "./admin";
import { brands, categories, products } from "./catalog";
import { contentItems } from "./content";
import { mediaAssets } from "./media";

export const priceImportBatches = pgTable("price_import_batches", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "price_import_batches_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sourceFileMediaId: bigint("source_file_media_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	createdBy: bigint("created_by", { mode: "number" }).notNull(),
	status: text().default('uploaded').notNull(),
	totalRows: integer("total_rows").default(0).notNull(),
	validRows: integer("valid_rows").default(0).notNull(),
	errorRows: integer("error_rows").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	validatedAt: timestamp("validated_at", { withTimezone: true, mode: 'string' }),
	appliedAt: timestamp("applied_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.sourceFileMediaId],
			foreignColumns: [mediaAssets.id],
			name: "price_import_batches_source_file_media_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [adminUsers.id],
			name: "price_import_batches_created_by_fkey"
		}).onDelete("restrict"),
	check("price_batch_status_ck", sql`status = ANY (ARRAY['uploaded'::text, 'validated'::text, 'applied'::text, 'rejected'::text, 'failed'::text])`),
	check("price_batch_counts_ck", sql`(total_rows >= 0) AND (valid_rows >= 0) AND (error_rows >= 0)`),
]);

export const productPrices = pgTable("product_prices", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	productId: bigint("product_id", { mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	amountToman: bigint("amount_toman", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	updatedBy: bigint("updated_by", { mode: "number" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [adminUsers.id],
			name: "product_prices_updated_by_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_prices_product_id_fkey"
		}).onDelete("restrict"),
	check("product_price_positive_ck", sql`amount_toman > 0`),
]);

export const priceHistory = pgTable("price_history", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "price_history_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	productId: bigint("product_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	oldAmountToman: bigint("old_amount_toman", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	newAmountToman: bigint("new_amount_toman", { mode: "number" }),
	changeSource: text("change_source").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	importBatchId: bigint("import_batch_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	changedBy: bigint("changed_by", { mode: "number" }).notNull(),
	changedAt: timestamp("changed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("price_history_product_time_ix").using("btree", table.productId.asc().nullsLast(), table.changedAt.desc().nullsFirst()),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "price_history_product_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.importBatchId],
			foreignColumns: [priceImportBatches.id],
			name: "price_history_import_batch_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.changedBy],
			foreignColumns: [adminUsers.id],
			name: "price_history_changed_by_fkey"
		}).onDelete("restrict"),
	check("price_history_old_positive_ck", sql`(old_amount_toman IS NULL) OR (old_amount_toman > 0)`),
	check("price_history_new_positive_ck", sql`(new_amount_toman IS NULL) OR (new_amount_toman > 0)`),
	check("price_history_changed_ck", sql`old_amount_toman IS DISTINCT FROM new_amount_toman`),
	check("price_history_source_ck", sql`change_source = ANY (ARRAY['manual'::text, 'excel'::text, 'rollback'::text, 'clear'::text])`),
	check("price_history_batch_source_ck", sql`((change_source = 'excel'::text) AND (import_batch_id IS NOT NULL)) OR ((change_source <> 'excel'::text) AND (import_batch_id IS NULL))`),
]);

export const priceLists = pgTable("price_lists", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "price_lists_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	contentItemId: bigint("content_item_id", { mode: "number" }).notNull(),
	contentType: text("content_type").default('price_list').notNull(),
	title: text().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	categoryId: bigint("category_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	brandId: bigint("brand_id", { mode: "number" }),
	includeDescendants: boolean("include_descendants").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("price_lists_brand_ix").using("btree", table.brandId.asc().nullsLast()),
	index("price_lists_category_ix").using("btree", table.categoryId.asc().nullsLast()),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "price_lists_category_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "price_lists_brand_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.contentItemId, table.contentType],
			foreignColumns: [contentItems.id, contentItems.contentType],
			name: "price_lists_content_item_id_content_type_fkey"
		}).onDelete("restrict"),
	unique("price_lists_content_item_id_key").on(table.contentItemId),
	check("price_lists_content_type_check", sql`content_type = 'price_list'::text`),
	check("price_lists_title_not_blank_ck", sql`length(btrim(title)) > 0`),
]);

export const priceListPublications = pgTable("price_list_publications", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "price_list_publications_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	priceListId: bigint("price_list_id", { mode: "number" }).notNull(),
	versionNumber: integer("version_number").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	generatedBy: bigint("generated_by", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	publishedBy: bigint("published_by", { mode: "number" }).notNull(),
	generatedAt: timestamp("generated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("price_publications_latest_ix").using("btree", table.priceListId.asc().nullsLast(), table.versionNumber.desc().nullsFirst()),
	foreignKey({
			columns: [table.priceListId],
			foreignColumns: [priceLists.id],
			name: "price_list_publications_price_list_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.generatedBy],
			foreignColumns: [adminUsers.id],
			name: "price_list_publications_generated_by_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.publishedBy],
			foreignColumns: [adminUsers.id],
			name: "price_list_publications_published_by_fkey"
		}).onDelete("restrict"),
	unique("price_list_publications_price_list_id_version_number_key").on(table.priceListId, table.versionNumber),
	check("price_list_publications_version_number_check", sql`version_number > 0`),
]);

export const priceImportRows = pgTable("price_import_rows", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	batchId: bigint("batch_id", { mode: "number" }).notNull(),
	rowNumber: integer("row_number").notNull(),
	rawProductCode: text("raw_product_code").default("").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	productId: bigint("product_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	proposedAmountToman: bigint("proposed_amount_toman", { mode: "number" }),
	validationStatus: text("validation_status").default('pending').notNull(),
	errorCode: text("error_code"),
	errorMessage: text("error_message"),
}, (table) => [
	index("price_import_rows_code_ix").using("btree", table.batchId.asc().nullsLast(), table.rawProductCode.asc().nullsLast()),
	index("price_import_rows_product_ix").using("btree", table.productId.asc().nullsLast()),
	foreignKey({
			columns: [table.batchId],
			foreignColumns: [priceImportBatches.id],
			name: "price_import_rows_batch_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "price_import_rows_product_id_fkey"
		}).onDelete("restrict"),
	primaryKey({ columns: [table.batchId, table.rowNumber], name: "price_import_rows_pkey"}),
	check("price_import_row_num_ck", sql`row_number > 0`),
	check("price_import_amount_ck", sql`(proposed_amount_toman IS NULL) OR (proposed_amount_toman > 0)`),
	check("price_import_row_status_ck", sql`validation_status = ANY (ARRAY['pending'::text, 'valid'::text, 'invalid'::text, 'duplicate'::text, 'applied'::text])`),
]);

export const priceListPublicationItems = pgTable("price_list_publication_items", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	publicationId: bigint("publication_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	productId: bigint("product_id", { mode: "number" }).notNull(),
	productCodeSnapshot: text("product_code_snapshot").notNull(),
	productNameSnapshot: text("product_name_snapshot").notNull(),
	productPathSnapshot: text("product_path_snapshot").notNull(),
	brandNameSnapshot: text("brand_name_snapshot"),
	saleUnitSnapshot: text("sale_unit_snapshot").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	amountTomanSnapshot: bigint("amount_toman_snapshot", { mode: "number" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.publicationId],
			foreignColumns: [priceListPublications.id],
			name: "price_list_publication_items_publication_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "price_list_publication_items_product_id_fkey"
		}).onDelete("restrict"),
	primaryKey({ columns: [table.publicationId, table.productId], name: "price_list_publication_items_pkey"}),
	check("price_list_snapshot_amount_ck", sql`amount_toman_snapshot > 0`),
	check("price_list_snapshot_path_ck", sql`"left"(product_path_snapshot, 1) = '/'::text`),
]);
