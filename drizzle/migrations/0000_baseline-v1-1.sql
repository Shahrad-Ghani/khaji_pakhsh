CREATE TABLE "admin_user_roles" (
	"admin_user_id" bigint NOT NULL,
	"role_id" bigint NOT NULL,
	CONSTRAINT "admin_user_roles_pkey" PRIMARY KEY("admin_user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admin_users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_not_blank_ck" CHECK (length(btrim(email)) > 3),
	CONSTRAINT "admin_users_password_hash_not_blank_ck" CHECK (length(password_hash) > 0)
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"actor_type" text DEFAULT 'admin' NOT NULL,
	"actor_user_id" bigint,
	"entity_type" text NOT NULL,
	"entity_id" bigint,
	"action" text NOT NULL,
	"before_data" jsonb,
	"after_data" jsonb,
	"request_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audit_actor_type_ck" CHECK (actor_type = ANY (ARRAY['admin'::text, 'system'::text])),
	CONSTRAINT "audit_actor_consistency_ck" CHECK (((actor_type = 'admin'::text) AND (actor_user_id IS NOT NULL)) OR ((actor_type = 'system'::text) AND (actor_user_id IS NULL))),
	CONSTRAINT "audit_entity_not_blank_ck" CHECK (length(btrim(entity_type)) > 0),
	CONSTRAINT "audit_action_not_blank_ck" CHECK (length(btrim(action)) > 0)
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "permissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"code" text NOT NULL,
	"label_fa" text NOT NULL,
	CONSTRAINT "permissions_code_key" UNIQUE("code"),
	CONSTRAINT "permissions_code_format_ck" CHECK (code ~ '^[a-z][a-z0-9_.]*$'::text)
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" bigint NOT NULL,
	"permission_id" bigint NOT NULL,
	CONSTRAINT "role_permissions_pkey" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "roles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"code" text NOT NULL,
	"label_fa" text NOT NULL,
	CONSTRAINT "roles_code_key" UNIQUE("code"),
	CONSTRAINT "roles_code_format_ck" CHECK (code ~ '^[a-z][a-z0-9_]*$'::text)
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "media_assets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"storage_key" text NOT NULL,
	"original_filename" text,
	"mime_type" text NOT NULL,
	"byte_size" bigint NOT NULL,
	"sha256_hex" char(64),
	"width_px" integer,
	"height_px" integer,
	"default_alt_text" text,
	"uploaded_by" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_storage_key_key" UNIQUE("storage_key"),
	CONSTRAINT "media_storage_key_not_blank_ck" CHECK (length(btrim(storage_key)) > 0),
	CONSTRAINT "media_mime_not_blank_ck" CHECK (length(btrim(mime_type)) > 0),
	CONSTRAINT "media_byte_size_ck" CHECK (byte_size > 0),
	CONSTRAINT "media_width_ck" CHECK ((width_px IS NULL) OR (width_px > 0)),
	CONSTRAINT "media_height_ck" CHECK ((height_px IS NULL) OR (height_px > 0)),
	CONSTRAINT "media_sha_format_ck" CHECK ((sha256_hex IS NULL) OR (sha256_hex ~ '^[0-9a-f]{64}$'::text))
);
--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "content_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"content_type" text NOT NULL,
	"slug" text NOT NULL,
	"canonical_path" text NOT NULL,
	"h1_override" text,
	"seo_title" text,
	"meta_description" text,
	"canonical_url_override" text,
	"robots_index" boolean DEFAULT false NOT NULL,
	"robots_follow" boolean DEFAULT true NOT NULL,
	"og_title" text,
	"og_description" text,
	"og_image_media_id" bigint,
	"og_image_alt_text" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"content_updated_at" timestamp with time zone,
	"removed_http_status" smallint DEFAULT 404 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_items_type_pair_uq" UNIQUE("id","content_type"),
	CONSTRAINT "content_items_type_ck" CHECK (content_type = ANY (ARRAY['page'::text, 'category'::text, 'brand'::text, 'product'::text, 'price_list'::text])),
	CONSTRAINT "content_items_status_ck" CHECK (status = ANY (ARRAY['draft'::text, 'review'::text, 'published'::text, 'unpublished'::text, 'deleted'::text, 'redirected'::text])),
	CONSTRAINT "content_items_slug_not_blank_ck" CHECK ((length(btrim(slug)) > 0) AND (slug = btrim(slug)) AND (POSITION(('/'::text) IN (slug)) = 0) AND (POSITION(('?'::text) IN (slug)) = 0) AND (POSITION(('#'::text) IN (slug)) = 0) AND (POSITION((' '::text) IN (slug)) = 0)),
	CONSTRAINT "content_items_path_ck" CHECK (("left"(canonical_path, 1) = '/'::text) AND (POSITION(('?'::text) IN (canonical_path)) = 0) AND (POSITION(('#'::text) IN (canonical_path)) = 0) AND (POSITION(('//'::text) IN (canonical_path)) = 0)),
	CONSTRAINT "content_items_canonical_override_ck" CHECK ((canonical_url_override IS NULL) OR (canonical_url_override ~* '^https://'::text)),
	CONSTRAINT "content_items_published_date_ck" CHECK ((status <> 'published'::text) OR (published_at IS NOT NULL)),
	CONSTRAINT "content_items_nonpublished_noindex_ck" CHECK ((status = 'published'::text) OR (robots_index = false)),
	CONSTRAINT "content_items_removed_status_ck" CHECK (removed_http_status = ANY (ARRAY[404, 410]))
);
--> statement-breakpoint
CREATE TABLE "attributes" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "attributes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"code" text NOT NULL,
	"label_fa" text NOT NULL,
	"data_type" text NOT NULL,
	"unit_label" text,
	CONSTRAINT "attributes_code_key" UNIQUE("code"),
	CONSTRAINT "attributes_code_ck" CHECK (code ~ '^[a-z][a-z0-9_]*$'::text),
	CONSTRAINT "attributes_type_ck" CHECK (data_type = ANY (ARRAY['text'::text, 'number'::text, 'boolean'::text]))
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "brands_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"content_item_id" bigint NOT NULL,
	"content_type" text DEFAULT 'brand' NOT NULL,
	"name_fa" text NOT NULL,
	"name_en" text,
	"logo_media_id" bigint,
	"logo_alt_text" text DEFAULT '' NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brands_content_item_id_key" UNIQUE("content_item_id"),
	CONSTRAINT "brands_content_type_check" CHECK (content_type = 'brand'::text),
	CONSTRAINT "brands_name_not_blank_ck" CHECK (length(btrim(name_fa)) > 0)
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"content_item_id" bigint NOT NULL,
	"content_type" text DEFAULT 'category' NOT NULL,
	"parent_id" bigint,
	"title" text NOT NULL,
	"description" text,
	"hero_media_id" bigint,
	"hero_alt_text" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_content_item_id_key" UNIQUE("content_item_id"),
	CONSTRAINT "categories_content_type_check" CHECK (content_type = 'category'::text),
	CONSTRAINT "categories_title_not_blank_ck" CHECK (length(btrim(title)) > 0),
	CONSTRAINT "categories_parent_self_ck" CHECK ((parent_id IS NULL) OR (parent_id <> id))
);
--> statement-breakpoint
CREATE TABLE "category_attributes" (
	"category_id" bigint NOT NULL,
	"attribute_id" bigint NOT NULL,
	"is_required_for_publication" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "category_attributes_pkey" PRIMARY KEY("category_id","attribute_id")
);
--> statement-breakpoint
CREATE TABLE "product_attribute_values" (
	"product_id" bigint NOT NULL,
	"attribute_id" bigint NOT NULL,
	"text_value" text,
	"number_value" numeric(20, 4),
	"boolean_value" boolean,
	CONSTRAINT "product_attribute_values_pkey" PRIMARY KEY("product_id","attribute_id"),
	CONSTRAINT "product_attribute_one_value_ck" CHECK (num_nonnulls(text_value, number_value, boolean_value) = 1)
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"product_id" bigint NOT NULL,
	"category_id" bigint NOT NULL,
	CONSTRAINT "product_categories_pkey" PRIMARY KEY("product_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_media_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"product_id" bigint NOT NULL,
	"media_id" bigint NOT NULL,
	"alt_text" text DEFAULT '' NOT NULL,
	"is_decorative" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "product_media_decorative_alt_ck" CHECK ((NOT is_decorative) OR (alt_text = ''::text))
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"content_item_id" bigint NOT NULL,
	"content_type" text DEFAULT 'product' NOT NULL,
	"product_code" text GENERATED ALWAYS AS (('KHJ-'::text || (id)::text)) STORED,
	"name" text NOT NULL,
	"brand_id" bigint,
	"primary_category_id" bigint NOT NULL,
	"sale_unit" text DEFAULT 'عدد' NOT NULL,
	"short_description" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_content_item_id_key" UNIQUE("content_item_id"),
	CONSTRAINT "products_product_code_key" UNIQUE("product_code"),
	CONSTRAINT "products_content_type_check" CHECK (content_type = 'product'::text),
	CONSTRAINT "products_name_not_blank_ck" CHECK (length(btrim(name)) > 0),
	CONSTRAINT "products_sale_unit_not_blank_ck" CHECK (length(btrim(sale_unit)) > 0)
);
--> statement-breakpoint
CREATE TABLE "navigation_items" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "navigation_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"menu_id" bigint NOT NULL,
	"parent_item_id" bigint,
	"label" text NOT NULL,
	"target_content_item_id" bigint,
	"external_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	CONSTRAINT "navigation_items_menu_id_id_key" UNIQUE("id","menu_id"),
	CONSTRAINT "nav_item_target_one_ck" CHECK (num_nonnulls(target_content_item_id, external_url) = 1),
	CONSTRAINT "nav_item_external_https_ck" CHECK ((external_url IS NULL) OR (external_url ~* '^https://'::text)),
	CONSTRAINT "nav_item_not_own_parent_ck" CHECK ((parent_item_id IS NULL) OR (parent_item_id <> id)),
	CONSTRAINT "nav_item_label_not_blank_ck" CHECK (length(btrim(label)) > 0)
);
--> statement-breakpoint
CREATE TABLE "navigation_menus" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "navigation_menus_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"code" text NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "navigation_menus_code_key" UNIQUE("code"),
	CONSTRAINT "nav_menu_code_ck" CHECK (code ~ '^[a-z][a-z0-9_]*$'::text)
);
--> statement-breakpoint
CREATE TABLE "page_revision_media" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "page_revision_media_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"revision_id" bigint NOT NULL,
	"block_key" text NOT NULL,
	"media_id" bigint NOT NULL,
	"alt_text" text DEFAULT '' NOT NULL,
	"is_decorative" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "page_revision_media_block_key_ck" CHECK (length(btrim(block_key)) > 0),
	CONSTRAINT "page_revision_media_decorative_alt_ck" CHECK ((NOT is_decorative) OR (alt_text = ''::text))
);
--> statement-breakpoint
CREATE TABLE "page_revisions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "page_revisions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"page_content_item_id" bigint NOT NULL,
	"revision_number" integer NOT NULL,
	"title" text NOT NULL,
	"h1_override" text,
	"blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"seo_title" text,
	"meta_description" text,
	"canonical_url_override" text,
	"robots_index" boolean DEFAULT false NOT NULL,
	"robots_follow" boolean DEFAULT true NOT NULL,
	"og_title" text,
	"og_description" text,
	"og_image_media_id" bigint,
	"og_image_alt_text" text,
	"revision_status" text DEFAULT 'draft' NOT NULL,
	"created_by" bigint NOT NULL,
	"reviewed_by" bigint,
	"published_by" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "page_revisions_page_content_item_id_revision_number_key" UNIQUE("page_content_item_id","revision_number"),
	CONSTRAINT "page_revision_json_array_ck" CHECK (jsonb_typeof(blocks) = 'array'::text),
	CONSTRAINT "page_revision_status_ck" CHECK (revision_status = ANY (ARRAY['draft'::text, 'review'::text, 'published'::text, 'archived'::text])),
	CONSTRAINT "page_revision_published_date_ck" CHECK ((revision_status <> 'published'::text) OR (published_at IS NOT NULL)),
	CONSTRAINT "page_revision_canonical_ck" CHECK ((canonical_url_override IS NULL) OR (canonical_url_override ~* '^https://'::text))
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"content_item_id" bigint PRIMARY KEY NOT NULL,
	"content_type" text DEFAULT 'page' NOT NULL,
	"page_type" text DEFAULT 'static' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pages_content_type_check" CHECK (content_type = 'page'::text),
	CONSTRAINT "pages_type_ck" CHECK (page_type = ANY (ARRAY['home'::text, 'static'::text, 'landing'::text]))
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "price_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"product_id" bigint NOT NULL,
	"old_amount_toman" bigint,
	"new_amount_toman" bigint,
	"change_source" text NOT NULL,
	"import_batch_id" bigint,
	"changed_by" bigint NOT NULL,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "price_history_old_positive_ck" CHECK ((old_amount_toman IS NULL) OR (old_amount_toman > 0)),
	CONSTRAINT "price_history_new_positive_ck" CHECK ((new_amount_toman IS NULL) OR (new_amount_toman > 0)),
	CONSTRAINT "price_history_changed_ck" CHECK (old_amount_toman IS DISTINCT FROM new_amount_toman),
	CONSTRAINT "price_history_source_ck" CHECK (change_source = ANY (ARRAY['manual'::text, 'excel'::text, 'rollback'::text, 'clear'::text])),
	CONSTRAINT "price_history_batch_source_ck" CHECK (((change_source = 'excel'::text) AND (import_batch_id IS NOT NULL)) OR ((change_source <> 'excel'::text) AND (import_batch_id IS NULL)))
);
--> statement-breakpoint
CREATE TABLE "price_import_batches" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "price_import_batches_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"source_file_media_id" bigint,
	"created_by" bigint NOT NULL,
	"status" text DEFAULT 'uploaded' NOT NULL,
	"total_rows" integer DEFAULT 0 NOT NULL,
	"valid_rows" integer DEFAULT 0 NOT NULL,
	"error_rows" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"validated_at" timestamp with time zone,
	"applied_at" timestamp with time zone,
	CONSTRAINT "price_batch_status_ck" CHECK (status = ANY (ARRAY['uploaded'::text, 'validated'::text, 'applied'::text, 'rejected'::text, 'failed'::text])),
	CONSTRAINT "price_batch_counts_ck" CHECK ((total_rows >= 0) AND (valid_rows >= 0) AND (error_rows >= 0))
);
--> statement-breakpoint
CREATE TABLE "price_import_rows" (
	"batch_id" bigint NOT NULL,
	"row_number" integer NOT NULL,
	"raw_product_code" text DEFAULT '' NOT NULL,
	"product_id" bigint,
	"proposed_amount_toman" bigint,
	"validation_status" text DEFAULT 'pending' NOT NULL,
	"error_code" text,
	"error_message" text,
	CONSTRAINT "price_import_rows_pkey" PRIMARY KEY("batch_id","row_number"),
	CONSTRAINT "price_import_row_num_ck" CHECK (row_number > 0),
	CONSTRAINT "price_import_amount_ck" CHECK ((proposed_amount_toman IS NULL) OR (proposed_amount_toman > 0)),
	CONSTRAINT "price_import_row_status_ck" CHECK (validation_status = ANY (ARRAY['pending'::text, 'valid'::text, 'invalid'::text, 'duplicate'::text, 'applied'::text]))
);
--> statement-breakpoint
CREATE TABLE "price_list_publication_items" (
	"publication_id" bigint NOT NULL,
	"product_id" bigint NOT NULL,
	"product_code_snapshot" text NOT NULL,
	"product_name_snapshot" text NOT NULL,
	"product_path_snapshot" text NOT NULL,
	"brand_name_snapshot" text,
	"sale_unit_snapshot" text NOT NULL,
	"amount_toman_snapshot" bigint NOT NULL,
	CONSTRAINT "price_list_publication_items_pkey" PRIMARY KEY("publication_id","product_id"),
	CONSTRAINT "price_list_snapshot_amount_ck" CHECK (amount_toman_snapshot > 0),
	CONSTRAINT "price_list_snapshot_path_ck" CHECK ("left"(product_path_snapshot, 1) = '/'::text)
);
--> statement-breakpoint
CREATE TABLE "price_list_publications" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "price_list_publications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"price_list_id" bigint NOT NULL,
	"version_number" integer NOT NULL,
	"generated_by" bigint NOT NULL,
	"published_by" bigint NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "price_list_publications_price_list_id_version_number_key" UNIQUE("price_list_id","version_number"),
	CONSTRAINT "price_list_publications_version_number_check" CHECK (version_number > 0)
);
--> statement-breakpoint
CREATE TABLE "price_lists" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "price_lists_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"content_item_id" bigint NOT NULL,
	"content_type" text DEFAULT 'price_list' NOT NULL,
	"title" text NOT NULL,
	"category_id" bigint,
	"brand_id" bigint,
	"include_descendants" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "price_lists_content_item_id_key" UNIQUE("content_item_id"),
	CONSTRAINT "price_lists_content_type_check" CHECK (content_type = 'price_list'::text),
	CONSTRAINT "price_lists_title_not_blank_ck" CHECK (length(btrim(title)) > 0)
);
--> statement-breakpoint
CREATE TABLE "product_prices" (
	"product_id" bigint PRIMARY KEY NOT NULL,
	"amount_toman" bigint NOT NULL,
	"updated_by" bigint,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_price_positive_ck" CHECK (amount_toman > 0)
);
--> statement-breakpoint
CREATE TABLE "seo_redirects" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "seo_redirects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"source_path" text NOT NULL,
	"target_path" text NOT NULL,
	"status_code" smallint DEFAULT 301 NOT NULL,
	"reason" text,
	"created_by" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "seo_redirect_source_path_ck" CHECK (("left"(source_path, 1) = '/'::text) AND (POSITION(('?'::text) IN (source_path)) = 0) AND (POSITION(('#'::text) IN (source_path)) = 0)),
	CONSTRAINT "seo_redirect_target_path_ck" CHECK (("left"(target_path, 1) = '/'::text) AND (POSITION(('?'::text) IN (target_path)) = 0) AND (POSITION(('#'::text) IN (target_path)) = 0)),
	CONSTRAINT "seo_redirect_no_self_ck" CHECK (source_path <> target_path),
	CONSTRAINT "seo_redirect_code_ck" CHECK (status_code = ANY (ARRAY[301, 308]))
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"setting_key" text PRIMARY KEY NOT NULL,
	"setting_value" jsonb NOT NULL,
	"updated_by" bigint,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_key_ck" CHECK (setting_key ~ '^[a-z][a-z0-9_.]*$'::text)
);
--> statement-breakpoint
ALTER TABLE "admin_user_roles" ADD CONSTRAINT "admin_user_roles_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_user_roles" ADD CONSTRAINT "admin_user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_og_image_media_id_fkey" FOREIGN KEY ("og_image_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_media_id_fkey" FOREIGN KEY ("logo_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_content_item_id_content_type_fkey" FOREIGN KEY ("content_item_id","content_type") REFERENCES "public"."content_items"("id","content_type") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_hero_media_id_fkey" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_content_item_id_content_type_fkey" FOREIGN KEY ("content_item_id","content_type") REFERENCES "public"."content_items"("id","content_type") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_primary_category_id_fkey" FOREIGN KEY ("primary_category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_content_item_id_content_type_fkey" FOREIGN KEY ("content_item_id","content_type") REFERENCES "public"."content_items"("id","content_type") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "public"."navigation_menus"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_target_content_item_id_fkey" FOREIGN KEY ("target_content_item_id") REFERENCES "public"."content_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_menu_id_parent_item_id_fkey" FOREIGN KEY ("menu_id","parent_item_id") REFERENCES "public"."navigation_items"("id","menu_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_revision_media" ADD CONSTRAINT "page_revision_media_revision_id_fkey" FOREIGN KEY ("revision_id") REFERENCES "public"."page_revisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_revision_media" ADD CONSTRAINT "page_revision_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_revisions" ADD CONSTRAINT "page_revisions_page_content_item_id_fkey" FOREIGN KEY ("page_content_item_id") REFERENCES "public"."pages"("content_item_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_revisions" ADD CONSTRAINT "page_revisions_og_image_media_id_fkey" FOREIGN KEY ("og_image_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_revisions" ADD CONSTRAINT "page_revisions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_revisions" ADD CONSTRAINT "page_revisions_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_revisions" ADD CONSTRAINT "page_revisions_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_content_item_id_content_type_fkey" FOREIGN KEY ("content_item_id","content_type") REFERENCES "public"."content_items"("id","content_type") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "public"."price_import_batches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_import_batches" ADD CONSTRAINT "price_import_batches_source_file_media_id_fkey" FOREIGN KEY ("source_file_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_import_batches" ADD CONSTRAINT "price_import_batches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_import_rows" ADD CONSTRAINT "price_import_rows_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."price_import_batches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_import_rows" ADD CONSTRAINT "price_import_rows_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_list_publication_items" ADD CONSTRAINT "price_list_publication_items_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "public"."price_list_publications"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_list_publication_items" ADD CONSTRAINT "price_list_publication_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_list_publications" ADD CONSTRAINT "price_list_publications_price_list_id_fkey" FOREIGN KEY ("price_list_id") REFERENCES "public"."price_lists"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_list_publications" ADD CONSTRAINT "price_list_publications_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_list_publications" ADD CONSTRAINT "price_list_publications_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_lists" ADD CONSTRAINT "price_lists_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_lists" ADD CONSTRAINT "price_lists_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_lists" ADD CONSTRAINT "price_lists_content_item_id_content_type_fkey" FOREIGN KEY ("content_item_id","content_type") REFERENCES "public"."content_items"("id","content_type") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_redirects" ADD CONSTRAINT "seo_redirects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_ci_uq" ON "admin_users" USING btree (lower(email));--> statement-breakpoint
CREATE INDEX "audit_actor_time_ix" ON "audit_logs" USING btree ("actor_user_id","created_at" DESC NULLS FIRST);--> statement-breakpoint
CREATE INDEX "audit_entity_time_ix" ON "audit_logs" USING btree ("entity_type","entity_id","created_at" DESC NULLS FIRST);--> statement-breakpoint
CREATE INDEX "media_assets_sha_ix" ON "media_assets" USING btree ("sha256_hex") WHERE (sha256_hex IS NOT NULL);--> statement-breakpoint
CREATE UNIQUE INDEX "content_items_path_ci_uq" ON "content_items" USING btree (lower(canonical_path));--> statement-breakpoint
CREATE INDEX "content_items_sitemap_ix" ON "content_items" USING btree ("status","robots_index","content_updated_at") WHERE ((status = 'published'::text) AND (robots_index = true));--> statement-breakpoint
CREATE INDEX "content_items_type_status_ix" ON "content_items" USING btree ("content_type","status");--> statement-breakpoint
CREATE INDEX "brands_sort_ix" ON "brands" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "categories_parent_ix" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "categories_sort_ix" ON "categories" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "product_categories_category_ix" ON "product_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "product_media_media_ix" ON "product_media" USING btree ("media_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_media_one_primary_ix" ON "product_media" USING btree ("product_id") WHERE (is_primary = true);--> statement-breakpoint
CREATE INDEX "products_brand_ix" ON "products" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "products_primary_category_ix" ON "products" USING btree ("primary_category_id");--> statement-breakpoint
CREATE INDEX "nav_items_order_ix" ON "navigation_items" USING btree ("menu_id","parent_item_id","sort_order");--> statement-breakpoint
CREATE INDEX "page_revision_media_revision_ix" ON "page_revision_media" USING btree ("revision_id","block_key","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "page_one_published_revision_ix" ON "page_revisions" USING btree ("page_content_item_id") WHERE (revision_status = 'published'::text);--> statement-breakpoint
CREATE INDEX "page_revisions_history_ix" ON "page_revisions" USING btree ("page_content_item_id","revision_number" DESC NULLS FIRST);--> statement-breakpoint
CREATE UNIQUE INDEX "pages_one_home_ix" ON "pages" USING btree ("page_type") WHERE (page_type = 'home'::text);--> statement-breakpoint
CREATE INDEX "price_history_product_time_ix" ON "price_history" USING btree ("product_id","changed_at" DESC NULLS FIRST);--> statement-breakpoint
CREATE INDEX "price_import_rows_code_ix" ON "price_import_rows" USING btree ("batch_id","raw_product_code");--> statement-breakpoint
CREATE INDEX "price_import_rows_product_ix" ON "price_import_rows" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "price_publications_latest_ix" ON "price_list_publications" USING btree ("price_list_id","version_number" DESC NULLS FIRST);--> statement-breakpoint
CREATE INDEX "price_lists_brand_ix" ON "price_lists" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "price_lists_category_ix" ON "price_lists" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "seo_redirects_source_ci_uq" ON "seo_redirects" USING btree (lower(source_path));