import { ImageResponse } from "next/og";
import { pantherSvg } from "@/lib/pantherSvg";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * iOS home-screen icon: same panther as icon.tsx, inset 12% — iOS masks the
 * corners, and the ear tips sit near the edge of the square.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <img
        width={size.width}
        height={size.height}
        src={`data:image/svg+xml,${encodeURIComponent(pantherSvg(0.12))}`}
        alt=""
      />
    ),
    size,
  );
}
