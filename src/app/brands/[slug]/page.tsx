import Image from "next/image";
import Link from "next/link";
import {notFound} from "next/navigation";
import {brands} from "@/content/site";
import {SiteHeader} from "@/components/SiteHeader";
import {Icon} from "@/components/Icon";
import {DemoContactButton} from "@/components/DemoContactButton";
export function generateStaticParams(){return brands.map(b=>({slug:b.slug}))}
export default async function BrandPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const item=brands.find(b=>b.slug===slug);if(!item)notFound();
 return <><SiteHeader/><main className="inner-page"><div className="container"><nav className="breadcrumb" aria-label="مسیر صفحه"><Link href="/">خانه</Link><Icon name="arrow-left" size={14}/><Link href="/#brands">برندها</Link><Icon name="arrow-left" size={14}/><span>{item.name}</span></nav><section className="inner-hero"><div className="inner-content"><span className="eyebrow">پیش‌نمایش صفحه برند</span><h1>محصولات برند {item.name}</h1><p>حوزه فعالیت: {item.field}. در نسخه عملیاتی این صفحه، محصولات واقعی، اطلاعات برند و لیست قیمت مربوط به آن قابل مشاهده خواهند بود.</p><Link className="button button-outline" href="/#brands">بازگشت به برندها <Icon name="arrow" size={16}/></Link> <DemoContactButton className="button button-gold">تماس با فروش <Icon name="phone" size={16}/></DemoContactButton></div><div className="inner-image brand-detail-image"><Image src={item.image} alt={`لوگوی برند ${item.name}`} fill sizes="(max-width: 720px) 100vw, 50vw"/></div></section><div className="inner-notice">در این دمو استفاده از تصویر برند به معنای ادعای نمایندگی رسمی نیست.</div></div></main></>;
}
