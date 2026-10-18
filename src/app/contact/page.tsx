import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import {categories,SALES_NUMBER,SALES_TEL} from "@/content/site";
import {SiteHeader} from "@/components/SiteHeader";
import {SiteFooter} from "@/components/SiteFooter";
import {Icon} from "@/components/Icon";
import {DemoContactButton} from "@/components/DemoContactButton";

export const metadata:Metadata={
 title:"تماس با ما و آدرس فروشگاه | خاجی پخش",
 description:"راه‌های ارتباط با خاجی پخش، تلفن فروش و موقعیت فروشگاه در خیابان انقلاب تهران نزدیک تقاطع لاله‌زار نو و مترو دروازه دولت.",
 robots:{index:false,follow:false}, // demo environment
};
const STORE_ADDRESS="تهران، خیابان انقلاب اسلامی، حوالی تقاطع خیابان لاله‌زار نو، نزدیک ایستگاه مترو دروازه دولت";
const MAPS_LINK="https://maps.app.goo.gl/fDaBz9vXBcHYxNeQ6";
const MAP_EMBED="https://maps.google.com/maps?q=35.701032%2C51.424135&z=17&output=embed";
const advantages=[
 {icon:"layers" as const,title:"تنوع گروه‌های کالایی",text:"امکان بررسی سیم و کابل، کلید و پریز، روشنایی، تجهیزات حفاظتی و برق صنعتی در یک مسیر مشخص."},
 {icon:"phone" as const,title:"ارتباط مستقیم و مشاوره خرید",text:"پیش از ثبت سفارش عمده می‌توانید درباره مشخصات محصول، برند و شرایط تأمین با فروش هماهنگ کنید."},
 {icon:"truck" as const,title:"هماهنگی ارسال سفارش",text:"درباره امکان و شرایط ارسال به شهرستان و شیوه تحویل، هنگام استعلام با فروشگاه هماهنگ کنید."},
 {icon:"package" as const,title:"خرید عمده و حضوری",text:"تمرکز فروشگاه بر تأمین عمده است و برای مراجعه حضوری می‌توانید از نشانی و مسیر‌یابی پایین صفحه استفاده کنید."}
];
export default function ContactPage(){return <>
 <SiteHeader/>
 <main className="v4-page v4-contact-page">
  <div className="container"><nav className="breadcrumb v4-breadcrumb" aria-label="مسیر صفحه"><Link href="/">خانه</Link><Icon name="arrow-left" size={14}/><span aria-current="page">تماس با ما</span></nav></div>
  <section className="container" aria-labelledby="v4-contact-title"><div className="v4-contact-hero">
   <div className="v4-contact-copy"><span className="v4-kicker"><Icon name="phone" size={17}/> آشنایی و ارتباط با فروشگاه</span><h1 id="v4-contact-title">تماس با <span>خاجی پخش</span></h1><p>خاجی پخش با <strong>۱۰ سال سابقه فعالیت</strong> در حوزه کالای برق، بر فروش عمده تجهیزات الکتریکی ساختمانی، روشنایی و برق صنعتی تمرکز دارد. هدف ما کمک به انتخاب کالا، استعلام قیمت و هماهنگی سفارش از طریق ارتباط مستقیم با واحد فروش است.</p><div className="v4-hero-actions"><DemoContactButton className="button button-gold">تماس با فروش <Icon name="phone" size={17}/></DemoContactButton><a className="button button-outline" href="#store-location">آدرس و مسیریابی <Icon name="arrow" size={17}/></a></div></div>
   <div className="v4-contact-art"><div className="v4-contact-logo"><Image src="/images/identity/khaji-logo.jpg" alt="لوگوی اصلی خاجی" width={270} height={270} priority/></div><span>تأمین عمده تجهیزات الکتریکی</span></div>
  </div></section>
  <section className="v4-content-section" aria-labelledby="v4-contact-products"><div className="container"><div className="v4-section-head"><span className="eyebrow"><Image className="section-emblem" src="/images/ui/khaji-gold-emblem.png" width={25} height={29} alt="" aria-hidden="true"/>حوزه فعالیت</span><h2 id="v4-contact-products">چه محصولاتی را می‌توانید بررسی کنید؟</h2><p>برای فروش عمده انواع کالای برق ساختمانی و صنعتی، از دسته‌بندی‌های موجود برای شروع استعلام استفاده کنید.</p></div>
   <div className="v4-contact-categories">{categories.map(cat=><Link href={`/categories/${cat.slug}`} key={cat.slug}><span className="v4-small-image"><Image src={cat.image} alt="" fill sizes="(max-width: 580px) 35vw, 120px"/></span><strong>{cat.shortTitle}</strong><Icon name="arrow-left" size={16}/></Link>)}</div>
  </div></section>
  <section className="v4-content-section v4-contact-benefits" aria-labelledby="v4-contact-why"><div className="container"><div className="v4-section-head"><span className="eyebrow"><Image className="section-emblem" src="/images/ui/khaji-gold-emblem.png" width={25} height={29} alt="" aria-hidden="true"/>شیوه همکاری</span><h2 id="v4-contact-why">فروش عمده و ارتباط با مشتریان</h2><p>برای بررسی شرایط خرید، تأمین و تحویل، اطلاعات دقیق سفارش را در تماس با فروشگاه مطرح کنید.</p></div>
   <div className="v4-benefits-grid">{advantages.map(a=><article className="v4-benefit" key={a.title}><span className="v4-benefit-icon"><Icon name={a.icon} size={26}/></span><h3>{a.title}</h3><p>{a.text}</p></article>)}</div>
  </div></section>
  <section className="v4-content-section v4-location-section" id="store-location" aria-labelledby="v4-contact-location"><div className="container"><div className="v4-section-head"><span className="eyebrow"><Image className="section-emblem" src="/images/ui/khaji-gold-emblem.png" width={25} height={29} alt="" aria-hidden="true"/>مراجعه حضوری</span><h2 id="v4-contact-location">آدرس و شماره تماس خاجی پخش</h2><p>برای هماهنگی مراجعه حضوری یا بررسی قیمت و موجودی، از شماره تلفن و لینک مسیریابی استفاده کنید.</p></div>
   <div className="v4-location-grid"><div className="v4-location-details">
    <div className="v4-location-card"><span className="v4-location-icon"><Icon name="phone" size={23}/></span><div><h3>تلفن واحد فروش</h3><a href={SALES_TEL} dir="ltr" className="v4-contact-tel">{SALES_NUMBER}</a><p>برای استعلام کالا، قیمت و هماهنگی سفارش.</p></div></div>
    <div className="v4-location-card"><span className="v4-location-icon"><Icon name="grid" size={23}/></span><div><h3>آدرس فروشگاه</h3><address>{STORE_ADDRESS}</address><p>پیش از مراجعه، هماهنگی تلفنی توصیه می‌شود.</p></div></div>
    <a className="button button-gold v4-route-button" href={MAPS_LINK} target="_blank" rel="noopener noreferrer">مسیریابی به فروشگاه <Icon name="external" size={18}/></a>
   </div><div className="v4-location-map"><iframe title="موقعیت فروشگاه خاجی پخش در تهران روی نقشه گوگل" src={MAP_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/><div className="v4-map-caption"><span>موقعیت محدوده فروشگاه روی نقشه</span><a href={MAPS_LINK} target="_blank" rel="noopener noreferrer">باز کردن نقشه <Icon name="external" size={16}/></a></div></div></div>
  </div></section>
 </main>
 <SiteFooter/>
 </>}
