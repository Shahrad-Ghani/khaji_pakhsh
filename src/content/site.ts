export const SALES_TEL = "tel:+989124718654";
export const SALES_NUMBER = "۰۹۱۲۴۷۱۸۶۵۴";

/** Demo content: commercial information and prices are illustrative only. */
export type Category = {
  slug: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  image: string;
  countTag: string;
};

export const categories: Category[] = [
  {slug:"wire-cable",title:"سیم و کابل",shortTitle:"سیم و کابل",subtitle:"سیم افشان، کابل قدرت، کابل شبکه",image:"/images/categories/wire-cable.webp",countTag:"کابل و هادی"},
  {slug:"switches-sockets",title:"کلید و پریز",shortTitle:"کلید و پریز",subtitle:"کلید یک‌پل، دوپل، پریز ارت‌دار",image:"/images/categories/switches-sockets.webp",countTag:"برق ساختمانی"},
  {slug:"circuit-protection",title:"کلید مینیاتوری و حفاظتی",shortTitle:"تجهیزات حفاظتی",subtitle:"MCB، RCCB، RCBO و کلیدهای حفاظتی",image:"/images/categories/circuit-protection.webp",countTag:"حفاظت مدار"},
  {slug:"lighting",title:"روشنایی و لامپ",shortTitle:"روشنایی و لامپ",subtitle:"لامپ LED، پروژکتور، پنل سقفی",image:"/images/categories/lighting.webp",countTag:"نور و روشنایی"},
  {slug:"industrial",title:"تجهیزات برق صنعتی",shortTitle:"برق صنعتی",subtitle:"کنتاکتور، رله، تایمر، بی‌متال",image:"/images/categories/industrial.webp",countTag:"صنعت و کنترل"},
  {slug:"panels",title:"تابلو برق و متعلقات",shortTitle:"تابلو برق",subtitle:"جعبه فیوز، ترمینال، شینه و ریل",image:"/images/categories/panels.webp",countTag:"ملزومات تابلو"},
  {slug:"conduits",title:"لوله، داکت و متعلقات نصب",shortTitle:"لوله و داکت",subtitle:"لوله PVC، خرطومی، سینی کابل",image:"/images/categories/conduits.webp",countTag:"نصب و اجرا"},
  {slug:"accessories",title:"اتصالات و ملزومات برقی",shortTitle:"اتصالات برقی",subtitle:"کابلشو، سرسیم، گلند، بست کابل",image:"/images/categories/accessories.webp",countTag:"لوازم جانبی"},
];

export type Brand = {slug:string; name:string; image:string; field:string};
export const brands: Brand[] = [
  {slug:"afratab",name:"افراتاب",image:"/images/brands/afratab.webp",field:"روشنایی"},
  {slug:"afshar-nejad",name:"خراسان افشارنژاد",image:"/images/brands/afshar-nejad.webp",field:"سیم و کابل"},
  {slug:"alborz",name:"برق البرز",image:"/images/brands/alborz.webp",field:"کابل و الکتریک"},
  {slug:"deland",name:"دلند الکتریک",image:"/images/brands/deland.webp",field:"کلید و پریز"},
  {slug:"dena-electric",name:"دنا الکتریک ایرانیان",image:"/images/brands/dena-electric.webp",field:"تجهیزات حفاظتی"},
  {slug:"iran-electric",name:"ایران الکتریک",image:"/images/brands/iran-electric.webp",field:"کلید و پریز"},
  {slug:"mazi-noor",name:"مازی نور",image:"/images/brands/mazi-noor.webp",field:"روشنایی"},
  {slug:"pars-fanal",name:"پارس فانال",image:"/images/brands/pars-fanal.webp",field:"برق صنعتی"},
  {slug:"pars-shahab",name:"پارس شهاب",image:"/images/brands/pars-shahab.webp",field:"روشنایی"},
  {slug:"pars-shoa-toos",name:"پارس شعاع توس",image:"/images/brands/pars-shoa-toos.webp",field:"روشنایی"},
  {slug:"part-electric",name:"پارت الکتریک",image:"/images/brands/part-electric.webp",field:"کلید و پریز"},
  {slug:"damghan-cable",name:"سیم و کابل دامغان",image:"/images/brands/damghan-cable.webp",field:"سیم و کابل"},
  {slug:"shiva-amvaj",name:"شیوا امواج",image:"/images/brands/shiva-amvaj.webp",field:"کنترل صنعتی"},
];

/** All prices below are invented for presentation, never live price quotes. */
export type SamplePrice = {
 id:number; group:string; product:string; brand:string; unit:string; price:number|string;
};
export const samplePrices: SamplePrice[] = [
 {id:1,group:"سیم و کابل",product:"سیم افشان ۱٫۵ میلی‌متر",brand:"خراسان افشارنژاد",unit:"متر",price:18300},
 {id:2,group:"سیم و کابل",product:"سیم افشان ۲٫۵ میلی‌متر",brand:"سیم و کابل دامغان",unit:"متر",price:28400},
 {id:3,group:"کلید و پریز",product:"کلید یک‌پل سفید",brand:"دلند الکتریک",unit:"عدد",price:68000},
 {id:4,group:"کلید و پریز",product:"پریز ارت‌دار توکار",brand:"پارت الکتریک",unit:"عدد",price:74500},
 {id:5,group:"تجهیزات حفاظتی",product:"کلید مینیاتوری تک‌پل C16",brand:"پارس فانال",unit:"عدد",price:184000},
 {id:6,group:"تجهیزات حفاظتی",product:"کلید محافظ جان دوپل",brand:"دنا الکتریک",unit:"عدد",price:"استعلام"},
 {id:7,group:"روشنایی",product:"لامپ LED حبابی ۱۲ وات",brand:"افراتاب",unit:"عدد",price:53000},
 {id:8,group:"روشنایی",product:"پنل LED توکار",brand:"مازی نور",unit:"عدد",price:"استعلام"},
];

export const faNumber = (value: number) => new Intl.NumberFormat("fa-IR").format(value);
