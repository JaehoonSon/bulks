/**
 * Request the server to zip multiple files and trigger a download in the browser.
 */
export async function downloadZip(
  fileUrls: string[],
  options?: { names?: string[]; zipName?: string }
): Promise<void> {
  if (!Array.isArray(fileUrls) || fileUrls.length === 0) return;
  const res = await fetch("/api/proxy-download-zip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      urls: fileUrls,
      names: options?.names,
      zipName: options?.zipName,
    }),
  });
  if (!res.ok) {
    console.error("Zip download failed", res.status, await res.text());
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = options?.zipName ?? "download.zip";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
