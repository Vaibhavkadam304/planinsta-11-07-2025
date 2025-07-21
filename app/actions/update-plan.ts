"use server";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { BusinessPlanData, GeneratedPlan } from "@/app/plan-builder/PlanBuilderClient"

export async function updatePlan(
  planId: string,
  formData: BusinessPlanData
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerComponentClient({ cookies });
  const { error } = await supabase
    .from("business_plans")
    .update({
      plan_name: formData.businessName,
      plan_data: formData,
    })
    .eq("id", planId);

  if (error) {
    console.error("Error updating plan:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
