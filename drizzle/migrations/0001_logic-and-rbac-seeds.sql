-- 0001_logic-and-rbac-seeds
-- PostgreSQL functions and triggers. Run only after registering 0000 baseline.
CREATE OR REPLACE FUNCTION public.khaji_guard_content_path()
RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
    IF NEW.status <> 'redirected' AND EXISTS (
        SELECT 1 FROM public.seo_redirects r
        WHERE lower(r.source_path) = lower(NEW.canonical_path)
    ) THEN
        RAISE EXCEPTION 'Canonical path % is already registered as a redirect source', NEW.canonical_path;
    END IF;
    RETURN NEW;
END;
$function$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.khaji_guard_redirect_path()
RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.content_items c
        WHERE lower(c.canonical_path) = lower(NEW.source_path)
          AND c.status <> 'redirected'
    ) THEN
        RAISE EXCEPTION 'Redirect source % is still an active canonical content path', NEW.source_path;
    END IF;
    IF EXISTS (
        SELECT 1 FROM public.seo_redirects r
        WHERE lower(r.source_path) = lower(NEW.target_path)
          AND r.id IS DISTINCT FROM NEW.id
    ) THEN
        RAISE EXCEPTION 'Redirect target % is itself a redirect source; redirect chains are not allowed', NEW.target_path;
    END IF;
    RETURN NEW;
END;
$function$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.khaji_reject_immutable_change()
RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
    RAISE EXCEPTION 'Table % is append-only; % is not allowed', TG_TABLE_NAME, TG_OP;
    RETURN OLD;
END;
$function$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.khaji_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$function$;
--> statement-breakpoint

DROP TRIGGER IF EXISTS touch_admin_users ON public.admin_users;
--> statement-breakpoint
CREATE TRIGGER touch_admin_users BEFORE UPDATE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION public.khaji_touch_updated_at();
--> statement-breakpoint
DROP TRIGGER IF EXISTS audit_logs_append_only ON public.audit_logs;
--> statement-breakpoint
CREATE TRIGGER audit_logs_append_only BEFORE DELETE OR UPDATE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.khaji_reject_immutable_change();
--> statement-breakpoint
DROP TRIGGER IF EXISTS touch_brands ON public.brands;
--> statement-breakpoint
CREATE TRIGGER touch_brands BEFORE UPDATE ON public.brands
FOR EACH ROW EXECUTE FUNCTION public.khaji_touch_updated_at();
--> statement-breakpoint
DROP TRIGGER IF EXISTS touch_categories ON public.categories;
--> statement-breakpoint
CREATE TRIGGER touch_categories BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.khaji_touch_updated_at();
--> statement-breakpoint
DROP TRIGGER IF EXISTS guard_content_path_insert ON public.content_items;
--> statement-breakpoint
CREATE TRIGGER guard_content_path_insert BEFORE INSERT ON public.content_items
FOR EACH ROW EXECUTE FUNCTION public.khaji_guard_content_path();
--> statement-breakpoint
DROP TRIGGER IF EXISTS guard_content_path_update ON public.content_items;
--> statement-breakpoint
CREATE TRIGGER guard_content_path_update BEFORE UPDATE OF canonical_path, status ON public.content_items
FOR EACH ROW EXECUTE FUNCTION public.khaji_guard_content_path();
--> statement-breakpoint
DROP TRIGGER IF EXISTS touch_content_items ON public.content_items;
--> statement-breakpoint
CREATE TRIGGER touch_content_items BEFORE UPDATE ON public.content_items
FOR EACH ROW EXECUTE FUNCTION public.khaji_touch_updated_at();
--> statement-breakpoint
DROP TRIGGER IF EXISTS touch_pages ON public.pages;
--> statement-breakpoint
CREATE TRIGGER touch_pages BEFORE UPDATE ON public.pages
FOR EACH ROW EXECUTE FUNCTION public.khaji_touch_updated_at();
--> statement-breakpoint
DROP TRIGGER IF EXISTS price_history_append_only ON public.price_history;
--> statement-breakpoint
CREATE TRIGGER price_history_append_only BEFORE DELETE OR UPDATE ON public.price_history
FOR EACH ROW EXECUTE FUNCTION public.khaji_reject_immutable_change();
--> statement-breakpoint
DROP TRIGGER IF EXISTS price_publication_items_append_only ON public.price_list_publication_items;
--> statement-breakpoint
CREATE TRIGGER price_publication_items_append_only BEFORE DELETE OR UPDATE ON public.price_list_publication_items
FOR EACH ROW EXECUTE FUNCTION public.khaji_reject_immutable_change();
--> statement-breakpoint
DROP TRIGGER IF EXISTS price_publications_append_only ON public.price_list_publications;
--> statement-breakpoint
CREATE TRIGGER price_publications_append_only BEFORE DELETE OR UPDATE ON public.price_list_publications
FOR EACH ROW EXECUTE FUNCTION public.khaji_reject_immutable_change();
--> statement-breakpoint
DROP TRIGGER IF EXISTS touch_price_lists ON public.price_lists;
--> statement-breakpoint
CREATE TRIGGER touch_price_lists BEFORE UPDATE ON public.price_lists
FOR EACH ROW EXECUTE FUNCTION public.khaji_touch_updated_at();
--> statement-breakpoint
DROP TRIGGER IF EXISTS touch_product_prices ON public.product_prices;
--> statement-breakpoint
CREATE TRIGGER touch_product_prices BEFORE UPDATE ON public.product_prices
FOR EACH ROW EXECUTE FUNCTION public.khaji_touch_updated_at();
--> statement-breakpoint
DROP TRIGGER IF EXISTS touch_products ON public.products;
--> statement-breakpoint
CREATE TRIGGER touch_products BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.khaji_touch_updated_at();
--> statement-breakpoint
DROP TRIGGER IF EXISTS guard_redirect_path_insert ON public.seo_redirects;
--> statement-breakpoint
CREATE TRIGGER guard_redirect_path_insert BEFORE INSERT ON public.seo_redirects
FOR EACH ROW EXECUTE FUNCTION public.khaji_guard_redirect_path();
--> statement-breakpoint
DROP TRIGGER IF EXISTS guard_redirect_path_update ON public.seo_redirects;
--> statement-breakpoint
CREATE TRIGGER guard_redirect_path_update BEFORE UPDATE OF source_path, target_path ON public.seo_redirects
FOR EACH ROW EXECUTE FUNCTION public.khaji_guard_redirect_path();
--> statement-breakpoint
DROP TRIGGER IF EXISTS touch_site_settings ON public.site_settings;
--> statement-breakpoint
CREATE TRIGGER touch_site_settings BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.khaji_touch_updated_at();
--> statement-breakpoint

-- Seed the five standard roles. Preserve any existing labels.
INSERT INTO public.roles (code, label_fa)
VALUES
    ('catalog_manager', 'مدیر محصولات و کاتالوگ'),
    ('content_editor',  'مدیر محتوا'),
    ('price_manager',   'مدیر قیمت‌ها'),
    ('seo_editor',      'کارشناس سئو'),
    ('super_admin',     'مدیر کل')
ON CONFLICT (code) DO NOTHING;
--> statement-breakpoint

-- Seed the 23 standard permissions. Preserve any existing labels.
INSERT INTO public.permissions (code, label_fa)
VALUES
    ('audit.read',          'مشاهده تاریخچه فعالیت‌ها'),
    ('backups.manage',      'مدیریت عملیات پشتیبان‌گیری'),
    ('brands.read',         'مشاهده برندها'),
    ('brands.write',        'مدیریت برندها'),
    ('categories.read',     'مشاهده دسته‌بندی‌ها'),
    ('categories.write',    'مدیریت دسته‌بندی‌ها'),
    ('dashboard.read',      'مشاهده داشبورد'),
    ('media.manage',        'مدیریت رسانه'),
    ('media.read',          'مشاهده رسانه'),
    ('navigation.manage',   'مدیریت منوها'),
    ('pages.publish',       'انتشار صفحات'),
    ('pages.read',          'مشاهده صفحات'),
    ('pages.write',         'ویرایش صفحات'),
    ('price_lists.publish', 'انتشار لیست قیمت'),
    ('price_lists.read',    'مشاهده لیست قیمت'),
    ('prices.import',       'ورود گروهی قیمت‌ها'),
    ('prices.read',         'مشاهده قیمت‌ها'),
    ('prices.write',        'ویرایش قیمت‌ها'),
    ('products.read',       'مشاهده محصولات'),
    ('products.write',      'مدیریت محصولات'),
    ('seo.manage',          'مدیریت تنظیمات سئو'),
    ('settings.manage',     'مدیریت تنظیمات سایت'),
    ('users.manage',        'مدیریت کاربران')
ON CONFLICT (code) DO NOTHING;
--> statement-breakpoint

-- Seed the 55 role-permission assignments by stable codes, not generated IDs.
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM (
    VALUES
        ('catalog_manager', 'brands.read'),
        ('catalog_manager', 'brands.write'),
        ('catalog_manager', 'categories.read'),
        ('catalog_manager', 'categories.write'),
        ('catalog_manager', 'dashboard.read'),
        ('catalog_manager', 'media.manage'),
        ('catalog_manager', 'media.read'),
        ('catalog_manager', 'products.read'),
        ('catalog_manager', 'products.write'),

        ('content_editor', 'dashboard.read'),
        ('content_editor', 'media.manage'),
        ('content_editor', 'media.read'),
        ('content_editor', 'navigation.manage'),
        ('content_editor', 'pages.publish'),
        ('content_editor', 'pages.read'),
        ('content_editor', 'pages.write'),

        ('price_manager', 'brands.read'),
        ('price_manager', 'categories.read'),
        ('price_manager', 'dashboard.read'),
        ('price_manager', 'price_lists.publish'),
        ('price_manager', 'price_lists.read'),
        ('price_manager', 'prices.import'),
        ('price_manager', 'prices.read'),
        ('price_manager', 'prices.write'),
        ('price_manager', 'products.read'),

        ('seo_editor', 'brands.read'),
        ('seo_editor', 'categories.read'),
        ('seo_editor', 'dashboard.read'),
        ('seo_editor', 'pages.read'),
        ('seo_editor', 'price_lists.read'),
        ('seo_editor', 'products.read'),
        ('seo_editor', 'seo.manage'),

        ('super_admin', 'audit.read'),
        ('super_admin', 'backups.manage'),
        ('super_admin', 'brands.read'),
        ('super_admin', 'brands.write'),
        ('super_admin', 'categories.read'),
        ('super_admin', 'categories.write'),
        ('super_admin', 'dashboard.read'),
        ('super_admin', 'media.manage'),
        ('super_admin', 'media.read'),
        ('super_admin', 'navigation.manage'),
        ('super_admin', 'pages.publish'),
        ('super_admin', 'pages.read'),
        ('super_admin', 'pages.write'),
        ('super_admin', 'price_lists.publish'),
        ('super_admin', 'price_lists.read'),
        ('super_admin', 'prices.import'),
        ('super_admin', 'prices.read'),
        ('super_admin', 'prices.write'),
        ('super_admin', 'products.read'),
        ('super_admin', 'products.write'),
        ('super_admin', 'seo.manage'),
        ('super_admin', 'settings.manage'),
        ('super_admin', 'users.manage')
) AS assignments(role_code, permission_code)
JOIN public.roles r
  ON r.code = assignments.role_code
JOIN public.permissions p
  ON p.code = assignments.permission_code
ON CONFLICT (role_id, permission_id) DO NOTHING;
