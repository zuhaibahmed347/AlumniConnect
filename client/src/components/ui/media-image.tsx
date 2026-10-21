import { useState, type ImgHTMLAttributes } from 'react'
import { cn } from 'cn'

export interface MediaImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'className' | 'src' | 'alt'> {
  src: string
  alt: string
  /** Outer box: controls size, radius and layout. */
  className?: string
  /** Applied to the <img> itself, e.g. a different object-position. */
  imgClassName?: string
  /** Loads eagerly with high fetch priority — for above-the-fold imagery only. */
  eager?: boolean
}

/**
 * Image that never breaks the layout.
 *
 * The <img> is layered over a branded Meridian Emerald & Obsidian gradient box,
 * so if the asset is missing or fails to load, the section keeps its shape and
 * displays a refined architectural fallback.
 */
export function MediaImage({
  src,
  alt,
  className,
  imgClassName,
  eager = false,
  ...props
}: MediaImageProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={cn(
        'relative isolate overflow-hidden bg-gradient-to-br from-[#091422] via-[#0D6E5B] to-[#102238]',
        className,
      )}
    >
      {failed ? (
        <div role="img" aria-label={alt} className="absolute inset-0 flex items-end p-5">
          <span className="text-xs leading-relaxed text-white/80 font-medium">{alt}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
          className={cn('h-full w-full object-cover', imgClassName)}
          {...props}
        />
      )}
    </div>
  )
}
