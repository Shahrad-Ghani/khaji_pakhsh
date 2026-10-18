"use client";
import {useEffect,useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {categories,brands,SALES_TEL,SALES_NUMBER} from "@/content/site";
import {Icon} from "./Icon";

const simpleMenu=[
 {label:"صفحه اصلی",href:"/#home"},
 {label:"لیست قیمت",href:"/#price-lists"},

 {label:"تماس با ما",href:"/contact"},
];
export function SiteHeader(){
 const [menuOpen,setMenuOpen]=useState(false);
 const [expanded,setExpanded]=useState<"categories"|"brands"|null>(null);
 const [searchOpen,setSearchOpen]=useState(false);
 const closeMenu=()=>{setMenuOpen(false);setExpanded(null)};
 useEffect(()=>{
  const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape"){closeMenu();setSearchOpen(false)}};
  window.addEventListener("keydown",onKey);
  return()=>window.removeEventListener("keydown",onKey);
 },[]);
 return <>
  {/* 01 / Top strip: never imply a real promotion or shipping promise */}
  <div className="topbar"><div className="container topbar-inner"><span><span className="topbar-dot"/> تأمین عمده تجهیزات الکتریکی</span><a className="topbar-phone" href={SALES_TEL} dir="ltr"><Icon name="phone" size={14}/> {SALES_NUMBER}</a></div></div>
  {/* 02 / White header + separate navigation row. All layout changes are responsive. */}
  <header className="site-header">
   <div className="container header-inner">
    <Link href="/#home" className="brand-identity" aria-label="خاجی پخش — صفحه اصلی">
     <span className="header-logo"><Image src="/images/identity/khaji-logo.jpg" alt="لوگوی اصلی خاجی" width={94} height={94} priority/></span>
     <span className="header-wordmark"><strong>خاجی پخش</strong><small>KHAJI ELECTRICAL</small></span>
    </Link>
    <button type="button" className="header-search" onClick={()=>setSearchOpen(true)} aria-label="جست‌وجوی نمایشی محصولات"><span>جست‌وجوی محصولات، برندها و مدل کالا</span><Icon name="search" size={22}/></button>
    <div className="header-contact-area"><Icon name="phone" size={30}/><div><span>تماس با واحد فروش</span><a href={SALES_TEL} dir="ltr" className="header-phone-number">{SALES_NUMBER}</a></div></div>
    <div className="header-mobile-actions"><button type="button" className="icon-button mobile-search-toggle" aria-label="جست‌وجوی نمایشی" onClick={()=>setSearchOpen(true)}><Icon name="search"/></button><a className="icon-button mobile-call-link" href={SALES_TEL} aria-label={`تماس با فروش ${SALES_NUMBER}`}><Icon name="phone"/></a><button type="button" className="icon-button mobile-menu-toggle" aria-label={menuOpen?"بستن منو":"باز کردن منو"} aria-controls="khaji-mobile-nav" aria-expanded={menuOpen} onClick={()=>setMenuOpen(v=>!v)}><Icon name={menuOpen?"close":"menu"}/></button></div>
   </div>
   <div className="navigation-bar"><nav className="container desktop-nav" aria-label="منوی اصلی">
    <Link href="/#home">صفحه اصلی</Link>
    <div className="nav-dropdown-group"><Link href="/#categories" className="nav-dropdown-trigger">دسته‌بندی‌ها <Icon name="chevron" size={16}/></Link><div className="nav-dropdown nav-dropdown-categories"><span className="nav-dropdown-title">دسته‌بندی محصولات</span><div className="nav-dropdown-grid">{categories.map(item=><Link href={`/categories/${item.slug}`} key={item.slug}><span>{item.shortTitle}</span><Icon name="arrow-left" size={14}/></Link>)}</div></div></div>
    <div className="nav-dropdown-group"><Link href="/#brands" className="nav-dropdown-trigger">برندها <Icon name="chevron" size={16}/></Link><div className="nav-dropdown nav-dropdown-brands"><span className="nav-dropdown-title">برندهای قابل نمایش</span><div className="nav-dropdown-grid">{brands.map(item=><Link href={`/brands/${item.slug}`} key={item.slug}><span>{item.name}</span><Icon name="arrow-left" size={14}/></Link>)}</div></div></div>
    {simpleMenu.slice(1).map(item=><Link href={item.href} key={item.href}>{item.label}</Link>)}
   </nav></div>
   {menuOpen&&<nav className="mobile-nav" id="khaji-mobile-nav" aria-label="منوی موبایل">
    <Link href="/#home" onClick={closeMenu}>صفحه اصلی</Link>
    <div className="mobile-nav-group"><button type="button" aria-expanded={expanded==="categories"} aria-controls="khaji-mobile-categories" onClick={()=>setExpanded(expanded==="categories"?null:"categories")}>دسته‌بندی‌ها <Icon name="chevron" size={17}/></button><div id="khaji-mobile-categories" className={`mobile-subnav ${expanded==="categories"?"is-expanded":""}`}><div>{categories.map(c=><Link onClick={closeMenu} href={`/categories/${c.slug}`} key={c.slug}>{c.shortTitle}</Link>)}</div></div></div>
    <div className="mobile-nav-group"><button type="button" aria-expanded={expanded==="brands"} aria-controls="khaji-mobile-brands" onClick={()=>setExpanded(expanded==="brands"?null:"brands")}>برندها <Icon name="chevron" size={17}/></button><div id="khaji-mobile-brands" className={`mobile-subnav ${expanded==="brands"?"is-expanded":""}`}><div>{brands.map(b=><Link onClick={closeMenu} href={`/brands/${b.slug}`} key={b.slug}>{b.name}</Link>)}</div></div></div>
    {simpleMenu.slice(1).map(item=><Link href={item.href} key={item.href} onClick={closeMenu}>{item.label}</Link>)}
   </nav>}
  </header>
  {searchOpen&&<div className="modal-backdrop" onMouseDown={e=>{if(e.currentTarget===e.target)setSearchOpen(false)}}><div className="demo-modal" role="dialog" aria-modal="true" aria-labelledby="search-demo-title"><button className="icon-button modal-close" aria-label="بستن" onClick={()=>setSearchOpen(false)}><Icon name="close"/></button><span className="modal-icon"><Icon name="search" size={26}/></span><h2 id="search-demo-title">جست‌وجوی محصولات</h2><p>جست‌وجو در نسخه عملیاتی فعال خواهد شد. در این دمو می‌توانید از دسته‌بندی‌ها و کارت‌های برند استفاده کنید.</p><Link className="button button-gold modal-action" href="/#categories" onClick={()=>setSearchOpen(false)}>مشاهده دسته‌بندی‌ها <Icon name="arrow" size={16}/></Link></div></div>}
 </>;
}
