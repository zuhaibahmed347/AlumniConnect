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
 * The <img> is layered over a branded gradient box, so if the asset is missing
 * (not yet uploaded, typo in the path, 404 in production) the section keeps its
 * shape and shows the gradient instead of a broken-image icon or a collapsed
 * container. Static assets live in `public/images/` and are served verbatim.
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
        'relative isolate overflow-hidden bg-gradient-to-br from-navy via-primary to-violet',
        className,
      )}
    >
      {failed ? (
        <div role="img" aria-label={alt} className="absolute inset-0 flex items-end p-4">
          <span className="text-xs leading-relaxed text-white/70">{alt}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={eager ? 'high' : 'auto'}
          onError={() => setFailed(true)}
          className={cn('h-full w-full object-cover', imgClassName)}
          {...props}
        />
      )}
    </div>
  )
}
