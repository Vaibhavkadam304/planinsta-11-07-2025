import { cookies, headers } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { notFound } from "next/navigation";
import FinalPlanClient from "./FinalPlanClient";

type Props = { params: { planId: string } };

export default async function PlanDetailPage({ params }: Props) {
  const { planId } = params;

  const cookieStore = await cookies();
  const headerList = await headers();

  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
    headers: () => headerList,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data, error } = await supabase
    .from("business_plans")
    .select("id, plan_name, created_at, plan_data")
    .eq("id", planId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <FinalPlanClient
        id={data.id}
        planName={data.plan_name}
        createdAt={data.created_at}
        planData={data.plan_data}
      />
    </div>
  );
}
