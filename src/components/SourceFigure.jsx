import { useEffect, useRef, useState } from 'react';

export default function SourceFigure({ src, alt, openLabel, aspectRatio }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageRef.current?.complete) {
      if (imageRef.current.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, [src]);

  return (
    <figure className={`diagram-card source-figure${loaded ? ' loaded' : ''}${failed ? ' unavailable' : ''}`} style={{ '--figure-ratio': aspectRatio }}>
      <div className="diagram-heading">
        <strong>{alt}</strong>
        <button className="figure-zoom" type="button" data-action="zoom" aria-label={`ขยายภาพ ${alt}`}>ขยาย ↗</button>
      </div>
      <a className="source-figure-link" href={src} target="_blank" rel="noreferrer" aria-label={openLabel}>
        <img ref={imageRef} src={src} alt={alt} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
      </a>
      {failed && <div className="source-figure-missing" role="img" aria-label={alt}>
        <strong>{alt}</strong>
        <span>ยังไม่สามารถโหลดภาพต้นฉบับได้</span>
      </div>}
      {loaded && <figcaption><a href={src} target="_blank" rel="noreferrer">{openLabel} ↗</a></figcaption>}
    </figure>
  );
}
