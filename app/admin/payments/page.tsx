"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  IndianRupee,
  Filter,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";

interface Member {
  _id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

interface PaymentEvent {
  eventId: {
    _id: string;
    title: string;
    eventId: string;
    fees: number;
    category: string;
  };
  selectedMembers: Member[];
  coordinator?: {
    name: string;
    phone: string;
  };
}

interface PaymentSubmission {
  _id: string;
  clerkId: string;
  transactionId: string;
  screenshotUrl: string;
  totalAmount: number;
  events: PaymentEvent[];
  status: "pending" | "verified" | "rejected";
  leaderEmail: string;
  leaderName: string;
  leaderFullName?: string;
  leaderPhone: string;
  teamId?: { name: string };
  rejectionReason?: string;
  createdAt: string;
  verifiedAt?: string;
}

interface Stats {
  pending: number;
  verified: number;
  rejected: number;
  totalRevenue: number;
}

export default function AdminPaymentsPage() {
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    verified: 0,
    rejected: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "verified" | "rejected"
  >("pending");
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: "verify" | "reject";
  } | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payments?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
        setStats(
          data.stats || {
            pending: 0,
            verified: 0,
            rejected: 0,
            totalRevenue: 0,
          },
        );
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  async function handleAction(
    submissionId: string,
    action: "verify" | "reject",
  ) {
    if (action === "reject" && !rejectReason.trim()) {
      setShowRejectModal(submissionId);
      return;
    }

    // Require confirmation
    if (
      !confirmAction ||
      confirmAction.id !== submissionId ||
      confirmAction.action !== action
    ) {
      setConfirmAction({ id: submissionId, action });
      return;
    }

    setProcessing(submissionId);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          action,
          rejectionReason: rejectReason,
        }),
      });

      if (res.ok) {
        await fetchSubmissions();
        setShowRejectModal(null);
        setConfirmAction(null);
        setRejectReason("");
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setProcessing(null);
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-mono">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#00F0FF] uppercase">
              Payment Verification
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Review and verify manual payment submissions
            </p>
          </div>
          <button
            onClick={fetchSubmissions}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 flex sm:flex-col justify-between items-center sm:items-start">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <IndianRupee size={18} />
              <span className="text-[10px] md:text-sm uppercase font-bold tracking-wider">
                Total Revenue
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-black text-cyan-400 leading-none">
              ₹{stats.totalRevenue || 0}
            </p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex sm:flex-col justify-between items-center sm:items-start">
            <div className="flex items-center gap-2 text-yellow-400 mb-1">
              <Clock size={18} />
              <span className="text-[10px] md:text-sm uppercase font-bold tracking-wider">
                Pending
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-black text-yellow-400 leading-none">
              {stats.pending}
            </p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex sm:flex-col justify-between items-center sm:items-start">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <CheckCircle size={18} />
              <span className="text-[10px] md:text-sm uppercase font-bold tracking-wider">
                Verified
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-black text-green-400 leading-none">
              {stats.verified}
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex sm:flex-col justify-between items-center sm:items-start">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <XCircle size={18} />
              <span className="text-[10px] md:text-sm uppercase font-bold tracking-wider">
                Rejected
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-black text-red-400 leading-none">
              {stats.rejected}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(["pending", "verified", "rejected", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold uppercase transition-colors whitespace-nowrap ${
                filter === f
                  ? "bg-[#00F0FF] text-black"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#00F0FF]" size={40} />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <Filter size={48} className="mx-auto mb-4 opacity-50" />
            <p>No {filter === "all" ? "" : filter} submissions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub._id}
                className={`bg-[#111] border rounded-xl p-4 md:p-6 ${
                  sub.status === "pending"
                    ? "border-yellow-500/30"
                    : sub.status === "verified"
                      ? "border-green-500/30"
                      : "border-red-500/30"
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Screenshot */}
                  <div className="w-full lg:w-48 h-48 bg-zinc-900 rounded-xl overflow-hidden relative shrink-0">
                    {sub.screenshotUrl === "FREE_EVENT" ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/50 border border-white/10">
                        <CheckCircle
                          className="text-green-500 mb-2"
                          size={32}
                        />
                        <span className="text-xs font-bold uppercase">
                          Free Event
                        </span>
                        <span className="text-[10px] opacity-70">
                          No Payment Needed
                        </span>
                      </div>
                    ) : (
                      <div
                        className="w-full h-full relative cursor-pointer group"
                        onClick={() => setSelectedImage(sub.screenshotUrl)}
                      >
                        <Image
                          src={sub.screenshotUrl}
                          alt="Payment screenshot"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          sub.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : sub.status === "verified"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {sub.status}
                      </span>
                      <span className="text-zinc-500 text-xs">
                        {formatDate(sub.createdAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-zinc-500 block text-xs uppercase mb-1">
                          Leader
                        </span>
                        <span className="text-white font-bold">
                          {sub.leaderFullName || sub.leaderName}
                        </span>
                        <div className="flex flex-col text-xs">
                          <span className="text-zinc-400">
                            {sub.leaderEmail}
                          </span>
                          <span className="text-[#00F0FF] mt-0.5">
                            {sub.leaderPhone}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-xs uppercase mb-1">
                          Team
                        </span>
                        <span className="text-white">
                          {sub.teamId?.name || "Individual"}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-xs uppercase mb-1">
                          Transaction ID
                        </span>
                        <code className="text-[#00F0FF] bg-zinc-900 px-2 py-1 rounded text-xs">
                          {sub.transactionId}
                        </code>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-xs uppercase mb-1">
                          Amount
                        </span>
                        <span className="text-xl font-black text-white">
                          ₹{sub.totalAmount}
                        </span>
                      </div>
                    </div>

                    {/* Events */}
                    <div className="mt-4">
                      <span className="text-zinc-500 block text-xs uppercase mb-2">
                        Events & Members
                      </span>
                      <div className="grid grid-cols-1 gap-3">
                        {sub.events.map((e, i) => {
                          const fees = e.eventId?.fees || 0;
                          const title = e.eventId?.title || "Unknown Event";

                          return (
                            <div
                              key={i}
                              className="bg-zinc-900/50 border border-white/5 rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-bold text-xs">
                                  {title}
                                </span>
                                <span className="text-zinc-500 text-[10px]">
                                  ₹{fees}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {e.selectedMembers?.length > 0 ? (
                                  e.selectedMembers.map((member) => {
                                    const fullName = [
                                      member.firstName,
                                      member.lastName,
                                    ]
                                      .filter(Boolean)
                                      .join(" ");
                                    return (
                                      <span
                                        key={member._id}
                                        title={member.username}
                                        className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-400 border border-white/5"
                                      >
                                        {fullName ||
                                          member.username ||
                                          "Unknown Member"}
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span className="text-zinc-600 text-[10px] italic">
                                    No members listed
                                  </span>
                                )}
                              </div>

                              {/* Coordinator info */}
                              {e.coordinator?.name && (
                                <div className="mt-2 flex items-center gap-2 px-2 py-1.5 bg-[#E661FF]/10 border border-[#E661FF]/30 rounded">
                                  <span className="text-[10px] text-[#E661FF] font-bold uppercase tracking-wide">Coordinator:</span>
                                  <span className="text-[10px] text-white font-mono">{e.coordinator.name}</span>
                                  <span className="text-[10px] text-zinc-400 font-mono">•</span>
                                  <span className="text-[10px] text-[#E661FF] font-mono">{e.coordinator.phone}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {sub.rejectionReason && (
                      <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
                        <strong>Rejection Reason:</strong> {sub.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(sub._id, "verify")}
                      disabled={processing === sub._id}
                      className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 border rounded-xl font-bold text-sm transition-colors disabled:opacity-50 ${
                        sub.status === "verified"
                          ? "bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30"
                          : "bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30"
                      }`}
                    >
                      {processing === sub._id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      {sub.status === "verified" ? "Re-verify" : "Verify"}
                    </button>

                    {sub.status !== "verified" && sub.status !== "rejected" && (
                      <button
                        onClick={() => setShowRejectModal(sub._id)}
                        disabled={processing === sub._id}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl font-bold text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <Image
              src={selectedImage}
              alt="Payment screenshot"
              width={800}
              height={600}
              className="object-contain w-full h-full rounded-xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70"
            >
              <XCircle size={24} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-zinc-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">
              Reject Payment
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white text-sm placeholder:text-zinc-600 focus:border-red-500/50 focus:outline-none resize-none h-24"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason("");
                }}
                className="flex-1 py-2 bg-zinc-800 text-white rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(showRejectModal, "reject")}
                disabled={
                  !rejectReason.trim() || processing === showRejectModal
                }
                className="flex-1 py-2 bg-red-500 text-white rounded-lg font-bold disabled:opacity-50"
              >
                {processing === showRejectModal ? (
                  <Loader2 size={16} className="animate-spin mx-auto" />
                ) : (
                  "Next: Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#00F0FF]/30 rounded-xl p-6 max-w-md w-full text-center">
            <div
              className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                confirmAction.action === "verify"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {confirmAction.action === "verify" ? (
                <CheckCircle size={32} />
              ) : (
                <XCircle size={32} />
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tighter">
              Confirm Action
            </h3>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Are you absolutely sure you want to{" "}
              <strong>{confirmAction.action}</strong> this payment?
              {confirmAction.action === "verify"
                ? " This will mark all related registrations as paid and cannot be easily undone."
                : " This will inform the user that their payment was rejected."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-700 transition-colors"
              >
                GO BACK
              </button>
              <button
                onClick={() =>
                  handleAction(confirmAction.id, confirmAction.action)
                }
                disabled={processing === confirmAction.id}
                className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                  confirmAction.action === "verify"
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {processing === confirmAction.id ? (
                  <Loader2 size={20} className="animate-spin mx-auto" />
                ) : (
                  "CONFIRM"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
