import { ImageResponse } from "next/og";
import { pantherSvg } from "@/lib/pantherSvg";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/**
 * Rasterises the "Phantom Panther" mark (components/ui/Logo.tsx) for the browser
 * tab and installed-app icon. Geometry lives in lib/pantherSvg.ts.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <img
        width={size.width}
        height={size.height}
        src={`data:image/svg+xml,${encodeURIComponent(pantherSvg())}`}
        alt=""
      />
    ),
    size,
  );
}
