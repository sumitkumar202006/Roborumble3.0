"use client";


import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  Trophy,
  Users,
  Shield,
  Zap,
  Cpu,
  Bot,
  Gamepad2,
  Mic,
  Rocket,
  Magnet,
  CheckCircle,
  Clock,
  Loader2,
  Calendar,
  MapPin,
  ArrowRight,
  ShoppingCart,
  Plus,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { BiFootball } from "react-icons/bi";
import { useAudio } from "@/app/hooks/useAudio";
import CartSidebar from "@/app/components/CartSidebar";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface EventData {
  _id: string;
  eventId: string;
  title: string;
  category: string;
  description: string;
  teamSize: string;
  prize: string;
  fees: number;
  image?: string;
  rules: string[];
  currentRegistrations: number;
  maxRegistrations?: number;
  date?: string; // Adding date field for UI
  minTeamSize?: number;
  maxTeamSize?: number;
}

interface RegistrationStatus {
  eventId: string;
  status:
    | "registered"
    | "paid"
    | "pending"
    | "verification_pending"
    | "manual_verified";
}

// --- Icons Mapping ---
const getEventIcon = (category: string, eventId: string) => {
  if (eventId.includes("soccer")) return BiFootball;
  if (category === "Robotics") {
    if (eventId.includes("war")) return Shield;
    if (eventId.includes("line")) return Zap;
    if (eventId.includes("race")) return Bot;
    if (eventId.includes("pick")) return Magnet;
    return Bot;
  }
  if (category === "Aerial") return Cpu;
  if (category === "Gaming") return Gamepad2;
  if (category === "Innovation") return Users;
  if (category === "Seminar") return Mic;
  if (category === "Exhibition") return Rocket;
  return Trophy;
};

// --- Formatter Helper ---
const formatDate = (dateStr?: string) => {
  // Default to a fixed date if none provided, for demo purposes as requested
  const date = dateStr ? new Date(dateStr) : new Date("2026-03-16T09:00:00");
  const day = date.getDate();
  const month = date
    .toLocaleString("default", { month: "short" })
    .toUpperCase();
  const fullDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = "9:00 AM"; // Default time
  return { day, month, fullDate, time };
};

// --- Internal Component: HorizontalEventCard ---
const HorizontalEventCard = ({
  event,
  registration,
  onAddToCart,
  teamData,
  esportsTeamData,
  isInCart,
  addingToCart,
}: {
  event: EventData;
  registration?: RegistrationStatus;
  onAddToCart: (
    eventId: string,
    teamId?: string,
    selectedMembers?: string[],
  ) => void;
  teamData: any;
  esportsTeamData: any;
  isInCart: boolean;
  addingToCart: boolean;
}) => {
  const [showRosterDialog, setShowRosterDialog] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const isRegistered = !!registration;
  const isPaid =
    registration?.status === "paid" ||
    registration?.status === "manual_verified";
  const isVerifying = registration?.status === "verification_pending";
  const Icon = getEventIcon(event.category, event.eventId);
  const { day, month, fullDate, time } = formatDate(event.date);

  // Parse team size to get min/max allowed members
  const isTeamEvent =
    !event.teamSize.toLowerCase().includes("individual") &&
    !event.teamSize.toLowerCase().includes("open");
  const minTeamSize = event.minTeamSize || 1;
  const maxTeamSize =
    event.maxTeamSize || parseInt(event.teamSize.match(/(\d+)/g)?.pop() || "1");

  // Determine which team to use based on event category
  const isEsportsEvent = event.category === "Gaming";
  const activeTeam = isEsportsEvent ? esportsTeamData?.team : teamData?.team;
  const activeProfileId = isEsportsEvent
    ? esportsTeamData?.profileId
    : teamData?.profileId;

  // Initialize with team leader if available
  useEffect(() => {
    if (activeProfileId) {
      setSelectedMembers([activeProfileId]);
    }
  }, [activeProfileId]);

  const handleRegisterClick = () => {
    if (isTeamEvent && !activeTeam) {
      alert(
        `This event requires a team. Please create a ${isEsportsEvent ? "Esports " : ""}team in the '${isEsportsEvent ? "Esports Team" : "My Team"}' tab first.`,
      );
      return;
    }

    // Check if user is team leader for team events
    if (isTeamEvent && activeTeam) {
      const isLeader =
        activeTeam.leaderId === activeProfileId ||
        activeTeam.leaderId?._id === activeProfileId;

      if (!isLeader) {
        alert(`Only the team leader can add team events to cart.`);
        return;
      }

      // Show roster selection dialog
      setShowRosterDialog(true);
    } else {
      // Individual event - add to cart directly
      onAddToCart(event.eventId);
    }
  };

  const handleConfirmRoster = () => {
    if (selectedMembers.length < minTeamSize) {
      alert(
        `Please select at least ${minTeamSize} member${minTeamSize > 1 ? "s" : ""}`,
      );
      return;
    }
    if (selectedMembers.length > maxTeamSize) {
      alert(`Maximum ${maxTeamSize} members allowed`);
      return;
    }
    onAddToCart(event.eventId, activeTeam?._id, selectedMembers);
    setShowRosterDialog(false);
  };

  return (
    <>
      <div className="w-full bg-[#111] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group flex flex-col md:flex-row relative">
        {/* Left: Image Section */}
        <div className="md:w-[280px] h-[200px] md:h-auto relative shrink-0 overflow-hidden">
          {event.image ? (
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/10 to-[#E661FF]/10" />
              <Icon size={60} className="text-zinc-700 relative z-10" />
            </div>
          )}
          {/* Category Tag Overlay */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2 z-20">
            <Icon size={12} className="text-[#00F0FF]" />
            <span className="text-[10px] font-mono text-white/90 uppercase tracking-wider">
              {event.category}
            </span>
          </div>
        </div>

        {/* Right: Content Section */}
        <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col justify-center">
            {/* Header: Date Badge & Meta */}
            <div className="flex items-start gap-4 mb-3">
              <div className="flex flex-col items-center bg-zinc-800/50 rounded-lg p-2 min-w-[60px] border border-white/5">
                <span className="text-2xl font-black text-white leading-none">
                  {day}
                </span>
                <span className="text-[10px] font-black text-[#00F0FF] uppercase tracking-wider">
                  {month}
                </span>
              </div>
              <div className="flex flex-col pt-1">
                <span className="text-[#E661FF] font-mono text-xs font-bold tracking-wide flex items-center gap-2">
                  {fullDate} • {time}
                </span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-[#00F0FF] transition-colors mt-1">
                  {event.title}
                </h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-2 pl-[76px] font-mono">
              {event.description}
            </p>

            {/* Footer: Participants & Location */}
            <div className="flex items-center gap-6 pl-[76px]">
              <div className="flex items-center -space-x-2">
                {[1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border border-black bg-zinc-800 flex items-center justify-center text-[8px] text-zinc-500"
                  >
                    <Users size={10} />
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full border border-black bg-[#222] flex items-center justify-center">
                  <span className="text-[8px] text-white font-mono">
                    +{event.currentRegistrations || 10}
                  </span>
                </div>
              </div>
              <span className="text-zinc-500 text-xs font-mono">
                {event.currentRegistrations > 0
                  ? `${event.currentRegistrations} going`
                  : "Be the first"}
              </span>

              <div className="h-1 w-1 bg-zinc-700 rounded-full" />

              <span className="text-zinc-500 text-xs font-mono flex items-center gap-1">
                <MapPin size={12} /> CSJMU
              </span>
            </div>
          </div>

          {/* Far Right: Action Column */}
          <div className="flex md:flex-col items-center md:justify-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 shrink-0 min-w-[140px]">
            <div className="text-center">
              <p className="text-zinc-500 text-[10px] uppercase font-mono mb-1">
                Entry Fee
              </p>
              <p className="text-xl font-black text-white">
                {event.fees === 0 ? "FREE" : `₹${event.fees}`}
              </p>
            </div>

            {isPaid ? (
              <button
                disabled
                className="w-full px-4 py-2 bg-green-500/10 border border-green-500/50 text-green-400 font-bold font-mono text-xs rounded-lg uppercase flex items-center justify-center gap-2 cursor-default"
              >
                <CheckCircle size={14} /> Registered
              </button>
            ) : isVerifying ? (
              <button
                disabled
                className="w-full px-4 py-2 bg-orange-500/10 border border-orange-500/50 text-orange-400 font-bold font-mono text-xs rounded-lg uppercase flex items-center justify-center gap-2 cursor-default"
              >
                <Clock size={14} /> Verifying...
              </button>
            ) : isInCart ? (
              <button
                disabled
                className="w-full px-4 py-2 bg-[#00F0FF]/10 border border-[#00F0FF]/50 text-[#00F0FF] font-bold font-mono text-xs rounded-lg uppercase flex items-center justify-center gap-2 cursor-default"
              >
                <ShoppingCart size={14} /> In Cart
              </button>
            ) : addingToCart ? (
              <button
                disabled
                className="w-full px-4 py-2 bg-zinc-800 text-zinc-400 font-bold font-mono text-xs rounded-lg uppercase flex items-center justify-center gap-2"
              >
                <Loader2 size={14} className="animate-spin" /> Adding...
              </button>
            ) : (
              <button
                onClick={handleRegisterClick}
                className="w-full px-4 py-2 bg-white text-black font-black font-mono text-xs rounded-lg uppercase hover:bg-[#00F0FF] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              >
                <Plus size={14} /> Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Roster Selection Dialog */}
      {showRosterDialog && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#00F0FF] rounded-xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(0,240,255,0.3)]">
            <h3 className="text-xl font-black text-white font-mono mb-2 uppercase">
              Select Squad Members
            </h3>
            <p className="text-zinc-400 text-xs font-mono mb-4">
              Choose{" "}
              {minTeamSize === maxTeamSize
                ? minTeamSize
                : `${minTeamSize}-${maxTeamSize}`}{" "}
              members for {event.title}
            </p>

            <div className="mb-4 p-3 bg-zinc-900/50 border border-zinc-800 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase">
                    Team
                  </div>
                  <div className="text-white font-bold font-mono">
                    {activeTeam?.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase">
                    Selected
                  </div>
                  <div
                    className={`font-bold font-mono ${selectedMembers.length < minTeamSize || selectedMembers.length > maxTeamSize ? "text-red-500" : "text-[#00F0FF]"}`}
                  >
                    {selectedMembers.length} /{" "}
                    {minTeamSize === maxTeamSize
                      ? minTeamSize
                      : `${minTeamSize}-${maxTeamSize}`}
                  </div>
                </div>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
              {activeTeam?.members?.map((member: any) => (
                <label
                  key={member._id}
                  className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-all ${
                    selectedMembers.includes(member._id)
                      ? "bg-[#00F0FF]/10 border-[#00F0FF]"
                      : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedMembers.includes(member._id)}
                    onChange={() => {
                      if (selectedMembers.includes(member._id)) {
                        setSelectedMembers((prev) =>
                          prev.filter((id) => id !== member._id),
                        );
                      } else {
                        if (selectedMembers.length < maxTeamSize) {
                          setSelectedMembers((prev) => [...prev, member._id]);
                        }
                      }
                    }}
                  />
                  <div
                    className={`w-4 h-4 border flex items-center justify-center ${
                      selectedMembers.includes(member._id)
                        ? "border-[#00F0FF] bg-[#00F0FF]"
                        : "border-zinc-600"
                    }`}
                  >
                    {selectedMembers.includes(member._id) && (
                      <div className="w-2 h-2 bg-black" />
                    )}
                  </div>
                  <span className="text-sm font-mono text-white">
                    {member.username || member.email}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowRosterDialog(false)}
                className="flex-1 py-2 bg-zinc-800 text-white font-mono font-bold uppercase text-xs hover:bg-zinc-700 transition-all rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRoster}
                disabled={
                  selectedMembers.length < minTeamSize ||
                  selectedMembers.length > maxTeamSize
                }
                className="flex-[2] py-2 bg-[#00F0FF] text-black font-mono font-black uppercase text-xs hover:bg-white transition-all rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Squad
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function DashboardEventsPage() {
    const { data: session, status: sessionStatus } = useSession();

    const user = useMemo(() => {
        if (session?.user) {
            return {
                // @ts-ignore
                id: session.user.id,
                firstName: session.user.name?.split(" ")[0] || "Champion",
            };
        }
        return null;
    }, [session]);

    const isLoaded = sessionStatus !== "loading";

    const [events, setEvents] = useState<EventData[]>([]);
    const [registeredEvents, setRegisteredEvents] = useState<
        RegistrationStatus[]
    >([]);
    const [teamData, setTeamData] = useState<any>(null);
    const [esportsTeamData, setEsportsTeamData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState<string | null>(null);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Cart state
    const [cartItems, setCartItems] = useState<string[]>([]);
    const [cartCount, setCartCount] = useState(0);
    const [cartOpen, setCartOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState("Upcoming");

    async function fetchEvents() {
        try {
            const res = await fetch("/api/events");
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events || []);
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function fetchRegistrationStatus() {
        if (!session?.user) return;
        try {
            const res = await fetch("/api/profile/status");
            if (res.ok) {
                const data = await res.json();

                let statuses: RegistrationStatus[] = [];

                if (data.registrations) {
                    statuses = data.registrations.map((r: any) => ({
                        eventId: r.eventId,
                        status: r.status,
                    }));
                } else {
                    const userEvents = data.registeredEvents || [];
                    const paidEvents = data.paidEvents || [];

                    statuses = userEvents.map((eventId: string) => ({
                        eventId,
                        status: paidEvents.includes(eventId) ? "paid" : "registered",
                    }));
                }
                setRegisteredEvents(statuses);
            }
        } catch (e) {
            console.error(e);
        } finally {
            // Slight delay for smooth transition
            setTimeout(() => setLoading(false), 500);
        }
    }

    async function fetchTeamData() {
        if (!session?.user) return;
        try {
            // Fetch normal team
            const teamRes = await fetch(`/api/teams`);
            if (teamRes.ok) {
                const tData = await teamRes.json();
                setTeamData(tData);
            }

            // Fetch esports team
            const esportsRes = await fetch(
                `/api/teams?type=esports`,
            );
            if (esportsRes.ok) {
                const eData = await esportsRes.json();
                setEsportsTeamData(eData);
            }
        } catch (e) {
            console.error("Failed to fetch team data", e);
        }
    }

    async function fetchCart() {
        if (!session?.user) return;
        try {
            const res = await fetch("/api/cart");
            if (res.ok) {
                const data = await res.json();
                const eventIds =
                    data.items?.map(
                        (item: any) => item.eventId?.eventId || item.eventId,
                    ) || [];
                setCartItems(eventIds);
                setCartCount(data.itemCount || 0);
            }
        } catch (e) {
            console.error("Failed to fetch cart", e);
        }
    }

    useEffect(() => {
        fetchEvents();
        if (isLoaded && session?.user) {
            fetchRegistrationStatus();
            fetchTeamData();
            fetchCart();
        } else if (isLoaded && !session?.user) {
            setLoading(false);
        }
    }, [session, isLoaded]);

  function getRegistrationStatus(
    eventId: string,
  ): RegistrationStatus | undefined {
    return registeredEvents.find((r) => r.eventId === eventId);
  }

  async function handleAddToCart(
    eventId: string,
    teamId?: string,
    selectedMembers?: string[],
  ) {
    if (!user?.id) return;
    setAddingToCart(eventId);
    setMessage({ type: "", text: "" });

    try {
      const payload: any = { eventId };
      if (teamId && selectedMembers) {
        payload.teamId = teamId;
        payload.selectedMembers = selectedMembers;
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add to cart");
      }

      setMessage({
        type: "success",
        text: `${data.eventTitle || eventId} added to cart!`,
      });
      await fetchCart();
    } catch (e) {
      console.error(e);
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Something went wrong",
      });
    } finally {
      setAddingToCart(null);
    }
  }

  function isEventInCart(eventId: string): boolean {
    return cartItems.includes(eventId);
  }

  const filteredEvents = events.filter((event) => {
    const eventDate = event.date ? new Date(event.date) : null;
    const now = new Date();

    if (activeFilter === "Upcoming") {
      return !eventDate || eventDate >= now;
    }
    if (activeFilter === "Past") {
      return eventDate && eventDate < now;
    }
    if (activeFilter === "Yours") {
      return registeredEvents.some((r) => r.eventId === event._id);
    }
    return true;
  });

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#00F0FF] mb-4" size={32} />
        <p className="text-zinc-500 font-mono text-sm animate-pulse">
          LOADING_EVENTS...
        </p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 font-mono">
            <Calendar className="text-[#00F0FF]" size={32} /> EVENTS
          </h1>
          <p className="text-zinc-500 mt-2 font-mono text-sm max-w-xl">
            Browse and register for upcoming competitions. Secure your spot in
            the arena.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 items-center">
          {["Upcoming", "Past", "Yours"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs font-bold font-mono transition-all ${
                activeFilter === filter
                  ? "bg-[#eab308] text-black hover:bg-[#eab308]/90"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {message.text && (
        <div
          className={`px-4 py-3 rounded-lg mb-8 border font-mono text-sm ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/50 text-green-400"
              : "bg-red-500/10 border-red-500/50 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Overloading screen if registering */}
      {addingToCart && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center">
          <div className="flex flex-col items-center bg-black border border-[#00F0FF]/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)]">
            <Loader2 className="animate-spin text-[#00F0FF]" size={48} />
            <p className="text-[#00F0FF] font-mono mt-4 animate-pulse font-bold tracking-widest">
              TRANSMITTING_DATA...
            </p>
          </div>
        </div>
      )}

      {filteredEvents.length === 0 ? (
        <div className="text-center text-gray-400 py-12 font-mono border border-dashed border-zinc-800 rounded-2xl">
          NO_MISSIONS_FOUND_FOR_THIS_FILTER
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredEvents.map((event) => (
            <HorizontalEventCard
              key={event.eventId}
              event={event}
              registration={getRegistrationStatus(event._id)}
              onAddToCart={handleAddToCart}
              teamData={teamData}
              esportsTeamData={esportsTeamData}
              isInCart={isEventInCart(event.eventId)}
              addingToCart={addingToCart === event.eventId}
            />
          ))}
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCartUpdate={(count) => {
          setCartCount(count);
          fetchCart();
        }}
      />
    </div>
  );
}
