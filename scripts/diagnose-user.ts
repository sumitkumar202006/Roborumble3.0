/**
 * Check if the user is referenced in ANY registration's selectedMembers
 * Also check all teams (not just esports) for this user
 */
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const TARGET_EMAIL = "kumarpiyushsingh629@gmail.com";

async function diagnose() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) { console.log("ERROR: No MONGODB_URI"); return; }

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db!;

  // Find the target user profile
  const profile = await db.collection("profiles").findOne({ 
    email: { $regex: new RegExp(`^${TARGET_EMAIL}$`, "i") } 
  });
  if (!profile) { console.log("NO PROFILE FOUND"); await mongoose.disconnect(); return; }
  
  const userId = profile._id;
  console.log("TARGET USER ID:", userId.toString());
  console.log("TARGET USER EMAIL IN DB:", profile.email);
  console.log();

  // 1. Check ALL teams (not just esports) for this user
  const allTeams = await db.collection("teams").find({ members: userId }).toArray();
  console.log(`USER IS IN ${allTeams.length} TEAM(S) (any type):`);
  for (const t of allTeams) {
    console.log(`  - "${t.name}" | isEsports: ${t.isEsports} | ID: ${t._id}`);
  }
  console.log();

  // 2. Check if this user appears in ANY registration's selectedMembers
  const regsWithUser = await db.collection("registrations").find({ 
    selectedMembers: userId 
  }).toArray();
  console.log(`USER APPEARS IN selectedMembers OF ${regsWithUser.length} REGISTRATION(S):`);
  for (const r of regsWithUser) {
    const ev = await db.collection("events").findOne({ _id: r.eventId });
    const team = r.teamId ? await db.collection("teams").findOne({ _id: r.teamId }) : null;
    console.log(`  - Event: "${ev?.title}" | Team: "${team?.name || 'N/A'}" | Status: ${r.paymentStatus}`);
  }
  console.log();

  // 3. Show FULL profile document to see what teams they have
  console.log("FULL PROFILE DATA:");
  console.log(JSON.stringify({
    _id: profile._id,
    email: profile.email,
    username: profile.username,
    college: profile.college,
    onboardingCompleted: profile.onboardingCompleted,
    currentTeamId: profile.currentTeamId,
    esportsTeamId: profile.esportsTeamId,
    invitations: profile.invitations,
  }, null, 2));

  await mongoose.disconnect();
  console.log("\n--- Done ---");
}

diagnose().catch(err => { console.error("Error:", err); process.exit(1); });
