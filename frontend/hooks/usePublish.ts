import JSZip from "jszip";
import { FlattenedRow } from "@/app/dashboard/library/tables";
import { CarouselObjectType, VideoObjectType } from "./models";
import { toast } from "sonner";
import { useDialog } from "@/components/dialogs/dialog-provider";
import { BASE_URL, getToken } from "@/lib/utils";
import { Tables } from "@/database.types";

const base = process.env.NEXT_PUBLIC_API_URL;

// id should be job id + index of item in result set
export async function schedulePost(
  original: FlattenedRow,
  special_id: string,
  open_id: string,
  date: Date,
  title: string,
  caption: string
) {
  const token = await getToken();
  let payload = {};
  if (original.job_type === "VIDEO") {
    payload = {
      title: title,
      video_url: new URL(
        original.result?.generation as string,
        BASE_URL
      ).toString(),
      visibility: "PUBLIC",
    };
  } else {
    payload = {
      title: title,
      description: caption,
      visibility: "PUBLIC",
      items: (original.result?.generation as string[]).map((x) =>
        new URL(x, BASE_URL).toString()
      ),
    };
  }

  const r = await fetch(`${base}/publishing/schedule`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      special_reference_id: special_id,
      open_id: open_id,
      post_type: original.job_type,
      scheduled_at: date,
      payload: payload,
    }),
  });
  if (!r.ok) {
    const err = await r.json(); // parse JSON body
    console.log(err);
    throw new Error(err.detail || "Failed to schedule post");
  }
}

export async function updatePost(
  publishData: Tables<"publishing">,
  scheduleId: string,
  post_type: string,
  title: string,
  caption: string,
  newScheduleTime: Date,
  open_id: string
) {
  const token = await getToken();
  let payload = {};
  if (post_type === "VIDEO") {
    payload = {
      title: title,
      description: caption,
      video_url: (publishData.payload as any).video_url,
      visibility: "PUBLIC",
    };
  } else {
    payload = {
      title: title,
      description: caption,
      visibility: "PUBLIC",
      items: (publishData.payload as any).items || [],
    };
  }
  const r = await fetch(`${base}/publishing/reschedule/${scheduleId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      special_reference_id: publishData.special_reference_id,
      open_id: open_id,
      post_type: publishData.post_type,
      scheduled_at: newScheduleTime,
      payload: payload,
    }),
  });
  if (!r.ok) {
    const err = await r.json(); // parse JSON body
    console.log(err);
    throw new Error(err.detail || "Failed to schedule post");
  }
}

export async function publishNow(scheduleId: string) {
  const r = await fetch(`${base}/publishing/publish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: scheduleId }),
  });
  if (!r.ok) {
    const err = await r.json(); // parse JSON body
    console.log(err);
    throw new Error(err.detail || "Failed to publish post");
  }
}

export async function deletePost(scheduleId: string) {
  const r = await fetch(`${base}/publishing/delete/${scheduleId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });
  if (!r.ok) {
    const err = await r.json(); // parse JSON body
    console.log(err);
    throw new Error(err.detail || "Failed to delete post");
  }
}

const downloadBlob = (blob: Blob, filename: string) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
};

const fetchBlob = async (url: string) => {
  const r = await fetch(new URL(url, base).toString());
  if (!r.ok) throw new Error(`Issues with fetching file`);
  return await r.blob();
};

export async function DownloadPost(row: FlattenedRow) {
  if (row.job_type === "CAROUSEL") {
    const gen = (row.result as CarouselObjectType | null)?.generation ?? [];
    const zip = new JSZip();
    await Promise.all(
      gen.map(async (u: string, i: number) => {
        const b = await fetchBlob(u);
        zip.file(`image_${i + 1}.jpg`, b);
      })
    );
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, `carousel_${row.id || "post"}.zip`);
  } else if (row.job_type === "VIDEO") {
    const item: VideoObjectType | null = row.result as VideoObjectType | null;
    // One link
    const url = item?.generation;
    if (!url) throw new Error("No video URL found");
    const blob = await fetchBlob(url);
    downloadBlob(blob, `video_${row.id || "post"}.mp4`);
  }
}
