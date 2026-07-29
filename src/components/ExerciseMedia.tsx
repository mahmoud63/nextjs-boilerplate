"use client";

import { useState } from "react";
import { ExternalLink, PlayCircle } from "lucide-react";

type MediaKind = "youtube" | "video" | "image" | "external";

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)(\?|$)/i;
const IMAGE_EXT = /\.(gif|png|jpe?g|webp|avif)(\?|$)/i;

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "youtube-nocookie.com") return null;
    if (u.pathname === "/watch") return u.searchParams.get("v");
    const m = u.pathname.match(/^\/(embed|shorts|v)\/([^/?]+)/);
    return m ? m[2] : null;
  } catch {
    return null;
  }
}

/** Private blobs are not directly fetchable �?" they go through the authenticated proxy. */
function proxied(url: string): string {
  return url.includes("vercel-storage.com") ? `/api/blob?url=${encodeURIComponent(url)}` : url;
}

export function resolveMedia(url: string): { kind: MediaKind; src: string } {
  const yt = youtubeId(url);
  if (yt) return { kind: "youtube", src: `https://www.youtube-nocookie.com/embed/${yt}` };
  if (VIDEO_EXT.test(url)) return { kind: "video", src: proxied(url) };
  if (IMAGE_EXT.test(url)) return { kind: "image", src: proxied(url) };
  return { kind: "external", src: url };
}

export default function ExerciseMedia({
  videoUrl,
  imageUrl,
  name,
}: {
  videoUrl?: string | null;
  imageUrl?: string | null;
  name: string;
}) {
  const [playing, setPlaying] = useState(false);

  const media = videoUrl ? resolveMedia(videoUrl) : null;

  // Nothing embeddable �?" fall back to the still image, then to the outbound link.
  if (!media || media.kind === "external") {
    return (
      <div className="mt-4 space-y-2">
        {imageUrl && (
          <div className="overflow-hidden border border-line">
            <img src={proxied(imageUrl)} alt={name} className="w-full h-auto object-cover max-h-56" />
          </div>
        )}
        {media?.kind === "external" && (
          <a
            href={media.src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-line-strong px-3 py-2 text-eyebrow uppercase text-fg-muted hover:border-accent hover:text-accent transition-colors"
          >
            <ExternalLink size={14} /> Demo opens outside the app
          </a>
        )}
      </div>
    );
  }

  if (media.kind === "image") {
    return (
      <div className="mt-4 overflow-hidden border border-line">
        <img src={media.src} alt={`${name} demo`} className="w-full h-auto object-cover max-h-72" />
      </div>
    );
  }

  if (media.kind === "video") {
    return (
      <div className="mt-4 overflow-hidden border border-line bg-black">
        <video
          src={media.src}
          poster={imageUrl ? proxied(imageUrl) : undefined}
          controls
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full h-auto max-h-72"
        />
      </div>
    );
  }

  // YouTube: hold the iframe back behind a click so we don't hit YouTube on every page view.
  return (
    <div className="mt-4 overflow-hidden border border-line bg-black aspect-video relative">
      {playing ? (
        <iframe
          src={`${media.src}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={`${name} demo`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/90 hover:text-white transition-colors group"
        >
          {imageUrl && (
            <img
              src={proxied(imageUrl)}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity"
            />
          )}
          <PlayCircle size={48} className="relative group-hover:scale-110 transition-transform" />
          <span className="relative text-eyebrow uppercase">Play demo</span>
        </button>
      )}
    </div>
  );
}
