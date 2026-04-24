import { supabase } from "@/integrations/supabase/client";
import type { Business } from "@/types/business";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface SubmissionRecord {
  id: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  owner_message: string | null;
  proposed_data: Partial<Business>;
  status: SubmissionStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
  approved_business_id: string | null;
  created_at: string;
}

const TABLE = "business_submissions" as const;

export const submitListing = async (input: {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerMessage?: string;
  proposedData: Partial<Business>;
}) => {
  const { data, error } = await supabase
    .from(TABLE as any)
    .insert({
      owner_name: input.ownerName,
      owner_email: input.ownerEmail,
      owner_phone: input.ownerPhone,
      owner_message: input.ownerMessage ?? null,
      proposed_data: input.proposedData as any,
      status: "pending",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as SubmissionRecord;
};

export const listSubmissions = async (status?: SubmissionStatus) => {
  let q = supabase.from(TABLE as any).select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as SubmissionRecord[];
};

export const updateSubmission = async (
  id: string,
  patch: { status?: SubmissionStatus; admin_notes?: string | null; approved_business_id?: string | null },
) => {
  const { error } = await supabase
    .from(TABLE as any)
    .update({ ...patch, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
};

export const deleteSubmission = async (id: string) => {
  const { error } = await supabase.from(TABLE as any).delete().eq("id", id);
  if (error) throw error;
};
