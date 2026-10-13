import React, { useState } from 'react';
import { Package, X, ZoomIn, ImageOff } from 'lucide-react';

interface ProductThumbnailProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  enableZoom?: boolean;
  fallbackCategory?: string;
}

const sizeClasses = {
  xs: 'w-7 h-7 min-w-[28px] text-[10px] rounded-lg',
  sm: 'w-10 h-10 min-w-[40px] text-xs rounded-xl',
  md: 'w-14 h-14 min-w-[56px] text-sm rounded-xl',
  lg: 'w-20 h-20 min-w-[80px] text-base rounded-2xl',
  xl: 'w-28 h-28 min-w-[112px] text-lg rounded-2xl',
  full: 'w-full h-full text-base rounded-xl'
};

const iconSizes = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
  full: 'w-8 h-8'
};

export const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
  src,
  alt,
  size = 'md',
  className = '',
  enableZoom = false,
  fallbackCategory
}) => {
  const [hasError, setHasError] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const containerSizeClass = sizeClasses[size];
  const iconSizeClass = iconSizes[size];

  const handleOpenZoom = (e: React.MouseEvent) => {
    if (enableZoom && src && !hasError) {
      e.stopPropagation();
      setIsZoomOpen(true);
    }
  };

  const handleCloseZoom = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsZoomOpen(false);
  };

  const hasValidImage = Boolean(src && src.trim() !== '' && !hasError);

  return (
    <>
      <div
        onClick={enableZoom && hasValidImage ? handleOpenZoom : undefined}
        className={`relative overflow-hidden shrink-0 border border-slate-200/90 dark:border-slate-750 bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all ${containerSizeClass} ${
          enableZoom && hasValidImage ? 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 group shadow-2xs' : ''
        } ${className}`}
        title={enableZoom && hasValidImage ? `คลิกเพื่อดูรูปขยายของ ${alt}` : alt}
      >
        {hasValidImage ? (
          <>
            <img
              src={src}
              alt={alt}
              referrerPolicy="no-referrer"
              onError={() => setHasError(true)}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
            {enableZoom && (
              <div className="absolute inset-0 bg-slate-900/30 dark:bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ZoomIn className="w-3.5 h-3.5 text-white drop-shadow-md" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200/90 dark:from-slate-800 dark:to-slate-900 text-slate-400 dark:text-slate-500 p-1">
            <Package className={`${iconSizeClass} text-slate-400 dark:text-slate-500`} />
            {size === 'lg' || size === 'xl' ? (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium truncate max-w-full px-1">
                {fallbackCategory || 'ไม่มีรูป'}
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Lightbox Zoom Modal */}
      {isZoomOpen && src && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => handleCloseZoom()}
        >
          <div
            className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="min-w-0 pr-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{alt}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">รูปภาพสินค้าขยาย</p>
              </div>
              <button
                type="button"
                onClick={() => handleCloseZoom()}
                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Image */}
            <div className="p-4 bg-slate-100 dark:bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={src}
                alt={alt}
                referrerPolicy="no-referrer"
                className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl shadow-xs"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="truncate max-w-[280px] font-mono text-[11px]">{src}</span>
              <button
                type="button"
                onClick={() => handleCloseZoom()}
                className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium rounded-lg text-xs"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
