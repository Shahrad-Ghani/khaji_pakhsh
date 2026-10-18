import type {CategorySampleItem} from "@/content/categoryDetails";
import {faNumber} from "@/content/site";
import {DemoContactButton} from "@/components/DemoContactButton";
import {Icon} from "@/components/Icon";

/** Server-rendered, crawlable HTML table. No synthetic or unverified prices. */
export function CategoryPriceTable({items,categoryName}:{items:CategorySampleItem[];categoryName:string}){
 return <div className="v4-pricelist price-panel">
  <div className="v4-price-head"><span>اقلام نمونه برای استعلام</span><span>{faNumber(items.length)} محصول نمونه</span></div>
  <div className="table-scroll" tabIndex={0} role="region" aria-label={`جدول نمونه محصولات ${categoryName} با پیمایش افقی`}>
   <table className="price-table v4-price-table">
    <caption className="sr-only">نمونه محصولات {categoryName}. هیچ قیمتی اعلام نشده و موجودی کالاها تأیید نشده است.</caption>
    <thead><tr><th scope="col">ردیف</th><th scope="col">نام کالا</th><th scope="col">مشخصات مورد استعلام</th><th scope="col">واحد پیشنهادی</th><th scope="col">قیمت عمده</th><th scope="col">ارتباط</th></tr></thead>
    <tbody>{items.map((item,i)=><tr key={`${item.name}-${i}`}>
      <td className="table-index">{faNumber(i+1)}</td>
      <td className="table-product">{item.name}</td>
      <td>{item.specification}</td>
      <td>{item.unit}</td>
      <td><span className="inquiry-price">استعلام قیمت</span></td>
      <td><DemoContactButton className="table-action">تماس <Icon name="phone" size={14}/></DemoContactButton></td>
    </tr>)}</tbody>
   </table>
  </div>
  <p className="v4-price-disclaimer"><Icon name="shield" size={18}/> این جدول برای نمایش ساختار دسته‌بندی است؛ قیمت، برند قابل تأمین، موجودی و شرایط فروش هر کالا باید تلفنی تأیید شود.</p>
 </div>;
}
