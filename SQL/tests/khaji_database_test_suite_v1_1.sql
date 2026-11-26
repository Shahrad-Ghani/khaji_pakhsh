-- KHAJI PAKHSH DATABASE TEST SUITE v1.1
-- For PostgreSQL 15+; intended for the isolated khaji_test database only.
-- Run with psql -v ON_ERROR_STOP=1 -f this_file.sql
-- All test records are wrapped in one transaction and rolled back at the end.
-- PostgreSQL identity sequences may advance despite ROLLBACK; this is normal.

\set ON_ERROR_STOP on
\echo '============================================================'
\echo 'KHAJI PAKHSH DATABASE TEST SUITE v1.1'
\echo 'Database schema: already installed; test data will be rolled back.'
\echo '============================================================'

BEGIN;

DO $khaji_test$
DECLARE
    v_count BIGINT;
    v_admin_id BIGINT;
    v_role_id BIGINT;
    v_permission_id BIGINT;
    v_media_id BIGINT;
    v_category_content_id BIGINT;
    v_category_id BIGINT;
    v_child_category_content_id BIGINT;
    v_child_category_id BIGINT;
    v_brand_content_id BIGINT;
    v_brand_id BIGINT;
    v_product_content_id BIGINT;
    v_product_id BIGINT;
    v_page_content_id BIGINT;
    v_page_revision_id BIGINT;
    v_second_page_content_id BIGINT;
    v_price_list_content_id BIGINT;
    v_price_list_id BIGINT;
    v_publication_id BIGINT;
    v_batch_id BIGINT;
    v_menu_id BIGINT;
    v_second_menu_id BIGINT;
    v_nav_item_id BIGINT;
    v_attribute_id BIGINT;
    v_redirect_id BIGINT;
    v_rejected BOOLEAN;
    v_actual_code TEXT;
BEGIN
    RAISE NOTICE 'GROUP 0: schema inventory';
    SELECT count(*) INTO v_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    IF v_count <> 30 THEN
        RAISE EXCEPTION 'Expected 30 public tables, found %', v_count;
    END IF;
    RAISE NOTICE '[PASS] Exactly 30 public tables exist';

    SELECT count(*) INTO v_count FROM roles;
    IF v_count <> 5 THEN RAISE EXCEPTION 'Expected 5 seeded roles, found %', v_count; END IF;
    SELECT count(*) INTO v_count FROM permissions;
    IF v_count <> 23 THEN RAISE EXCEPTION 'Expected 23 seeded permissions, found %', v_count; END IF;
    SELECT count(*) INTO v_count
    FROM role_permissions rp
    JOIN roles r ON r.id = rp.role_id
    WHERE r.code = 'super_admin';
    IF v_count <> 23 THEN RAISE EXCEPTION 'super_admin should have 23 permissions, found %', v_count; END IF;
    RAISE NOTICE '[PASS] Seeded roles, permissions, and super_admin grants';

    RAISE NOTICE 'GROUP 1: admin users and RBAC';
    INSERT INTO admin_users (email, password_hash, display_name)
    VALUES ('dbtest-v11@example.invalid', 'TEST_HASH_NOT_A_REAL_PASSWORD', 'کاربر آزمایشی')
    RETURNING id INTO v_admin_id;

    SELECT id INTO v_role_id FROM roles WHERE code = 'super_admin';
    SELECT id INTO v_permission_id FROM permissions WHERE code = 'dashboard.read';
    INSERT INTO admin_user_roles (admin_user_id, role_id) VALUES (v_admin_id, v_role_id);

    v_rejected := FALSE;
    BEGIN
        INSERT INTO admin_users (email, password_hash, display_name)
        VALUES ('DBTEST-V11@EXAMPLE.INVALID', 'TEST_HASH', 'Duplicate email test');
    EXCEPTION WHEN unique_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Case-insensitive duplicate admin email was accepted'; END IF;
    RAISE NOTICE '[PASS] Admin creation, role assignment, case-insensitive email uniqueness';

    RAISE NOTICE 'GROUP 2: media validation';
    INSERT INTO media_assets (
        storage_key, original_filename, mime_type, byte_size, sha256_hex,
        width_px, height_px, default_alt_text, uploaded_by
    ) VALUES (
        '__dbtest_v11__/test-image.webp', 'test-image.webp', 'image/webp', 2048,
        repeat('a', 64), 800, 600, 'تصویر آزمایشی', v_admin_id
    ) RETURNING id INTO v_media_id;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO media_assets (storage_key, mime_type, byte_size, sha256_hex)
        VALUES ('__dbtest_v11__/bad-hash.webp', 'image/webp', 100, 'not-a-sha256');
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Invalid media SHA-256 was accepted'; END IF;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO media_assets (storage_key, mime_type, byte_size)
        VALUES ('__dbtest_v11__/zero-size.webp', 'image/webp', 0);
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Zero-byte media asset was accepted'; END IF;
    RAISE NOTICE '[PASS] Media metadata, checksum format, and positive file size';

    RAISE NOTICE 'GROUP 3: SEO content identity and URL rules';
    INSERT INTO content_items (
        content_type, slug, canonical_path, status, robots_index,
        seo_title, meta_description, h1_override, og_image_media_id, og_image_alt_text
    ) VALUES (
        'category', '__dbtest_v11_category', '/__dbtest_v11/category', 'draft', FALSE,
        'SEO test category', 'SEO description test', 'H1 test', v_media_id, 'تصویر دسته آزمایشی'
    ) RETURNING id INTO v_category_content_id;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO content_items (content_type, slug, canonical_path)
        VALUES ('page', '__dbtest_v11_duplicate_path', '/__DBTEST_V11/CATEGORY');
    EXCEPTION WHEN unique_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Case-insensitive duplicate canonical path was accepted'; END IF;
    RAISE NOTICE '[PASS] Global case-insensitive canonical path uniqueness';

    v_rejected := FALSE;
    BEGIN
        INSERT INTO content_items (content_type, slug, canonical_path)
        VALUES ('page', '__dbtest_v11_bad slug', '/__dbtest_v11/bad-slug');
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Slug containing spaces was accepted'; END IF;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO content_items (content_type, slug, canonical_path, canonical_url_override)
        VALUES ('page', '__dbtest_v11_http_canonical', '/__dbtest_v11/http-canonical', 'http://example.com/page');
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Non-HTTPS canonical override was accepted'; END IF;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO content_items (content_type, slug, canonical_path, status, robots_index)
        VALUES ('page', '__dbtest_v11_draft_index', '/__dbtest_v11/draft-index', 'draft', TRUE);
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Draft content with robots_index=true was accepted'; END IF;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO content_items (content_type, slug, canonical_path, status, robots_index)
        VALUES ('page', '__dbtest_v11_published_without_date', '/__dbtest_v11/published-no-date', 'published', TRUE);
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Published content without published_at was accepted'; END IF;

    INSERT INTO content_items (content_type, slug, canonical_path, status, robots_index, published_at, content_updated_at)
    VALUES ('brand', '__dbtest_v11_brand', '/__dbtest_v11/brand', 'published', TRUE, now(), now())
    RETURNING id INTO v_brand_content_id;
    RAISE NOTICE '[PASS] Slug, canonical HTTPS, draft/noindex, and publication-date constraints';

    RAISE NOTICE 'GROUP 4: categories, brands, products, and generated product code';
    INSERT INTO categories (content_item_id, title, hero_media_id, hero_alt_text)
    VALUES (v_category_content_id, 'دسته آزمایشی', v_media_id, 'تصویر دسته آزمایشی')
    RETURNING id INTO v_category_id;

    INSERT INTO content_items (content_type, slug, canonical_path)
    VALUES ('category', '__dbtest_v11_child_category', '/__dbtest_v11/child-category')
    RETURNING id INTO v_child_category_content_id;
    INSERT INTO categories (content_item_id, parent_id, title)
    VALUES (v_child_category_content_id, v_category_id, 'زیردسته آزمایشی')
    RETURNING id INTO v_child_category_id;

    v_rejected := FALSE;
    BEGIN
        UPDATE categories SET parent_id = id WHERE id = v_category_id;
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Category self-parenting was accepted'; END IF;

    INSERT INTO brands (content_item_id, name_fa, logo_media_id, logo_alt_text)
    VALUES (v_brand_content_id, 'برند آزمایشی', v_media_id, 'لوگوی برند آزمایشی')
    RETURNING id INTO v_brand_id;

    INSERT INTO content_items (content_type, slug, canonical_path)
    VALUES ('product', '__dbtest_v11_product', '/__dbtest_v11/product')
    RETURNING id INTO v_product_content_id;
    INSERT INTO products (content_item_id, name, brand_id, primary_category_id, sale_unit)
    VALUES (v_product_content_id, 'محصول آزمایشی', v_brand_id, v_category_id, 'عدد')
    RETURNING id, product_code INTO v_product_id, v_actual_code;

    IF v_actual_code <> 'KHJ-' || v_product_id::text THEN
        RAISE EXCEPTION 'Generated product_code mismatch: id %, code %', v_product_id, v_actual_code;
    END IF;

    v_rejected := FALSE;
    BEGIN
        UPDATE products SET product_code = 'KHJ-999999' WHERE id = v_product_id;
    EXCEPTION WHEN SQLSTATE '428C9' THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Generated product_code was directly updateable'; END IF;

    INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_child_category_id);
    v_rejected := FALSE;
    BEGIN
        INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_child_category_id);
    EXCEPTION WHEN unique_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Duplicate product-category relation was accepted'; END IF;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO products (content_item_id, name, primary_category_id)
        VALUES (v_category_content_id, 'Wrong content type product', v_category_id);
    EXCEPTION WHEN foreign_key_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Product referencing category content identity was accepted'; END IF;
    RAISE NOTICE '[PASS] Category hierarchy, brand/product links, product-category uniqueness';
    RAISE NOTICE '[PASS] Product code generated as % and protected from direct update', v_actual_code;

    RAISE NOTICE 'GROUP 5: technical attributes and image placement alt';
    INSERT INTO attributes (code, label_fa, data_type, unit_label)
    VALUES ('dbtest_v11_voltage', 'ولتاژ آزمایشی', 'number', 'ولت')
    RETURNING id INTO v_attribute_id;
    INSERT INTO category_attributes (category_id, attribute_id, is_required_for_publication)
    VALUES (v_category_id, v_attribute_id, TRUE);
    INSERT INTO product_attribute_values (product_id, attribute_id, number_value)
    VALUES (v_product_id, v_attribute_id, 220);

    v_rejected := FALSE;
    BEGIN
        INSERT INTO product_attribute_values (product_id, attribute_id, text_value, number_value)
        VALUES (v_product_id, v_attribute_id, '220', 220);
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Multiple attribute value columns were accepted'; END IF;

    INSERT INTO product_media (product_id, media_id, alt_text, is_primary)
    VALUES (v_product_id, v_media_id, 'تصویر محصول آزمایشی', TRUE);

    v_rejected := FALSE;
    BEGIN
        INSERT INTO product_media (product_id, media_id, alt_text, is_decorative)
        VALUES (v_product_id, v_media_id, 'alt نباید برای تصویر تزئینی باشد', TRUE);
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Decorative product image with non-empty alt was accepted'; END IF;
    RAISE NOTICE '[PASS] Typed product attributes and placement-specific image alt rules';

    RAISE NOTICE 'GROUP 6: prices, imports, and immutable price history';
    v_rejected := FALSE;
    BEGIN
        INSERT INTO product_prices (product_id, amount_toman, updated_by)
        VALUES (v_product_id, -100, v_admin_id);
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Negative price was accepted'; END IF;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO product_prices (product_id, amount_toman, updated_by)
        VALUES (v_product_id, 0, v_admin_id);
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Zero price was accepted'; END IF;

    INSERT INTO product_prices (product_id, amount_toman, updated_by)
    VALUES (v_product_id, 150000, v_admin_id);

    v_rejected := FALSE;
    BEGIN
        INSERT INTO product_prices (product_id, amount_toman, updated_by)
        VALUES (v_product_id, 200000, v_admin_id);
    EXCEPTION WHEN unique_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Second current price for same product was accepted'; END IF;

    INSERT INTO price_import_batches (created_by, status, total_rows, valid_rows, error_rows)
    VALUES (v_admin_id, 'validated', 1, 1, 0)
    RETURNING id INTO v_batch_id;
    INSERT INTO price_import_rows (
        batch_id, row_number, raw_product_code, product_id,
        proposed_amount_toman, validation_status
    ) VALUES (
        v_batch_id, 1, v_actual_code, v_product_id, 160000, 'valid'
    );

    v_rejected := FALSE;
    BEGIN
        INSERT INTO price_import_rows (batch_id, row_number, raw_product_code)
        VALUES (v_batch_id, 1, v_actual_code);
    EXCEPTION WHEN unique_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Duplicate Excel row number in one batch was accepted'; END IF;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO price_import_rows (batch_id, row_number, raw_product_code, proposed_amount_toman)
        VALUES (v_batch_id, 2, v_actual_code, -1);
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Negative proposed Excel price was accepted'; END IF;

    INSERT INTO price_history (
        product_id, old_amount_toman, new_amount_toman,
        change_source, changed_by
    ) VALUES (v_product_id, NULL, 150000, 'manual', v_admin_id);

    INSERT INTO price_history (
        product_id, old_amount_toman, new_amount_toman,
        change_source, import_batch_id, changed_by
    ) VALUES (v_product_id, 150000, 160000, 'excel', v_batch_id, v_admin_id);

    v_rejected := FALSE;
    BEGIN
        UPDATE price_history SET new_amount_toman = 170000 WHERE product_id = v_product_id;
    EXCEPTION WHEN raise_exception THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Price history UPDATE was not blocked'; END IF;

    v_rejected := FALSE;
    BEGIN
        DELETE FROM price_history WHERE product_id = v_product_id;
    EXCEPTION WHEN raise_exception THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Price history DELETE was not blocked'; END IF;
    RAISE NOTICE '[PASS] Positive single current price and Excel staging constraints';
    RAISE NOTICE '[PASS] Price history insert rules and append-only protection';

    RAISE NOTICE 'GROUP 7: price-list publications and immutable snapshots';
    INSERT INTO content_items (content_type, slug, canonical_path)
    VALUES ('price_list', '__dbtest_v11_price_list', '/__dbtest_v11/price-list')
    RETURNING id INTO v_price_list_content_id;
    INSERT INTO price_lists (content_item_id, title, category_id, brand_id)
    VALUES (v_price_list_content_id, 'لیست قیمت آزمایشی', v_category_id, v_brand_id)
    RETURNING id INTO v_price_list_id;
    INSERT INTO price_list_publications (
        price_list_id, version_number, generated_by, published_by
    ) VALUES (v_price_list_id, 1, v_admin_id, v_admin_id)
    RETURNING id INTO v_publication_id;
    INSERT INTO price_list_publication_items (
        publication_id, product_id, product_code_snapshot,
        product_name_snapshot, product_path_snapshot,
        brand_name_snapshot, sale_unit_snapshot, amount_toman_snapshot
    ) VALUES (
        v_publication_id, v_product_id, v_actual_code,
        'محصول آزمایشی', '/__dbtest_v11/product', 'برند آزمایشی', 'عدد', 150000
    );

    v_rejected := FALSE;
    BEGIN
        UPDATE price_list_publications SET version_number = 2 WHERE id = v_publication_id;
    EXCEPTION WHEN raise_exception THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Published price-list version was updateable'; END IF;

    v_rejected := FALSE;
    BEGIN
        DELETE FROM price_list_publication_items WHERE publication_id = v_publication_id;
    EXCEPTION WHEN raise_exception THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Published price-list snapshot item was deletable'; END IF;
    RAISE NOTICE '[PASS] Price-list publication and immutable snapshot rules';

    RAISE NOTICE 'GROUP 8: pages, revisions, and page-builder JSONB';
    INSERT INTO content_items (
        content_type, slug, canonical_path, status, robots_index, published_at, content_updated_at
    ) VALUES (
        'page', '__dbtest_v11_home', '/__dbtest_v11/home', 'published', TRUE, now(), now()
    ) RETURNING id INTO v_page_content_id;
    INSERT INTO pages (content_item_id, page_type) VALUES (v_page_content_id, 'home');
    INSERT INTO page_revisions (
        page_content_item_id, revision_number, title, blocks,
        revision_status, created_by, published_by, published_at
    ) VALUES (
        v_page_content_id, 1, 'صفحه آزمایشی', '[{"type":"hero","title":"تست"}]'::jsonb,
        'published', v_admin_id, v_admin_id, now()
    ) RETURNING id INTO v_page_revision_id;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO page_revisions (
            page_content_item_id, revision_number, title, blocks, created_by
        ) VALUES (
            v_page_content_id, 2, 'JSON object not array', '{"type":"hero"}'::jsonb, v_admin_id
        );
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Page builder accepted a JSON object instead of a JSON array'; END IF;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO page_revisions (
            page_content_item_id, revision_number, title, blocks,
            revision_status, created_by, published_by, published_at
        ) VALUES (
            v_page_content_id, 2, 'Second published revision', '[]'::jsonb,
            'published', v_admin_id, v_admin_id, now()
        );
    EXCEPTION WHEN unique_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Two published revisions for one page were accepted'; END IF;

    INSERT INTO page_revision_media (
        revision_id, block_key, media_id, alt_text, is_decorative
    ) VALUES (v_page_revision_id, 'hero-image', v_media_id, 'تصویر هیرو آزمایشی', FALSE);

    v_rejected := FALSE;
    BEGIN
        INSERT INTO page_revision_media (
            revision_id, block_key, media_id, alt_text, is_decorative
        ) VALUES (v_page_revision_id, 'decorative-image', v_media_id, 'alt برای تزئینی', TRUE);
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Decorative page image with non-empty alt was accepted'; END IF;

    INSERT INTO content_items (content_type, slug, canonical_path)
    VALUES ('page', '__dbtest_v11_second_home', '/__dbtest_v11/second-home')
    RETURNING id INTO v_second_page_content_id;
    v_rejected := FALSE;
    BEGIN
        INSERT INTO pages (content_item_id, page_type) VALUES (v_second_page_content_id, 'home');
    EXCEPTION WHEN unique_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'More than one home page was accepted'; END IF;
    RAISE NOTICE '[PASS] Page revisions, JSONB array validation, single published revision, one homepage';

    RAISE NOTICE 'GROUP 9: navigation and site settings';
    INSERT INTO navigation_menus (code, label) VALUES ('dbtest_v11_main_menu', 'منوی آزمایشی')
    RETURNING id INTO v_menu_id;
    INSERT INTO navigation_menus (code, label) VALUES ('dbtest_v11_other_menu', 'منوی دوم آزمایشی')
    RETURNING id INTO v_second_menu_id;
    INSERT INTO navigation_items (menu_id, label, target_content_item_id, sort_order)
    VALUES (v_menu_id, 'محصول آزمایشی', v_product_content_id, 1)
    RETURNING id INTO v_nav_item_id;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO navigation_items (menu_id, label)
        VALUES (v_menu_id, 'بدون مقصد');
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Navigation item without a target was accepted'; END IF;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO navigation_items (menu_id, label, external_url)
        VALUES (v_menu_id, 'لینک HTTP', 'http://example.com');
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Non-HTTPS external navigation URL was accepted'; END IF;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO navigation_items (menu_id, parent_item_id, label, target_content_item_id)
        VALUES (v_second_menu_id, v_nav_item_id, 'والد از منوی دیگر', v_product_content_id);
    EXCEPTION WHEN foreign_key_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Navigation parent from another menu was accepted'; END IF;

    INSERT INTO site_settings (setting_key, setting_value, updated_by)
    VALUES ('dbtest_v11.site_name', '{"value":"Khaji Test"}'::jsonb, v_admin_id);
    v_rejected := FALSE;
    BEGIN
        INSERT INTO site_settings (setting_key, setting_value)
        VALUES ('Invalid Setting Key', 'true'::jsonb);
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Invalid site setting key was accepted'; END IF;
    RAISE NOTICE '[PASS] Navigation destination, HTTPS, same-menu parent, and setting-key rules';

    RAISE NOTICE 'GROUP 10: SEO redirects and path guards';
    v_rejected := FALSE;
    BEGIN
        INSERT INTO seo_redirects (source_path, target_path, status_code, reason, created_by)
        VALUES ('/__dbtest_v11/product', '/__dbtest_v11/new-product', 301, 'Active path test', v_admin_id);
    EXCEPTION WHEN raise_exception THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Active canonical URL was accepted as redirect source'; END IF;

    INSERT INTO seo_redirects (source_path, target_path, status_code, reason, created_by)
    VALUES ('/__dbtest_v11/old-path', '/__dbtest_v11/new-path', 301, 'Valid test redirect', v_admin_id)
    RETURNING id INTO v_redirect_id;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO seo_redirects (source_path, target_path, status_code, reason, created_by)
        VALUES ('/__dbtest_v11/older-path', '/__dbtest_v11/old-path', 301, 'Chain test', v_admin_id);
    EXCEPTION WHEN raise_exception THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Direct redirect chain was accepted'; END IF;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO seo_redirects (source_path, target_path, status_code, reason, created_by)
        VALUES ('/__dbtest_v11/self', '/__dbtest_v11/self', 301, 'Self redirect test', v_admin_id);
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Self redirect was accepted'; END IF;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO content_items (content_type, slug, canonical_path)
        VALUES ('page', '__dbtest_v11_redirect_source', '/__dbtest_v11/old-path');
    EXCEPTION WHEN raise_exception THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Canonical content path colliding with redirect source was accepted'; END IF;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO seo_redirects (source_path, target_path, status_code, reason, created_by)
        VALUES ('/__dbtest_v11/bad-code', '/__dbtest_v11/dest', 302, 'Bad status test', v_admin_id);
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Unsupported redirect status code was accepted'; END IF;
    RAISE NOTICE '[PASS] Redirect source conflicts, direct-chain prevention, self-loop and status-code checks';

    RAISE NOTICE 'GROUP 11: append-only audit log';
    INSERT INTO audit_logs (actor_type, actor_user_id, entity_type, entity_id, action, after_data)
    VALUES ('admin', v_admin_id, 'product', v_product_id, 'dbtest.create', '{"test":true}'::jsonb);

    v_rejected := FALSE;
    BEGIN
        UPDATE audit_logs SET action = 'tampered' WHERE entity_type = 'product' AND entity_id = v_product_id;
    EXCEPTION WHEN raise_exception THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Audit log UPDATE was not blocked'; END IF;

    v_rejected := FALSE;
    BEGIN
        DELETE FROM audit_logs WHERE entity_type = 'product' AND entity_id = v_product_id;
    EXCEPTION WHEN raise_exception THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Audit log DELETE was not blocked'; END IF;

    v_rejected := FALSE;
    BEGIN
        INSERT INTO audit_logs (actor_type, actor_user_id, entity_type, action)
        VALUES ('system', v_admin_id, 'product', 'invalid.system.actor');
    EXCEPTION WHEN check_violation THEN
        v_rejected := TRUE;
    END;
    IF NOT v_rejected THEN RAISE EXCEPTION 'Invalid system audit actor combination was accepted'; END IF;
    RAISE NOTICE '[PASS] Audit log actor consistency and append-only protection';

    RAISE NOTICE '============================================================';
    RAISE NOTICE 'ALL DATABASE SCHEMA TESTS PASSED';
    RAISE NOTICE 'Note: application-level workflows still require API/integration tests.';
    RAISE NOTICE '============================================================';
END;
$khaji_test$;

ROLLBACK;
\echo 'Test transaction rolled back. No test rows were retained.'
\echo 'Identity sequences may have gaps; this is expected PostgreSQL behavior.'
