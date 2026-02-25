import mongoose, { Schema, Document, Model } from "mongoose";

interface IPaymentEvent {
    eventId: mongoose.Types.ObjectId;
    selectedMembers: mongoose.Types.ObjectId[];
    coordinator?: {
        name: string;
        phone: string;
    };
}

export interface IPaymentSubmission extends Document {
    clerkId: string;
    cartId?: mongoose.Types.ObjectId;
    teamId?: mongoose.Types.ObjectId;
    transactionId: string;
    screenshotUrl: string;
    totalAmount: number;
    events: IPaymentEvent[];
    status: "pending" | "verified" | "rejected";
    verifiedBy?: string;
    verifiedAt?: Date;
    rejectionReason?: string;
    leaderEmail: string;
    leaderName: string;
    leaderPhone: string;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSubmissionSchema = new Schema<IPaymentSubmission>(
    {
        clerkId: { type: String, required: true, index: true },
        cartId: { type: Schema.Types.ObjectId, ref: "Cart" },
        teamId: { type: Schema.Types.ObjectId, ref: "Team" },
        transactionId: { type: String, required: true },
        screenshotUrl: { type: String, required: true },
        totalAmount: { type: Number, required: true },
        events: [
            {
                eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
                selectedMembers: [{ type: Schema.Types.ObjectId, ref: "Profile" }],
                coordinator: {
                    name: { type: String },
                    phone: { type: String },
                },
            },
        ],
        status: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
            index: true,
        },
        verifiedBy: { type: String },
        verifiedAt: { type: Date },
        rejectionReason: { type: String },
        leaderEmail: { type: String, required: true },
        leaderName: { type: String, required: true },
        leaderPhone: { type: String, required: true },
    },
    { timestamps: true }
);

// Compound index for faster admin queries
PaymentSubmissionSchema.index({ status: 1, createdAt: -1 });

// Strategic indexes
PaymentSubmissionSchema.index({ teamId: 1 });  // Team payment lookup
PaymentSubmissionSchema.index({ clerkId: 1, status: 1 });  // User's payments

const PaymentSubmission: Model<IPaymentSubmission> =
    mongoose.models.PaymentSubmission ||
    mongoose.model<IPaymentSubmission>("PaymentSubmission", PaymentSubmissionSchema);

export default PaymentSubmission;
