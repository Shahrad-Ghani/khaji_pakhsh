"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type TransitionEvent } from "react";
import { Icon } from "@/components/Icon";
import { SALES_TEL } from "@/content/site";

const slides = [
  {
    id: "bulk",
    image: "/images/hero/khaji-hero-products.webp",
    overline: "خاجی پخش | فروش عمده تجهیزات برق",
    title: "تأمین قطعات الکتریکی",
    highlight: "به‌صورت عمده",
    description:
      "برای فروشگاه‌ها، پروژه‌های ساختمانی و خریداران عمده؛ با امکان بررسی کالا و استعلام قیمت و موجودی.",
    primaryLabel: "استعلام قیمت و موجودی",
    primaryHref: "/#price-lists",
    secondaryLabel: "مشاهده دسته‌بندی‌ها",
    secondaryHref: "/#categories",
    tone: "light",
    calendar: false,
  },
  {
    id: "monday",
    image: "/images/categories/wire-cable.webp",
    overline: "خاجی پخش | پیشنهادهای ویژه خرید عمده",
    title: "دوشنبه‌های ویژه",
    highlight: "با قیمت خرید استثنایی",
    description:
      "فرصتی برای بررسی شرایط ویژه خرید عمده و مرور لیست قیمت محصولات.",
    primaryLabel: "مشاهده لیست قیمت",
    primaryHref: "/#price-lists",
    secondaryLabel: "تماس با فروش",
    secondaryHref: SALES_TEL,
    tone: "special",
    calendar: true,
  },
  {
    id: "quality",
    image: "/images/categories/circuit-protection.webp",
    overline: "خاجی پخش | تأمین تجهیزات الکتریکی",
    title: "تأمین قطعات الکتریکی",
    highlight: "با بالاترین کیفیت",
    description:
      "برای تأمین نیاز پروژه‌ها و خرید عمده، با امکان بررسی گروه‌های مختلف کالای برق و برندها.",
    primaryLabel: "مشاهده محصولات",
    primaryHref: "/#categories",
    secondaryLabel: "آشنایی با برندها",
    secondaryHref: "/#brands",
    tone: "light",
    calendar: false,
  },
] as const;

const extendedSlides = [
  { slide: slides[slides.length - 1], key: "clone-last" },
  ...slides.map((slide) => ({ slide, key: slide.id })),
  { slide: slides[0], key: "clone-first" },
];

export function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [trackPosition, setTrackPosition] = useState(1);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const isAnimatingRef = useRef(false);

  const move = useCallback((direction: -1 | 1) => {
    // Do not allow rapid clicks to push the track beyond its clone panels.
    if (isAnimatingRef.current) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setActiveIndex((current) => (current + direction + slides.length) % slides.length);

    if (reducedMotion) {
      // With transitions disabled, jump directly to a real panel (never a clone).
      setTrackPosition((current) => {
        const next = current + direction;
        if (next <= 0) return slides.length;
        if (next >= slides.length + 1) return 1;
        return next;
      });
      return;
    }

    isAnimatingRef.current = true;
    setIsAnimating(true);
    setTrackPosition((current) => current + direction);
  }, []);

  const showPrevious = useCallback(() => move(-1), [move]);
  const showNext = useCallback(() => move(1), [move]);

  useEffect(() => {
    // Respect reduced-motion preferences; manual navigation remains available.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // A timeout (rather than a persistent interval) starts a fresh 5s wait
    // after every accepted navigation, including manual arrow/dot clicks.
    const timer = window.setTimeout(showNext, 5000);
    return () => window.clearTimeout(timer);
  }, [activeIndex, showNext]);

  useEffect(() => {
    if (isTransitionEnabled) return;
    const frame = window.requestAnimationFrame(() => {
      setIsTransitionEnabled(true);
      isAnimatingRef.current = false;
      setIsAnimating(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isTransitionEnabled]);

  // Failsafe: unlock if the browser doesn't emit transitionend.
  useEffect(() => {
    if (!isAnimating || !isTransitionEnabled) return;

    const timer = window.setTimeout(() => {
      if (trackPosition === 0) {
        setIsTransitionEnabled(false);
        setTrackPosition(slides.length);
      } else if (trackPosition === slides.length + 1) {
        setIsTransitionEnabled(false);
        setTrackPosition(1);
      } else {
        isAnimatingRef.current = false;
        setIsAnimating(false);
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [isAnimating, isTransitionEnabled, trackPosition]);

  const handleTrackTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== "transform") {
      return;
    }

    if (trackPosition === 0) {
      setIsTransitionEnabled(false);
      setTrackPosition(slides.length);
    } else if (trackPosition === slides.length + 1) {
      setIsTransitionEnabled(false);
      setTrackPosition(1);
    } else {
      isAnimatingRef.current = false;
      setIsAnimating(false);
    }
  };

  const goToSlide = (index: number) => {
    if (index === activeIndex || isAnimatingRef.current) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setActiveIndex(index);

    if (reducedMotion) {
      setTrackPosition(index + 1);
      return;
    }

    isAnimatingRef.current = true;
    setIsAnimating(true);
    setTrackPosition(index + 1);
  };

  return (
    <section className="hero-slider-wrap" aria-label="پیشنهادهای خاجی پخش">
      <div
        className="hero-slider"
        role="region"
        aria-roledescription="carousel"
        aria-label="بنرهای معرفی خاجی پخش"
      >
        <div
          className={`hero-slider-track ${isTransitionEnabled ? "" : "is-no-transition"}`}
          style={{ transform: `translateX(-${trackPosition * 20}%)` }}
          onTransitionEnd={handleTrackTransitionEnd}
        >
          {extendedSlides.map(({ slide, key }, physicalIndex) => {
            const isCurrent = physicalIndex === trackPosition;
            const HeadingTag = isCurrent ? "h1" : "h2";

            return (
              <article
                className={`hero-slider-panel ${slide.tone === "special" ? "is-special" : ""}`}
                key={key}
                aria-hidden={!isCurrent}
                inert={!isCurrent}
              >
                <div className={`hero-slider-art-layer ${slide.tone === "special" ? "is-special" : ""}`}>
                  <Image
                    src={slide.image}
                    alt=""
                    fill
                    priority={slide.id === "bulk"}
                    loading="eager"
                    sizes="(max-width: 720px) 100vw, 54vw"
                    className="hero-slider-image"
                  />
                  {slide.calendar && (
                    <div className="hero-slider-calendar">
                      <span className="hero-slider-calendar-rings" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                      <span className="hero-slider-calendar-label">دوشنبه‌های</span>
                      <strong>ویژه</strong>
                      <span className="hero-slider-calendar-lines" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                    </div>
                  )}
                </div>

                <div className="hero-slider-copy">
                  <span className="hero-slider-overline">{slide.overline}</span>
                  <HeadingTag id={isCurrent ? "hero-title" : undefined}>
                    {slide.title}
                    <strong>{slide.highlight}</strong>
                  </HeadingTag>
                  <span className="hero-slider-rule" aria-hidden="true" />
                  <p>{slide.description}</p>
                  <div className="hero-slider-cta">
                    <Link className="button button-gold button-xl" href={slide.primaryHref}>
                      {slide.primaryLabel}
                      <Icon name="arrow" size={18} />
                    </Link>
                    {slide.secondaryHref.startsWith("tel:") ? (
                      <a className="button button-outline button-xl" href={slide.secondaryHref}>
                        {slide.secondaryLabel}
                        <Icon name="phone" size={17} />
                      </a>
                    ) : (
                      <Link className="button button-outline button-xl" href={slide.secondaryHref}>
                        {slide.secondaryLabel}
                        <Icon name="grid" size={17} />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <button
          className="hero-slider-arrow hero-slider-previous"
          type="button"
          onClick={showPrevious}
          disabled={isAnimating}
          aria-label="اسلاید قبلی"
        >
          <Icon name="arrow" size={21} />
        </button>
        <button
          className="hero-slider-arrow hero-slider-next"
          type="button"
          onClick={showNext}
          disabled={isAnimating}
          aria-label="اسلاید بعدی"
        >
          <Icon name="arrow" size={21} />
        </button>

        <div className="hero-slider-controls" aria-label="کنترل اسلایدها">
          <div className="hero-slider-dots">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={`hero-slider-dot ${index === activeIndex ? "is-active" : ""}`}
                onClick={() => goToSlide(index)}
                disabled={isAnimating}
                aria-label={`رفتن به اسلاید ${index + 1}`}
                aria-pressed={index === activeIndex}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
