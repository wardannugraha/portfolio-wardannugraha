export interface EmbedInfo {
  isExternal: boolean;
  type: "youtube" | "vimeo" | "instagram" | "tiktok" | "figma" | "direct" | "unknown";
  embedUrl: string | null;
  thumbnailUrl: string | null;
}

export function parseEmbedUrl(url: string | null | undefined): EmbedInfo {
  if (!url) {
    return { isExternal: false, type: "unknown", embedUrl: null, thumbnailUrl: null };
  }

  const cleanUrl = url.trim();

  // 1. YouTube
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const ytMatch = cleanUrl.match(ytRegex);
  if (ytMatch) {
    const id = ytMatch[1];
    return {
      isExternal: true,
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${id}?rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    };
  }

  // 2. Vimeo
  const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
  const vimeoMatch = cleanUrl.match(vimeoRegex);
  if (vimeoMatch) {
    const id = vimeoMatch[3];
    return {
      isExternal: true,
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${id}`,
      thumbnailUrl: null,
    };
  }

  // 3. Instagram Reels or Posts (photos and short videos)
  const igRegex = /instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/;
  const igMatch = cleanUrl.match(igRegex);
  if (igMatch) {
    const id = igMatch[1];
    return {
      isExternal: true,
      type: "instagram",
      embedUrl: `https://www.instagram.com/p/${id}/embed/captioned/`,
      thumbnailUrl: null,
    };
  }

  // 4. TikTok
  const ttRegex = /tiktok\.com\/@.*\/video\/(\d+)/;
  const ttMatch = cleanUrl.match(ttRegex);
  if (ttMatch) {
    const id = ttMatch[1];
    return {
      isExternal: true,
      type: "tiktok",
      embedUrl: `https://www.tiktok.com/embed/v2/${id}`,
      thumbnailUrl: null,
    };
  }

  // 5. Figma designs, canvas, proto
  const figmaRegex = /figma\.com\/(?:file|design|proto)\/([a-zA-Z0-9_-]+)/;
  const figmaMatch = cleanUrl.match(figmaRegex);
  if (figmaMatch) {
    return {
      isExternal: true,
      type: "figma",
      embedUrl: `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(cleanUrl)}`,
      thumbnailUrl: null,
    };
  }

  // 6. Direct MP4/WebM Video
  const isDirectVideo = /\.(mp4|webm|ogg|mov|m4v)/i.test(cleanUrl);
  if (isDirectVideo) {
    return {
      isExternal: false,
      type: "direct",
      embedUrl: cleanUrl,
      thumbnailUrl: null,
    };
  }

  return {
    isExternal: false,
    type: "unknown",
    embedUrl: null,
    thumbnailUrl: null,
  };
}
