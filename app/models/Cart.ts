import mongoose, { Schema, Document, Model } from "mongoose";

interface ICartItem {
    eventId: mongoose.Types.ObjectId;
    selectedMembers: mongoose.Types.ObjectId[];
    gameChoice?: string; // "FreeFire" | "BGMI" for esports events
    coordinator?: {
        name: string;
        phone: string;
    };
    addedAt: Date;
}

export interface ICart extends Document {
    clerkId: string;
    teamId?: mongoose.Types.ObjectId;
    items: ICartItem[];
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const CartItemSchema = new Schema({
    eventId: {
        type: Schema.Types.ObjectId,
        ref: "Event",
        required: true,
    },
    selectedMembers: [{
        type: Schema.Types.ObjectId,
        ref: "Profile",
    }],
    gameChoice: {
        type: String,
        enum: ["FreeFire", "BGMI"],
        default: undefined,
    },
    coordinator: {
        name: { type: String },
        phone: { type: String },
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
});

const CartSchema = new Schema<ICart>(
    {
        clerkId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
        },
        items: [CartItemSchema],
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            index: { expires: 0 }, // TTL index - auto-delete when expiresAt is reached
        },
    },
    { timestamps: true }
);

// Helper method to check if an event is already in cart
CartSchema.methods.hasEvent = function (eventId: string): boolean {
    return this.items.some((item: ICartItem) =>
        item.eventId.toString() === eventId
    );
};

// Strategic indexes
CartSchema.index({ teamId: 1 });  // Find cart by team
CartSchema.index({ clerkId: 1, 'items.eventId': 1 });  // Check if event in cart

const Cart: Model<ICart> =
    mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
