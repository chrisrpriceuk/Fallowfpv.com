const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";
const asset = (path: string) => `${publicBasePath}${path}`;

type Props = {
  webpSrc: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
  loading?: "eager" | "lazy";
  decoding?: "async" | "auto" | "sync";
  ariaHidden?: boolean;
};

/**
 * WebP with PNG fallback for static /public assets (GitHub Pages friendly).
 */
export function PublicPicture({
  webpSrc,
  fallbackSrc,
  alt,
  className,
  width,
  height,
  loading = "lazy",
  decoding = "async",
  ariaHidden,
}: Props) {
  return (
    <picture>
      <source srcSet={asset(webpSrc)} type="image/webp" />
      <img
        src={asset(fallbackSrc)}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        aria-hidden={ariaHidden ? true : undefined}
      />
    </picture>
  );
}
