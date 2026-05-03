'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Gallery() {
  // In a real build you would generate this list at build time.
  // For demo we show placeholders; replace with actual filenames or fetch via an API.
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);

  // Helper to close lightbox
  const closeLightbox = () => {
    setSelectedImg(null);
    setShowLightbox(false);
  };

  // Generate a list of image URLs – in production you could import all files from public/gallery
  // Here we just show 20 placeholders; replace with actual file names if you know them.
  const imageUrls = Array.from({ length: 20 }, (_, i) => `/gallery/${i + 1}.png`);

  return (
    <section style={{ padding: '2rem' }}>
      <h2>Gallery</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {imageUrls.map((src, idx) => (
          <div key={idx} style={{ position: 'relative', overflow: 'hidden', borderRadius: '4px', cursor: 'pointer' }}>
            <Image
              src={src}
              alt={`Sample ${idx + 1}`}
              fill
              style={{ objectFit: 'cover', display: 'block' }}
              onClick={() => {
                setSelectedImg(src);
                setShowLightbox(true);
              }}
            />
            {/* Optional overlay hint */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s',
            }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0'; }}>
              Zoom
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox overlay */}
      {showLightbox && selectedImg && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={closeLightbox}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <Image
              src={selectedImg}
              alt="Enlarged"
              style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '4px' }}
            />
            <button
              onClick={closeLightbox}
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}