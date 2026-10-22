"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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

export function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    if (isPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const showPrevious = () =>
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  const showNext = () =>
    setActiveIndex((current) => (current + 1) % slides.length);

  return (
    <section className="hero-slider-wrap" aria-label="پیشنهادهای خاجی پخش">
      <div
        className={`hero-slider ${activeSlide.tone === "special" ? "is-special" : ""}`}
        role="region"
        aria-roledescription="carousel"
        aria-label="بنرهای معرفی خاجی پخش"
      >
        {slides.map((slide, index) => (
          <div
            className={`hero-slider-art-layer ${index === activeIndex ? "is-active" : ""} ${slide.tone === "special" ? "is-special" : ""}`}
            key={slide.id}
            aria-hidden="true"
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={index === 0}
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
        ))}

        <div className="hero-slider-copy" aria-live="off">
          <span className="hero-slider-overline">{activeSlide.overline}</span>
          <h1 id="hero-title">
            {activeSlide.title}
            <strong>{activeSlide.highlight}</strong>
          </h1>
          <span className="hero-slider-rule" aria-hidden="true" />
          <p>{activeSlide.description}</p>
          <div className="hero-slider-cta">
            <Link className="button button-gold button-xl" href={activeSlide.primaryHref}>
              {activeSlide.primaryLabel}
              <Icon name="arrow" size={18} />
            </Link>
            {activeSlide.secondaryHref.startsWith("tel:") ? (
              <a className="button button-outline button-xl" href={activeSlide.secondaryHref}>
                {activeSlide.secondaryLabel}
                <Icon name="phone" size={17} />
              </a>
            ) : (
              <Link className="button button-outline button-xl" href={activeSlide.secondaryHref}>
                {activeSlide.secondaryLabel}
                <Icon name="grid" size={17} />
              </Link>
            )}
          </div>
        </div>

        <button
          className="hero-slider-arrow hero-slider-previous"
          type="button"
          onClick={showPrevious}
          aria-label="اسلاید قبلی"
        >
          <Icon name="arrow-left" size={21} />
        </button>
        <button
          className="hero-slider-arrow hero-slider-next"
          type="button"
          onClick={showNext}
          aria-label="اسلاید بعدی"
        >
          <Icon name="arrow" size={21} />
        </button>

        <div className="hero-slider-controls" aria-label="کنترل پخش اسلایدها">
          <div className="hero-slider-dots">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={`hero-slider-dot ${index === activeIndex ? "is-active" : ""}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`رفتن به اسلاید ${index + 1}`}
                aria-pressed={index === activeIndex}
              />
            ))}
          </div>
          <button
            type="button"
            className="hero-slider-pause"
            onClick={() => setIsPaused((paused) => !paused)}
            aria-label={isPaused ? "ادامه پخش خودکار" : "توقف پخش خودکار"}
            title={isPaused ? "ادامه پخش خودکار" : "توقف پخش خودکار"}
          >
            {isPaused ? "▶" : "Ⅱ"}
          </button>
        </div>
      </div>
    </section>
  );
}
