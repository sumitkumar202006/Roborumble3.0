import mongoose, { Schema, Document, Model } from "mongoose";

interface PaymentAttempt {
    attemptedAt: Date;
    razorpayOrderId: string;
    status: string;
    errorMessage?: string;
}

interface ManualVerification {
    verifiedBy: mongoose.Types.ObjectId;
    verifiedAt: Date;
    notes?: string;
}

// Denormalized data for fast reads (avoids expensive populate calls)
interface DenormalizedData {
    teamName?: string;
    eventTitle?: string;
    eventSlug?: string;
    leaderName?: string;
    leaderEmail?: string;
    memberCount?: number;
}

export interface IRegistration extends Document {
    teamId?: mongoose.Types.ObjectId; // Optional for individual events
    eventId: mongoose.Types.ObjectId;
    paymentStatus: "initiated" | "pending" | "paid" | "failed" | "refunded" | "manual_verified" | "verification_pending";
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    amountExpected?: number;
    amountPaid?: number;
    currency: string;
    paymentAttempts: PaymentAttempt[];
    manualVerification?: ManualVerification;
    createdAt: Date;
    updatedAt: Date;
    selectedMembers: mongoose.Types.ObjectId[]; // The squad for this event
    checkedIn: boolean;
    checkedInAt?: Date;
    gameChoice?: "BGMI" | "FreeFire"; // Added for e-sports
    _denormalized?: DenormalizedData; // Fast-read cache
}

const RegistrationSchema = new Schema<IRegistration>(
    {
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: false, // Optional for individual events
        },
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },

        // Roster Selection (The specific squad for this event)
        selectedMembers: [
            {
                type: Schema.Types.ObjectId,
                ref: "Profile",
            },
        ],

        // Payment Tracking
        paymentStatus: {
            type: String,
            enum: ["initiated", "pending", "paid", "failed", "refunded", "manual_verified", "verification_pending"],
            default: "initiated",
        },

        // Razorpay Fields
        razorpayOrderId: { type: String, index: true },
        razorpayPaymentId: String,
        razorpaySignature: String,

        // Financial
        amountExpected: Number,
        amountPaid: Number,
        currency: { type: String, default: "INR" },

        // Audit Trail
        paymentAttempts: [
            {
                attemptedAt: Date,
                razorpayOrderId: String,
                status: String,
                errorMessage: String,
            },
        ],

        // Admin Override for manual verification
        manualVerification: {
            verifiedBy: { type: Schema.Types.ObjectId, ref: "Profile" },
            verifiedAt: Date,
            notes: String,
        },

        // Event Check-in
        checkedIn: { type: Boolean, default: false },
        checkedInAt: Date,

        // Denormalized data for fast reads (populated on create/update)
        _denormalized: {
            teamName: String,
            eventTitle: String,
            eventSlug: String,
            leaderName: String,
            leaderEmail: String,
            memberCount: Number,
        },

        // For E-sports
        gameChoice: {
            type: String,
            enum: ["BGMI", "FreeFire"],
            required: false,
        },
    },
    { timestamps: true }
);

// Prevent duplicate registrations (one team can only register once per event)
RegistrationSchema.index({ teamId: 1, eventId: 1 }, { unique: true });

// Strategic indexes for common queries
RegistrationSchema.index({ eventId: 1, paymentStatus: 1 });  // Event dashboard
RegistrationSchema.index({ selectedMembers: 1 });  // Find user's registrations
RegistrationSchema.index({ paymentStatus: 1, createdAt: -1 });  // Admin payments list
RegistrationSchema.index({ checkedIn: 1, eventId: 1 });  // Check-in queries
RegistrationSchema.index({ teamId: 1, paymentStatus: 1 });  // Team payment status
const Registration: Model<IRegistration> =
    mongoose.models.Registration ||
    mongoose.model<IRegistration>("Registration", RegistrationSchema);

export default Registration;
