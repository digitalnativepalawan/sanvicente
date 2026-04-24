import { supabase } from "@/integrations/supabase/client";
import type { Business } from "@/types/business";

export type ClaimStatus = "pending" | "approved" | "rejected";

export interface ClaimRecord {
  id: string;
  business_id: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  owner_message: string | null;
  proposed_data: Partial<Business>;
  status: ClaimStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const CLAIMS_TABLE = "business_claims" as const;

export const submitClaim = async (input: {
  businessId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerMessage?: string;
  proposedData: Partial<Business>;
}) => {
  const { data, error } = await supabase
    .from(CLAIMS_TABLE as any)
    .insert({
      business_id: input.businessId,
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
  return data as unknown as ClaimRecord;
};

export const listClaims = async (status?: ClaimStatus) => {
  let q = supabase.from(CLAIMS_TABLE as any).select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as ClaimRecord[];
};

export const updateClaimStatus = async (
  id: string,
  status: ClaimStatus,
  adminNotes?: string,
) => {
  const { error } = await supabase
    .from(CLAIMS_TABLE as any)
    .update({ status, admin_notes: adminNotes ?? null, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
};

export const deleteClaim = async (id: string) => {
  const { error } = await supabase.from(CLAIMS_TABLE as any).delete().eq("id", id);
  if (error) throw error;
};
