import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import {notFound} from "next/navigation";
import {categories} from "@/content/site";
import {categoryDetails,APARAT_DEMO_VIDEO_ID} from "@/content/categoryDetails";
import {SiteHeader} from "@/components/SiteHeader";
import {SiteFooter} from "@/components/SiteFooter";
import {Icon} from "@/components/Icon";
import {DemoContactButton} from "@/components/DemoContactButton";
import {CategoryPriceTable} from "@/components/CategoryPriceTable";
import {AparatLazyVideo} from "@/components/AparatLazyVideo";
import {FAQAccordion} from "@/components/FAQAccordion";

export function generateStaticParams(){return categories.map(c=>({slug:c.slug}));}
type CategoryPageProps={params:Promise<{slug:string}>};
export async function generateMetadata({params}:CategoryPageProps):Promise<Metadata>{
 const {slug}=await params;
 const category=categories.find(c=>c.slug===slug);
 if(!category)return {title:"دسته‌بندی یافت نشد | خاجی پخش",robots:{index:false,follow:false}};
 return {
  title:`خرید عمده ${category.title} | خاجی پخش`,
  description:`معرفی و نمونه لیست قیمت ${category.title}، نکات خرید و استعلام قیمت عمده از خاجی پخش. قیمت‌ها با تماس تأیید می‌شوند.`,
  robots:{index:false,follow:false}, // V4 remains DEMO until real data is approved.
 };
}
function V4SectionHeader({eyebrow,title,description,id}:{eyebrow:string;title:string;description:string;id:string}){
 return <div className="v4-section-head"><span className="eyebrow"><Image src="/images/ui/khaji-gold-emblem.png" alt="" aria-hidden="true" width={25} height={29} className="section-emblem"/>{eyebrow}</span><h2 id={id}>{title}</h2><p>{description}</p></div>
}
export default async function CategoryPage({params}:CategoryPageProps){
 const {slug}=await params;
 const category=categories.find(c=>c.slug===slug);
 const detail=categoryDetails[slug];
 if(!category||!detail)notFound();
 const related=detail.related.map(relatedSlug=>categories.find(c=>c.slug===relatedSlug)).filter((item):item is (typeof categories)[number]=>Boolean(item));
 return <>
  <SiteHeader/>
  <main className="v4-page v4-category-page">
   <div className="container"><nav className="breadcrumb v4-breadcrumb" aria-label="مسیر صفحه"><Link href="/">خانه</Link><Icon name="arrow-left" size={14}/><Link href="/#categories">دسته‌بندی‌ها</Link><Icon name="arrow-left" size={14}/><span aria-current="page">{category.title}</span></nav></div>
   <section className="container" aria-labelledby="v4-category-title"><div className="v4-category-hero">
    <div className="v4-category-hero-copy"><span className="v4-kicker"><Icon name="grid" size={17}/> دسته‌بندی محصولات</span><h1 id="v4-category-title">خرید عمده {category.title}</h1><p>{detail.lead}</p><div className="v4-hero-actions"><a className="button button-outline" href="#category-prices">مشاهده لیست قیمت <Icon name="arrow" size={17}/></a><DemoContactButton className="button button-gold">استعلام از فروش <Icon name="phone" size={17}/></DemoContactButton></div></div>
    <div className="v4-category-hero-image"><Image src={category.image} alt={`نمای تصویری گروه ${category.title}`} fill priority sizes="(max-width: 780px) 100vw, 47vw"/></div>
   </div></section>
   <section className="v4-content-section v4-prices-section" id="category-prices" aria-labelledby="v4-prices-title"><div className="container">
    <V4SectionHeader eyebrow="مرکز لیست قیمت" title={`لیست قیمت عمده ${category.title}`} description={`اقلام نمونه گروه ${category.title} برای استعلام تلفنی؛ بدون قیمت یا موجودی ساختگی.`} id="v4-prices-title"/>
    <CategoryPriceTable items={detail.products} categoryName={category.title}/>
   </div></section>
   <section className="v4-content-section" aria-labelledby="v4-video-title"><div className="container">
    <V4SectionHeader eyebrow="ویدئوی محصول" title={`ویدئوی معرفی محصولات ${category.title}`} description="برای حفظ سرعت سایت، پخش‌کننده آپارات فقط بعد از کلیک شما بارگذاری می‌شود." id="v4-video-title"/>
    <AparatLazyVideo videoId={APARAT_DEMO_VIDEO_ID} poster={category.image} categoryName={category.title}/>
   </div></section>
   <section className="v4-content-section v4-guidance-section" aria-labelledby="v4-guide-title"><div className="container">
    <V4SectionHeader eyebrow="راهنمای انتخاب" title={`توضیحات و نکات خرید ${category.title}`} description="پیش از استعلام عمده، مشخصات کلیدی موردنیاز پروژه را مرور کنید." id="v4-guide-title"/>
    <div className="v4-guide-layout"><article className="v4-editorial">{detail.description.map((p,i)=><p key={i}>{p}</p>)}<DemoContactButton className="button button-outline">مشاوره و استعلام تلفنی <Icon name="phone" size={17}/></DemoContactButton></article><div className="v4-tips-grid">{detail.buyingTips.map((tip,i)=><article className="v4-tip" key={tip.title}><span className="v4-tip-symbol"><Icon name="check" size={20}/></span><div><h3>{tip.title}</h3><p>{tip.text}</p></div></article>)}</div></div>
   </div></section>
   <section className="v4-content-section" aria-labelledby="v4-faq-title"><div className="container v4-faq-wrap">
    <V4SectionHeader eyebrow="سؤالات متداول" title={`پرسش‌های رایج درباره ${category.title}`} description="پاسخ چند سؤال کاربردی پیش از تماس برای استعلام خرید عمده." id="v4-faq-title"/>
    <FAQAccordion items={detail.faqs}/>
   </div></section>
   <section className="v4-content-section v4-related-section" aria-labelledby="v4-related-title"><div className="container">
    <V4SectionHeader eyebrow="مسیرهای مرتبط" title="دسته‌بندی‌های مرتبط" description="برای تکمیل فهرست خرید، دیگر گروه‌های کالایی را هم ببینید." id="v4-related-title"/>
    <div className="v4-related-grid">{related.map(c=><Link href={`/categories/${c.slug}`} className="v4-related-card" key={c.slug}><span className="v4-related-image"><Image src={c.image} alt="" fill sizes="(max-width: 640px) 45vw, 25vw"/></span><span>{c.shortTitle}</span><Icon name="arrow-left" size={18}/></Link>)}</div>
   </div></section>
   <section className="container v4-bottom-contact"><div><span className="eyebrow">ارتباط مستقیم با فروش</span><h2>برای استعلام {category.title} آماده‌اید؟</h2><p>برای بررسی قیمت، برند قابل تأمین و شرایط سفارش، با واحد فروش خاجی پخش تماس بگیرید.</p></div><DemoContactButton className="button button-gold button-xl">تماس با واحد فروش <Icon name="phone" size={18}/></DemoContactButton></section>
  </main>
  <SiteFooter/>
 </>;
}
