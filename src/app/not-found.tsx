import Link from "next/link";
import {SiteHeader} from "@/components/SiteHeader";
export default function NotFound(){return <><SiteHeader/><main className="inner-page"><div className="container" style={{textAlign:"center",padding:"100px 20px"}}><h1>صفحه موردنظر پیدا نشد</h1><p>این مسیر در نسخه نمایشی موجود نیست.</p><Link className="button button-gold" href="/">بازگشت به صفحه اصلی</Link></div></main></>}
