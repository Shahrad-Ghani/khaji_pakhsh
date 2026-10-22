import type { SVGProps } from "react";

type IconName = "arrow"|"arrow-left"|"search"|"menu"|"close"|"phone"|"chevron"|"shield"|"layers"|"file"|"message"|"truck"|"check"|"plus"|"sparkle"|"package"|"grid"|"clock"|"bolt"|"external";
export function Icon({name, size=20, className="", ...props}: {name:IconName; size?:number; className?:string} & SVGProps<SVGSVGElement>) {
  const common={width:size,height:size,fill:"none",stroke:"currentColor",strokeWidth:1.75,strokeLinecap:"round" as const,strokeLinejoin:"round" as const,viewBox:"0 0 24 24","aria-hidden":true as const,className,...props};
  const shapes: Record<IconName, React.ReactNode>={
    arrow:<><path d="M19 12H5m0 0 6-6m-6 6 6 6"/></>,
    "arrow-left":<><path d="m14 7-5 5 5 5"/></>,
    search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    menu:<><path d="M4 6h16M4 12h16M4 18h16"/></>,
    close:<><path d="M5 5l14 14M19 5 5 19"/></>,
    phone:<><path d="M21 16.4v3a2 2 0 0 1-2.2 2 17 17 0 0 1-7.5-2.7 17 17 0 0 1-5.2-5.2A17 17 0 0 1 3.4 6 2 2 0 0 1 5.4 3h3a2 2 0 0 1 2 1.7l.4 2.6a2 2 0 0 1-.6 1.7L8.8 10a14 14 0 0 0 5.2 5.2l1.1-1.4a2 2 0 0 1 1.7-.6l2.6.4a2 2 0 0 1 1.6 2.8Z"/></>,
    chevron:<><path d="m6 9 6 6 6-6"/></>,
    shield:<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
    layers:<><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/></>,
    file:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h7"/></>,
    message:<><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5Z"/></>,
    truck:<><path d="M3 5h12v12H3zM15 9h4l3 4v4h-7"/><circle cx="7.5" cy="18" r="2"/><circle cx="18.5" cy="18" r="2"/></>,
    check:<><path d="m5 12 4 4L19 6"/></>,
    plus:<><path d="M12 5v14M5 12h14"/></>,
    sparkle:<><path d="m12 2 2.3 7.7L22 12l-7.7 2.3L12 22l-2.3-7.7L2 12l7.7-2.3L12 2Z"/></>,
    package:<><path d="m12 2 9 5-9 5-9-5 9-5ZM3 7v10l9 5 9-5V7M12 12v10"/></>,
    grid:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    bolt:<><path d="m13 2-9 12h7l-1 8 10-12h-7l0-8Z"/></>,
    external:<><path d="M12 5h7v7m0-7-9 9"/><path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4"/></>
  };
  return <svg {...common}>{shapes[name]}</svg>;
}
