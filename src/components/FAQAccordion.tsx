"use client";
import {useState} from "react";
import {Icon} from "./Icon";
export type FAQItem={q:string;a:string};
export function FAQAccordion({items}:{items:FAQItem[]}){
 const [openIndex,setOpenIndex]=useState<number|null>(0);
 return <div className="faq-list">{items.map((item,i)=>{
  const open=openIndex===i;
  return <section className={`faq-item ${open?"is-open":""}`} key={item.q}>
   <h3><button type="button" className="faq-question" aria-expanded={open} aria-controls={`faq-answer-${i}`} id={`faq-question-${i}`} onClick={()=>setOpenIndex(open?null:i)}><span>{item.q}</span><Icon name="chevron" size={20}/></button></h3>
   <div className="faq-answer-outer" id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-question-${i}`} aria-hidden={!open}><div className="faq-answer-inner"><p>{item.a}</p></div></div>
  </section>;
 })}</div>;
}
