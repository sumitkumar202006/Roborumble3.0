"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, X, UserPlus, Loader2, Users } from "lucide-react";

interface JoinRequest {
  _id: string;
  username: string;
  email: string;
  college?: string;
  avatarUrl?: string;
}

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({
  className = "",
}: NotificationBellProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/teams/join`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.joinRequests || []);
      }
    } catch (e) {
      console.error("Failed to fetch join requests:", e);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetchRequests();
    // Poll every 30 seconds for new requests
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const handleAction = async (
    targetUserId: string,
    action: "accept" | "reject",
  ) => {
    if (!session?.user) return;
    setActionLoading(targetUserId);
    try {
      const actionName =
        action === "accept" ? "accept_request" : "reject_request";
      const res = await fetch("/api/teams/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUserId,
          action: actionName,
        }),
      });
      if (res.ok) {
        // Remove from list
        setRequests((prev) => prev.filter((r) => r._id !== targetUserId));
      }
    } catch (e) {
      console.error("Action failed:", e);
    } finally {
      setActionLoading(null);
    }
  };

  const count = requests.length;

  return (
    <div className={`relative ${className}`}>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700/80 backdrop-blur-sm transition-all"
      >
        <Bell size={18} className="text-gray-400" />

        {/* Badge */}
        <AnimatePresence>
          {count > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center"
            >
              <span className="text-[10px] font-bold text-white">
                {count > 9 ? "9+" : count}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{
                type: "spring" as const,
                stiffness: 300,
                damping: 25,
              }}
              className="fixed md:absolute right-4 md:right-0 left-4 md:left-auto mt-2 md:w-80 bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[80vh] md:max-h-[400px]"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-700/50 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                <div className="flex items-center gap-2">
                  <UserPlus size={16} className="text-cyan-400" />
                  <span className="font-semibold text-white text-sm">
                    Join Requests
                  </span>
                  {count > 0 && (
                    <span className="ml-auto text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="max-h-72 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-cyan-400" size={20} />
                  </div>
                ) : requests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <Users size={24} className="mb-2 opacity-50" />
                    <span className="text-sm">No pending requests</span>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-700/50">
                    {requests.map((request) => (
                      <motion.div
                        key={request._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="p-3 hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {request.username?.[0]?.toUpperCase() || "?"}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {request.username}
                            </p>
                            <p className="text-gray-500 text-xs truncate">
                              {request.email}
                            </p>
                            {request.college && (
                              <p className="text-gray-600 text-xs truncate mt-0.5">
                                {request.college}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-2.5">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAction(request._id, "accept")}
                            disabled={actionLoading === request._id}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === request._id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Check size={12} />
                            )}
                            Accept
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAction(request._id, "reject")}
                            disabled={actionLoading === request._id}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          >
                            <X size={12} />
                            Decline
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
