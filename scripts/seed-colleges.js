const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

const CollegeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
    },
    { timestamps: true }
);

const College =
    mongoose.models.College || mongoose.model("College", CollegeSchema);

const COLLEGES = [
    // UP Colleges
    "University Institute of Engineering and Technology, Chandigarh",
    "Panjab University, Chandigarh",
    "Harcourt Butler Technical University, Kanpur",
    "Motilal Nehru National Institute of Technology, Allahabad",
    "Indian Institute of Technology, Kanpur",
    "Indian Institute of Technology, Delhi",
    "Indian Institute of Technology, Bombay",
    "Indian Institute of Technology, Madras",
    "Indian Institute of Technology, Kharagpur",
    "Indian Institute of Technology, Roorkee",
    "Indian Institute of Technology, Guwahati",
    "Indian Institute of Technology, Hyderabad",
    "Birla Institute of Technology and Science, Pilani",
    "National Institute of Technology, Tiruchirappalli",
    "National Institute of Technology, Warangal",
    "National Institute of Technology, Surathkal",
    "Dr. A.P.J. Abdul Kalam Technical University, Lucknow",
    "Amity University, Noida",
    "SRM Institute of Science and Technology, Chennai",
    "VIT University, Vellore",
    "Lovely Professional University, Phagwara",
    "Delhi Technological University, Delhi",
    "Netaji Subhas University of Technology, Delhi",
    "Jamia Millia Islamia, Delhi",
    "Aligarh Muslim University, Aligarh",
    "Banaras Hindu University, Varanasi",
    "University of Lucknow, Lucknow",
    "CSJM University, Kanpur",
    "Bundelkhand University, Jhansi",
    "Chandigarh University, Mohali",
];

async function seedColleges() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        let added = 0;
        let skipped = 0;

        for (const name of COLLEGES) {
            try {
                await College.create({ name });
                added++;
                console.log(`  ✓ Added: ${name}`);
            } catch (err) {
                if (err.code === 11000) {
                    skipped++;
                    console.log(`  - Skipped (exists): ${name}`);
                } else {
                    console.error(`  ✗ Error adding "${name}":`, err.message);
                }
            }
        }

        console.log(`\nDone! Added ${added}, Skipped ${skipped}`);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected");
    }
}

seedColleges();
