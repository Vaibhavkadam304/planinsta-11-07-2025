"use server"

import { supabase } from "@/lib/supabase/server"

interface LeadData {
  name: string
  email: string
  phone: string
  source: string
}

export async function saveLead(leadData: LeadData) {
  try {
    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          source: leadData.source,
        },
      ])
      .select()

    if (error) {
      console.error("Error saving lead:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error saving lead:", error)
    return { success: false, error: "Failed to save lead" }
  }
}
