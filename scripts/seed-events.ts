/**
 * Seed Script: Populate MongoDB with Events Data
 * 
 * Run with: npx ts-node scripts/seed-events.ts
 * Or add to package.json: "seed:events": "ts-node scripts/seed-events.ts"
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Event data matching the static events
const eventsData = [
    {
        eventId: "robo-wars",
        title: "Robo Wars",
        category: "Robotics",
        description: "The ultimate battle of steel and strategy. Build a remote-controlled bot to survive the arena.",
        teamSize: "3-5 Members",
        prize: "₹20,000",
        rules: ["Width: Not More Than 45cm.", "Length: Not More Than 45cm", "Max weight: 6kg (+10% penalty limit).", "No explosives or flammable liquids."],
        image: "/robo-war.jpeg",
        fees: 500,
        minTeamSize: 3,
        maxTeamSize: 5,
    },
    {
        eventId: "line-following",
        title: "Line Following Bot",
        category: "Robotics",
        description: "Speed and precision. Program your bot to follow the twisted path in the shortest time.",
        teamSize: "3-5 Members",
        prize: "₹15,000",
        rules: ["Autonomous robots only.", "Dimensions: 30x30x30 cm Max.", "Onboard batteries only (External Prohibited)."],
        image: "/line-following-robot.jpeg",
        fees: 300,
        minTeamSize: 3,
        maxTeamSize: 5,
    },
    {
        eventId: "robo-soccer",
        title: "Robo Soccer",
        category: "Robotics",
        description: "The Fifa of Robotics. Design bots to outmaneuver and outscore your opponents.",
        teamSize: "3-5 Members",
        prize: "₹20,000",
        rules: ["Max Dimensions: 30x30x30 cm.", "Max Weight: 5kg.", "Dribbling mechanisms permitted under specific conditions."],
        image: "/robo-soccer.jpeg",
        fees: 400,
        minTeamSize: 3,
        maxTeamSize: 5,
    },
    {
        eventId: "rc-flying",
        title: "RC Flying",
        category: "Aerial",
        description: "Navigate obstacles at breakneck speeds. Test your piloting skills.",
        teamSize: "3-5 Members",
        prize: "₹20,000",
        rules: ["Fixed-wing aircraft only.", "Wingspan Max: 1.5m.", "Handmade models only (RTF Prohibited).", "Electric motors only."],
        image: "/rc flying.jpeg",
        fees: 400,
        minTeamSize: 3,
        maxTeamSize: 5,
    },
    {
        eventId: "project-expo",
        title: "Showcase and Exhibition",
        category: "Innovation",
        description: "Showcase your hardware or software projects to industry experts.",
        teamSize: "1-4 Members",
        prize: "₹10,000",
        rules: ["Working prototype required.", "Technical presentation mandatory.", "Live Q&A with industry judges."],
        image: "/exhibition.jpeg",
        fees: 250,
        minTeamSize: 1,
        maxTeamSize: 4,
    },
    {
        eventId: "robo-obstacle-race",
        title: "Robo Obstacle Race",
        category: "Robotics",
        description: "A thrilling challenge where robots must navigate and overcome a series of obstacles, testing speed, control, and mechanical efficiency.",
        teamSize: "3-5 Members",
        prize: "₹20,000 Pool",
        rules: ["Dimensions: 30x30x25 cm Max.", "Weight: Max 2kg (+5% tolerance).", "Power: Electric only, Max 12V DC.", "Wired (15m cable) or Wireless allowed."],
        image: "/robo-race.jpeg",
        fees: 300,
        minTeamSize: 3,
        maxTeamSize: 5,
    },
    {
        eventId: "pick-and-drop",
        title: "Pick and Drop Challenge",
        category: "Robotics",
        description: "A task-based challenge where robots must accurately pick objects from designated zones and place them at target locations, testing precision, control, and efficiency.",
        teamSize: "3-5 Members",
        prize: "₹20,000 Pool",
        rules: ["Dimensions: 30x30x30 cm Max.", "Weight: Max 5kg.", "Power: Electric only, Max 12V DC.", "Must use Gripper/Claw/Magnet/Suction.", "Time limit: 15 minutes."],
        image: "/pick-place.jpeg",
        fees: 300,
        minTeamSize: 3,
        maxTeamSize: 5,
    },
    {
        eventId: "defence-talk",
        title: "Defence Talk",
        category: "Seminar",
        description: "An informative session exploring modern defense technologies, strategies, and career opportunities in the defense sector.",
        teamSize: "Open to All",
        prize: "Certificate",
        rules: ["Discipline mandatory.", "Q&A in designated time only.", "No recording without permission."],
        image: "/defence-talk.jpeg",
        fees: 0,
        minTeamSize: 1,
        maxTeamSize: 100,
    },
    {
        eventId: "defence-expo",
        title: "Defence Expo",
        category: "Exhibition",
        description: "An exhibition showcasing defense technologies, equipment, innovations, and student-led defense projects.",
        teamSize: "Individual / Team",
        prize: "Certificate",
        rules: ["Setup within allotted time.", "Safe handling of exhibits.", "Misconduct leads to strict action."],
        image: "/defence-expo.jpeg",
        fees: 0,
        minTeamSize: 1,
        maxTeamSize: 10,
    },
    {
        eventId: "e-sports",
        title: "E-SPORTS",
        category: "Gaming",
        description: "Competitive digital arena. Feature titles: BGMI and FREE FIRE. Squad-based combat.",
        teamSize: "4 Members (Squad)",
        prize: "₹10,000 Pool",
        rules: ["Squad Mode only.", "No iPads/Tablets/Emulators allowed.", "Registered IDs must remain consistent."],
        image: "/e-sports.jpeg",
        fees: 200,
        minTeamSize: 4,
        maxTeamSize: 4,
    },
    {
        eventId: "dance-performance",
        title: "Street Dance Battle",
        category: "Performance",
        description: "Hit the streets and own the stage. Whether you're a solo artist or a powerhouse crew, bring your rhythm and raw energy to the ultimate street dance showdown.",
        teamSize: "1-5 Members",
        prize: "Gift Hampers / Live Voting",
        rules: ["Category: Solo or Group (3-5 members).", "Time Limit: 4–5 minutes per performance.", "Style: Any dance style is welcome."],
        image: "/dance.png",
        fees: 0,
        minTeamSize: 1,
        maxTeamSize: 5,
    },
    {
        eventId: "gokart",
        title: "Gokart",
        category: "Entertainment",
        description: "Speed through the track in our thrilling Gokart competition. Experience the rush of adrenaline!",
        teamSize: "Individual",
        prize: "N/A",
        rules: ["Safety gear mandatory.", "Registration on-desk only."],
        image: "/gokart.jpeg",
        fees: 0,
        minTeamSize: 1,
        maxTeamSize: 1,
    },
    {
        eventId: "paintball",
        title: "Paintball",
        category: "Entertainment",
        description: "Strategize and eliminate the opposing team in a high-intensity paintball battle.",
        teamSize: "Individual",
        prize: "N/A",
        rules: ["Protective gear mandatory.", "Registration on-desk only."],
        image: "/paintball.jpeg",
        fees: 0,
        minTeamSize: 1,
        maxTeamSize: 1,
    },
    {
        eventId: "silent-dj",
        title: "Silent DJ",
        category: "Entertainment",
        description: "Dance to your own beat! Put on your headphones and choose your music in this unique DJ experience.",
        teamSize: "Individual",
        prize: "N/A",
        rules: ["Compulsory to carry your University ID to enter.", "Capped to 150 registrations only."],
        image: "/silent-dj.jpeg",
        fees: 180,
        minTeamSize: 1,
        maxTeamSize: 1,
        maxRegistrations: 150,
        requiresUniversityId: true,
        phasedCap: 75,
        basePrice: 180,
        discountedPrice: 150,
    },
    {
        eventId: "band-show",
        title: "Band Show",
        category: "Entertainment",
        description: "A spectacular musical night featuring live band performances. Don't miss out!",
        teamSize: "Individual/Couple",
        prize: "N/A",
        rules: ["Compulsory to carry your University ID to enter."],
        image: "/band-show.jpeg",
        fees: 249,
        minTeamSize: 1,
        maxTeamSize: 2,
        requiresUniversityId: true,
        ticketTypes: {
            "Single": 249,
            "Couple": 399
        }
    },
];

// Define Event schema inline for the script
const EventSchema = new mongoose.Schema({
    eventId: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    teamSize: { type: String, required: true },
    prize: { type: String, required: true },
    rules: [{ type: String }],
    image: String,
    fees: { type: Number, required: true, default: 0 },
    minTeamSize: { type: Number, default: 1 },
    maxTeamSize: { type: Number, default: 4 },
    maxRegistrations: Number,
    currentRegistrations: { type: Number, default: 0 },
    registrationDeadline: Date,
    requiresUniversityId: { type: Boolean, default: false },
    phasedCap: Number,
    ticketTypes: { type: Map, of: Number },
    basePrice: Number,
    discountedPrice: Number,
    isLive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
}, { timestamps: true });

const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

async function seedEvents() {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        console.error("❌ MONGODB_URI not found in environment variables");
        process.exit(1);
    }

    try {
        console.log("🔗 Connecting to MongoDB...");
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        console.log("🗑️  Clearing existing events...");
        await Event.deleteMany({});

        console.log("📝 Seeding events...");

        for (const eventData of eventsData) {
            const event = new Event({
                ...eventData,
                slug: generateSlug(eventData.title),
                isLive: true,
                currentRegistrations: 0,
            });
            await event.save();
            console.log(`  ✅ Created: ${eventData.title}`);
        }

        console.log(`\n🎉 Successfully seeded ${eventsData.length} events!`);

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

seedEvents();
