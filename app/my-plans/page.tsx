// app/my-plans/page.tsx
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/database.types"; // ← your generated DB types

export default async function MyPlansPage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const { data: plans, error } = await supabase
    .from("business_plans")   // no need for a .from<PlanRecord>() generic
    .select("id, plan_name, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load plans:", error);
    throw new Error("Could not load your plans");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Plans</h1>
      {plans && plans.length > 0 ? (
        <ul className="space-y-4">
          {plans.map((plan) => (
            <li
              key={plan.id}
              className="p-4 border rounded hover:shadow-lg transition"
            >
              <Link
                href={`/plan-builder/${plan.id}`}
                className="block font-semibold text-lg hover:underline"
              >
                {plan.plan_name}
              </Link>
              <small className="text-gray-500">
                Created on {new Date(plan.created_at).toLocaleDateString()}
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven’t generated any plans yet.</p>
      )}
    </div>
  );
}
