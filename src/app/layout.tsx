import type {Metadata,Viewport} from "next";
import "./globals.css";
export const metadata:Metadata={
 title:"خاجی پخش | فروش عمده تجهیزات الکتریکی",
 description:"پیش‌نمایش طراحی وب‌سایت خاجی پخش؛ دسته‌بندی سیم و کابل، کلید و پریز، روشنایی و تجهیزات برق صنعتی.",
 robots:{index:false,follow:false},
};
export const viewport:Viewport={width:"device-width",initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="fa" dir="rtl"><body>{children}</body></html>}
