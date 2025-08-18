// utils/inlineHtmlAssets.ts
export async function inlineImages(html: string): Promise<string> {
  const imgTag = /<img[^>]+src=["'](http[s]?:\/\/[^"']+)["'][^>]*>/gi;
  const urls = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = imgTag.exec(html))) urls.add(m[1]);

  const urlToData = new Map<string, string>();
  await Promise.all(
    [...urls].map(async (url) => {
      const res = await fetch(url);
      const buf = await res.arrayBuffer();
      const mime = res.headers.get("content-type") || "image/png";
      const base64 = Buffer.from(buf).toString("base64");
      urlToData.set(url, `data:${mime};base64,${base64}`);
    })
  );

  return html.replace(imgTag, (tag, url) => tag.replace(url, urlToData.get(url)!));
}

// (Optional) strip external stylesheets – inline your CSS instead
export function stripExternalStyles(html: string): string {
  return html.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, "");
}
