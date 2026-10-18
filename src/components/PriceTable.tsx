"use client";
import {useMemo,useState} from "react";
import {faNumber,samplePrices} from "@/content/site";
import {Icon} from "./Icon";
import {DemoContactButton} from "./DemoContactButton";
const filters=["همه محصولات","سیم و کابل","کلید و پریز","تجهیزات حفاظتی","روشنایی"];
export function PriceTable(){
 const [active,setActive]=useState("همه محصولات");
 const rows=useMemo(()=>active==="همه محصولات"?samplePrices:samplePrices.filter(r=>r.group===active),[active]);
 return <div className="price-panel">
  <div className="price-panel-top"><div className="price-tabs" role="group" aria-label="فیلتر دسته قیمت">{filters.map(f=><button key={f} className={"price-tab "+(active===f?"selected":"")} aria-pressed={active===f} onClick={()=>setActive(f)}>{f}</button>)}</div><span className="table-counter">{faNumber(rows.length)} ردیف نمونه</span></div>
  <div className="table-scroll" tabIndex={0} aria-label="جدول قیمت نمونه با امکان پیمایش افقی"><table className="price-table"><caption className="sr-only">جدول نمونه قیمت عمده تجهیزات الکتریکی؛ هیچ‌یک از قیمت‌ها واقعی نیستند.</caption><thead><tr><th scope="col">ردیف</th><th scope="col">گروه کالا</th><th scope="col">نام محصول</th><th scope="col">برند</th><th scope="col">واحد</th><th scope="col">قیمت نمونه (تومان)</th><th scope="col">استعلام</th></tr></thead><tbody>{rows.map((r,i)=><tr key={r.id}><td className="table-index">{faNumber(i+1).padStart(2,"۰")}</td><td><span className="group-pill">{r.group}</span></td><td className="table-product">{r.product}</td><td>{r.brand}</td><td>{r.unit}</td><td>{typeof r.price==="number"?<span className="table-price">{faNumber(r.price)}</span>:<span className="inquiry-price">{r.price}</span>}</td><td><DemoContactButton className="table-action">تماس <Icon name="arrow" size={14}/></DemoContactButton></td></tr>)}</tbody></table></div>

 </div>
}
