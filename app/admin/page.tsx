"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  IndianRupee,
  Users,
  Trophy,
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
} from "lucide-react";

interface RegistrationData {
  _id: string;
  eventId?: {
    title: string;
    fees: number;
  };
  teamId?: {
    name: string;
    leaderId?: {
      username: string;
      email: string;
      phone?: string;
    };
  };
  paymentStatus: string;
  amountExpected?: number;
  amountPaid?: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

export default function AdminPage() {
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchRegistrations();
  }, [statusFilter]);

  async function fetchRegistrations() {
    try {
      const params = new URLSearchParams({
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const res = await fetch(`/api/admin/registrations?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Access denied");
        return;
      }

      setRegistrations(data.registrations || []);
    } catch (e) {
      console.error(e);
      setMessage("Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  }

  async function verifyPayment(
    registrationId: string,
    action: "verify" | "reject",
  ) {
    try {
      const notes =
        action === "reject"
          ? window.prompt("Reason for rejection:")
          : undefined;

      const res = await fetch("/api/admin/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId,
          action,
          notes,
        }),
      });

      const data = await res.json();
      setMessage(data.message);
      fetchRegistrations();
    } catch (e) {
      console.error(e);
    }
  }

  // Calculate stats
  const stats = {
    totalRegistrations: registrations.length,
    paidCount: registrations.filter((r) =>
      ["paid", "manual_verified"].includes(r.paymentStatus),
    ).length,
    pendingCount: registrations.filter((r) =>
      ["initiated", "pending", "verification_pending"].includes(
        r.paymentStatus,
      ),
    ).length,
    totalRevenue: registrations
      .filter((r) => ["paid", "manual_verified"].includes(r.paymentStatus))
      .reduce((sum, r) => sum + (r.amountPaid || r.amountExpected || 0), 0),
  };

  if (loading)
    return <div className="text-white p-8">Loading admin panel...</div>;

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 flex items-center gap-3">
        <LayoutDashboard className="text-cyan-400" /> Admin Dashboard
      </h1>

      {message && (
        <div className="bg-cyan-500/10 border border-cyan-500 text-cyan-400 px-4 py-3 rounded-lg mb-6 text-sm">
          {message}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          icon={FileCheck}
          label="Total Registrations"
          value={stats.totalRegistrations}
          color="cyan"
        />
        <StatCard
          icon={CheckCircle}
          label="Paid"
          value={stats.paidCount}
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.pendingCount}
          color="yellow"
        />
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          color="emerald"
        />
      </div>

      {/* Filter */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-[200px]">
            <Filter size={20} className="text-gray-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm outline-none focus:border-cyan-400 transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="manual_verified">Manually Verified</option>
              <option value="initiated">Initiated</option>
              <option value="pending">Pending Payment</option>
              <option value="verification_pending">Verification Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-gray-900">
              <tr className="text-left text-gray-400 whitespace-nowrap">
                <th className="px-4 md:px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">
                  Team_Profile
                </th>
                <th className="px-4 md:px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">
                  Event_Target
                </th>
                <th className="px-4 md:px-6 py-4 font-semibold uppercase tracking-wider text-[10px] hidden md:table-cell">
                  Contact_Net
                </th>
                <th className="px-4 md:px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">
                  Financials
                </th>
                <th className="px-4 md:px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">
                  Status_Code
                </th>
                <th className="px-4 md:px-6 py-4 font-semibold uppercase tracking-wider text-[10px] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {registrations.map((reg) => (
                <tr
                  key={reg._id}
                  className="hover:bg-gray-800/50 transition-colors whitespace-nowrap"
                >
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-white font-bold">
                        {reg.teamId?.name || "Independent"}
                      </span>
                      <span className="text-gray-500 text-[10px]">
                        {reg.teamId?.leaderId?.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-white font-medium">
                    {reg.eventId?.title || "N/A"}
                  </td>
                  <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                    <div className="flex flex-col text-[11px]">
                      <span className="text-gray-400">
                        {reg.teamId?.leaderId?.email}
                      </span>
                      <span className="text-cyan-500/70">
                        {reg.teamId?.leaderId?.phone}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-white font-mono">
                        ₹{reg.amountExpected || 0}
                      </span>
                      {reg.amountPaid !== undefined && reg.amountPaid > 0 && (
                        <span className="text-green-400 text-[10px]">
                          Recv: ₹{reg.amountPaid}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <StatusBadge status={reg.paymentStatus} />
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    {[
                      "initiated",
                      "pending",
                      "verification_pending",
                      "failed",
                    ].includes(reg.paymentStatus) && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => verifyPayment(reg._id, "verify")}
                          className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-all"
                          title="Verify Payment"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => verifyPayment(reg._id, "reject")}
                          className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {registrations.length === 0 && (
            <div className="text-center py-12 text-gray-500 font-mono text-sm">
              ZERO_RECORDS_MATCH_QUERY
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof IndianRupee;
  label: string;
  value: number | string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    cyan: "text-cyan-400 bg-cyan-500/10",
    green: "text-green-400 bg-green-500/10",
    yellow: "text-yellow-400 bg-yellow-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; bg: string }> = {
    paid: { color: "text-green-400", bg: "bg-green-500/10" },
    manual_verified: { color: "text-green-400", bg: "bg-green-500/10" },
    initiated: { color: "text-yellow-400", bg: "bg-yellow-500/10" },
    pending: { color: "text-yellow-400", bg: "bg-yellow-500/10" },
    verification_pending: { color: "text-orange-400", bg: "bg-orange-500/10" },
    failed: { color: "text-red-400", bg: "bg-red-500/10" },
    refunded: { color: "text-gray-400", bg: "bg-gray-500/10" },
  };

  const { color, bg } = config[status] || config.pending;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${bg} ${color}`}
    >
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
}
