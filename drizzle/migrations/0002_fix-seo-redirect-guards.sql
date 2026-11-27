
-- 0002_fix-seo-redirect-guards
-- Fix bidirectional redirect-chain prevention.
-- Add case-insensitive self-redirect protection.
-- Serialize SEO path writes with a shared transaction advisory lock.

CREATE OR REPLACE FUNCTION public.khaji_guard_content_path()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Shared lock for content paths and SEO redirects.
    PERFORM pg_advisory_xact_lock(20261127, 1101);

    IF NEW.status <> 'redirected' AND EXISTS (
        SELECT 1
        FROM public.seo_redirects r
        WHERE lower(r.source_path) = lower(NEW.canonical_path)
    ) THEN
        RAISE EXCEPTION
            'Canonical path % is already registered as a redirect source',
            NEW.canonical_path;
    END IF;

    RETURN NEW;
END;
$function$;

--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.khaji_guard_redirect_path()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Use the same lock as khaji_guard_content_path().
    PERFORM pg_advisory_xact_lock(20261127, 1101);

    -- Prevent self-redirects, including case-insensitive variants.
    IF lower(NEW.source_path) = lower(NEW.target_path) THEN
        RAISE EXCEPTION
            'Redirect source % and target % are identical (case-insensitive)',
            NEW.source_path,
            NEW.target_path;
    END IF;

    -- A redirect source cannot be an active canonical content path.
    IF EXISTS (
        SELECT 1
        FROM public.content_items c
        WHERE lower(c.canonical_path) = lower(NEW.source_path)
          AND c.status <> 'redirected'
    ) THEN
        RAISE EXCEPTION
            'Redirect source % is still an active canonical content path',
            NEW.source_path;
    END IF;

    -- Prevent forward redirect chains: A -> B -> C.
    IF EXISTS (
        SELECT 1
        FROM public.seo_redirects r
        WHERE lower(r.source_path) = lower(NEW.target_path)
          AND r.id IS DISTINCT FROM NEW.id
    ) THEN
        RAISE EXCEPTION
            'Redirect target % is itself a redirect source; redirect chains are not allowed',
            NEW.target_path;
    END IF;

    -- Prevent reverse redirect chains: X -> A -> B.
    IF EXISTS (
        SELECT 1
        FROM public.seo_redirects r
        WHERE lower(r.target_path) = lower(NEW.source_path)
          AND r.id IS DISTINCT FROM NEW.id
    ) THEN
        RAISE EXCEPTION
            'Redirect source % is already a target of another redirect; redirect chains are not allowed',
            NEW.source_path;
    END IF;

    RETURN NEW;
END;
$function$;
-- Custom SQL migration file, put your code below! --

--> statement-breakpoint

ALTER TABLE public.seo_redirects
DROP CONSTRAINT seo_redirect_no_self_ck;

--> statement-breakpoint

ALTER TABLE public.seo_redirects
ADD CONSTRAINT seo_redirect_no_self_ck
CHECK (lower(source_path) <> lower(target_path));