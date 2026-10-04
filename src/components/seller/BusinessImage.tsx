"use client";

import ContentSkeleton from "@/components/common/ContentSkeleton";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Building2 } from "lucide-react";
import { getBusinessImage, saveBusinessImage, sellerErrorMessage, type SellerBusiness } from "@/lib/api/seller";

export default function BusinessImage({ business, onUpdated, onBusyChange, thumbnail = false }: {
  business: SellerBusiness;
  onUpdated?: (business: SellerBusiness) => void;
  onBusyChange?: (busy: boolean) => void;
  thumbnail?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(business.profile_image_key));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!business.profile_image_key) return;
    getBusinessImage(business.id).then((image) => {
      if (!cancelled) { setUrl(image.url); setError(null); }
    }).catch(() => {
      if (!cancelled) setError("The business photo could not be loaded.");
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [business.id, business.profile_image_key, retry]);

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || uploading) return;
    setUploading(true); setError(null); onBusyChange?.(true);
    try {
      const updated = await saveBusinessImage(business.id, file);
      setLoading(true);
      onUpdated?.(updated);
      setRetry((value) => value + 1);
    } catch (error) { setError(sellerErrorMessage(error)); }
    finally { setUploading(false); onBusyChange?.(false); }
  };

  return <div className={thumbnail ? "business-photo business-photo--thumbnail" : "business-photo"}>
    {url ? <img src={url} alt={`${business.dba || business.legal_name || "Business"} photo`}
      onError={() => { setUrl(null); setError("The business photo could not be loaded."); }} />
      : <div className="business-photo__placeholder">{loading ? <ContentSkeleton shape="photo" label="Loading business photo" /> : <><Building2 size={thumbnail ? 28 : 44} aria-hidden="true" /><span>Add a business photo</span></>}</div>}
    {!thumbnail && <>
      {onUpdated && <>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden
          aria-label="Business photo" onChange={upload} disabled={uploading} />
        <button type="button" className="business-photo__upload" disabled={uploading} onClick={() => input.current?.click()}>
          <ImagePlus size={18} aria-hidden="true" />{uploading ? "Uploading photo…" : url ? "Change business photo" : "Upload business photo"}
        </button>
      </>}
      {error && <div className="business-photo__error" role="alert">{error}
        {business.profile_image_key && <button type="button" disabled={uploading} onClick={() => {
          setLoading(true); setRetry((value) => value + 1);
        }}>Retry photo</button>}
      </div>}
    </>}
  </div>;
}
