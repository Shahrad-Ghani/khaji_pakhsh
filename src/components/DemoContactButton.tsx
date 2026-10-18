import type {ReactNode} from "react";
import {SALES_TEL} from "@/content/site";
/** Native telephone deep link: opens phone dialer with number pre-filled on supported devices. */
export function DemoContactButton({className="",children}:{className?:string;children:ReactNode}) {
  return <a className={className} href={SALES_TEL} aria-label="تماس با واحد فروش با شماره ۰۹۱۲۴۷۱۸۶۵۴">{children}</a>;
}
