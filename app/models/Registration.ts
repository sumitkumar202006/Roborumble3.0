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

export interface IRegistration extends Document {
    teamId?: mongoose.Types.ObjectId; // Optional for individual events
    eventId: mongoose.Types.ObjectId;
    paymentStatus: "initiated" | "pending" | "paid" | "failed" | "refunded" | "manual_verified";
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
            enum: ["initiated", "pending", "paid", "failed", "refunded", "manual_verified"],
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
    },
    { timestamps: true }
);

// Prevent duplicate registrations (one team can only register once per event)
RegistrationSchema.index({ teamId: 1, eventId: 1 }, { unique: true });

const Registration: Model<IRegistration> =
    mongoose.models.Registration ||
    mongoose.model<IRegistration>("Registration", RegistrationSchema);

export default Registration;
