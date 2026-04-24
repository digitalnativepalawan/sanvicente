import { supabase } from "@/integrations/supabase/client";

const BUCKET = "business-uploads";
const MAX_BYTES = 3 * 1024 * 1024;

export class UploadError extends Error {}

const sanitize = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-").replace(/-+/g, "-");

/** Uploads a single image to Cloud storage and returns the public URL. */
export const uploadImage = async (file: File, folder = "biz", maxBytes = MAX_BYTES): Promise<string> => {
  if (!file.type.startsWith("image/")) throw new UploadError("Only image files are allowed.");
  if (file.size > maxBytes) throw new UploadError(`Image must be under ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${sanitize(file.name).slice(0, 40)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw new UploadError(error.message);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

export const uploadImages = async (files: File[], folder = "biz"): Promise<string[]> => {
  const out: string[] = [];
  for (const f of files) {
    out.push(await uploadImage(f, folder));
  }
  return out;
};
