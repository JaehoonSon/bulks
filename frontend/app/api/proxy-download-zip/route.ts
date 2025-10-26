export const runtime = "nodejs";

import { Zip, AsyncZipDeflate } from "fflate";

function getAllowedBaseUrl(): URL | null {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;
  try {
    return new URL(base);
  } catch {
    return null;
  }
}

function resolveTargetUrl(rawUrl: string): URL | null {
  const allowedBaseUrl = getAllowedBaseUrl();
  if (!allowedBaseUrl) return null;

  let target: URL;
  try {
    if (rawUrl.startsWith("/")) {
      target = new URL(rawUrl, allowedBaseUrl);
    } else {
      target = new URL(rawUrl);
    }
  } catch {
    return null;
  }

  if (target.host !== allowedBaseUrl.host) {
    return null;
  }

  return target;
}

type ZipRequestBody = {
  urls: string[];
  names?: string[];
  zipName?: string;
};

function pickEntryName(
  index: number,
  targetUrl: URL,
  provided?: string
): string {
  if (provided && provided.trim().length > 0) return provided.trim();
  const last =
    targetUrl.pathname.split("/").filter(Boolean).pop() || `file-${index + 1}`;
  // Ensure uniqueness by prefixing with index; avoids collisions on repeated names like 01.png
  const indexPrefix = String(index + 1).padStart(2, "0");
  return `${indexPrefix}-${last}`;
}

export async function POST(req: Request) {
  let body: ZipRequestBody | null = null;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!body || !Array.isArray(body.urls) || body.urls.length === 0) {
    return new Response("Missing urls array", { status: 400 });
  }

  const targets: { url: URL; name: string }[] = [];
  for (let i = 0; i < body.urls.length; i++) {
    const raw = body.urls[i];
    const target = resolveTargetUrl(raw);
    if (!target) {
      return new Response("Invalid or disallowed url in list", { status: 400 });
    }
    const name = pickEntryName(i, target, body.names?.[i]);
    targets.push({ url: target, name });
  }

  const zipFilename = (
    body.zipName && body.zipName.trim().length > 0
      ? body.zipName.trim()
      : "download.zip"
  ).replace(/[^\w\-\.]+/g, "-");

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const zip = new Zip(
        (err: Error | null, data: Uint8Array, final: boolean) => {
          if (err) {
            controller.error(err);
            return;
          }
          if (data) controller.enqueue(data);
          if (final) controller.close();
        }
      );

      (async () => {
        for (let i = 0; i < targets.length; i++) {
          const { url, name } = targets[i];
          const deflater = new AsyncZipDeflate(name);
          zip.add(deflater);
          const upstream = await fetch(url.toString(), {
            cache: "no-store",
            headers: { Accept: "*/*" },
          });
          if (!upstream.ok || !upstream.body) {
            // Close current entry to keep archive valid and abort
            deflater.push(new Uint8Array(0), true);
            throw new Error(`Upstream fetch failed: ${upstream.status}`);
          }

          const reader = upstream.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value && value.length > 0) {
              deflater.push(value);
            }
          }
          deflater.push(new Uint8Array(0), true);
        }

        zip.end();
      })().catch((e) => {
        controller.error(e);
      });
    },
    type: "bytes",
  });

  const headers = new Headers();
  headers.set("Content-Type", "application/zip");
  headers.set(
    "Content-Disposition",
    `attachment; filename*=UTF-8''${encodeURIComponent(zipFilename)}`
  );

  return new Response(stream, { status: 200, headers });
}
