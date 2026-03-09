import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function repair() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error("No MONGODB_URI");
        process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for repair");

    const Registration = mongoose.models.Registration || mongoose.model('Registration', new mongoose.Schema({
        eventId: mongoose.Schema.Types.ObjectId,
        _denormalized: {
            eventTitle: String,
            eventSlug: String
        }
    }));

    const Event = mongoose.models.Event || mongoose.model('Event', new mongoose.Schema({
        eventId: String,
        title: String,
        slug: String
    }));

    const regs = await Registration.find({});
    const events = await Event.find({});

    console.log(`Found ${regs.length} registrations and ${events.length} events.`);

    let repairedCount = 0;
    for (const reg of regs) {
        // Try to find matching event by slug or title from denormalized data
        const eventSlug = reg._denormalized?.eventSlug;
        const eventTitle = reg._denormalized?.eventTitle;

        if (!eventSlug && !eventTitle) {
            console.log(`Reg ${reg._id} has no denormalized data to repair with.`);
            continue;
        }

        const match = events.find(e => e.slug === eventSlug || e.title === eventTitle);

        if (match) {
            if (reg.eventId.toString() !== match._id.toString()) {
                reg.eventId = match._id;
                await reg.save();
                repairedCount++;
                console.log(`  ✅ Repaired Reg ${reg._id}: Linked to ${match.title}`);
            }
        } else {
            console.log(`  ❌ Could not find event match for Reg ${reg._id} (${eventSlug || eventTitle})`);
        }
    }

    console.log(`\nRepair complete. ${repairedCount} registrations updated.`);
    process.exit(0);
}

repair();
