import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProfile extends Document {
    clerkId: string;
    googleId?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    password?: string;
    username?: string;
    bio?: string;
    phone?: string;
    college?: string;
    city?: string;
    state?: string;
    degree?: string;
    branch?: string;
    yearOfStudy?: number;
    role: "user" | "admin" | "superadmin";
    interests: string[];
    currentTeamId?: mongoose.Types.ObjectId;
    esportsTeamId?: mongoose.Types.ObjectId;
    invitations: mongoose.Types.ObjectId[];
    registeredEvents: string[];
    paidEvents: string[];
    onboardingCompleted: boolean;
    boarding?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
    {
        // Clerk Integration
        clerkId: { type: String, unique: true, sparse: true },
        googleId: { type: String, unique: true, sparse: true }, // Google Subject ID
        email: { type: String, required: true },
        firstName: String,
        lastName: String,
        avatarUrl: String,
        password: { type: String, select: false }, // For credentials login


        // Profile Data
        username: { type: String, unique: true, sparse: true },
        bio: { type: String, maxlength: 500 },
        phone: String,
        college: String,
        city: String,
        state: String,
        degree: String,
        branch: String,
        yearOfStudy: Number,

        // Role Management
        role: {
            type: String,
            enum: ["user", "admin", "superadmin"],
            default: "user",
        },

        // Interests for matching
        interests: [{ type: String }],

        // Team Relationships
        currentTeamId: { type: Schema.Types.ObjectId, ref: "Team" },
        esportsTeamId: { type: Schema.Types.ObjectId, ref: "Team" },
        invitations: [{ type: Schema.Types.ObjectId, ref: "Team" }],

        // Event Registrations
        registeredEvents: [{ type: String }],
        paidEvents: [{ type: String }],

        // Status
        onboardingCompleted: { type: Boolean, default: false },
        boarding: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Strategic indexes for fast queries
ProfileSchema.index({ email: 1 });
ProfileSchema.index({ currentTeamId: 1 });
ProfileSchema.index({ role: 1 });
ProfileSchema.index({ college: 1 });  // For analytics/filtering
ProfileSchema.index({ clerkId: 1, email: 1 });  // Compound for auth queries

const Profile: Model<IProfile> =
    mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);

export default Profile;

