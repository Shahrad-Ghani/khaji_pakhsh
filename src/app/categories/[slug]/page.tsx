import Image from "next/image";
import Link from "next/link";
import {notFound} from "next/navigation";
import {categories} from "@/content/site";
import {SiteHeader} from "@/components/SiteHeader";
import {Icon} from "@/components/Icon";
import {DemoContactButton} from "@/components/DemoContactButton";
export function generateStaticParams(){return categories.map(c=>({slug:c.slug}))}
export default async function CategoryPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const item=categories.find(c=>c.slug===slug);if(!item)notFound();
 return <><SiteHeader/><main className="inner-page"><div className="container"><nav className="breadcrumb" aria-label="مسیر صفحه"><Link href="/">خانه</Link><Icon name="arrow-left" size={14}/><Link href="/#categories">دسته‌بندی‌ها</Link><Icon name="arrow-left" size={14}/><span>{item.title}</span></nav><section className="inner-hero"><div className="inner-content"><span className="eyebrow">پیش‌نمایش صفحه دسته‌بندی</span><h1>خرید عمده {item.title}</h1><p>{item.subtitle}. این صفحه به‌صورت نمایشی برای کامل بودن مسیرهای ناوبری آماده شده است. محتوا، کالاها و قیمت‌های واقعی در فازهای بعدی اضافه می‌شوند.</p><Link className="button button-outline" href="/#categories">بازگشت به دسته‌بندی‌ها <Icon name="arrow" size={16}/></Link> <DemoContactButton className="button button-gold">تماس با فروش <Icon name="phone" size={16}/></DemoContactButton></div><div className="inner-image"><Image src={item.image} alt={`تصویر دسته ${item.title}`} fill sizes="(max-width: 720px) 100vw, 50vw"/></div></section><div className="inner-notice">این یک صفحه داخلی آزمایشی است؛ محدوده فاز اول پروژه، طراحی کامل صفحه اصلی است.</div></div></main></>;
}
