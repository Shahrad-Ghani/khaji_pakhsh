"use client";

import { useEffect, useMemo, useState } from "react";
import { faNumber, samplePrices, categories, brands } from "@/content/site";
import { Icon } from "./Icon";
import { DemoContactButton } from "./DemoContactButton";

const categoryFilters = ["همه محصولات", ...categories.map((category) => category.shortTitle)];
const brandFilters = ["همه برندها", ...brands.map((brand) => brand.name)];
const STORAGE_KEY = "khaji-v1-inquiry-list";
function normalize(value: string) {
  return value.toLocaleLowerCase("fa-IR").replace(/[\u064A]/g, "ی").replace(/[\u0643]/g, "ک").trim();
}

export function PriceTable() {
  const [activeCategory, setActiveCategory] = useState("همه محصولات");
  const [activeBrand, setActiveBrand] = useState("همه برندها");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) setSelectedIds(parsed.filter((id): id is number => typeof id === "number" && samplePrices.some((row) => row.id === id)));
      }
    } catch { /* Storage is optional; the table still works for this session. */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds)); }
    catch { /* The inquiry list remains usable without persistent browser storage. */ }
  }, [selectedIds, hydrated]);

  const rows = useMemo(() => {
    const query = normalize(search);
    return samplePrices.filter((row) => {
      const selectedCategory = categories.find((category) => category.shortTitle === activeCategory);
      const mappedGroup = selectedCategory?.slug === "lighting" ? "روشنایی" :
        selectedCategory?.slug === "circuit-protection" ? "تجهیزات حفاظتی" :
        selectedCategory?.slug === "wire-cable" ? "سیم و کابل" :
        selectedCategory?.slug === "switches-sockets" ? "کلید و پریز" : activeCategory;
      const categoryMatch = activeCategory === "همه محصولات" || row.group === mappedGroup;
      const brandMatch = activeBrand === "همه برندها" || row.brand === activeBrand;
      const searchMatch = !query || normalize([row.product, row.brand, row.group, row.unit, String(row.id)].join(" ")).includes(query);
      return categoryMatch && brandMatch && searchMatch;
    });
  }, [activeCategory, activeBrand, search]);

  const selectedRows = useMemo(() => samplePrices.filter((row) => selectedIds.includes(row.id)), [selectedIds]);
  const inquiryText = useMemo(() => [
    "درخواست استعلام خرید عمده — خاجی پخش", "",
    ...selectedRows.map((row, index) => `${index + 1}. ${row.product} | برند: ${row.brand} | دسته: ${row.group} | واحد: ${row.unit} | تعداد درخواستی: نیازمند هماهنگی`),
    "", "لطفاً قیمت روز، موجودی و شرایط خرید عمده اقلام بالا را اعلام فرمایید.",
    "این فهرست از نسخه نمایشی سایت تهیه شده است؛ قیمت‌های نمایش‌داده‌شده نمونه هستند."
  ].join("\n"), [selectedRows]);

  const toggleSelected = (id: number) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setFeedback("");
  };

  const copyInquiry = async () => {
    if (!selectedRows.length) { setFeedback("ابتدا یک یا چند کالا را به فهرست استعلام اضافه کنید."); return; }
    try {
      await navigator.clipboard.writeText(inquiryText);
      setFeedback("فهرست استعلام کپی شد؛ می‌توانید آن را برای واحد فروش ارسال کنید.");
    } catch { setFeedback("کپی خودکار در این مرورگر در دسترس نیست. از قابلیت اشتراک‌گذاری استفاده کنید."); }
  };

  const shareInquiry = async () => {
    if (!selectedRows.length) { setFeedback("ابتدا یک یا چند کالا را به فهرست استعلام اضافه کنید."); return; }
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "فهرست استعلام خرید عمده خاجی پخش", text: inquiryText });
        setFeedback("پنجره اشتراک‌گذاری باز شد.");
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setFeedback("اشتراک‌گذاری در دسترس نبود؛ از گزینه کپی فهرست استفاده کنید.");
      }
    } else { await copyInquiry(); }
  };

  return <div className="price-panel">
    <div className="price-panel-top price-panel-filters">
      <div className="price-filter-controls">
        <label className="price-search-field"><Icon name="search" size={18}/><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجوی نام کالا، برند یا گروه..." aria-label="جست‌وجوی کالا، برند یا گروه"/></label>
        <label className="price-select-field"><span>دسته‌بندی</span><select value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)} aria-label="فیلتر دسته‌بندی">{categoryFilters.map((filter) => <option key={filter} value={filter}>{filter}</option>)}</select></label>
        <label className="price-select-field"><span>برند</span><select value={activeBrand} onChange={(event) => setActiveBrand(event.target.value)} aria-label="فیلتر برند">{brandFilters.map((filter) => <option key={filter} value={filter}>{filter}</option>)}</select></label>
      </div>
      <span className="table-counter">{faNumber(rows.length)} کالا</span>
    </div>
    <div className="inquiry-intro"><span className="inquiry-intro-icon"><Icon name="file" size={21}/></span><div><strong>فهرست استعلام خرید عمده</strong><p>کالاهای موردنظر را انتخاب کنید، سپس فهرست را کپی یا با قابلیت اشتراک‌گذاری دستگاه خود ارسال کنید. پرداخت آنلاین در این نسخه وجود ندارد.</p></div></div>
    <div className="table-scroll" tabIndex={0} aria-label="جدول قیمت نمونه با امکان پیمایش افقی"><table className="price-table">
      <caption className="sr-only">جدول نمونه قیمت عمده تجهیزات الکتریکی؛ قیمت‌ها نمونه هستند. برای استعلام کالاها را انتخاب کنید.</caption>
      <thead><tr><th scope="col">انتخاب</th><th scope="col">ردیف</th><th scope="col">گروه کالا</th><th scope="col">نام محصول</th><th scope="col">برند</th><th scope="col">واحد</th><th scope="col">قیمت نمونه (تومان)</th></tr></thead>
      <tbody>{rows.map((row, index) => {
        const checked = selectedIds.includes(row.id);
        return <tr key={row.id} className={checked ? "is-inquiry-selected" : ""}>
          <td><button type="button" className={`inquiry-select-button ${checked ? "is-selected" : ""}`} onClick={() => toggleSelected(row.id)} aria-pressed={checked} aria-label={checked ? `حذف ${row.product} از فهرست استعلام` : `افزودن ${row.product} به فهرست استعلام`}><Icon name={checked ? "check" : "plus"} size={16}/></button></td>
          <td className="table-index">{faNumber(index + 1).padStart(2, "۰")}</td><td><span className="group-pill">{row.group}</span></td><td className="table-product">{row.product}</td><td>{row.brand}</td><td>{row.unit}</td>
          <td>{typeof row.price === "number" ? <span className="table-price">{faNumber(row.price)}</span> : <span className="inquiry-price">{row.price}</span>}</td>
        </tr>;
      })}{rows.length === 0 && <tr><td colSpan={7} className="price-empty-state">کالایی با این مشخصات پیدا نشد. عبارت جست‌وجو یا فیلترها را تغییر دهید.</td></tr>}</tbody>
    </table></div>
    <div className="inquiry-builder">
      <div className="inquiry-builder-heading"><div><span className="eyebrow">فهرست شما</span><h3>{faNumber(selectedRows.length)} کالا برای استعلام انتخاب شده</h3></div>{selectedRows.length > 0 && <button type="button" className="inquiry-clear" onClick={() => { setSelectedIds([]); setFeedback(""); }}>حذف همه</button>}</div>
      {selectedRows.length > 0 ? <ul className="inquiry-selected-list">{selectedRows.map((row) => <li key={row.id}><span><strong>{row.product}</strong><small>{row.brand} · {row.group}</small></span><button type="button" onClick={() => toggleSelected(row.id)} aria-label={`حذف ${row.product} از فهرست`}><Icon name="close" size={16}/></button></li>)}</ul> : <p className="inquiry-empty">هنوز کالایی انتخاب نشده است. از جدول بالا کالاهای موردنظر را اضافه کنید.</p>}
      <div className="inquiry-actions"><button type="button" className="button button-gold" onClick={shareInquiry}><Icon name="external" size={17}/> اشتراک‌گذاری فهرست</button><button type="button" className="button button-outline" onClick={copyInquiry}><Icon name="file" size={17}/> کپی متن استعلام</button><DemoContactButton className="button button-outline"><Icon name="phone" size={17}/> تماس با واحد فروش</DemoContactButton></div>
      {feedback && <p className="inquiry-feedback" role="status">{feedback}</p>}
      <p className="inquiry-disclaimer"><Icon name="shield" size={16}/> قیمت‌های این دمو نمونه‌اند؛ قیمت روز، موجودی و تعداد سفارش هنگام استعلام از فروشگاه تأیید می‌شوند.</p>
    </div>
  </div>;
}
