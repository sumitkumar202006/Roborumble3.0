import { Shield, Zap, Users, Bot, Magnet, Mic, Rocket, Gamepad2, Cpu, Crosshair, Music, Target } from "lucide-react";
import { BiFootball } from "react-icons/bi";

export const events = [
  {
    id: "robo-obstacle-race",
    title: "Robo Obstacle Race",
    category: "Robotics",
    icon: Bot,
    desc: "Build a wired or wireless robot to navigate a track with obstacles and finish in the shortest time.",
    teamSize: "3-5 Members",
    prize: "₹20,000 Prize Pool",
    cost: 400,
    brochureLink: "/event_specific_brochures/Robo Obstace Race.pdf",
    rules: [
      "Objective: Finish track in shortest time.",
      "Single run (no trials). Penalties for skipping obstacles.",
      "Scoring: (points / time) * 100."
    ],
    specifications: [
      "Dimensions: Max 30cm (W) x 30cm (L) x 25cm (H).",
      "Weight: Max 2.5 kg (+5% tolerance).",
      "Power: Electric only. Max 12V DC. Sealed batteries.",
      "Cabling: 15m slack wire (if wired)."
    ],
    gameplay: [
      "Track Length: 16+ meters, Width: 35 cm.",
      "Obstacles: Block pushing, speed breakers, marble pit, slippery path, rotating disc, curved ramp, seesaw."
    ],
    image: "/robo-race.jpeg"
  },
  {
    id: "robo-wars",
    title: "Robo War",
    category: "Robotics",
    icon: Shield,
    desc: "Construct a wired or wireless combat robot to knockout or push the opponent out of the arena.",
    teamSize: "3-5 Members",
    prize: "₹20,000 Prize Pool",
    cost: 400,
    brochureLink: "/event_specific_brochures/Robo War.pdf",
    rules: [
      "Objective: Knockout or push opponent out.",
      "Weapons: Hidden allowed. Pneumatic pincers, armor, axes allowed.",
      "Prohibited: Disrupting opponent power, explosives.",
      "Submission: Abstract video (360 view, specs, driving test, weapon test) required."
    ],
    specifications: [
      "Dimensions: Max 45cm x 45cm (Any Height).",
      "Weight: Max 8 kg (+5% tolerance).",
      "Power: Max 36V DC. (230V AC avail on-site).",
    ],
    gameplay: [
      "Arena Hazards: Saws, cutters, flame-throwers, ditches."
    ],
    image: "/robo-war.jpeg"
  },
  {
    id: "line-following",
    title: "Line Following Bot",
    category: "Robotics",
    icon: Zap,
    desc: "Design an autonomous robot to follow a black line on a white surface with precision and speed.",
    teamSize: "3-5 Members",
    prize: "₹15,000 Prize Pool",
    cost: 400,
    brochureLink: "/event_specific_brochures/Line Following Bot.pdf",
    rules: [
      "Autonomous only (onboard sensors). No external control.",
      "2 attempts allowed; best time recorded.",
      "Max 5 minutes per attempt."
    ],
    specifications: [
      "Dimensions: Max 30cm x 30cm x 30cm.",
      "Power: Onboard batteries only. External power prohibited."
    ],
    gameplay: [
      "Track: Black line (3-4cm) on white.",
      "Features: Sharp turns, curves, intersections."
    ],
    image: "/line-following-robot.jpeg"
  },
  {
    id: "robo-soccer",
    title: "Robo Soccer",
    category: "Robotics",
    icon: BiFootball,
    desc: "Manual wired/wireless robots compete to score goals in a knockout format.",
    teamSize: "3-5 Members",
    prize: "₹20,000 Prize Pool",
    cost: 400,
    brochureLink: "/event_specific_brochures/Robo Soccer.pdf",
    rules: [
      "Format: 1v1 Knockout.",
      "Match: 3 rounds (3 mins each).",
      "Tie-breaker: 3-penalty shoot-out.",
      "Cannot lift/hold ball (Push/Dribble only)."
    ],
    specifications: [
      "Dimensions: Max 30cm x 30cm x 30cm.",
      "Weight: Max 5 kg (+10% tolerance).",
      "Power: Max 24V DC. (230V AC avail)."
    ],
    image: "/robo-soccer.jpeg"
  },
  {
    id: "pick-and-drop",
    title: "Pick and Drop",
    category: "Robotics",
    icon: Magnet,
    desc: "Robots must pick objects from a source zone and place them accurately in a target zone.",
    teamSize: "3-5 Members",
    prize: "₹20,000 Prize Pool",
    cost: 400,
    brochureLink: "/event_specific_brochures/Pick & Drop Challenge.pdf",
    rules: [
      "Elimination Round: 3 rounds of 2 mins.",
      "Qualify by collecting most boxes (9 total)."
    ],
    specifications: [
      "Dimensions: Max 30cm x 30cm x 30cm.",
      "Weight: Max 5 kg.",
      "Mechanism: Grippers, claws, magnets, or suction only. No dragging."
    ],
    image: "/pick-place.jpeg"
  },
  {
    id: "rc-flying",
    title: "RC Flying",
    category: "Aerial",
    icon: Cpu,
    desc: "Pilot a remotely controlled fixed-wing aircraft through basic and precision maneuvers.",
    teamSize: "3-5 Members",
    prize: "₹20,000 Prize Pool",
    cost: 400,
    brochureLink: "/event_specific_brochures/RC Flying.pdf",
    rules: [
      "Manual RC only (2.4 GHz). No GPS/Autopilot.",
      "Tasks: Takeoff, figure-8, 180-turn, loop/roll, landing."
    ],
    specifications: [
      "Type: Fixed-wing only (Handmade).",
      "Wingspan: Max 1.5m.",
      "Weight: Max 2 kg.",
      "Power: Electric Motor (Max 6S Li-Po)."
    ],
    image: "/rc flying.jpeg"
  },
  {
    id: "e-sports",
    title: "E-SPORTS",
    category: "Gaming",
    icon: Gamepad2,
    desc: "Competitive digital arena featuring BGMI and Free Fire. Squad Mode (4 players). Mobile only.",
    teamSize: "4 Members (Squad)",
    prize: "₹30,000 Prize Pool (₹15,000 FREE FIRE / ₹15,000 BGMI)",
    cost: 250,
    brochureLink: "/event_specific_brochures/E-Sports.pdf",
    rules: [
      "Games: BGMI and Free Fire (₹15,000 Prize Pool each).",
      "Mobile phones only. No tablets/triggers/emulators.",
      "Top 5 must submit POV + Handcam footage.",
      "Zero tolerance for hacking/teaming."
    ],
    gameplay: [
      "Scoring: Placement (1st=12pts, 2nd=9pts...) + 1pt per kill."
    ],
    image: "/e-sports.jpeg"
  },
  {
    id: "project-expo",
    title: "Showcase & Exhibition",
    category: "Innovation",
    icon: Users,
    desc: "Display innovative science projects and working models.",
    teamSize: "1-4 Members",
    prize: "Certificate",
    cost: 250,
    brochureLink: "/event_specific_brochures/Showcase & Exhibition.pdf",
    rules: [
      "Criteria: Usability, Innovation, Presentation, Uniqueness."
    ],
    image: "/exhibition.jpeg"
  },
  {
    id: "defence-talk",
    title: "Defence Talk",
    category: "Seminar",
    icon: Mic,
    desc: "Informative session on modern defense technologies and career opportunities.",
    teamSize: "Open to All",
    prize: "N/A",
    cost: 0,
    brochureLink: "/event_specific_brochures/Defence talk.pdf",
    rules: [
      "Open to registered participants.",
      "Q&A restricted to designated sessions."
    ],
    image: "/defence-talk.jpeg"
  },
  {
    id: "defence-expo",
    title: "Defence Expo",
    category: "Exhibition",
    icon: Rocket,
    desc: "An exhibition showcasing defense technologies, equipment, innovations, and student-led defense projects.",
    teamSize: "Open to All",
    prize: "Exhibition",
    cost: 0,
    brochureLink: "/event_specific_brochures/Defence Expo.pdf",
    rules: [
      "Open to all registered participants and visitors.",
      "Exhibits must be set up within the allotted time and space.",
      "Participants should ensure safe handling of all displayed models and equipment.",
      "Any form of misconduct or damage to exhibits will lead to strict action.",
      "Organizers’ instructions must be followed at all times."
    ],
    specifications: [
      "Objective: Provide a platform to display advancements in defense technology and innovation.",
      "Promote awareness of defense systems, research, and indigenous development.",
      "Encourage student participation, creativity, and technical learning.",
      "Highlight the role of technology in national security and defense preparedness."
    ],
    image: "/defence-expo.jpeg"
  },

  {
    id: "gokart",
    title: "Gokart",
    category: "Entertainment",
    icon: Gamepad2,
    desc: "Speed through the track in our thrilling Gokart competition. Experience the rush of adrenaline!",
    teamSize: "Individual",
    prize: "N/A",
    cost: 0,
    isOffline: true,
    image: "/gokart.jpeg"
  },
  {
    id: "paintball",
    title: "Paintball",
    category: "Entertainment",
    icon: Target,
    desc: "Strategize and eliminate the opposing team in a high-intensity paintball battle.",
    teamSize: "Individual",
    prize: "N/A",
    cost: 0,
    isOffline: true,
    image: "/paintball.jpeg"
  },
  {
    id: "silent-dj",
    title: "Silent DJ",
    category: "Entertainment",
    icon: Music,
    desc: "Dance to your own beat! Put on your headphones and choose your music in this unique DJ experience. (On Desk Registration Only)",
    teamSize: "Individual",
    prize: "N/A",
    cost: 180,
    basePrice: 180,
    discountedPrice: 150,
    maxRegistrations: 150,
    phasedCap: 75,
    requiresUniversityId: true,
    isOffline: true,
    rules: [
      "Compulsory to carry your University ID to enter.",
      "Capped to 150 registrations only.",
      "On Desk Registration Only."
    ],
    image: "/silent-dj.jpeg"
  },
  {
    id: "band-show",
    title: "Band Show",
    category: "Entertainment",
    icon: Music,
    desc: "A spectacular musical night featuring live band performances. Don't miss out!",
    teamSize: "Individual/Couple",
    prize: "N/A",
    ticketTypes: {
      single: 249,
      couple: 399
    },
    requiresUniversityId: true,
    rules: [
      "Compulsory to carry your University ID to enter."
    ],
    image: "/band-show.jpeg"
  }
];
