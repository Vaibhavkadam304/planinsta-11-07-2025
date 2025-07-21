// app/dashboard/payments/page.tsx
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/dashboard-layout";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paid_at: string;
}

export default async function PaymentsPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return <p>Please sign in.</p>;

  const { data: payments } = await supabase
    .from<Payment>("payments")
    .select("id, amount, currency, status, paid_at")
    .eq("user_id", user.id)
    .order("paid_at", { ascending: false });

  return (
    <ProtectedRoute>
      <DashboardLayout currentPage="payments" userName={(user.user_metadata as any).full_name}>
        <h1 className="text-2xl mb-4">Payment History</h1>
        {!payments || payments.length === 0 ? (
          <p>No payments yet.</p>
        ) : (
          <table className="w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-right">Amount</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="odd:bg-white even:bg-gray-100">
                  <td className="p-2">{new Date(p.paid_at).toLocaleString()}</td>
                  <td className="p-2 text-right">
                    {p.currency} {(p.amount / 100).toFixed(2)}
                  </td>
                  <td className="p-2">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
