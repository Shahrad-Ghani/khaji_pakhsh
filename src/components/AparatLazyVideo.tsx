"use client";

import {useState} from "react";
import Image from "next/image";
import {Icon} from "@/components/Icon";

type Props = { videoId: string; poster: string; categoryName: string };
/** The Aparat iframe is NOT created or requested until the play button is clicked. */
export function AparatLazyVideo({videoId,poster,categoryName}:Props){
  const [playing,setPlaying]=useState(false);
  const safeId=/^[a-zA-Z0-9_-]+$/.test(videoId)?videoId:"";
  const watchUrl=`https://www.aparat.com/v/${safeId}`;
  const embedUrl=`https://www.aparat.com/video/video/embed/videohash/${safeId}/vt/frame`;
  return <div className="v4-video-shell">
    <div className="v4-video-frame">
      {playing&&safeId ?
        <iframe
          title={`پخش ویدئوی آپارات برای دسته ${categoryName}`}
          src={embedUrl}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
        /> :
        <button type="button" className="v4-video-cover" onClick={()=>setPlaying(true)} disabled={!safeId} aria-label={`پخش ویدئوی آپارات در دسته ${categoryName}`}>
          <Image src={poster} alt="" fill sizes="(max-width: 780px) 95vw, 70vw" className="v4-video-cover-image" />
          <span className="v4-video-shade" aria-hidden="true"/>
          <span className="v4-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="29" height="29" fill="currentColor"><path d="M8 5.5v13l10-6.5-10-6.5Z" /></svg></span>
          <span className="v4-video-hint">برای پخش ویدئو کلیک کنید</span>
        </button>
      }
    </div>
    <div className="v4-video-bottom">
      <span>ویدئوی مشترک آزمایشی؛ در نسخه نهایی، ویدئوی اختصاصی این دسته جایگزین می‌شود.</span>
      <a href={watchUrl} target="_blank" rel="noopener noreferrer">مشاهده در آپارات <Icon name="external" size={16}/></a>
    </div>
  </div>;
}
