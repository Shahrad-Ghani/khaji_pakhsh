import Image from "next/image";
import Link from "next/link";
import {categories,SALES_TEL,SALES_NUMBER} from "@/content/site";
import {DemoContactButton} from "@/components/DemoContactButton";
import {Icon} from "@/components/Icon";

/** Keeps the V3 dark footer layout on new V4 inner pages. */
export function SiteFooter(){return <footer className="footer">
 <div className="container footer-main">
  <div className="footer-about"><Link className="footer-brand" href="/#home"><Image src="/images/identity/khaji-logo.jpg" alt="لوگوی اصلی خاجی" width={54} height={54}/><span>خاجی پخش<small>KHAJI ELECTRICAL</small></span></Link><p>تأمین عمده تجهیزات برق ساختمانی، صنعتی و روشنایی؛ انتخاب محصول، استعلام قیمت و ارتباط مستقیم با فروش.</p></div>
  <div className="footer-col"><h3>دسترسی سریع</h3><Link href="/#categories">دسته‌بندی محصولات</Link><Link href="/#brands">برندها</Link><Link href="/#price-lists">لیست قیمت</Link><Link href="/contact">تماس با ما</Link></div>
  <div className="footer-col"><h3>گروه‌های اصلی</h3>{categories.slice(0,4).map(c=><Link key={c.slug} href={`/categories/${c.slug}`}>{c.shortTitle}</Link>)}</div>
  <div className="footer-col"><h3>ارتباط با ما</h3><p>برای استعلام قیمت و هماهنگی خرید حضوری یا عمده تماس بگیرید.</p><a className="footer-phone-number" dir="ltr" href={SALES_TEL}>{SALES_NUMBER}</a><DemoContactButton className="footer-contact">تماس با فروش <Icon name="arrow" size={16}/></DemoContactButton></div>
 </div><div className="container footer-bottom"><span>© خاجی پخش — نسخه نمایشی طراحی سایت</span><span>Clean White & Gold <span className="gold-dot">✦</span></span></div>
 </footer>}
