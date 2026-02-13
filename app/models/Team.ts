import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeam extends Document {
    name: string;
    leaderId: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    joinRequests: mongoose.Types.ObjectId[];
    isLocked: boolean;
    maxMembers: number;
    isEsports: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
    {
        name: { type: String, required: true, unique: true },

        // Leader is the creator of the team
        leaderId: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },

        // Members (includes leader)
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "Profile",
            },
        ],

        // Users who requested to join
        joinRequests: [
            {
                type: Schema.Types.ObjectId,
                ref: "Profile",
            },
        ],

        // Lock team after payment initiated (prevent member changes)
        isLocked: { type: Boolean, default: false },

        // Team pool size limit
        maxMembers: { type: Number, default: 50 },

        // Esports flag
        isEsports: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Strategic indexes for fast lookups
TeamSchema.index({ leaderId: 1 });
TeamSchema.index({ members: 1 });  // Array index for "find teams containing user"
TeamSchema.index({ leaderId: 1, members: 1 });  // Compound for team queries

const Team: Model<ITeam> =
    mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
